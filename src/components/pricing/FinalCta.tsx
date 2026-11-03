import DeviceFrame from "@/components/device/DeviceFrame";
import StartTrialCta from "@/components/ui/StartTrialCta";
import BandPhoto from "@/components/ui/BandPhoto";
import Glow from "@/components/ui/Glow";
import Section from "@/components/ui/Section";
import { downloadStill } from "@/content/featureImagery";
import { appCapture } from "@/lib/captures";
import { TRIAL_DAYS } from "@/lib/pricing";

/**
 * The site's one closing section, one of its two dark bands: headline, the
 * trial line in the brand gradient, the "Start my free 7 days" button into
 * web checkout (PRE-448; it was the App Store button and a QR code), and Home
 * in a phone rising from the bottom edge.
 *
 * `trackingSource` lets a page that ends with its own copy (each guide) count
 * its taps separately (`placement` on `web_landing_cta_click`); the
 * site-wide band uses "final-cta".
 *
 * `id` keeps ids unique: the layout's band stays in the page (hidden) on pages
 * that end with their own, so it passes a different one.
 */
export default function FinalCta({
  trackingSource = "final-cta",
  id = "download",
}: {
  trackingSource?: string;
  id?: string;
}) {
  return (
    <Section id={id} tone="dark" labelledBy={`${id}-heading`} analyticsName="final-cta">
      <BandPhoto photo={downloadStill} position="center" phone="none" text="centre" />
      <div className="relative flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-5">
          <h2 id={`${id}-heading`} className="font-display text-chapter text-ink text-balance">
            Start eating better this week.
          </h2>
          <p className="w-fit text-gradient-brand text-lead font-medium">
            Try your nutritionist free for {TRIAL_DAYS} days.
          </p>
        </div>
        <StartTrialCta placement={trackingSource} className="items-center" />
        {/* The phone is cropped by the section's bottom edge. */}
        <div className="relative -mb-section mt-4 h-[300px] w-full overflow-hidden sm:h-[380px] lg:h-[440px]">
          <Glow style={{ top: "70%" }} />
          <DeviceFrame
            className="mx-auto [--device-w:280px] sm:[--device-w:340px] lg:[--device-w:400px]"
            capture={appCapture("01-home", "PrepIt Home with today's Energy, Satiety and Mood", "dark")}
          />
        </div>
      </div>
    </Section>
  );
}
