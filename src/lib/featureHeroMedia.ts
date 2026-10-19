import type { ComponentProps } from "react";
import type DeviceFrame from "@/components/device/DeviceFrame";
import { appCapture, appVideo } from "@/lib/captures";
import type { FeatureSlug } from "@/lib/features";

export type FeatureHeroMedia = Pick<ComponentProps<typeof DeviceFrame>, "capture" | "video">;

/**
 * The phone in each feature page's header, a still or a looping clip. The
 * Features overview (PRE-311) shows the same phone in that feature's hero, so
 * the two pages never drift apart.
 */
export const FEATURE_HERO_MEDIA: Record<FeatureSlug, FeatureHeroMedia> = {
  "ai-nutritionist": {
    video: appVideo(
      "08-chat-ask",
      "Asking the nutritionist for a high-protein breakfast for tomorrow and getting its reply",
    ),
  },
  "nutrition-signals": {
    capture: appCapture(
      "06-signal-energy",
      "Energy at 84, with what shaped it: calorie fit, meal spread and timing",
    ),
  },
  "meal-plans": {
    video: appVideo("12-plan-week", "Scrolling a week of planned meals, each with a photo of the dish"),
  },
  logging: {
    video: appVideo("03-log-typed", "Typing a meal in plain words and PrepIt building the log with its macros"),
  },
  "widgets-and-siri": {
    capture: appCapture(
      "23b-home-screen-widgets",
      "An iPhone Home Screen with PrepIt's Today's calories widget: 1,485 kcal eaten, 85 left of a 1,570 goal, On track",
    ),
  },
};
