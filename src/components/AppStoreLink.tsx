"use client";

import type { ComponentProps } from "react";
import { APP_STORE_URL } from "@/lib/appStore";
import { trackAppStoreClick } from "@/lib/metaPixel";

type AppStoreLinkProps = ComponentProps<"a"> & {
  /** Identifies which CTA was tapped (sent to Meta Pixel as `source`). */
  trackingSource: string;
};

export default function AppStoreLink({
  trackingSource,
  href = APP_STORE_URL,
  onClick,
  ...props
}: AppStoreLinkProps) {
  return (
    <a
      href={href}
      onClick={(event) => {
        trackAppStoreClick(trackingSource);
        onClick?.(event);
      }}
      {...props}
    />
  );
}
