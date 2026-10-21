"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWebSession } from "@/components/account/useWebSession";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRIMARY_BUTTON_CLASS, TEXT_BUTTON_CLASS } from "@/components/ui/buttons";
import { providerOf, signOutOfWebsite } from "@/lib/firebase/auth";
import { parseFunnelId } from "@/lib/funnel/params";
import { parsePlanId } from "@/lib/pricing";
import {
  checkoutValueFor,
  ensurePrivateCheckoutRoot,
  hadPremium,
  hasPremium,
  loadCheckoutOffering,
  offeringOffersTrial,
  packageOffersTrial,
  planIdOf,
  purchasesFor,
  saveWithdrawalConsent,
  sendMetaMatchingToRevenueCat,
  toCheckoutFailure,
  waitForPremium,
  webBillingKeyProblem,
  type CheckoutFailure,
} from "@/lib/revenuecat/webBilling";
import type { Offering } from "@revenuecat/purchases-js";
import { identifyPixelUser, trackCheckoutInitiated } from "@/lib/metaPixel";
import { resetWebUser, trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";
import { WITHDRAWAL_CONSENT_TEXT, WITHDRAWAL_CONSENT_VERSION, withdrawalConsentAttributes } from "@/lib/withdrawalConsent";

const PROVIDER_NAMES = { google: "Google", apple: "Apple" } as const;

/**
 * `has_trial` is RevenueCat's answer for this customer; `trial_expected` is
 * ours (no trial in PrepIt's record or RevenueCat's history). A mismatch means
 * RevenueCat offered a trial to someone who already had one, so a product's
 * trial eligibility setting is probably wrong.
 */
function trialProperties(hasTrial: boolean, trialExpected: boolean) {
  return { has_trial: hasTrial, trial_expected: trialExpected, trial_mismatch: hasTrial && !trialExpected };
}

const FAILURE_MESSAGES: Record<CheckoutFailure, string | null> = {
  cancelled: null,
  already_purchased: "You already have this subscription.",
  payment_pending: "Your payment is still being confirmed. We'll unlock PrepIt as soon as it goes through.",
  network: "We couldn't reach the payment service. Check your connection and try again.",
  not_allowed: "This payment couldn't go through. Please try a different card or try again.",
  unknown:
    "Something went wrong with the payment. If you were charged, your subscription will show up shortly. Otherwise, please try again.",
};

type Plans =
  | { status: "loading" }
  /** `trialExpected`: whether we think they should get the free trial. RevenueCat decides. */
  | { status: "ready"; offering: Offering; trialExpected: boolean }
  | { status: "already_subscribed" }
  /** The email belongs to a PrepIt account under the other provider: the bridge explains. */
  | { status: "email_in_use" }
  /** The offering has no RevenueCat paywall attached yet. */
  | { status: "no_paywall" }
  | { status: "error" };

/**
 * Checkout (PRE-269): the plans, prices, trial and disclosures are the
 * RevenueCat paywall of the current offering, built in the dashboard and shown
 * here with `presentPaywall`. Whether the free trial applies is RevenueCat's
 * call, from each Web Billing product's trial eligibility setting. Around the
 * paywall this page keeps what RevenueCat can't know: sign in first with the
 * app's account, the email-in-use guard, no checkout for anyone already
 * subscribed, the "You're in" handoff once `premium` is active, and for UK
 * and EEA buyers the request to start now, which waives the 14-day right to
 * cancel (`askWithdrawalConsent`; the paywall waits for it).
 */
export default function Checkout({ country, askWithdrawalConsent }: { country: string | null; askWithdrawalConsent: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const funnelId = parseFunnelId(params.get("funnel"));
  const requestedPlan = parsePlanId(params.get("plan"));
  const { session, reloadAccount } = useWebSession();
  const keyProblem = webBillingKeyProblem();

  const [plansState, setPlans] = useState<{ key: string; plans: Plans } | null>(null);
  const [paying, setPaying] = useState<"idle" | "confirming">("idle");
  const [failure, setFailure] = useState<CheckoutFailure | null>(null);
  // The paywall itself couldn't be shown (nothing was bought).
  const [paywallFailed, setPaywallFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // Bumped to show the paywall again after a purchase that didn't go through.
  const [presentKey, setPresentKey] = useState(0);
  const paywallTracked = useRef(false);
  // UK/EEA: the consent's ISO time once ticked and confirmed; the paywall shows only after it.
  const [consentAt, setConsentAt] = useState<string | null>(null);
  const [consentTicked, setConsentTicked] = useState(false);
  const [consentSaving, setConsentSaving] = useState(false);
  const paywallAllowed = !askWithdrawalConsent || consentAt !== null;
  const paywallHost = useRef<HTMLDivElement>(null);

  const uid = session.status === "signedIn" ? session.user.uid : null;
  const account = session.status === "signedIn" ? session.account : null;
  const summary = account?.status === "ready" ? account.summary : null;
  const plansKey = uid && summary ? `${uid}:${summary.hasUsedTrial}:${summary.isSubscribed}:${reloadKey}` : null;
  const plans: Plans = useMemo(
    () => (plansState && plansState.key === plansKey ? plansState.plans : { status: "loading" }),
    [plansState, plansKey],
  );

  // Signed out: sign in first, then come back here with the same plan.
  useEffect(() => {
    if (session.status !== "signedOut") return;
    const back = `/checkout?${params.toString()}`;
    const query = new URLSearchParams({ ...(requestedPlan ? { plan: requestedPlan } : {}), funnel: funnelId, next: back });
    router.replace(`/signin?${query}`);
  }, [session.status, params, requestedPlan, funnelId, router]);

  useEffect(() => {
    if (!uid || !summary || !plansKey || keyProblem) return;
    let cancelled = false;
    const done = (next: Plans) => {
      if (!cancelled) setPlans({ key: plansKey, plans: next });
    };
    if (summary.emailInUse) {
      done({ status: "email_in_use" });
      return;
    }
    if (summary.isSubscribed) {
      done({ status: "already_subscribed" });
      return;
    }
    (async () => {
      try {
        // Premium from any store (an App Store subscription, or a web
        // purchase made before the account existed) means no checkout.
        const purchases = await purchasesFor(uid);
        const customerInfo = await purchases.getCustomerInfo();
        if (hasPremium(customerInfo)) return done({ status: "already_subscribed" });
        const loaded = await loadCheckoutOffering(uid);
        // A trial before (PrepIt's record, or premium at any time in RevenueCat)
        // means no second one; RevenueCat's trial eligibility enforces it.
        const hadTrial = summary.hasUsedTrial || hadPremium(customerInfo);
        done(loaded.status === "ready" ? { ...loaded, trialExpected: !hadTrial } : loaded);
      } catch {
        done({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid, summary, plansKey, keyProblem]);

  const context = useMemo(() => ({ funnel_id: funnelId }), [funnelId]);

  useEffect(() => {
    if (paywallTracked.current) return;
    const unavailable =
      keyProblem ??
      (plans.status === "already_subscribed" ||
      plans.status === "email_in_use" ||
      plans.status === "no_paywall"
        ? plans.status
        : null);
    if (unavailable) {
      paywallTracked.current = true;
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.checkoutUnavailable, { ...context, reason: unavailable });
    } else if (plans.status === "ready") {
      paywallTracked.current = true;
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.paywallView, {
        ...context,
        plan: requestedPlan,
        ...trialProperties(offeringOffersTrial(plans.offering), plans.trialExpected),
      });
      if (session.status === "signedIn") identifyPixelUser(session.user.uid, session.user.email);
      trackCheckoutInitiated(checkoutValueFor(plans.offering, requestedPlan));
    }
  }, [plans, keyProblem, context, requestedPlan, session]);

  const provider = session.status === "signedIn" ? providerOf(session.user) : null;
  const email = session.status === "signedIn" ? session.user.email : null;

  // Once per signed-in uid, as soon as there's a paywall to buy from: what
  // RevenueCat's Meta integration needs to match the purchase to an ad. Sent
  // again when the purchase starts if the pixel's _fbp cookie wasn't there yet
  // (a pixel that first loaded on this page).
  const metaMatchingSent = useRef<string | null>(null);
  const metaMatchingHadFbp = useRef(true);
  const sendMetaMatching = useCallback(
    (forUid: string, forEmail: string | null, trigger: "paywall" | "purchase_start") => {
      sendMetaMatchingToRevenueCat(forUid, forEmail)
        .then((result) => {
          if (!result) return;
          metaMatchingHadFbp.current = result.has_fbp;
          trackWebFunnelEvent(WEB_FUNNEL_EVENTS.metaMatchingSent, { ...context, trigger, ...result });
        })
        .catch(() => {
          trackWebFunnelEvent(WEB_FUNNEL_EVENTS.metaMatchingSent, {
            ...context,
            trigger,
            identity_saved: false,
            ids_saved: false,
            browser_saved: false,
          });
        });
    },
    [context],
  );
  useEffect(() => {
    if (!uid || plans.status !== "ready" || metaMatchingSent.current === uid) return;
    metaMatchingSent.current = uid;
    sendMetaMatching(uid, email, "paywall");
  }, [uid, email, plans.status, sendMetaMatching]);
  // `member`: premium was already active before checkout, so nothing new started (PRE-335).
  const welcomePath = (pending: boolean, member = false) =>
    `/welcome?${new URLSearchParams({
      ...(provider ? { provider } : {}),
      ...(pending ? { pending: "1" } : {}),
      ...(member ? { member: "1" } : {}),
    })}`;

  useEffect(() => {
    if (plans.status === "already_subscribed") router.replace(welcomePath(false, true));
    if (plans.status === "email_in_use") {
      router.replace(`/signin?${new URLSearchParams({ ...(requestedPlan ? { plan: requestedPlan } : {}), funnel: funnelId })}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans.status]);

  // Shows RevenueCat's paywall in the page. It runs the purchase itself (with
  // 3-D Secure and its own retryable errors); this waits for the result.
  const offering = plans.status === "ready" ? plans.offering : null;
  const trialExpected = plans.status === "ready" ? plans.trialExpected : false;
  useEffect(() => {
    const host = paywallHost.current;
    if (!uid || !offering || !host || paying !== "idle" || !paywallAllowed) return;
    let active = true;
    // A fresh element per showing, so a second showing never stacks on the first.
    const target = document.createElement("div");
    host.replaceChildren(target);
    let plan: string | null = null;
    let trial: ReturnType<typeof trialProperties> | null = null;
    let purchaseStarted = false;
    (async () => {
      try {
        const purchases = await purchasesFor(uid);
        ensurePrivateCheckoutRoot();
        const result = await purchases.presentPaywall({
          offering,
          htmlTarget: target,
          customerEmail: email ?? undefined,
          metadata: {
            funnel_id: funnelId,
            ...(consentAt ? { withdrawal_waiver_version: WITHDRAWAL_CONSENT_VERSION, withdrawal_waiver_at: consentAt } : {}),
          },
          hideBackButtons: true,
          listener: {
            onPurchaseStarted: (rcPackage) => {
              purchaseStarted = true;
              if (!metaMatchingHadFbp.current) {
                metaMatchingHadFbp.current = true;
                sendMetaMatching(uid, email, "purchase_start");
              }
              plan = planIdOf(rcPackage);
              trial = trialProperties(packageOffersTrial(rcPackage), trialExpected);
              setFailure(null);
              trackWebFunnelEvent(WEB_FUNNEL_EVENTS.checkoutStart, { ...context, plan, ...trial });
            },
            onPurchaseError: (error) => {
              void toCheckoutFailure(error).then(({ code, rcErrorCode }) =>
                trackWebFunnelEvent(WEB_FUNNEL_EVENTS.checkoutFailed, {
                  ...context,
                  plan,
                  reason: code,
                  rc_error_code: rcErrorCode,
                  retryable: true,
                }),
              );
            },
          },
        });
        if (!active) return;
        plan = planIdOf(result.selectedPackage) ?? plan;
        trial = trialProperties(packageOffersTrial(result.selectedPackage), trialExpected);
        setPaying("confirming");
        const unlocked = await waitForPremium(uid, result.customerInfo);
        if (!active) return;
        trackWebFunnelEvent(WEB_FUNNEL_EVENTS.checkoutSuccess, {
          ...context,
          plan,
          ...trial,
          entitlement_confirmed: unlocked,
        });
        router.push(welcomePath(!unlocked));
      } catch (error) {
        if (!active) return;
        const { code, rcErrorCode } = await toCheckoutFailure(error);
        if (!active) return;
        // Purchase errors stay inside the paywall, so a failure before any
        // purchase started is the paywall failing to load, not a payment.
        if (!purchaseStarted && code !== "cancelled" && code !== "already_purchased") {
          trackWebFunnelEvent(WEB_FUNNEL_EVENTS.checkoutFailed, {
            ...context,
            reason: "paywall_load_failed",
            rc_error_code: rcErrorCode,
          });
          setPaywallFailed(true);
          return;
        }
        trackWebFunnelEvent(WEB_FUNNEL_EVENTS.checkoutFailed, { ...context, plan, reason: code, rc_error_code: rcErrorCode });
        // Usually a retry after a first purchase that went through, so not `member`.
        if (code === "already_purchased") {
          router.push(welcomePath(false));
          return;
        }
        setFailure(code);
      }
    })();
    return () => {
      active = false;
      host.replaceChildren();
    };
    // welcomePath and context only change with the session and URL already in the deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, offering, presentKey, paywallAllowed]);

  const confirmWithdrawalConsent = async () => {
    if (!uid || !consentTicked || consentSaving) return;
    setConsentSaving(true);
    const attributes = withdrawalConsentAttributes(country, new Date());
    const recorded = await saveWithdrawalConsent(uid, attributes);
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.withdrawalConsent, {
      funnel_id: funnelId,
      wording_version: WITHDRAWAL_CONSENT_VERSION,
      recorded,
    });
    setConsentSaving(false);
    setConsentAt(attributes.withdrawal_waiver_at);
  };

  if (keyProblem || plans.status === "no_paywall") {
    return (
      <SectionHeading
        as="h1"
        size="title"
        align="center"
        title="Checkout isn't available right now"
        lead="Please try again later, or get PrepIt from the App Store."
      />
    );
  }

  if (session.status !== "signedIn" || account?.status === "loading" || plans.status === "loading" || plans.status === "already_subscribed" || plans.status === "email_in_use") {
    return <p className="text-body text-ink-secondary">Loading your plans…</p>;
  }

  if (account?.status === "error" || plans.status === "error" || paywallFailed) {
    return (
      <>
        <SectionHeading as="h1" size="title" align="center" title="We couldn't load the plans" lead="Please try again in a moment." />
        <button
          type="button"
          className={PRIMARY_BUTTON_CLASS}
          onClick={() => {
            if (paywallFailed) {
              setPaywallFailed(false);
              setPresentKey((key) => key + 1);
              return;
            }
            reloadAccount();
            setReloadKey((key) => key + 1);
          }}
        >
          Try again
        </button>
      </>
    );
  }

  const message = failure ? FAILURE_MESSAGES[failure] : null;

  return (
    <>
      {paying === "confirming" ? (
        <p role="status" className="text-body text-ink-secondary">
          Confirming your subscription…
        </p>
      ) : !paywallAllowed ? (
        <form
          className="flex w-full flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void confirmWithdrawalConsent();
          }}
        >
          <SectionHeading as="h2" size="title" align="center" title="Before you choose a plan" />
          <label className="flex items-start gap-2.5 text-left text-small text-ink-secondary">
            <input
              type="checkbox"
              className="mt-px size-5 flex-none accent-primary"
              checked={consentTicked}
              onChange={(event) => setConsentTicked(event.target.checked)}
            />
            {WITHDRAWAL_CONSENT_TEXT}
          </label>
          <button type="submit" className={PRIMARY_BUTTON_CLASS} disabled={!consentTicked || consentSaving}>
            Continue to plans
          </button>
        </form>
      ) : (
        <div ref={paywallHost} className="ph-no-capture w-full" data-testid="revenuecat-paywall" />
      )}
      {failure && paying === "idle" && (
        <div className="flex w-full flex-col gap-3">
          {message && (
            <p role="alert" className="text-small text-error">
              {message}
            </p>
          )}
          {failure !== "payment_pending" && (
            <button
              type="button"
              className={PRIMARY_BUTTON_CLASS}
              onClick={() => {
                setFailure(null);
                setPresentKey((key) => key + 1);
              }}
            >
              Show the plans again
            </button>
          )}
        </div>
      )}
      {/* Which account is paying, so an old session on the wrong account is visible. */}
      <p className="ph-no-capture text-small text-ink-muted">
        Paying for the PrepIt account signed in{provider ? ` with ${PROVIDER_NAMES[provider]}` : ""}
        {email ? ` as ${email}` : ""}.{" "}
        <button
          type="button"
          className={TEXT_BUTTON_CLASS}
          onClick={() => {
            void signOutOfWebsite().then(resetWebUser);
          }}
        >
          Not you? Sign out
        </button>
      </p>
      <p className="text-small text-ink-muted">
        Renews automatically until you cancel. Cancel any time at tryprepit.app/account. See our{" "}
        <Link href="/terms-and-conditions" className="underline underline-offset-4 hover:text-ink">
          Terms
        </Link>
        ,{" "}
        <Link href="/subscription-policy" className="underline underline-offset-4 hover:text-ink">
          Subscription policy
        </Link>{" "}
        and{" "}
        <Link href="/refund-policy" className="underline underline-offset-4 hover:text-ink">
          Refund policy
        </Link>
        .
      </p>
    </>
  );
}
