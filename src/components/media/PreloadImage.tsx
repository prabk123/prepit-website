"use client";

import { preload } from "react-dom";

type PreloadImageProps = {
  href: string;
  imageSrcSet?: string;
  imageSizes?: string;
  type?: string;
  media?: string;
};

/**
 * Preloads a page's LCP image at high priority. It is a client component on
 * purpose: `preload()` in a server component becomes a hint in the page's RSC
 * payload, and the browser acts on those hints when another page prefetches
 * this one, so every page linking here fetched this image at high priority.
 * A client component only runs when the page itself renders, and during
 * server rendering React still puts the preload in <head>.
 */
export default function PreloadImage({ href, ...options }: PreloadImageProps) {
  preload(href, { as: "image", fetchPriority: "high", ...options });
  return null;
}
