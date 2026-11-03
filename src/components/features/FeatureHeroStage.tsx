import { CapturePicture, Lift, PhotoStage, TypedField } from "@/components/features/PhotoStage";
import { V9Screen } from "@/components/landing/v9/V9Photo";
import { widgetCapture } from "@/lib/captures";
import { FEATURES, type FeatureSlug, type StagePhoto } from "@/lib/features";

/** The hero still's alt text per page; the tiles show the same stills without one. */
const HERO_ALT: Record<FeatureSlug, string> = {
  "ai-nutritionist": "Two coffees facing each other across a table, half a croissant and a notebook with a pencil",
  "nutrition-signals": "A chicken, sweet potato and chickpea bowl a third eaten at a desk, beside a glass of water and a laptop",
  "meal-plans": "A weekly shop laid out: a paper bag, eggs, salmon, spinach, lemons, tomatoes, feta, sourdough and bananas",
  logging: "A chicken wrap cut in half with a pot of hummus on a white plate",
  "widgets-and-siri": "On the way out: a takeaway coffee, a wrapped sandwich, a banana, keys and a tote bag",
};

/** A feature's still with its alt text, for its hero and its section on the Features overview. */
export function heroPhoto(slug: FeatureSlug): StagePhoto {
  return { ...FEATURES[slug].tile.photo, alt: HERO_ALT[slug] };
}

/**
 * The top of each feature page (PRE-450): the feature's still with one real
 * app card lifted over it, in place of the phone. Placements are the
 * handoff prototype's.
 */
export default function FeatureHeroStage({ slug }: { slug: FeatureSlug }) {
  const photo = heroPhoto(slug);
  switch (slug) {
    case "ai-nutritionist":
      return (
        <PhotoStage photo={photo} priority>
          <Lift tag="Session 2" style={{ right: "-3%", bottom: "12%", width: "70%" }}>
            <V9Screen name="focus-pick" width={736} height={136} priority alt="Pick your focus: choose one, or two. Your first pick is your main focus." />
          </Lift>
        </PhotoStage>
      );
    case "nutrition-signals":
      return (
        <PhotoStage photo={photo} priority>
          <Lift tag="Today" style={{ left: "-3%", bottom: "14%", width: "74%" }}>
            <V9Screen name="see-rings" width={741} height={337} priority alt="Energy 84, Satiety 96 and Mood 87, all green" />
          </Lift>
        </PhotoStage>
      );
    case "meal-plans":
      return (
        <PhotoStage photo={photo} priority>
          <Lift style={{ right: 0, top: "24%", width: "50%" }}>
            <V9Screen name="ui-grocery" width={764} height={951} priority alt="A grocery list grouped by aisle" />
          </Lift>
        </PhotoStage>
      );
    case "logging":
      return (
        <PhotoStage photo={photo} priority>
          <Lift style={{ left: 0, top: "20%", width: "74%" }}>
            <TypedField text="chicken wrap with hummus and salad" />
          </Lift>
          <Lift style={{ right: "3%", top: "42%", width: "70%" }}>
            <V9Screen name="say-row-wrap" width={626} height={247} priority alt="The wrap on the log with its numbers" />
          </Lift>
        </PhotoStage>
      );
    case "widgets-and-siri":
      return (
        <PhotoStage photo={photo} priority>
          <Lift style={{ left: "-2%", top: "30%", width: "66%" }}>
            <CapturePicture
              priority
              capture={widgetCapture("15-widget-signals-medium", "The Energy, Satiety and Mood widget", 1014, 474)}
            />
          </Lift>
        </PhotoStage>
      );
  }
}
