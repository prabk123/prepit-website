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
 * Annotation values on the phone: Energy 78, up 6 (about x 31%, y 22%) and
 * Snack, 3:30 PM, 210 kcal (about x 45%, y 51%).
 */
export const widgetsDesk: FeaturePhoto = {
  ...phonePhoto(
    "widgets-desk",
    {
      desktop:
        "A phone on a wooden stand beside a lunch box and a laptop shows PrepIt widgets: Energy 78, Satiety 52 and Mood 31, and today's plan with breakfast logged, lunch skipped and Log it on the snack and dinner.",
      mobile:
        "A phone on a desk stand shows PrepIt widgets with today's signals and today's plan, with Log it on the snack and dinner.",
    },
    { position: "38% 50%", scrim: "end" },
  ),
  textSide: "end",
};

/** A photo with no phone in it, at its native 1280 × 720 (no 2x upscale). */
function still(name: string, alt: string): SectionPhoto {
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

/** Soft honey light on near-black, behind sections that have no photo. Decorative. */
export const textureHoney = still("texture-honey", "");

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
 * The 54 s walkthrough with voiceover and music, for a hero video with sound
 * or the App Store preview. Starts muted like any autoplay; sound needs a tap.
 */
export const narratedWalkthrough = {
  mp4: "/app/21-walkthrough-narrated.mp4",
  webm: "/app/21-walkthrough-narrated.webm",
  poster: "/app/21-walkthrough-poster.webp",
  width: 804,
  height: 1748,
};
