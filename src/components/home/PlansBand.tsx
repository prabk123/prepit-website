import DeviceFrame from "@/components/device/DeviceFrame";
import Glow from "@/components/ui/Glow";
import PhotoBand from "@/components/ui/PhotoBand";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { appVideo } from "@/lib/captures";
import { plansKitchen } from "@/content/lifestyle";

/** "Your week, planned": the meal plan, with its grocery list in the kitchen photo. */
export default function PlansBand() {
  return (
    <PhotoBand
      id="plans"
      labelledBy="plans-heading"
      analyticsName="plans"
      photo={plansKitchen.desktop}
      phonePhoto={plansKitchen.mobile}
      annotations={plansKitchen.annotations}
      textSide={plansKitchen.textSide}
      textOnBrightPhoto
      aside={
        <>
          <SectionHeading as="h3" id="plans-swap-heading" size="section" title="Change anything, just ask." />
          <p className="text-body text-ink-secondary text-pretty">
            Want a different dinner on Thursday? Ask, and it swaps it.
          </p>
          <TextLink href="/features/meal-plans">More about meal plans</TextLink>
        </>
      }
      media={
        <div className="relative">
          <Glow />
          <DeviceFrame
            className="[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]"
            video={appVideo("12-plan-week", "Scrolling a week of planned meals, each with a photo of the dish")}
          />
        </div>
      }
    >
      <SectionHeading
        id="plans-heading"
        size="section"
        title="Your week, planned."
        lead="Ask for a week of meals. You get a plan built around your goals, the food you like and your budget, and one grocery list, sorted by aisle."
      />
    </PhotoBand>
  );
}
