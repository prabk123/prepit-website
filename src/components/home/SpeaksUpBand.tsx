import NudgeFilm from "@/components/motion/NudgeFilm";
import PhotoBand from "@/components/ui/PhotoBand";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import PhotoGlance, { GlanceNotification } from "@/components/media/PhotoGlance";
import { eveningGlance } from "@/content/lifestyle";

/**
 * Standout 1, first half: the nutritionist speaks up on its own. Under the
 * evening photo, a film of the messages it sends unasked, drawn in code from
 * the real chat captures (see NudgeFilm).
 * On desktop the phone is on the left and its titled text on the right, level
 * with the phone's middle, so the page keeps alternating (PRE-306). On
 * phones the title comes first and the photo under it (PRE-319).
 */
export default function SpeaksUpBand() {
  return (
    <PhotoBand
      id="nutritionist"
      labelledBy="speaks-up-heading"
      analyticsName="speaks-up"
      photo={eveningGlance.desktop}
      phonePhoto={eveningGlance.mobile}
      // Below 1024 px the title comes before the photo, so this photo doesn't
      // sit straight under the hero's, a similar shot (PRE-319).
      textFirstOnPhones
      // The protein check-in lands as she's about to eat dinner, where its
      // gap is (the showcase account's numbers, as in the hero film).
      overlay={
        <PhotoGlance x={62} y={58} phoneX={6} phoneY={62}>
          <GlanceNotification text="Over the past few weeks protein has been a little low: under your target on 18 of 21 logged days, about 127g a day against 158g. Most of the gap is at dinner…" />
        </PhotoGlance>
      }
      textSide={eveningGlance.textSide}
      mediaSide="start"
      aside={
        <>
          <SectionHeading as="h3" id="speaks-up-messages-heading" size="section" title="A nudge, not a nag." />
          <p className="text-body text-ink-secondary text-pretty">
            When breakfast goes missing, protein runs short or the same days keep running over, it tells you, with a
            fix that fits how you already eat. Any change waits for your OK.
          </p>
          <TextLink href="/features/ai-nutritionist">More about your nutritionist</TextLink>
        </>
      }
      media={
        <NudgeFilm label="An animation of PrepIt's nutritionist messages, each arriving as a notification. I can't see any breakfast log today, let me know if you skipped it: I'll log it now is tapped. It's been 8 days since your last weigh-in: Log my weight is tapped. Then a weekly calorie pattern: Tuesdays and Wednesdays 1,740 kcal, the other days 1,500 to 1,510, protein stays at 158g and the weekly total stays 10,990 kcal. Use this pattern is tapped." />
      }
    >
      <SectionHeading
        id="speaks-up-heading"
        size="section"
        title="It knows you, and it speaks up."
        lead="Most apps wait for you to open them. Your nutritionist notices the patterns in what you eat and messages you before a small slip becomes a habit."
      />
    </PhotoBand>
  );
}
