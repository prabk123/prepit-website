import ChatPanel from "@/components/ui/ChatPanel";
import PhotoBand from "@/components/ui/PhotoBand";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { nutritionistEvening } from "@/content/lifestyle";
import { proteinShort, weeklyPattern, weighIn } from "@/content/nutritionistMessages";

/**
 * Standout 1, first half: the nutritionist speaks up on its own. Three of the
 * messages it sends unasked, in its own words, on the evening photo.
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
      aside={
        <>
          <p className="text-body text-ink-secondary text-pretty">
            It reads your log every day. When breakfast goes missing, protein runs short for weeks, or the same
            days keep running over, it tells you, with a fix that fits how you already eat.
          </p>
          <p className="text-body text-ink-secondary text-pretty">
            Reply with a tap, or in your own words. Any change to your log, plan or goals waits for your OK.
          </p>
          <TextLink href="/features/ai-nutritionist">More about your nutritionist</TextLink>
        </>
      }
      media={
        <ChatPanel
          className="max-w-[480px]"
          messages={[proteinShort, weeklyPattern, weighIn]}
          caption="Messages your nutritionist sends on its own, in its own words. The numbers are examples."
        />
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
