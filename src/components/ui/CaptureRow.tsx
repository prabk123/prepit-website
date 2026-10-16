import DeviceFrame, { type DeviceCapture } from "@/components/device/DeviceFrame";
import SwipeRow from "@/components/ui/SwipeRow";

export type CaptureRowItem = {
  title: string;
  detail: string;
  /** A signal or accent colour token for a small dot before the title, as in PointList. */
  accent?: string;
  capture: DeviceCapture;
};

/**
 * Short points, each under the real app screen it talks about (PRE-285): one
 * row you swipe on phones, columns from 1024 px. Use it where a PointList
 * would otherwise be a text-only stretch.
 */
export default function CaptureRow({ label, items }: { label: string; items: CaptureRowItem[] }) {
  return (
    <SwipeRow label={label} itemClassName="w-[72%] max-w-[300px] lg:flex-1">
      {items.map((item) => (
        <div key={item.title} className="flex w-full flex-col gap-4">
          <DeviceFrame className="mx-auto [--device-w:220px] lg:[--device-w:240px]" capture={item.capture} />
          <div className="flex flex-col gap-2 border-t border-line pt-4">
            <h3 className="flex items-start gap-3 font-display text-card-title text-ink">
              {item.accent && (
                <span
                  aria-hidden
                  className="mt-[0.45em] h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: item.accent }}
                />
              )}
              {item.title}
            </h3>
            <p className="text-body text-ink-muted text-pretty">{item.detail}</p>
          </div>
        </div>
      ))}
    </SwipeRow>
  );
}
