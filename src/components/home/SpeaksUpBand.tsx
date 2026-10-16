import ChatPanel from "@/components/ui/ChatPanel";
import PhotoBand from "@/components/ui/PhotoBand";
import SectionHeading from "@/components/ui/SectionHeading";
import SwipeRow from "@/components/ui/SwipeRow";
import TextLink from "@/components/ui/TextLink";
import { nutritionistEvening } from "@/content/lifestyle";
import { proteinShort, weeklyPattern, weighIn } from "@/content/nutritionistMessages";

/**
 * Standout 1, first half: the nutritionist speaks up on its own. Three of the
 * messages it sends unasked, in its own words, on the evening photo. On
 * phones they are one row you swipe, not a stack (PRE-284).
 */
export default function SpeaksUpBand() {
  return (
    <PhotoBand
      id="nutritionist"
      labelledBy="speaks-up-heading"
      analyticsName="speaks-up"
      photo={nutritionistEvening.desktop}
      phonePhoto={nutritionistEvening.mobile}
      annotations={nutritionistEvening.annotations}
      textSide={nutritionistEvening.textSide}
      asideAlign="start"
      aside={
        <>
          <p className="text-body text-ink-secondary text-pretty">
            When breakfast goes missing, protein runs short or the same days keep running over, it tells you, with a
            fix that fits how you already eat. Any change waits for your OK.
          </p>
          <TextLink href="/features/ai-nutritionist">More about your nutritionist</TextLink>
        </>
      }
      media={
        <figure className="flex w-full min-w-0 max-w-[480px] flex-col gap-4">
          <SwipeRow label="Messages your nutritionist sends on its own" desktop="stack">
            {[proteinShort, weeklyPattern, weighIn].map((message) => (
              <ChatPanel key={message.text} messages={[message]} />
            ))}
          </SwipeRow>
          <figcaption className="text-small text-ink-faint">
            Messages your nutritionist sends on its own, in its own words. The numbers are examples.
          </figcaption>
        </figure>
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
