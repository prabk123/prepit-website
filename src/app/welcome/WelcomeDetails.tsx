"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BridgeHead, BridgeHeader, BridgeProgress } from "@/components/bridge/BridgeParts";
import { watchUser } from "@/lib/firebase/auth";
import { readBridgeVisit } from "@/lib/funnel/bridgeHandoff";
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
 */
export default function WelcomeDetails({ download }: { download: ReactNode }) {
  const params = useSearchParams();
  const raw = params.get("provider");
  const provider = raw === "google" || raw === "apple" ? raw : null;
  const pending = params.get("pending") === "1";
  const tracked = useRef(false);
  const [account, setAccount] = useState<{ email: string | null; name: string | null } | null>(null);
  // Where they came from and whether they got the free week, left by the
  // bridge; useSearchParams keeps this page out of the server render.
  const [visit] = useState(() => readBridgeVisit());
  const from = visit?.from ?? "landing";
  const trial = visit?.trial ?? true;

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackWebFunnelEvent(WEB_FUNNEL_EVENTS.handoffView, { provider, pending, from, trial });
  }, [provider, pending, from, trial]);

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
      <BridgeProgress from={from} current="app" />
      <BridgeHead
        eyebrow={trial ? "Free week started" : "Membership started"}
        title={account?.name ? `You’re in, ${account.name}.` : "You’re in."}
        lead={
          trial
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
        <p>
          To cancel, go to <a href="/account" className="font-bold text-ink underline underline-offset-4">tryprepit.app/account</a>{" "}
          and sign in the same way.
        </p>
      </section>
    </>
  );
}
