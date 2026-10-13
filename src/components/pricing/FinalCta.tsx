import DeviceFrame from "@/components/device/DeviceFrame";
import AppStoreCta from "@/components/ui/AppStoreCta";
import Glow from "@/components/ui/Glow";
import Section from "@/components/ui/Section";
import { TRIAL_DAYS } from "@/lib/pricing";

/**
 * The site's one closing download section: full-bleed dark band, headline,
 * the trial line in the brand gradient, App Store button, a QR code on
 * desktop, and Home in a phone rising from the bottom edge.
 *
 * `trackingSource` lets a page that ends with its own copy (each guide) count
 * its App Store taps separately; the site-wide band uses "final-cta".
 */
export default function FinalCta({ trackingSource = "final-cta" }: { trackingSource?: string }) {
  return (
    <Section id="download" labelledBy="download-heading">
      <div className="relative flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-5">
          <h2 id="download-heading" className="font-display text-chapter text-ink text-balance">
            Start eating better this week.
          </h2>
          <p className="w-fit text-gradient-brand text-lead font-medium">
            Try your nutritionist free for {TRIAL_DAYS} days.
          </p>
        </div>
        <AppStoreCta
          trackingSource={trackingSource}
          qrCaption="Scan with your iPhone camera"
          className="justify-center"
        />
        {/* The phone is cropped by the section's bottom edge. */}
        <div className="relative -mb-section mt-4 h-[300px] w-full overflow-hidden sm:h-[380px] lg:h-[440px]">
          <Glow style={{ top: "70%" }} />
          <DeviceFrame
            className="mx-auto [--device-w:280px] sm:[--device-w:340px] lg:[--device-w:400px]"
            capture={{
              src: "/app/01-home-dark@2x.webp",
              avif: "/app/01-home-dark@2x.avif",
              webp: "/app/01-home-dark@2x.webp",
              alt: "PrepIt Home with today's Energy, Satiety and Mood",
            }}
          />
        </div>
      </div>
    </Section>
  );
}
