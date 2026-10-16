import DeviceFrame from "@/components/device/DeviceFrame";
import DevicePair from "@/components/device/DevicePair";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Glow from "@/components/ui/Glow";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { appCapture } from "@/lib/captures";

/**
 * Standout 1, second half: how it gets to know you. The consultation's focus
 * picker and a weekly check-in report.
 */
export default function KnowsYouSection() {
  return (
    <Section id="consultation" labelledBy="knows-you-heading" analyticsName="knows-you">
      <FeatureSplit
        media={
          <div className="relative">
            <Glow />
            <DevicePair className="[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]">
              <DeviceFrame
                capture={appCapture(
                  "20-focus-picker",
                  "The consultation's focus picker: front-load protein at breakfast, even out the day, or make snacks work harder",
                )}
              />
              <DeviceFrame
                className="hidden sm:block"
                capture={appCapture(
                  "11-check-in-report",
                  "A weekly check-in report: your steadiest week yet, with goal pace and calories",
                )}
              />
            </DevicePair>
          </div>
        }
      >
        <SectionHeading
          id="knows-you-heading"
          size="section"
          title="It gets to know you first."
          lead="A short consultation about how you eat now ends with one or two things to focus on, like protein at breakfast or the evening snacking."
        />
        <p className="max-w-[46ch] text-body text-ink-secondary text-pretty">
          Every week, a check-in looks back at how it went and picks the one thing to change next. It remembers your
          goals, your notes and what you told it last week, so every reply starts from you.
        </p>
      </FeatureSplit>
    </Section>
  );
}
