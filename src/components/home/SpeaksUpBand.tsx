import SpeaksUpPhone from "@/components/home/SpeaksUpPhone";
import PhotoBand from "@/components/ui/PhotoBand";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { nutritionistEvening } from "@/content/lifestyle";

/**
 * Standout 1, first half: the nutritionist speaks up on its own. Under the
 * evening photo, one phone shows the messages it sends unasked, each lifted
 * out of the real chat screen, with buttons to switch between them (PRE-294).
 * The text sits level with the phone's middle on desktop.
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
            When breakfast goes missing, protein runs short or the same days keep running over, it tells you, with a
            fix that fits how you already eat. Any change waits for your OK.
          </p>
          <TextLink href="/features/ai-nutritionist">More about your nutritionist</TextLink>
        </>
      }
      media={<SpeaksUpPhone />}
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
