import type { SectionPhoto } from "@/components/ui/Section";

/**
 * Lifestyle photos for the homepage (PRE-199). Each is a generated photo in
 * which the phone shows a real app capture; see docs/imagery/prompts.md.
 *
 * Annotation values come from the same logged day the phone shows (the
 * showcase account the captures were taken on), so the numbers agree.
 */

export type PhotoAnnotation = {
  /** Point on the photo the note refers to, as a percentage of the desktop image. */
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
  alt: string,
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
      alt,
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
      alt,
      priority,
      scrim,
    },
  };
}

export const heroCafe: LifestylePhoto = {
  ...photo(
    "hero-cafe",
    "A hand holds a phone showing today's PrepIt log, with a chicken, hummus and salad wrap logged at 12:30 PM for 462 kcal, beside the same wrap and a flat white on a cafe table.",
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
    "On a sofa in the evening, a hand holds a phone showing a chat with the PrepIt nutritionist and a chart of protein per day against a 158 g target, next to a bowl of Greek yogurt with raspberries and a cup of tea.",
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
    "A phone propped against a jar on a kitchen worktop shows the PrepIt grocery list for 13 to 19 October, estimated at £48 to £66, beside the same groceries just unpacked: tortillas, eggs, feta, Greek yogurt, apples and avocados.",
    { position: "40% 50%", scrim: "end" },
  ),
  // The phone is on the left of this photo, so the Plans text sits on the right.
  textSide: "end",
  annotations: [
    { x: 38, y: 38, lines: ["Est. £48–£66 for the week"] },
    { x: 61, y: 63, lines: ["850 g Greek yogurt"] },
    { x: 69, y: 70, lines: ["200 g eggs"] },
    { x: 78, y: 88, lines: ["120 g wholemeal tortilla"] },
  ],
};

export const lifestylePhotos = { heroCafe, nutritionistEvening, plansKitchen };
