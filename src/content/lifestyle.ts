import type { SectionPhoto } from "@/components/ui/Section";

/**
 * Lifestyle photos for the homepage (PRE-199). Each is a generated photo in
 * which the phone shows a real app capture; see docs/imagery/prompts.md.
 *
 * Annotation values come from the same logged day the phone shows (the
 * showcase account the captures were taken on), so the numbers agree.
 */

export type PhotoAnnotation = {
  /**
   * Point on the photo the note refers to, as a percentage of the full 16:9
   * desktop image. If the section crops the photo (object-cover with a
   * different aspect ratio), map these through the same crop.
   */
  x: number;
  y: number;
  /** Short amber note, one or two lines. Desktop only. */
  lines: string[];
};

export type LifestylePhoto = {
  /** 16:9 desktop photo. */
  desktop: SectionPhoto;
  /** 4:5 crop around the phone for narrow screens. */
  mobile: SectionPhoto;
  /** Side of the section the page text sits on, clear of the subject. */
  textSide: "start" | "end";
  annotations: PhotoAnnotation[];
};

function photo(
  name: string,
  alt: { desktop: string; mobile: string },
  {
    position,
    priority,
    scrim,
  }: { position?: string; priority?: boolean; scrim?: SectionPhoto["scrim"] } = {},
): Pick<LifestylePhoto, "desktop" | "mobile"> {
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
      priority,
      scrim,
    },
    mobile: {
      src: `${base}-mobile@1x.webp`,
      avif: `${base}-mobile@1x.avif 640w, ${base}-mobile@2x.avif 920w`,
      webp: `${base}-mobile@1x.webp 640w, ${base}-mobile@2x.webp 920w`,
      width: 640,
      height: 800,
      alt: alt.mobile,
      priority,
      scrim,
    },
  };
}

export const heroCafe: LifestylePhoto = {
  ...photo(
    "hero-cafe",
    {
      desktop:
        "A hand holds a phone showing today's PrepIt log, with a chicken, hummus and salad wrap logged at 12:30 PM for 462 kcal, beside the same wrap and a flat white on a cafe table.",
      mobile:
        "A hand holds a phone in a cafe, showing today's PrepIt log with a chicken, hummus and salad wrap logged at 12:30 PM for 462 kcal.",
    },
    { position: "70% 50%", priority: true },
  ),
  textSide: "start",
  annotations: [
    { x: 46, y: 50, lines: ["Chicken wrap with hummus and salad", "462 kcal · 61 g protein"] },
    { x: 41, y: 78, lines: ["150 g chicken breast"] },
    { x: 22, y: 63, lines: ["60 g wholemeal tortilla"] },
  ],
};

export const nutritionistEvening: LifestylePhoto = {
  ...photo(
    "nutritionist-evening",
    {
      desktop:
        "On a sofa in the evening, a hand holds a phone showing a chat with the PrepIt nutritionist and a chart of protein per day against a 158 g target, next to a bowl of Greek yogurt with raspberries and a cup of tea.",
      mobile:
        "In lamplight, a hand holds a phone showing a chat with the PrepIt nutritionist and a chart of protein per day against a 158 g target.",
    },
    { position: "65% 50%" },
  ),
  textSide: "start",
  annotations: [
    { x: 92, y: 77, lines: ["Greek yogurt with raspberries", "168 kcal · 13 g protein"] },
  ],
};

export const plansKitchen: LifestylePhoto = {
  ...photo(
    "plans-kitchen",
    {
      desktop:
        "A phone propped against a jar on a kitchen worktop shows the PrepIt grocery list for 13 to 19 October, estimated at £48 to £66, beside the same groceries just unpacked: tortillas, eggs, feta, Greek yogurt, apples and avocados.",
      mobile:
        "A phone propped against a jar on a kitchen worktop shows the PrepIt grocery list for 13 to 19 October, estimated at £48 to £66.",
    },
    { position: "40% 50%", scrim: "end" },
  ),
  // The phone is on the left of this photo, so the Plans text sits on the right.
  textSide: "end",
  annotations: [
    { x: 38, y: 38, lines: ["Est. £48–£66 for the week"] },
    { x: 61, y: 63, lines: ["850 g Greek yogurt"] },
    // The carton and the tortilla pack hold more than the list, so these two
    // point at their rows on the phone rather than at the food.
    { x: 44, y: 50, lines: ["120 g wholemeal tortilla"] },
    { x: 44, y: 57, lines: ["200 g eggs"] },
  ],
};

