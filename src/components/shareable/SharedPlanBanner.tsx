import Image from "next/image";
import AppStoreCta from "@/components/ui/AppStoreCta";
import { TRIAL_NOTE } from "@/lib/pricing";

/**
 * The top banner on a shared plan: who made it (PrepIt, never the person who
 * shared it) and the App Store button.
 */
export default function SharedPlanBanner() {
  return (
    <aside
      aria-label="Made with PrepIt"
      className="flex flex-col gap-5 rounded-tile border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-6"
    >
      <div className="flex items-center gap-4">
        <Image src="/logo.png" alt="" width={48} height={48} className="h-12 w-12 shrink-0" />
        <div>
          <p className="font-display text-card-title text-ink">A meal plan made with PrepIt</p>
          <p className="mt-1 text-small text-ink-muted">
            Planned by PrepIt, your personal AI nutritionist.
          </p>
        </div>
      </div>
      <AppStoreCta trackingSource="shared-meal-plan-banner" note={TRIAL_NOTE} className="shrink-0" />
    </aside>
  );
}
