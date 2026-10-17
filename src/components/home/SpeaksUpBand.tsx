import ChatCapture from "@/components/ui/ChatCapture";
import PhotoBand from "@/components/ui/PhotoBand";
import SectionHeading from "@/components/ui/SectionHeading";
import SwipeRow from "@/components/ui/SwipeRow";
import TextLink from "@/components/ui/TextLink";
import { nutritionistEvening } from "@/content/lifestyle";
import { proteinShort, weighIn } from "@/content/nutritionistMessages";

/**
 * Standout 1, first half: the nutritionist speaks up on its own. Three of the
 * messages it sends unasked, cropped from the app's chat (PRE-283), on the
 * evening photo. They are one row you swipe, on phones and in the desktop
 * column alike (PRE-284).
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
          <SwipeRow
            label="Messages your nutritionist sends on its own"
            desktop="scroll"
            itemClassName="w-[82%] max-w-[340px] lg:w-[340px]"
          >
            {[proteinShort, weighIn].map((message) => (
              <ChatCapture key={message.caption} {...message} />
            ))}
          </SwipeRow>
          <figcaption className="text-small text-ink-faint">
            Real messages from the app. <span className="lg:hidden">Swipe for more.</span>
            <span className="hidden lg:inline">Scroll sideways for more.</span>
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