// Features page (PRE-203). Nothing on the bench or desk is logged, so these
// notes point at the phone rather than at the food.

export const signalsGym: LifestylePhoto = {
  ...photo(
    "signals-gym",
    {
      desktop:
        "A phone leans on a gym bag beside a protein shake on a wooden bench, showing PrepIt's Home screen with Energy 84, Satiety 96 and Mood 87, and 1,481 of 1,570 kcal eaten.",
      mobile:
        "A phone on a gym bench shows PrepIt's Home screen with Energy 84, Satiety 96 and Mood 87.",
    },
    { position: "62% 50%" },
  ),
  textSide: "start",
  annotations: [
    { x: 61, y: 34, lines: ["Energy 84 · Satiety 96 · Mood 87"] },
    { x: 58, y: 44, lines: ["1,481 of 1,570 kcal", "On track"] },
  ],
};

export const widgetsDesk: LifestylePhoto = {
  ...photo(
    "widgets-desk",
    {
      desktop:
        "A phone on a wooden stand beside a lunch box and a laptop shows PrepIt widgets: Energy 78, Satiety 52 and Mood 31, and today's plan with breakfast logged, lunch skipped and Log it on the snack and dinner.",
      mobile:
        "A phone on a desk stand shows PrepIt widgets with today's signals and today's plan, with Log it on the snack and dinner.",
    },
    { position: "38% 50%", scrim: "end" },
  ),
  // The phone is on the left of this photo, so the text sits on the right.
  textSide: "end",
  annotations: [
    { x: 31, y: 22, lines: ["Energy 78, up 6 on your week"] },
    { x: 45, y: 51, lines: ["Snack, 3:30 PM · 210 kcal"] },
  ],
};

export const lifestylePhotos = {
  heroCafe,
  nutritionistEvening,
  plansKitchen,
  signalsGym,
  widgetsDesk,
};

/** A photo with no phone in it, at its native 1280 × 720 (no 2x upscale). */
export type LifestyleStill = {
  src: string;
  avif: string;
  webp: string;
  width: number;
  height: number;
  /** Empty string when the image is decorative. */
  alt: string;
};

function still(name: string, alt: string): LifestyleStill {
  const base = `/lifestyle/${name}`;
  return {
    src: `${base}.webp`,
    avif: `${base}.avif 1280w`,
    webp: `${base}.webp 1280w`,
    width: 1280,
    height: 720,
    alt,
  };
}

/**
 * Overhead flat-lays of meals from the showcase plan, for the Plans section of
 * the features page (PRE-203) and the share images (PRE-206). Each leaves dark
 * space on the left for text.
 */
export const planFlatLays = {
  oats: still(
    "flatlay-oats",
    "A bowl of protein overnight oats topped with diced apple and cinnamon on a walnut table.",
  ),
  wrap: still(
    "flatlay-wrap",
    "A wholemeal chicken wrap with hummus and salad, cut in half, beside a dish of hummus.",
  ),
  salmon: still(
    "flatlay-salmon",
    "A Mediterranean salmon bowl with quinoa, tomatoes, olives, feta and a lemon wedge.",
  ),
};

/** Soft honey light on near-black, behind sections that have no photo. */
export const textureHoney = still("texture-honey", "");

/** Props for LoopVideo: chicken and vegetables cooking, no phone (PRE-203 Plans). */
export const cookingClip = {
  mp4: "/lifestyle/cooking.mp4",
  webm: "/lifestyle/cooking.webm",
  poster: "/lifestyle/cooking-poster.webp",
  width: 1280,
  height: 720,
  label: "Sliced chicken, peppers and spinach cooking in a cast-iron pan.",
};
