import type { ReactNode } from "react";

export const DESIGN_WIDTH = 390;
export const DESIGN_HEIGHT = 844;
export const PHONE_INNER_WIDTH = 288;
export const SCALE = PHONE_INNER_WIDTH / DESIGN_WIDTH;
export const PHONE_INNER_HEIGHT = Math.round(
  PHONE_INNER_WIDTH * (DESIGN_HEIGHT / DESIGN_WIDTH),
);

export function PhoneDemoShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative mx-auto w-full max-w-[300px] overflow-hidden rounded-[40px] border-[6px] border-[var(--black-100)] bg-[var(--grey-5)] shadow-[0_24px_48px_rgba(0,0,0,0.12)]"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-2 z-20 h-[22px] w-[88px] -translate-x-1/2 rounded-full bg-[var(--black-100)]" />
      <div
        className="relative overflow-hidden bg-[#F4F4F5]"
        style={{ height: PHONE_INNER_HEIGHT }}
      >
        {children}
      </div>
    </div>
  );
}

export function ScaledDesign({
  children,
  height = DESIGN_HEIGHT,
}: {
  children: ReactNode;
  height?: number;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#F4F4F5]">
      <div
        className="pointer-events-none origin-top-left select-none"
        style={{
          transform: `scale(${SCALE})`,
          width: DESIGN_WIDTH,
          height,
        }}
      >
        {children}
      </div>
    </div>
  );
}
