import DeviceFrame from "@/components/device/DeviceFrame";
import WidgetImage from "@/components/device/WidgetImage";
import FeatureBlock from "@/components/features/FeatureBlock";
import Glow from "@/components/ui/Glow";
import type { SectionPhoto } from "@/components/ui/Section";
import TextLink from "@/components/ui/TextLink";
import { planFlatLays } from "@/content/featureImagery";
import { appCapture, widgetCapture } from "@/lib/captures";

const PHONE = "[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]";

// Three across in the text column: about a sixth of the page on desktop, a third on phones.
const FLAT_LAY_SIZES = "(min-width: 1024px) 16vw, 33vw";

const FLAT_LAYS: { photo: SectionPhoto; caption: string }[] = [
  { photo: planFlatLays.oats, caption: "Protein overnight oats" },
  { photo: planFlatLays.wrap, caption: "Hummus and salad wrap" },
  { photo: planFlatLays.salmon, caption: "Mediterranean salmon bowl" },
];

/** /features/meal-plans: how it plans, swaps, grocery lists with estimates, the weekly calorie pattern. */
export default function MealPlansFeature() {
  return (
    <>
      <FeatureBlock
        id="how-it-plans"
        tone="surface"
        title="It asks first, then plans."
        lead="It asks which days to cover, which meals to leave out, snacks, your budget and how much variety you like. Then you check the week, day by day, before you confirm."
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className={PHONE}
              capture={appCapture(
                "27-plan-questions",
                "The nutritionist's first plan question, which days to plan, with Friday 9 to Sunday 11 October suggested and a Confirm 3 days button",
              )}
            />
          </div>
        }
      >
        <TextLink href="/guides/make-your-first-meal-plan">Guide: make your first meal plan</TextLink>
      </FeatureBlock>

      <FeatureBlock
        id="swaps"
        reverse
        title="Don't fancy it? Swap it."
        lead="Not in the mood for Monday's dinner? Ask for something else and your nutritionist changes it, and the grocery list with it."
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className={PHONE}
              capture={appCapture(
                "27b-plan-swap",
                "Asking for alternatives to Monday's dinner, and the nutritionist offering cod and sweet potato mash, a chicken and vegetable stir-fry or a tuna and pasta bake",
              )}
            />
          </div>
        }
      >
        <p className="max-w-[56ch] text-body text-ink-muted text-pretty">
          Plans cover up to 7 days, starting today if you like, and every meal is built around your calories,
          protein and tastes. Each one comes with its nutrition and cooking steps.
        </p>
        {/* Meals from the showcase plan, as supporting pictures beside the swap (PRE-288). */}
        <ul className="grid grid-cols-3 gap-3">
          {FLAT_LAYS.map(({ photo, caption }) => (
            <li key={caption} className="flex flex-col gap-2">
              <picture>
                {photo.avif && <source srcSet={photo.avif} sizes={FLAT_LAY_SIZES} type="image/avif" />}
                {photo.webp && <source srcSet={photo.webp} sizes={FLAT_LAY_SIZES} type="image/webp" />}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square h-auto w-full rounded-tile border border-line object-cover"
                />
              </picture>
              <p className="text-small text-ink-muted">{caption}</p>
            </li>
          ))}
        </ul>
      </FeatureBlock>

      <FeatureBlock
        id="grocery-list"
        layout="peek"
        tone="surface"
        title="One grocery list, by aisle."
        lead="One list for the week, grouped by aisle, with an estimated cost. Tick things off as you shop, or share it with whoever's doing the shop."
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className={PHONE}
              capture={appCapture(
                "13-grocery-list",
                "A grocery list for 17 to 23 October, estimated at £48 to £66, grouped into bakery, dairy and fresh produce",
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
        lead="Client dinners on Tuesdays? Your nutritionist spots the days you always go over and suggests more room there and a little less on the rest, for the same weekly total."
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
        <p className="max-w-[56ch] text-body text-ink-muted text-pretty">
          It works whether you&apos;re losing, maintaining or gaining, and you can change any day yourself in
          Nutrition &amp; Goals.
        </p>
      </FeatureBlock>

      <FeatureBlock
        id="plan-widget"
        tone="surface"
        reverse
        title="Today's plan on your Home Screen."
        lead="The Today's plan widget lists every meal for the day. Tap Log it or Skip right on the widget, without opening PrepIt."
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
