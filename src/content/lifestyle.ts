import type { PhotoAnnotation } from "@/components/media/AnnotatedPhoto";
import type { SectionPhoto } from "@/components/ui/Section";

/**
 * Lifestyle photos for the homepage (PRE-199, relit for the light site in
 * PRE-282). Each is a generated photo in
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
    "At a bright table by a window, a hand holds a phone showing a chat with the PrepIt nutritionist and a chart of protein per day against a 158 g target, beside a glass of water and a plate of apple slices and almonds.",
    { position: "60% 50%", priority: true },
  ),
  textSide: "start",
  // Nothing on the table is logged, so the label points at the chart on the
  // phone: the dashed line is the showcase account's 158 g protein target.
  // It sits right of the phone, over the hand, since the hero's text takes
  // the photo's left side (PRE-306).
  annotations: [{ x: 76, y: 55, side: "right", length: 40, value: "158 g", label: "Daily protein target" }],
};

export const nutritionistEvening: LifestylePhoto = {
  ...photo(
    "nutritionist-evening",
    "In a bright kitchen, a hand holds a phone showing a message from the PrepIt nutritionist: Tuesdays and Wednesdays have run about 520 kcal over goal, with a weekly calorie pattern that gives those days 2,250 kcal and the rest 1,620 kcal, keeping the weekly total at 12,600 kcal.",
    { position: "65% 50%" },
  ),
  textSide: "start",
  // Values from the weekly calorie pattern card on the phone. The labels sit
  // to the right of the phone, over the hand, so they stay clear of the text.
  annotations: [
    { x: 76, y: 58, side: "right", length: 32, value: "2,250 kcal", label: "Tuesday" },
    { x: 76, y: 77, side: "right", length: 32, value: "12,600 kcal", label: "Each week" },
  ],
};

/**
 * Standout: how food makes you feel. Lunch in front of the phone's Home
 * screen. The bowl is not on the log, so labels should point at the phone:
 * Energy 84, Satiety 96, Mood 87 (rings at about x 75%, y 31%) and 1,481 of
 * 1,570 kcal eaten (about x 72%, y 43%).
 */
export const lunchRings: LifestylePhoto = {
  ...photo(
    "lunch-rings",
    "A hand holds a phone showing PrepIt's Home screen with Energy 84, Satiety 96 and Mood 87 and 1,481 of 1,570 kcal eaten, beside a bowl of sliced chicken, quinoa, roasted peppers and salad.",
    { position: "65% 50%" },
  ),
  textSide: "start",
  annotations: [{ x: 70, y: 31, side: "left", length: 96, value: "Energy 84", label: "Satiety 96, Mood 87" }],
};

export const plansKitchen: LifestylePhoto = {
  ...photo(
    "plans-kitchen",
    "A phone propped against a jar on a kitchen worktop shows the PrepIt grocery list for 13 to 19 October with its estimated cost, beside the same groceries just unpacked: tortillas, eggs, feta, Greek yogurt, apples and avocados.",
    { position: "40% 50%" },
  ),
  // The phone is left of centre in this photo, so the Plans text sits on the right.
  textSide: "end",
  // The label sits on the avocados below the phone, clear of the text column
  // on the right. scripts/check-photo-labels.mjs checks that. The avocados
  // are more than this week's list, so the label says the amount is the list's.
  annotations: [{ x: 33, y: 86, side: "right", length: 32, value: "140 g", label: "Avocado on the list" }],
};

export const lifestylePhotos = { heroCafe, nutritionistEvening, lunchRings, plansKitchen };
