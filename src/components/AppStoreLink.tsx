"use client";

import type { ComponentProps } from "react";
import { APP_STORE_URL } from "@/lib/appStore";
import { trackAppStoreClick } from "@/lib/metaPixel";
import { trackPostHogAppStoreClick } from "@/lib/posthogAnalytics";
import { isPostHogPending } from "@/lib/posthogClient";

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
        const pending = isPostHogPending();
        trackAppStoreClick(trackingSource);
        const sent = trackPostHogAppStoreClick(trackingSource);
        onClick?.(event);

        // PostHog loads after the page is idle. A tap before then would leave
        // the page before the event is sent, so hold a plain same-tab click
        // until it is sent (at most about half a second), then follow it.
        const plainClick =
          event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
        const sameTab = !props.target || props.target === "_self";
        if (pending && plainClick && sameTab && !event.defaultPrevented) {
          event.preventDefault();
          const url = event.currentTarget.href;
          void sent.then(() => window.location.assign(url));
        }
      }}
      {...props}
    />
  );
}
