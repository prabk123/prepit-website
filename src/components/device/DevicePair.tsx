import type { CSSProperties, ReactNode } from "react";

type DevicePairProps = {
  /** Two `<DeviceFrame>`s. The second sits lower and overlaps the first. */
  children: ReactNode;
  /** Share of the frame width the second phone overlaps the first (0 to 0.5). */
  overlap?: number;
  className?: string;
};

export default function DevicePair({
  children,
  overlap = 0.28,
  className,
}: DevicePairProps) {
  const style = { "--device-overlap": `${-overlap}` } as CSSProperties;

  return (
    <div className={`device-pair ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}
