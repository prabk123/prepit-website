"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BridgeHead, BridgeHeader, BridgeProgress } from "@/components/bridge/BridgeParts";
import { watchUser } from "@/lib/firebase/auth";
import { readBridgeVisit } from "@/lib/funnel/bridgeHandoff";
import { APP_LINK_EMAIL_LIVE, welcomeRecap } from "@/lib/funnel/checkoutStates";
import { WEB_PRICES, WEB_REMINDER_EMAIL_LIVE } from "@/lib/pricing";
import EmailLinkButton from "./EmailLinkButton";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

const PROVIDER_NAMES = { google: "Google", apple: "Apple" } as const;

function Step({ n, title, children }: { n: number; title: string; children?: ReactNode }) {
  return (
    <li className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
      <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-small font-bold text-on-primary">
        {n}
      </span>
      <div className="flex min-w-0 flex-col gap-2">
        <b className="text-body font-bold text-ink">{title}</b>
        {children}
      </div>
    </li>
  );
}

/**
 * "You're in" (PRE-325), from the bridge design: three numbered steps, the
 * exact button to tap in the app (Sign in, not Get Started), and the account
 * to use. `download` is the App Store button and, on desktop, the QR code.
 * Under the steps, the recap of what they bought (PRE-438): due today, the
 * reminder email and the first payment, from what checkout left in this tab.
 */
export default function WelcomeDetails({ download }: { download: ReactNode }) {
  const params = useSearchParams();
  const raw = params.get("provider");
  const provider = raw === "google" || raw === "apple" ? raw : null;
  const pending = params.get("pending") === "1";
  // Checkout found premium already on the account: nothing new started (PRE-335).
  const member = params.get("member") === "1";
  const tracked = useRef(false);
  const [account, setAccount] = useState<{ email: string | null; name: string | null } | null>(null);
  // Where they came from and whether they got the free week, left by the
  // bridge; useSearchParams keeps this page out of the server render.
  const [visit] = useState(() => readBridgeVisit());
  const from = visit?.from ?? "landing";
  const trial = visit?.trial ?? true;
  const recap =
    !member && visit?.purchase
      ? welcomeRecap({
          trial,
          plan: visit.purchase.plan,
          prices: WEB_PRICES[visit.purchase.seller],
          startedAt: new Date(visit.purchase.startedAt),
          reminder: WEB_REMINDER_EMAIL_LIVE,
        })
      : null;

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.handoffView, { provider, pending, from, trial, member, has_recap: recap !== null });
  }, [provider, pending, from, trial, member, recap]);

  // The address they signed in with, so they pick the same account in the app.
  useEffect(
    () =>
      watchUser((user) =>
        setAccount(user ? { email: user.email, name: user.displayName?.trim().split(/\s+/)[0] || null } : null),
      ),
    [],
  );

  const providerName = provider ? PROVIDER_NAMES[provider] : null;

  return (
    <>
      <BridgeHeader />
      <BridgeProgress from={from} current="app" trial={trial} />
      <BridgeHead
        eyebrow={member ? "Already a member" : trial ? "Free week started" : "Membership started"}
        title={account?.name ? `You’re in, ${account.name}.` : "You’re in."}
        lead={
          member
            ? "Your PrepIt membership is already active on this account, so there’s nothing new to pay. Your account is waiting in the app."
            : trial
              ? "Session 1 with your AI nutritionist is waiting in the app. It takes about 5 minutes."
              : "Your account and past logs are waiting in the app."
        }
      />
      {pending && (
        <p role="status" className="text-small text-ink-muted">
          Your payment went through. It can take a minute for your subscription to show in the app.
        </p>
      )}
      <section aria-label="Get started in the app" className="rounded-tile border border-line bg-surface p-5">
        <ol className="flex flex-col gap-5">
          <Step n={1} title="Get PrepIt on your iPhone">
            {download}
            {APP_LINK_EMAIL_LIVE && <EmailLinkButton email={account?.email ?? null} provider={provider} />}
          </Step>
          <Step n={2} title="Open it and tap Sign in">
            <span className="w-fit rounded-tile bg-surface-raised px-3 py-2 text-small text-ink-secondary">
              Already have an account? <b className="font-bold text-ink underline">Sign in</b>
            </span>
            <p className="rounded-tile border border-energy bg-energy/20 px-3 py-2 text-small text-ink-secondary">
              Not Get Started. Get Started begins a new plan from scratch.
            </p>
          </Step>
          <Step n={3} title={providerName ? `Continue with ${providerName}` : "Continue with Google or Apple"}>
            <p className="ph-no-capture text-small text-ink-muted">
              Use the same {provider === "apple" ? "Apple ID" : provider === "google" ? "Google account" : "Google or Apple account"} as
              here{account?.email ? ` (${account.email})` : ""}: your subscription is on it.
              {account?.email?.endsWith("privaterelay.appleid.com")
                ? " You chose Hide My Email, so Apple shows this private address."
                : ""}
            </p>
          </Step>
        </ol>
      </section>
      <section aria-label="Your subscription" className="flex flex-col gap-2 rounded-tile border border-line bg-surface p-5 text-small text-ink-secondary">
        {recap && (
          <dl className="flex flex-col border-b border-line pb-3">
            {recap.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-3 py-1.5">
                <dt>{row.label}</dt>
                <dd className="text-right font-bold text-ink tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <p>
          To cancel, go to <a href="/account" className="font-bold text-ink underline underline-offset-4">tryprepit.app/account</a>{" "}
          and sign in the same way.
        </p>
      </section>
    </>
  );
}
