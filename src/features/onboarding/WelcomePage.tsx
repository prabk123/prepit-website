"use client";

import { useEffect, useState } from "react";
import AppStoreBadge from "@/components/AppStoreBadge";
import AppStoreLink from "@/components/AppStoreLink";
import { consumeRedirectResult, waitForAuthUser } from "@/lib/firebase";
import FunnelHeader from "@/features/onboarding/components/FunnelHeader";

export default function WelcomePage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      await consumeRedirectResult();
      const user = await waitForAuthUser();
      setEmail(user?.email ?? null);
    })();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--funnel-bg)] text-[var(--text-primary)]">
      <FunnelHeader progress={1} showProgress={false} />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-12 pt-6">
        <h1 className="font-clash text-[28px] font-semibold leading-8 tracking-tight text-[var(--text-primary)]">
          You&apos;re all set
        </h1>
        <p className="mt-3 text-base leading-6 text-[var(--text-secondary)]">
          Download PrepIt and sign in with the same account
          {email ? (
            <>
              {" "}
              (<span className="font-medium text-[var(--text-primary)]">{email}</span>)
            </>
          ) : null}
          . Your plan and subscription are already saved.
        </p>
        <ol className="mt-8 list-decimal space-y-3 pl-5 text-base leading-6">
          <li>Download PrepIt from the App Store.</li>
          <li>
            Open the app and tap <strong>Sign in</strong> — not Get Started.
          </li>
          <li>Use the same Google or Apple account you just used here.</li>
        </ol>
        <div className="mt-8 flex flex-col items-start gap-4">
          <AppStoreBadge />
          <AppStoreLink
            trackingSource="web-funnel-welcome"
            className="text-sm font-semibold underline"
          >
            Open the App Store
          </AppStoreLink>
        </div>
      </main>
    </div>
  );
}
