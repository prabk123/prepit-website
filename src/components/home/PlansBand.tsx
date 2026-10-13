import DeviceFrame from "@/components/device/DeviceFrame";
import PhotoBand from "@/components/ui/PhotoBand";
import PointList from "@/components/ui/PointList";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { appCapture, appVideo } from "@/lib/captures";
import { plansKitchen } from "@/content/lifestyle";

const PLAN_POINTS = [
  { title: "Swap anything", detail: "Change a meal in chat" },
  { title: "One grocery list", detail: "By aisle, with an estimated cost" },
  { title: "Weekly calorie pattern", detail: "More room when you need it" },
];

/** "Plans that fit your week": meal plan, grocery list and weekly pattern, on the kitchen photo. */
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
      media={
        <div className="flex items-start justify-center gap-4 lg:gap-5 [--device-w:260px] sm:[--device-w:240px] lg:[--device-w:clamp(220px,17vw,260px)]">
          <DeviceFrame
            video={appVideo("12-plan-week", "Asking for a week of meals and the plan being built")}
          />
          <DeviceFrame
            className="hidden sm:block sm:mt-24"
            capture={appCapture(
              "14-weekly-pattern",
              "A weekly calorie pattern with more room on Tuesday and Wednesday, same weekly total",
            )}
          />
        </div>
      }
    >
      <SectionHeading
        id="plans-heading"
        size="section"
        title="Ask for a week of meals. Get a plan built for you."
        lead="Your nutritionist plans around your goals, tastes and budget, then helps you stick to it."
      />
      <PointList layout="rows" points={PLAN_POINTS} />
      <TextLink href="/features/meal-plans">More about meal plans</TextLink>
    </PhotoBand>
  );
}
