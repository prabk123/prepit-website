import type { PhotoAnnotation } from "@/components/media/AnnotatedPhoto";
import type { SectionPhoto } from "@/components/ui/Section";

/**
 * Homepage lifestyle photos and their annotations (design D3).
 *
 * The photos are PLACEHOLDERS until PRE-199 delivers the real scenes under
 * public/lifestyle/. When a scene lands: swap `photo`, delete `placeholder`,
 * and move each annotation onto the food in the new photo. Annotation values
 * must come from a real log. These come from the PRE-198 captures (the
 * overnight oats breakfast in capture 05 and the grocery list in capture 13);
 * if the final scene shows a different meal, use that meal's real log instead.
 */
type LifestyleScene = {
  photo: SectionPhoto;
  /** Visible "placeholder" chip text; remove when the real photo lands. */
  placeholder?: string;
  annotations: PhotoAnnotation[];
};

const PLACEHOLDER = {
  src: "/lifestyle/placeholder.webp",
  webp: "/lifestyle/placeholder.webp",
  width: 1600,
  height: 900,
} as const;

/** Hero: hand holding a phone over a meal at a cafe table (PRE-199 scene 1). */
export const HERO_SCENE: LifestyleScene = {
  photo: { ...PLACEHOLDER, alt: "", priority: true },
  placeholder: "cafe meal with PrepIt open (PRE-199)",
  annotations: [
    { x: 16, y: 30, side: "right", value: "357 kcal", label: "Protein overnight oats" },
    { x: 38, y: 50, side: "left", value: "14 g protein", label: "Greek yogurt" },
    { x: 24, y: 68, side: "right", value: "14 g carbs", label: "Apple" },
    { x: 46, y: 22, side: "left", length: 56, value: "Energy +34", label: "Morning protein" },
  ],
};

/** Nutritionist: evening on the sofa, phone in hand, cup of tea (PRE-199 scene 3). */
export const EVENING_SCENE: LifestyleScene = {
  photo: { ...PLACEHOLDER, alt: "" },
  placeholder: "evening at home with a snack (PRE-199)",
  annotations: [{ x: 62, y: 34, side: "right", value: "14 g protein", label: "Greek yogurt" }],
};

/** Plans: groceries unpacked on a kitchen counter (PRE-199 scene 2). */
export const KITCHEN_SCENE: LifestyleScene = {
  photo: { ...PLACEHOLDER, alt: "" },
  placeholder: "groceries on a kitchen counter (PRE-199)",
  annotations: [
    { x: 60, y: 24, side: "right", value: "850 g", label: "Greek yogurt" },
    { x: 66, y: 46, side: "right", value: "200 g", label: "Eggs" },
    { x: 58, y: 66, side: "right", value: "Est. £48–£66", label: "This week's shop" },
  ],
};
