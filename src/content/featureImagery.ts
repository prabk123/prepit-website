import type { SectionPhoto } from "@/components/ui/Section";

/**
 * PRE-199 imagery for the features page (PRE-203), share images (PRE-206) and
 * section backgrounds. The homepage photos live in lifestyle.ts; this file is
 * separate so the homepage work can reshape that one freely.
 *
 * Phone photos follow the same rule as the homepage: the phone screen was
 * generated from the real capture passed in as a reference image, and checked
 * word by word against it. See docs/imagery/prompts.md.
 */

export type FeaturePhoto = {
  /** 16:9 photo, 1440 and 2048 px wide. */
  desktop: SectionPhoto;
  /** 4:5 crop around the phone, 640 and 920 px wide. */
  mobile: SectionPhoto;
  /** Side of the section the page text sits on, clear of the subject. */
  textSide: "start" | "end";
};

function phonePhoto(
  name: string,
  alt: { desktop: string; mobile: string },
  { position, scrim }: { position?: string; scrim?: SectionPhoto["scrim"] } = {},
): Pick<FeaturePhoto, "desktop" | "mobile"> {
  const base = `/lifestyle/${name}`;
  return {
    desktop: {
      src: `${base}@1x.webp`,
      avif: `${base}@1x.avif 1440w, ${base}@2x.avif 2048w`,
      webp: `${base}@1x.webp 1440w, ${base}@2x.webp 2048w`,
      width: 1440,
      height: 810,
      alt: alt.desktop,
      position,
      scrim,
    },
    mobile: {
      src: `${base}-mobile@1x.webp`,
      avif: `${base}-mobile@1x.avif 640w, ${base}-mobile@2x.avif 920w`,
      webp: `${base}-mobile@1x.webp 640w, ${base}-mobile@2x.webp 920w`,
      width: 640,
      height: 800,
      alt: alt.mobile,
      scrim,
    },
  };
}

/**
 * Signals section. Nothing on the bench is logged, so annotations should point
 * at the phone: the Energy 84 ring (about x 73%, y 37%) and Calorie fit,
 * 1481 / 1322 kcal expected, +22 (about x 72%, y 66%).
 */
export const signalsGym: FeaturePhoto = {
  ...phonePhoto(
    "signals-gym",
    {
      desktop:
        "In a bright home gym, a phone leans on a water bottle beside a towel, a banana and a smoothie, showing PrepIt's Energy screen at 84 and how it's shaped: calorie fit and meal spread.",
      mobile:
        "A phone on a bench shows PrepIt's Energy screen at 84 and how it's shaped.",
    },
    { position: "62% 50%" },
  ),
  textSide: "start",
};

/**
 * Widgets tile. The phone is on the left, so the text sits on the right.
 * Annotation values on the phone: Energy 84, Satiety 96, Mood 87 (about
 * x 27%, y 22%) and Lunch, 12:30 PM, Chicken and rice, Logged (about x 27%,
 * y 51%).
 */
export const widgetsDesk: FeaturePhoto = {
  ...phonePhoto(
    "widgets-desk",
    {
      desktop:
        "A phone on a wooden stand beside a finished lunch box, a glass of water and a laptop shows PrepIt widgets: Energy 84, Satiety 96 and Mood 87, and today's plan with breakfast and lunch logged and Log it on dinner.",
      mobile:
        "A phone on a desk stand shows PrepIt widgets with Energy 84, Satiety 96 and Mood 87, and today's plan with breakfast and lunch logged.",
    },
    { position: "30% 50%", scrim: "end" },
  ),
  textSide: "end",
};

/**
 * A photo with no phone in it, at its native 1280 × 720 (no 2x upscale), so
 * it stays sharp up to 640 CSS px wide on a 2x screen. Set `sizes` when it is
 * shown wider. `small` adds a 768 px copy (`<name>-768`) for photos shown at
 * phone width or in a three-up grid.
 */
function still(name: string, alt: string, { avif = true, small = false } = {}): SectionPhoto {
  const base = `/lifestyle/${name}`;
  const srcSet = (ext: string) => `${small ? `${base}-768.${ext} 768w, ` : ""}${base}.${ext} 1280w`;
  return {
    src: `${base}.webp`,
    avif: avif ? srcSet("avif") : undefined,
    webp: srcSet("webp"),
    width: 1280,
    height: 720,
    alt,
  };
}

/**
 * Overhead flat-lays of meals from the showcase plan, for the Plans section
 * and the share images (PRE-206). Each leaves light oak space on the left for
 * text.
 */
export const planFlatLays = {
  oats: still(
    "flatlay-oats",
    "A bowl of protein overnight oats topped with diced apple and cinnamon on a pale oak table.",
    { small: true },
  ),
  wrap: still(
    "flatlay-wrap",
    "A wholemeal chicken wrap with hummus and salad, cut in half, beside a dish of hummus.",
    { small: true },
  ),
  salmon: still(
    "flatlay-salmon",
    "A Mediterranean salmon bowl with quinoa, tomatoes, olives, feta and a lemon wedge.",
    { small: true },
  ),
};

/**
 * Soft honey light, made for the dark site; only the dev imagery page uses it.
 * Decorative. WebP only: AVIF smeared the grain into blocks. It is a soft
 * blur, so stretching it full width is fine.
 */
export const textureHoney = still("texture-honey", "", { avif: false });

/** Props for LoopVideo: chicken and vegetables cooking, no phone (Plans). */
export const cookingClip = {
  mp4: "/lifestyle/cooking.mp4",
  webm: "/lifestyle/cooking.webm",
  poster: "/lifestyle/cooking-poster.webp",
  width: 1280,
  height: 720,
  label: "Sliced chicken, peppers and spinach cooking in a cast-iron pan.",
};

/**
 * Dark band photos for the light site (PRE-282). Each is dark on the left,
 * where the band's text sits. No phone screen.
 */
export const researchStill = still(
  "research-table",
  "Whole foods on a dark stone worktop: salmon, eggs, oats, lentils, spinach, berries, walnuts, olive oil and yogurt.",
);
export const downloadStill = still(
  "download-evening",
  "A phone lies face down on the arm of a sofa in the evening, beside a cup of tea and a bowl of berries.",
  { small: true },
);
