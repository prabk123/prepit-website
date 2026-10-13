import type { PhotoAnnotation } from "@/components/media/AnnotatedPhoto";
import type { SectionPhoto } from "@/components/ui/Section";

/**
 * Lifestyle photos for the homepage (PRE-199). Each is a generated photo in
 * which the phone shows a real app capture; see docs/imagery/prompts.md.
 *
 * Annotation values come from the same logged day the phone shows (the
 * showcase account the captures were taken on), so the numbers agree.
 * Annotation x and y are percentages of the full 16:9 desktop photo;
 * <AnnotatedPhoto> keeps them on the food however the section crops it.
 */
export type LifestylePhoto = {
  /** 16:9 photo, from 1024 px. */
  desktop: SectionPhoto;
  /** 4:5 crop around the phone, below 1024 px. */
  mobile: SectionPhoto;
  /** Side of the section the page text sits on, clear of the subject. */
  textSide: "start" | "end";
  annotations: PhotoAnnotation[];
};

function photo(
  name: string,
  /** Describes the whole photo; the phone crop uses it too. */
  alt: string,
  { position, priority }: { position?: string; priority?: boolean } = {},
): Pick<LifestylePhoto, "desktop" | "mobile"> {
  const base = `/lifestyle/${name}`;
  return {
    desktop: {
      src: `${base}@1x.webp`,
      avif: `${base}@1x.avif 1440w, ${base}@2x.avif 2048w`,
      webp: `${base}@1x.webp 1440w, ${base}@2x.webp 2048w`,
      sizes: "100vw",
      width: 1440,
      height: 810,
      alt,
      position,
      priority,
    },
    mobile: {
      src: `${base}-mobile@1x.webp`,
      avif: `${base}-mobile@1x.avif 640w, ${base}-mobile@2x.avif 920w`,
      webp: `${base}-mobile@1x.webp 640w, ${base}-mobile@2x.webp 920w`,
      sizes: "100vw",
      width: 640,
      height: 800,
      priority,
    },
  };
}

export const heroCafe: LifestylePhoto = {
  ...photo(
    "hero-cafe",
    "A hand holds a phone showing today's PrepIt log, with a chicken, hummus and salad wrap logged at 12:30 PM for 462 kcal, beside the same wrap and a flat white on a cafe table.",
    { position: "60% 50%", priority: true },
  ),
  textSide: "start",
  annotations: [
    { x: 46, y: 52, side: "left", length: 96, value: "462 kcal", label: "Chicken wrap with hummus and salad" },
    { x: 42, y: 66, side: "left", length: 120, value: "61 g protein", label: "In the wrap" },
    { x: 43, y: 82, side: "left", length: 120, value: "150 g", label: "Chicken breast" },
  ],
};

export const nutritionistEvening: LifestylePhoto = {
  ...photo(
    "nutritionist-evening",
    "On a sofa in the evening, a hand holds a phone showing a chat with the PrepIt nutritionist and a chart of protein per day against a 158 g target, next to a bowl of Greek yogurt with raspberries and a cup of tea.",
    { position: "65% 50%" },
  ),
  textSide: "start",
  annotations: [{ x: 88, y: 86, side: "left", length: 48, value: "13 g protein", label: "Greek yogurt with raspberries" }],
};

export const plansKitchen: LifestylePhoto = {
  ...photo(
    "plans-kitchen",
    "A phone propped against a jar on a kitchen worktop shows the PrepIt grocery list for 13 to 19 October with its estimated cost, beside the same groceries just unpacked: tortillas, eggs, feta, Greek yogurt, apples and avocados.",
    { position: "40% 50%" },
  ),
  // The phone is on the left of this photo, so the Plans text sits on the right.
  textSide: "end",
  // The text sits top right, so the labels stay in the lower third.
  annotations: [
    { x: 62, y: 68, side: "right", length: 48, value: "850 g", label: "Greek yogurt" },
    // The carton and the pack hold more than this week's list, so the labels
    // say the amount is the list's.
    { x: 69, y: 76, side: "left", length: 48, value: "200 g", label: "Eggs on the list" },
    { x: 74, y: 90, side: "right", length: 48, value: "120 g", label: "Wholemeal tortilla on the list" },
  ],
};

export const lifestylePhotos = { heroCafe, nutritionistEvening, plansKitchen };
