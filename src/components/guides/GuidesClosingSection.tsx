import FreeToday from "@/components/guides/FreeToday";
import Reveal from "@/components/landing/v9/Reveal";
import { V9Photo, V9Screen } from "@/components/landing/v9/V9Photo";
import { Glass, V9Section } from "@/components/landing/v9/V9Sections";
import StartTrialCta from "@/components/ui/StartTrialCta";
import { TRIAL_DAYS } from "@/lib/pricing";

/**
 * The cream close on /guides and every guide (PRE-457, Charlie's site pages
 * handoff): the web trial, and how to get the app after paying, beside the
 * one-bite photo with the app's three rings lifted over it. It replaced the
 * site's dark download band (FinalCta) on these pages; the button reports
 * the same `placement` that band did.
 */
export default function GuidesClosingSection({ placement, id = "download" }: { placement: string; id?: string }) {
  const headingId = `${id}-heading`;
  return (
    <V9Section id={id} name="final-cta" labelledBy={headingId} band>
      <div className="grid items-center gap-x-16 gap-y-12 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex min-w-0 flex-col items-start gap-6">
          <p className="text-[12px] font-bold uppercase leading-none tracking-[0.12em]">
            <span className="text-gradient-brand">Your AI nutritionist</span>
          </p>
          <h2 id={headingId} className="font-display text-chapter text-ink text-balance">
            Start eating better this week.
          </h2>
          <p className="text-lead text-ink-secondary text-pretty">
            Try your nutritionist free for {TRIAL_DAYS} days.
            <FreeToday />
          </p>
          <StartTrialCta placement={placement} note={null} />
          <p className="max-w-[30em] text-small text-ink-muted text-pretty">
            Start here, then download PrepIt and sign in with the same Apple or Google account. Your free week is
            already there.
          </p>
        </div>
        <Reveal className="relative mx-auto aspect-[1/1.02] w-full max-w-[440px]">
          <div className="absolute inset-y-0 left-0 right-[12%] overflow-hidden rounded-[26px] bg-page">
            <V9Photo
              name="one-bite"
              widths={[560, 880]}
              width={880}
              height={1564}
              sizes="(min-width: 900px) 390px, 78vw"
              alt="Seven spoons in a row, each holding one bite of a different everyday food"
              className="h-full w-full object-cover"
            />
          </div>
          <Glass className="absolute bottom-[12%] right-0 w-[66%]">
            <V9Screen name="see-rings" width={741} height={337} alt="Energy 84, Satiety 96 and Mood 87" />
          </Glass>
        </Reveal>
      </div>
    </V9Section>
  );
}
