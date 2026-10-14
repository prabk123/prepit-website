import DeviceFrame from "@/components/device/DeviceFrame";
import WidgetImage from "@/components/device/WidgetImage";
import FeatureBlock from "@/components/features/FeatureBlock";
import LoopVideo from "@/components/media/LoopVideo";
import Glow from "@/components/ui/Glow";
import PointList from "@/components/ui/PointList";
import Section, { type SectionPhoto } from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { cookingClip, planFlatLays } from "@/content/featureImagery";
import { appCapture, widgetCapture } from "@/lib/captures";

const PHONE = "[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]";

const FLAT_LAYS: { photo: SectionPhoto; caption: string }[] = [
  { photo: planFlatLays.oats, caption: "Protein overnight oats" },
  { photo: planFlatLays.wrap, caption: "Chicken wrap with hummus" },
  { photo: planFlatLays.salmon, caption: "Mediterranean salmon bowl" },
];

/** /features/meal-plans: plans, swaps, grocery lists with estimates, the weekly calorie pattern. */
export default function MealPlansFeature() {
  return (
    <>
      <Section id="how-it-plans" tone="surface" labelledBy="how-it-plans-heading">
        <div className="flex flex-col gap-stack">
          <SectionHeading
            id="how-it-plans-heading"
            size="section"
            title="It asks first, then plans."
            lead="Which days to plan, meals to leave out, snacks, your grocery budget and how much variety you want. Then you review the week, day by day, before you confirm."
          />
          <ul className="grid gap-4 sm:grid-cols-3 lg:gap-5">
            {FLAT_LAYS.map(({ photo, caption }) => (
              <li key={caption} className="flex flex-col gap-3">
                <picture>
                  {photo.avif && <source srcSet={photo.avif} sizes="(min-width: 640px) 33vw, 100vw" type="image/avif" />}
                  {photo.webp && <source srcSet={photo.webp} sizes="(min-width: 640px) 33vw, 100vw" type="image/webp" />}
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full rounded-tile border border-line"
                  />
                </picture>
                <p className="text-small text-ink-muted">{caption}</p>
              </li>
            ))}
          </ul>
          <TextLink href="/guides/make-your-first-meal-plan">Guide: make your first meal plan</TextLink>
        </div>
      </Section>

      <FeatureBlock
        id="swaps"
        title="Swap anything in chat."
        lead="Don't fancy Tuesday's dinner? Ask for something else and your nutritionist changes it, and the grocery list with it. Every meal comes with its nutrition and cooking steps."
        media={
          <LoopVideo
            {...cookingClip}
            analyticsId="cooking"
            className="w-full overflow-hidden rounded-card border border-line"
          />
        }
      >
        <PointList
          layout="rows"
          points={[
            { title: "Up to 7 days", detail: "Starting today if you like" },
            { title: "Built for your goal", detail: "Calories, protein and your tastes" },
            { title: "Swap any meal", detail: "Just ask in chat" },
          ]}
        />
      </FeatureBlock>

      <FeatureBlock
        id="grocery-list"
        layout="peek"
        tone="surface"
        title="One grocery list, by aisle."
        lead="Everything for the week in one list, grouped by aisle, with an estimated cost and the cost per meal. Tick things off as you shop, or copy and share it."
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className={PHONE}
              capture={appCapture(
                "13-grocery-list",
                "A grocery list for 13 to 19 October, estimated at £48 to £66, grouped into bakery, dairy and fresh produce",
              )}
            />
          </div>
        }
      >
        <p className="text-small text-ink-faint">
          Estimates use typical supermarket prices where you live. They aren&apos;t live store prices.
        </p>
      </FeatureBlock>

      <FeatureBlock
        id="weekly-pattern"
        title="More room on the days you need it."
        lead="Client dinners on Tuesdays? A weekly calorie pattern gives those days more and takes a little off the rest, so the week adds up to the same total. Your nutritionist can suggest one from your log."
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className={PHONE}
              capture={appCapture(
                "14-weekly-pattern",
                "A weekly calorie pattern with 2,250 kcal on Tuesday and Wednesday and 1,620 on the other days",
              )}
            />
          </div>
        }
      >
        <PointList
          layout="rows"
          points={[
            { title: "Same weekly total", detail: "More on some days, less on others" },
            { title: "Any goal", detail: "Losing, maintaining or gaining" },
            { title: "Change any day", detail: "In Nutrition & Goals" },
          ]}
        />
      </FeatureBlock>

      <FeatureBlock
        id="plan-widget"
        tone="surface"
        reverse
        title="Today's plan on your Home Screen."
        lead="The Today's plan widget lists every meal for the day. Log it or Skip each one right from the widget, without opening PrepIt."
        media={
          <div className="w-full max-w-[420px]">
            <WidgetImage
              capture={widgetCapture(
                "15-widget-today-plan-large",
                "Large Today's plan widget with Log it and Skip on planned meals",
                1014,
                1062,
              )}
            />
          </div>
        }
      >
        <TextLink href="/features/widgets-and-siri">More about widgets and Siri</TextLink>
      </FeatureBlock>
    </>
  );
}
