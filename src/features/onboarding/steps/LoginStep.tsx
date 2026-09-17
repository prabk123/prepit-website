"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithApple, signInWithGoogle } from "@/lib/firebase";
import {
  trackAuthSignupSuccess,
  trackOnboardingComplete,
} from "@/lib/funnelAnalytics";
import { createAccountFromSavedState } from "@/features/onboarding/completeAccount";
import type { OnboardingState } from "@/features/onboarding/state";
import StepCopy from "@/features/onboarding/components/StepCopy";
import PrepItIcon from "@/components/shareable/PrepItIcon";

export default function LoginStep({
  state,
  onNameCaptured,
}: {
  state: OnboardingState;
  onNameCaptured: (name: string) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function finishAuth(method: "google" | "apple") {
    setError(null);
    setLoading(method);
    try {
      const user =
        method === "google" ? await signInWithGoogle() : await signInWithApple();
      if (user.displayName) onNameCaptured(user.displayName);
      const result = await createAccountFromSavedState(user);
      if (result === "incomplete") {
        throw new Error("Please finish the earlier onboarding steps.");
      }
      if (result === "created") {
        trackAuthSignupSuccess("oauth");
        trackOnboardingComplete();
      }
      router.push("/start/plan");
    } catch (err) {
      if (err instanceof Error && err.message === "REDIRECT_IN_PROGRESS") {
        return;
      }
      setError(err instanceof Error ? err.message : "Sign-in failed. Try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <StepCopy
        title="Save your plan"
        subtitle="Create an account to save your plan and keep your logs, insights, and coaching history."
      />
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => void finishAuth("apple")}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] text-base font-bold text-[var(--on-primary)] disabled:opacity-60"
          >
            <PrepItIcon name="appleLogo" size={20} color="var(--on-primary)" />
            {loading === "apple" ? "Signing in..." : "Continue with Apple"}
          </button>
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => void finishAuth("google")}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-base font-bold text-[var(--text-primary)] disabled:opacity-60"
          >
            <Image src="/google-icon.png" alt="" width={20} height={20} />
            {loading === "google" ? "Signing in..." : "Continue with Google"}
          </button>
        </div>
        {error ? <p className="mt-4 text-sm text-[var(--coral-100)]">{error}</p> : null}
      </div>
    </div>
  );
}
