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
 * at the phone: Energy 84, Satiety 96, Mood 87 (rings at about x 61%, y 34%)
 * and 1,481 of 1,570 kcal, On track (about x 58%, y 44%).
 */
export const signalsGym: FeaturePhoto = {
  ...phonePhoto(
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
};

/**
 * Widgets tile. The phone is on the left, so the text sits on the right.
 * Annotation values on the phone: Energy 84, Satiety 96, Mood 87 (about
 * x 26%, y 24%) and Lunch, 12:30 PM, Chicken and rice, Logged (about x 25%,
 * y 50%).
 */
export const widgetsDesk: FeaturePhoto = {
  ...phonePhoto(
    "widgets-desk",
    {
      desktop:
        "A phone on a wooden stand beside a lunch box of chicken and rice and a laptop shows PrepIt widgets: Energy 84, Satiety 96 and Mood 87, and today's plan with breakfast and lunch logged and Log it on dinner.",
      mobile:
        "A phone on a desk stand shows PrepIt widgets with Energy 84, Satiety 96 and Mood 87, and today's plan with breakfast and lunch logged.",
    },
    { position: "38% 50%", scrim: "end" },
  ),
  textSide: "end",
};

/**
 * A photo with no phone in it, at its native 1280 × 720 (no 2x upscale), so
 * it stays sharp up to 640 CSS px wide on a 2x screen. Set `sizes` when it is
 * shown wider.
 */
function still(name: string, alt: string, { avif = true } = {}): SectionPhoto {
  const base = `/lifestyle/${name}`;
  return {
    src: `${base}.webp`,
    avif: avif ? `${base}.avif 1280w` : undefined,
    webp: `${base}.webp 1280w`,
    width: 1280,
    height: 720,
    alt,
  };
}

/**
 * Overhead flat-lays of meals from the showcase plan, for the Plans section
 * and the share images (PRE-206). Each leaves dark space on the left for text.
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

/**
 * Soft honey light on near-black, behind sections that have no photo.
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
