"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useWebSession, type WebSessionState } from "@/components/account/useWebSession";
import { Assurances, BridgeAlert, BridgeHead, BridgeHeader, BridgeProgress, SUPPORT_EMAIL } from "@/components/bridge/BridgeParts";
import PaywallSkeleton from "@/components/bridge/PaywallSkeleton";
import SignedInChip from "@/components/bridge/SignedInChip";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRIMARY_BUTTON_CLASS } from "@/components/ui/buttons";
import { providerOf, signOutOfWebsite } from "@/lib/firebase/auth";
import { readBridgeVisit, writeBridgeVisit } from "@/lib/funnel/bridgeHandoff";
import {
  CHECKOUT_FAILURE_MESSAGES,
  classifyPurchasesError,
  couldNotStart,
  DECLINED_LINE,
  offeringPrices,
  startingLine,
  zeroIn,
  welcomeBackTerms,
  type CheckoutFailure,
} from "@/lib/funnel/checkoutStates";
import { checkoutTimer } from "@/lib/funnel/checkoutTimings";
import { bridgePath, parseFunnelId, type BridgeSource } from "@/lib/funnel/params";
import type { BridgeHandoff } from "@/lib/funnel/bridgeHandoff";
import {
  annualSaving,
  buildPaywallVariables,
  isWebPaywallOffering,
  paywallDateStyle,
  typedPaywallVariables,
  type AppStoreRating,
} from "@/lib/funnel/paywallVariables";
import { parsePlanId, WEB_PRICES, WEB_REMINDER_EMAIL_LIVE, type PlanId } from "@/lib/pricing";
import { prefetchCheckout } from "@/lib/revenuecat/checkoutPrefetch";
import { paywallFontCount, waitForPaywallDrawn } from "@/lib/revenuecat/paywallWarmup";
import {
  checkoutValueFor,
  ensurePrivateCheckoutRoot,
  hadPremium,
  hasPremium,
  offeringOffersTrial,
  packageOffersTrial,
  planIdOf,
  purchasesFor,
  sendMetaMatchingToRevenueCat,
  toCheckoutFailure,
  waitForPremium,
  webBillingKey,
  webBillingKeyProblem,
} from "@/lib/revenuecat/webBilling";
import { forceLightPaywall, systemPrefersDark } from "@/lib/revenuecat/lightPaywall";
import { WEB_BILLING_SELLER_NAMES, webBillingSellerFor } from "@/lib/revenuecat/sellers";
import { cartWho } from "@/lib/funnel/cart";
import type { Offering } from "@revenuecat/purchases-js";
import { identifyPixelUser, trackCheckoutInitiated } from "@/lib/metaPixel";
import { resetWebUser, trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

/**
 * `has_trial` is RevenueCat's answer for this customer; `trial_expected` is
 * ours (no trial in PrepIt's record or RevenueCat's history). A mismatch means
 * RevenueCat offered a trial to someone who already had one, so a product's
 * trial eligibility setting is probably wrong.
 */
function trialProperties(hasTrial: boolean, trialExpected: boolean) {
  return { has_trial: hasTrial, trial_expected: trialExpected, trial_mismatch: hasTrial && !trialExpected };
}

/** How long the skeleton takes to fade out over the drawn paywall. */
const SKELETON_FADE_MS = 350;

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
 * subscribed, and the "You're in" handoff once `premium` is active. UK and
 * EEA buyers are asked nothing extra: cancelling within 14 days of signing up
 * gets a full refund (/withdraw), so there is no "start my access now" box
 * (removed in PRE-371).
 *
 * The country also picks the company that sells (PRE-355): US, Canada,
 * Australia and New Zealand buy on the US company's Web Billing app, everyone
 * else on the UK company's (lib/revenuecat/sellers.ts).
 *
 * The paywall fills the page (PRE-375): no card around it, the page turns
 * white to match the paywall's light background, and the signed-in account
 * with Sign out sits in a slim header above it. `header={false}` is for /start,
 * which draws its own header with the account. The paywall always shows its
 * light colours, like the rest of the site (lightPaywall.ts).
 */
/**
 * What /start knows that /checkout doesn't (PRE-438): where they came from
 * (a quiz plan is saved to the account) and the line over the paywall for a free
 * week ("Your plan is saved." or "You're signed in."). With it, Checkout also
 * draws the assurances under the paywall, for the free week or not as
 * RevenueCat offers it.
 */
export type CheckoutBridge = {
  from: BridgeSource;
  signedInTitle: string;
  /**
   * For the web paywall (PRE-462): the quiz's saved plan and the App Store
   * rating, passed to the paywall as custom variables.
   */
  handoff?: BridgeHandoff | null;
  rating?: AppStoreRating | null;
};

export default function Checkout({
  country,
  refundWindow,
  header = true,
  bridge = null,
  webSession = null,
}: {
  country: string | null;
  /** The cart's rule (`buildCartMarket`): the UK company, in the UK, the EEA or an unknown country. */
  refundWindow: boolean;
  header?: boolean;
  bridge?: CheckoutBridge | null;
  /**
   * The page's own session, when it already has one (/start): Checkout then
   * uses it instead of reading the account a second time (PRE-464).
   */
  webSession?: WebSessionState | null;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const funnelId = parseFunnelId(params.get("funnel"));
  const requestedPlan = parsePlanId(params.get("plan"));
  const ownSession = useWebSession({ enabled: webSession === null });
  const { session, reloadAccount } = webSession ?? ownSession;
  const seller = webBillingSellerFor(country);
  const billing = webBillingKey(seller);
  const keyProblem = webBillingKeyProblem(seller);

  const [plansState, setPlans] = useState<{ key: string; plans: Plans } | null>(null);
  const [paying, setPaying] = useState<"idle" | "confirming">("idle");
  // Whether the purchase being confirmed started a free week, for "Starting your free week."
  const [confirmingTrial, setConfirmingTrial] = useState(true);
  // RevenueCat reported a declined card (PRE-438): our line over its error, until the next try starts.
  const [declined, setDeclined] = useState(false);
  // Welcome back (no free week on this account): "Continue to payment" was pressed.
  const [continued, setContinued] = useState(false);
  const welcomeBackTracked = useRef(false);
  const [failure, setFailure] = useState<CheckoutFailure | null>(null);
  // The paywall itself couldn't be shown (nothing was bought).
  const [paywallFailed, setPaywallFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // Bumped to show the paywall again after a purchase that didn't go through.
  const [presentKey, setPresentKey] = useState(0);
  const paywallTracked = useRef(false);
  const paywallHost = useRef<HTMLDivElement>(null);
  // The showing (offering and presentKey) whose paywall is drawn, and whose skeleton has
  // finished fading out (PRE-464). Any other showing still has its skeleton up.
  const [drawnFor, setDrawnFor] = useState<string | null>(null);
  const [skeletonGoneFor, setSkeletonGoneFor] = useState<string | null>(null);
  const drawnTracked = useRef(false);

  const uid = session.status === "signedIn" ? session.user.uid : null;
  const account = session.status === "signedIn" ? session.account : null;
  const summary = account?.status === "ready" ? account.summary : null;
  const plansKey = uid && summary ? `${uid}:${summary.hasUsedTrial}:${summary.isSubscribed}:${reloadKey}` : null;
  const plans: Plans = useMemo(
    () => (plansState && plansState.key === plansKey ? plansState.plans : { status: "loading" }),
    [plansState, plansKey],
  );

  // RevenueCat starts as soon as they're signed in, alongside the PrepIt account (PRE-464).
  // On /start the bridge has usually started it already, and this picks up the same answer.
  useEffect(() => {
    if (!uid || keyProblem) return;
    prefetchCheckout(uid, seller);
  }, [uid, seller, keyProblem]);
  useEffect(() => {
    if (uid && summary) checkoutTimer.mark(uid, "account");
  }, [uid, summary]);

  // Signed out: sign in first, then come back here with the same plan.
  useEffect(() => {
    if (session.status !== "signedOut") return;
    // The cart on /start signs them in and shows this checkout on the same page (PRE-437).
    router.replace(bridgePath({ from: "landing", plan: requestedPlan, funnel: funnelId }));
  }, [session.status, requestedPlan, funnelId, router]);

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
        // The customer info and the offering were fetched at the same time (PRE-464),
        // usually while the PrepIt account loaded. Try again fetches afresh.
        const prefetched = prefetchCheckout(uid, seller, { generation: reloadKey, take: true });
        // Premium from any store (an App Store subscription, or a web
        // purchase made before the account existed) means no checkout, even if
        // the offering failed.
        const customerInfo = await prefetched.customerInfo;
        if (hasPremium(customerInfo)) return done({ status: "already_subscribed" });
        const loaded = await prefetched.offering;
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
  }, [uid, summary, plansKey, keyProblem, seller, reloadKey]);

  const offering = plans.status === "ready" ? plans.offering : null;
  const trialExpected = plans.status === "ready" ? plans.trialExpected : false;
  // RevenueCat offers this account no free week, so they'd pay today: the cart
  // said $0, so Welcome back comes first, with today's price (PRE-438).
  // Before the offering loads, PrepIt's own record is the best guess (for the progress bar).
  const offersTrial = offering ? offeringOffersTrial(offering) : !summary?.hasUsedTrial;
  const welcomeBack = offering !== null && !offersTrial;
  // The web paywall (PRE-462, Charlie's design in RevenueCat on the `web_checkout`
  // offering) carries its own welcome back, signed-in line, terms and
  // reassurances, so this page leaves those to it.
  const webPaywall = isWebPaywallOffering(offering);
  const showPaywall = offering !== null && (!welcomeBack || continued || webPaywall);
  // RevenueCat's own prices for this visitor, so Welcome back always matches the payment form.
  const prices = useMemo(() => {
    if (!offering) return null;
    const priceOf = (plan: PlanId) =>
      offering.availablePackages.find((candidate) => planIdOf(candidate) === plan)?.webBillingProduct.price;
    return offeringPrices({ annual: priceOf("annual"), monthly: priceOf("monthly") });
  }, [offering]);

  // `billing_seller`: whose Web Billing app this checkout sells on;
  // `billing_seller_fallback`: that seller's own key isn't set, so this is on the shared pre-PRE-355 key.
  // `offering_id`: which offering's paywall, so every checkout event splits by paywall (PRE-462).
  const offeringId = offering?.identifier ?? null;
  const context = useMemo(
    () => ({ funnel_id: funnelId, billing_seller: seller, billing_seller_fallback: billing.fellBack, offering_id: offeringId }),
    [funnelId, seller, billing.fellBack, offeringId],
  );

  useEffect(() => {
    if (!welcomeBack || continued || webPaywall || welcomeBackTracked.current) return;
    welcomeBackTracked.current = true;
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.welcomeBackView, {
      ...context,
      trial_expected: trialExpected,
      has_prices: prices !== null,
    });
  }, [welcomeBack, continued, webPaywall, context, trialExpected, prices]);

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
    } else if (plans.status === "ready" && showPaywall) {
      paywallTracked.current = true;
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.paywallView, {
        ...context,
        plan: requestedPlan,
        // The visitor's system is dark, so the light paywall was forced (PRE-375).
        system_dark_mode: systemPrefersDark(),
        ...trialProperties(offeringOffersTrial(plans.offering), plans.trialExpected),
        // How long each step took after sign-in (PRE-464); the drawn time is on web_paywall_drawn.
        ...(uid ? checkoutTimer.properties(uid) : {}),
      });
      if (session.status === "signedIn") identifyPixelUser(session.user.uid, session.user.email);
      trackCheckoutInitiated(checkoutValueFor(plans.offering, requestedPlan));
    }
  }, [plans, keyProblem, context, requestedPlan, session, showPaywall, uid]);

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
      sendMetaMatchingToRevenueCat(forUid, seller, forEmail)
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
    [context, seller],
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
      router.replace(bridgePath({ from: "landing", plan: requestedPlan, funnel: funnelId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans.status]);

  // The web paywall's custom variables (PRE-462): dates from today, prices and
  // seller from this offering, the quiz's plan and the live rating rule.
  const [today] = useState(() => new Date());
  const bridgeFrom = bridge?.from;
  const bridgeHandoff = bridge?.handoff ?? null;
  const bridgeRating = bridge?.rating ?? null;
  const signedInTitle = bridge?.signedInTitle ?? "You’re signed in.";
  const paywallVariables = useMemo(() => {
    if (!offering || !webPaywall) return undefined;
    const priceOf = (plan: PlanId) =>
      offering.availablePackages.find((candidate) => planIdOf(candidate) === plan)?.webBillingProduct.price;
    const annual = priceOf("annual");
    const monthly = priceOf("monthly");
    const listed = WEB_PRICES[seller];
    return typedPaywallVariables(
      buildPaywallVariables({
        today,
        dateStyle: paywallDateStyle(country),
        trial: offeringOffersTrial(offering),
        refundWindow,
        reminder: WEB_REMINDER_EMAIL_LIVE,
        sellerName: WEB_BILLING_SELLER_NAMES[seller],
        savedPlan:
          bridgeFrom === "quiz" && bridgeHandoff
            ? { forLine: cartWho("quiz", bridgeHandoff.startingPoint).line, ...bridgeHandoff.planSummary }
            : null,
        rating: bridgeRating,
        signedInTitle,
        saving: annualSaving(annual, monthly),
        currencyName: listed && annual?.currency === listed.currency ? listed.currencyName : null,
      }),
    );
  }, [offering, webPaywall, today, country, seller, refundWindow, bridgeFrom, bridgeHandoff, bridgeRating, signedInTitle]);
  // Where RevenueCat's card form opens on the web paywall: in the page under it, not a pop-up.
  const cardHost = useRef<HTMLDivElement>(null);

  // Shows RevenueCat's paywall in the page. It runs the purchase itself (with
  // 3-D Secure and its own retryable errors); this waits for the result.

  useEffect(() => {
    const host = paywallHost.current;
    if (!uid || !offering || !showPaywall || !host || paying !== "idle") return;
    let active = true;
    // A fresh element per showing, so a second showing never stacks on the first.
    const target = document.createElement("div");
    host.replaceChildren(target);
    // The card form gets a fresh element too, so a failed try never leaves a stale form behind.
    const cardHostElement = webPaywall ? cardHost.current : null;
    const cardTarget = cardHostElement ? document.createElement("div") : null;
    if (cardHostElement && cardTarget) cardHostElement.replaceChildren(cardTarget);
    let plan: PlanId | null = null;
    let trial: ReturnType<typeof trialProperties> | null = null;
    let purchaseStarted = false;
    // The paywall couldn't be shown, so there's nothing to wait for.
    let loadFailed = false;
    const releaseLight = forceLightPaywall();
    // When RevenueCat has drawn it, with its fonts and icons, the skeleton fades into it (PRE-464).
    const showing = `${offering.identifier}:${presentKey}`;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    void waitForPaywallDrawn(target, {
      fontCount: paywallFontCount(offering),
      fontsBefore: document.fonts.size,
      cancelled: () => !active || loadFailed,
    }).then((drawn) => {
      if (!drawn || !active || loadFailed) return;
      checkoutTimer.mark(uid, "paywall_drawn");
      setDrawnFor(showing);
      fadeTimer = setTimeout(() => setSkeletonGoneFor(showing), SKELETON_FADE_MS);
      if (drawnTracked.current) return;
      drawnTracked.current = true;
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.paywallDrawn, { ...context, ...drawn, ...checkoutTimer.properties(uid) });
    });
    (async () => {
      try {
        const purchases = await purchasesFor(uid, seller);
        ensurePrivateCheckoutRoot();
        checkoutTimer.mark(uid, "paywall_start");
        const result = await purchases.presentPaywall({
          offering,
          htmlTarget: target,
          customerEmail: email ?? undefined,
          metadata: { funnel_id: funnelId },
          hideBackButtons: true,
          ...(paywallVariables ? { customVariables: paywallVariables } : {}),
          ...(cardTarget ? { purchaseHtmlTarget: cardTarget } : {}),
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
              setDeclined(false);
              if (webPaywall) cardHost.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              trackWebFunnelEvent(WEB_FUNNEL_EVENTS.checkoutStart, { ...context, plan, ...trial });
            },
            onPurchaseError: (error) => {
              // RevenueCat keeps its sheet open with its own error; ours is there when it closes.
              const { errorCode, message } = error as { errorCode?: unknown; message?: string };
              if (typeof errorCode === "number" && classifyPurchasesError(errorCode, message) === "declined") setDeclined(true);
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
        setConfirmingTrial(trial.has_trial);
        setDeclined(false);
        setPaying("confirming");
        // What "You're in" recaps: the plan, the company that billed it, and from when (PRE-438).
        const bought = result.selectedPackage.webBillingProduct.price;
        writeBridgeVisit({
          from: readBridgeVisit()?.from ?? bridge?.from ?? "landing",
          trial: trial.has_trial,
          purchase: {
            plan,
            amount: bought?.formattedPrice ?? null,
            free: zeroIn(bought?.currency ?? "USD"),
            startedAt: new Date().toISOString(),
          },
        });
        const unlocked = await waitForPremium(uid, seller, result.customerInfo);
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
          loadFailed = true;
          setPaywallFailed(true);
          return;
        }
        trackWebFunnelEvent(WEB_FUNNEL_EVENTS.checkoutFailed, { ...context, plan, reason: code, rc_error_code: rcErrorCode });
        // Usually a retry after a first purchase that went through, so not `member`.
        if (code === "already_purchased") {
          router.push(welcomePath(false));
          return;
        }
        if (code === "declined") setDeclined(true);
        setFailure(code);
      }
    })();
    return () => {
      active = false;
      clearTimeout(fadeTimer);
      releaseLight();
      host.replaceChildren();
      cardHostElement?.replaceChildren();
    };
    // welcomePath and context only change with the session and URL already in the deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, offering, presentKey, showPaywall]);

  const signOut = () => {
    void signOutOfWebsite().then(resetWebUser);
  };
  // Which account is paying, so an old session on the wrong account is visible.
  const top = (
    <>
      {header && (
        <BridgeHeader>
          {session.status === "signedIn" && <SignedInChip provider={provider} email={email} onSignOut={signOut} compact />}
        </BridgeHeader>
      )}
      {bridge && <BridgeProgress from={bridge.from} current="trial" trial={offersTrial} />}
    </>
  );

  if (keyProblem || plans.status === "no_paywall") {
    return (
      <>
        {top}
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title="Checkout isn't available right now"
          lead="Please try again in a few minutes."
        />
      </>
    );
  }

  if (session.status !== "signedIn" || account?.status === "loading" || plans.status === "loading" || plans.status === "already_subscribed" || plans.status === "email_in_use") {
    return (
      <>
        {top}
        {/* The web paywall's cream, with its shape in bones, until it is drawn (PRE-464). */}
        <span hidden data-paywall-page="web" />
        <PaywallSkeleton />
      </>
    );
  }

  if (account?.status === "error" || plans.status === "error" || paywallFailed) {
    // Couldn't start (PRE-438): nothing was charged, the plan is saved, Try again.
    const failed = couldNotStart(offersTrial, bridge?.from === "quiz");
    return (
      <>
        {top}
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="font-display text-title text-ink">{failed.title}</h1>
          <p className="text-small text-ink-secondary">{failed.body}</p>
          <button
            type="button"
            className={PRIMARY_BUTTON_CLASS}
            onClick={() => {
              if (paywallFailed) {
                setPaywallFailed(false);
                setPresentKey((key) => key + 1);
                return;
              }
              // /start's own session is never reloaded from here: that would take the page
              // back to the cart. Its account errors are the bridge's to show.
              if (!webSession) reloadAccount();
              setReloadKey((key) => key + 1);
            }}
          >
            Try again
          </button>
          <p className="text-small text-ink-muted">
            Still stuck? Email <span className="select-all font-bold text-ink">{SUPPORT_EMAIL}</span>.
          </p>
        </div>
      </>
    );
  }

  // Welcome back (PRE-438): this account has had its free week, so before
  // RevenueCat's paywall, today's price and "Continue to payment", with no
  // "free" or "trial" words.
  if (welcomeBack && !continued && !webPaywall) {
    return (
      <>
        {top}
        <BridgeHead
          eyebrow="Welcome back"
          title="Pick up where you left off."
          lead="This account has had its free week, so your plan starts today. Your logs and notes are still there."
        />
        <section aria-labelledby="welcome-back-plan" className="flex flex-col gap-2.5">
          <h2 id="welcome-back-plan" className="text-eyebrow font-bold uppercase tracking-[0.12em] text-ink-muted">
            Your plan
          </h2>
          {prices ? (
            <ul aria-label="Today’s prices" className="flex flex-col border-t border-line">
              <li className="flex items-baseline justify-between gap-3 border-b border-line py-2.5 text-[15px] text-ink-secondary">
                <b className="font-bold text-ink">Annual</b>
                <span className="text-right tabular-nums">
                  <b className="font-semibold text-ink">{prices.annual} a year</b>
                  {prices.annualPerMonth && (
                    <small className="block text-[13px] text-ink-muted">{prices.annualPerMonth} a month</small>
                  )}
                </span>
              </li>
              <li className="flex items-baseline justify-between gap-3 border-b border-line py-2.5 text-[15px] text-ink-secondary">
                <b className="font-bold text-ink">Monthly</b>
                <span className="text-right tabular-nums">
                  <b className="font-semibold text-ink">{prices.monthly} a month</b>
                  <small className="block text-[13px] text-ink-muted">billed monthly</small>
                </span>
              </li>
            </ul>
          ) : (
            <p className="text-small text-ink-secondary">Annual or monthly. You’ll see the price on the next step.</p>
          )}
        </section>
        <button
          type="button"
          className={PRIMARY_BUTTON_CLASS}
          onClick={() => {
            trackWebFunnelEvent(WEB_FUNNEL_EVENTS.welcomeBackContinue, context);
            setContinued(true);
          }}
        >
          Continue to payment
        </button>
        <p className="text-small text-ink-muted">{welcomeBackTerms(prices)}</p>
        {bridge && <Assurances trial={false} />}
      </>
    );
  }

  const showingId = offering ? `${offering.identifier}:${presentKey}` : null;
  const drawn = showingId !== null && drawnFor === showingId;
  const message = failure ? CHECKOUT_FAILURE_MESSAGES[failure] : null;
  const starting = startingLine(confirmingTrial);
  let intro: ReactNode = null;
  if (bridge && paying === "idle" && !webPaywall) {
    intro = welcomeBack ? (
      <p className="text-small text-ink-secondary">
        <b className="font-bold text-ink">Your plan starts today.</b> Pick annual or monthly below.
      </p>
    ) : (
      <BridgeAlert tone="success" title={bridge.signedInTitle}>
        Your free 7 days are one step away. Nothing was charged.
      </BridgeAlert>
    );
  }

  return (
    <>
      {top}
      {intro}
      {/* Our line over RevenueCat's own error: the card wasn't added and nothing was charged (PRE-438). */}
      {declined && paying === "idle" && !failure && (
        <p role="alert" className="rounded-icon border border-energy bg-energy/20 px-4 py-3 text-small text-ink">
          {DECLINED_LINE}
        </p>
      )}
      {paying === "confirming" ? (
        <p role="status" className="text-center text-body text-ink-secondary">
          <b className="font-bold text-ink">{starting.title}</b> {starting.body}
        </p>
      ) : (
        <>
          {/* Turns the page white like the paywall (globals.css). */}
          <span hidden data-paywall-page={webPaywall ? "web" : ""} />
          {/*
            RevenueCat draws the paywall under its skeleton, invisible, and it fades in
            over the skeleton once drawn (PRE-464), so there's no blank flash or jump.
          */}
          <div className="relative w-full">
            {skeletonGoneFor !== showingId && (
              <PaywallSkeleton
                className={
                  drawn
                    ? "pointer-events-none absolute inset-x-0 top-0 opacity-0 transition-opacity duration-300 ease-out motion-reduce:transition-none"
                    : ""
                }
              />
            )}
            <div
              ref={paywallHost}
              inert={!drawn}
              aria-hidden={drawn ? undefined : true}
              className={`ph-no-capture w-full transition-opacity duration-300 ease-out motion-reduce:transition-none ${
                drawn ? "opacity-100" : "pointer-events-none absolute inset-x-0 top-0 opacity-0"
              }`}
              data-paywall-host=""
              data-paywall-drawn={drawn ? "" : undefined}
              data-testid="revenuecat-paywall"
            />
          </div>
          {webPaywall && <div ref={cardHost} className="ph-no-capture w-full scroll-mt-4" data-testid="revenuecat-card-form" />}
        </>
      )}
      {failure && paying === "idle" && (
        <div className="flex w-full flex-col items-center gap-3 text-center">
          {message && (
            <p
              role="alert"
              className={
                failure === "declined"
                  ? "rounded-icon border border-energy bg-energy/20 px-4 py-3 text-small text-ink"
                  : "text-small text-error"
              }
            >
              {message}
            </p>
          )}
          <button
            type="button"
            className={PRIMARY_BUTTON_CLASS}
            onClick={() => {
              setFailure(null);
              setDeclined(false);
              setPresentKey((key) => key + 1);
            }}
          >
            Show the plans again
          </button>
        </div>
      )}
      {!webPaywall && (
      <p className="text-center text-small text-ink-muted">
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
      )}
      {bridge && paying === "idle" && !webPaywall && <Assurances trial={offersTrial} />}
    </>
  );
}
