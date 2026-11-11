"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Checkout from "@/app/checkout/Checkout";
import { useSaveWebSignup } from "@/components/account/useSaveWebSignup";
import { useWebSession } from "@/components/account/useWebSession";
import {
  BridgeFooter,
  BridgeHead,
  BridgeHeader,
  BridgeProgress,
  SUPPORT_EMAIL,
} from "@/components/bridge/BridgeParts";
import SignedInChip from "@/components/bridge/SignedInChip";
import Cart from "./Cart";
import { PRIMARY_BUTTON_CLASS, TEXT_BUTTON_CLASS } from "@/components/ui/buttons";
import { openAppUrl } from "@/lib/appStore";
import { providerOf, signInAuthDomain, signOutOfWebsite } from "@/lib/firebase/auth";
import { readBridgeHandoff, writeBridgeVisit, type BridgeHandoff } from "@/lib/funnel/bridgeHandoff";
import { couldNotStart } from "@/lib/funnel/checkoutStates";
import { checkoutTimer } from "@/lib/funnel/checkoutTimings";
import type { CartMarket } from "@/lib/funnel/cart";
import type { AppStoreRating } from "@/lib/funnel/paywallVariables";
import { parseBridgeSource, parseFunnelId } from "@/lib/funnel/params";
import { parsePlanId } from "@/lib/pricing";
import { prefetchCheckout, warmPurchasesSdk } from "@/lib/revenuecat/checkoutPrefetch";
import { webBillingSellerFor } from "@/lib/revenuecat/sellers";
import { webBillingKeyProblem } from "@/lib/revenuecat/webBilling";
import { identifyPixelUser, trackSignupRegistration } from "@/lib/metaPixel";
import { resetWebUser, trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

/**
 * The shared bridge (PRE-323) for the landing page and the quiz. Before
 * sign-in it is the cart (PRE-437, Cart.tsx): the free consultation, both
 * prices and the sign-in buttons; the plan is picked on RevenueCat's paywall
 * after sign-in, on this page. While the account and the quiz's answers are
 * saved, the cart stays up with "Saving your plan…" on its button. Then members
 * get their own page, people who had a trial get "Welcome back", and
 * everyone else goes on to RevenueCat's checkout and then "You're in".
 */
/**
 * `country` picks the company that sells at checkout (PRE-355); `market` is
 * the cart's prices and terms for that company, read on the server (PRE-437).
 */
export default function StartBridge({
  country,
  market,
  rating: ratingLookup,
}: {
  country: string | null;
  market: CartMarket;
  /** PrepIt's App Store rating in the visitor's storefront, for the web paywall's rating line (PRE-462). */
  rating?: Promise<AppStoreRating | null>;
}) {
  const params = useSearchParams();
  const from = parseBridgeSource(params.get("from"));
  const funnelId = parseFunnelId(params.get("funnel"));
  // The plan named in the link that sent them here, or null: the plan itself is
  // picked on RevenueCat's paywall (PRE-375).
  const plan = parsePlanId(params.get("plan"));
  const context = useMemo(() => ({ funnel_id: funnelId, plan, from }), [funnelId, plan, from]);

  const webSession = useWebSession();
  const { session, reloadAccount } = webSession;
  const save = useSaveWebSignup(session, funnelId, reloadAccount);
  // The quiz's answers live in this browser. useSearchParams keeps this page
  // out of the server render, so reading storage here can't mismatch.
  const [handoff, setHandoff] = useState<BridgeHandoff | null>(() => readBridgeHandoff());
  // PrepIt is iPhone-only: Android visitors stop before any card is taken.
  const [android] = useState(() => typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent));
  const [androidContinue, setAndroidContinue] = useState(false);
  const [today] = useState(() => new Date());
  // Long settled by the time they've signed in; until then the rating line stays hidden.
  const [rating, setRating] = useState<AppStoreRating | null>(null);
  useEffect(() => {
    let active = true;
    if (!ratingLookup) return;
    // A promise from the server arrives as React's thenable, whose `then` returns
    // nothing, so it is wrapped in a real Promise before chaining.
    Promise.resolve(ratingLookup)
      .then((value) => {
        if (active) setRating(value);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [ratingLookup]);
  const viewTracked = useRef(false);
  const signInTracked = useRef<string | null>(null);

  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.bridgeView, { ...context, has_quiz_answers: handoff !== null, android });
  }, [context, handoff, android]);

  const account = session.status === "signedIn" ? session.account : null;
  const summary = account?.status === "ready" ? account.summary : null;

  // Faster paywall after sign-in (PRE-464). RevenueCat's SDK code loads in the
  // background while they're on the cart, and once they're signed in its
  // customer info and offering are fetched alongside the PrepIt account and the
  // quiz save, instead of after them. Checkout picks the same answer up.
  const uid = session.status === "signedIn" ? session.user.uid : null;
  const seller = webBillingSellerFor(country);
  useEffect(() => {
    const timer = setTimeout(warmPurchasesSdk, 1_500);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!uid) return;
    checkoutTimer.start(uid);
    if (webBillingKeyProblem(seller)) return;
    prefetchCheckout(uid, seller);
  }, [uid, seller]);
  useEffect(() => {
    if (uid && summary) checkoutTimer.mark(uid, "account");
  }, [uid, summary]);
  useEffect(() => {
    if (uid && summary && save.status === "done") checkoutTimer.mark(uid, "signup_saved");
  }, [uid, summary, save.status]);

  // One sign-up result per signed-in uid on this page.
  useEffect(() => {
    if (session.status !== "signedIn" || !summary || signInTracked.current === session.user.uid) return;
    signInTracked.current = session.user.uid;
    if (summary.emailInUse) {
      trackWebFunnelEvent(WEB_FUNNEL_EVENTS.signInFailed, {
        ...context,
        reason: "email_in_use",
        existing_provider: summary.emailInUse.existingProvider,
      });
      return;
    }
    identifyPixelUser(session.user.uid, session.user.email);
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.signupSuccess, {
      ...context,
      has_account: summary.hasAccount,
      is_subscribed: summary.isSubscribed,
      has_quiz_answers: handoff !== null,
      auth_domain: signInAuthDomain(),
    });
    // New to PrepIt (no app account yet): a registration for Meta, with no details.
    if (!summary.hasAccount) trackSignupRegistration(session.user.uid);
  }, [session, summary, context, handoff]);

  const accountError = account?.status === "error" ? account.code : null;
  useEffect(() => {
    if (accountError) trackWebFunnelEvent(WEB_FUNNEL_EVENTS.bridgeError, { ...context, code: accountError });
  }, [accountError, context]);

  // The "You're in" page after checkout reads this (Checkout owns the redirect).
  const atCheckout = Boolean(summary && !summary.isSubscribed && !summary.emailInUse && save.status === "done");
  const trial = !summary?.hasUsedTrial;
  useEffect(() => {
    if (atCheckout) writeBridgeVisit({ from, trial });
  }, [atCheckout, from, trial]);

  async function signOut(keepQuizAnswers = false) {
    await signOutOfWebsite({ keepQuizAnswers });
    if (!keepQuizAnswers) setHandoff(null);
    resetWebUser();
  }

  const provider = session.status === "signedIn" ? providerOf(session.user) : null;
  const chip =
    session.status === "signedIn" ? (
      <SignedInChip provider={provider} email={session.user.email} onSignOut={() => void signOut()} />
    ) : null;

  if (session.status === "loading") {
    return (
      <Narrow>
        <BridgeHeader />
        <p className="text-body text-ink-secondary">Loading…</p>
      </Narrow>
    );
  }

  if (session.status === "signedOut" && android && !androidContinue) {
    return (
      <Narrow>
        <BridgeHeader />
        <BridgeProgress from={from} current="trial" />
        <BridgeHead
          eyebrow="Your AI nutritionist"
          title="PrepIt is on iPhone for now."
          lead="Android is coming soon. We won’t take a card for an app you can’t use yet."
        />
        <button type="button" className="w-fit text-left text-small text-ink-secondary" onClick={() => setAndroidContinue(true)}>
          Have an iPhone too? <u className="font-bold text-ink">Continue on this page</u>
        </button>
        <BridgeFooter />
      </Narrow>
    );
  }

  if (session.status === "signedOut" || summary?.emailInUse) {
    return (
      <Cart
        from={from}
        context={context}
        handoff={handoff}
        market={market}
        country={country}
        today={today}
        saving={false}
        emailInUse={
          summary?.emailInUse
            ? { existingProvider: summary.emailInUse.existingProvider, onSignOut: () => void signOut(true) }
            : null
        }
      />
    );
  }

  if (account?.status === "error") {
    return (
      <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-4 py-10 text-center">
        <div className="self-stretch text-left">
          <BridgeHeader />
        </div>
        <h1 className="font-display text-title text-ink">{couldNotStart(true, from === "quiz").title}</h1>
        <p className="text-small text-ink-secondary">{couldNotStart(true, from === "quiz").body}</p>
        <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={reloadAccount}>
          Try again
        </button>
        <p className="text-small text-ink-muted">
          Still stuck? Email <span className="select-all font-bold text-ink">{SUPPORT_EMAIL}</span>.
        </p>
        {chip}
      </div>
    );
  }

  // Signed in, account and answers still saving: the cart with "Saving your plan…" on its button.
  if (!summary || save.status !== "done") {
    return <Cart from={from} context={context} handoff={handoff} market={market} today={today} saving />;
  }

  // Already paying (any store): never a checkout.
  if (summary.isSubscribed) {
    return (
      <Narrow>
        <BridgeHeader />
        <BridgeHead
          eyebrow="Welcome back"
          title="You’re already a member."
          lead="PrepIt is active on this account, so there’s nothing new to pay."
        >
          {chip}
        </BridgeHead>
        <a
          href={openAppUrl(provider)}
          className={PRIMARY_BUTTON_CLASS}
          onClick={() => trackWebFunnelEvent(WEB_FUNNEL_EVENTS.handoffOpenApp, { ...context, provider, member: true })}
        >
          Open PrepIt
        </a>
        <p className="text-small text-ink-muted">
          See your subscription at{" "}
          <a href="/account" className={TEXT_BUTTON_CLASS}>
            tryprepit.app/account
          </a>
          .
        </p>
        <BridgeFooter />
      </Narrow>
    );
  }

  return (
    <Narrow>
      {/* The paying account, with Sign out, in the header like /checkout (PRE-375). */}
      <BridgeHeader>
        <SignedInChip
          provider={provider}
          email={session.status === "signedIn" ? session.user.email : null}
          onSignOut={() => void signOut()}
          compact
        />
      </BridgeHeader>
      {/*
        RevenueCat's paywall, straight on the page with no card around it (PRE-375).
        Checkout draws the progress and the line above it and the assurances under
        it, and Welcome back before it when RevenueCat offers this account no free
        week (PRE-438).
      */}
      <Checkout
        country={country}
        refundWindow={market.refundWindow}
        header={false}
        webSession={webSession}
        bridge={{
          from,
          signedInTitle: save.accountCreated ? "Your plan is saved." : "You’re signed in.",
          handoff,
          rating,
        }}
      />
      <BridgeFooter />
    </Narrow>
  );
}

/** Every step but the cart keeps the bridge's narrow column. */
function Narrow({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-[560px] flex-col gap-6">{children}</div>;
}
