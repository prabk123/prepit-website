import type { ReactNode } from "react";

type FeatureSplitProps = {
  /** Usually a <SectionHeading>, plus any points under it. */
  children: ReactNode;
  /** Usually a <DeviceFrame> or <DevicePair>, often with a <Glow>. */
  media: ReactNode;
  /** Put the media on the left on desktop. */
  reverse?: boolean;
  /** `text` gives the text column more room, for hero-size headlines. */
  emphasis?: "even" | "text";
  /** Extra classes for the media column, for example `max-lg:hidden`. */
  mediaClassName?: string;
  className?: string;
};

/** Text beside a device. Stacks text first on phones. */
export default function FeatureSplit({
  children,
  media,
  reverse,
  emphasis = "even",
  mediaClassName,
  className,
}: FeatureSplitProps) {
  const columns =
    emphasis === "even"
      ? "lg:grid-cols-2"
      : reverse
        ? "lg:grid-cols-[5fr_7fr]"
        : "lg:grid-cols-[7fr_5fr]";

  return (
    <div
      className={`grid items-center gap-stack lg:gap-x-12 ${columns} ${className ?? ""}`}
    >
      <div className={`flex min-w-0 flex-col gap-8 ${reverse ? "lg:order-2" : ""}`}>
        {children}
      </div>
      <div
        data-reveal="rise"
        className={`relative flex min-w-0 justify-center ${reverse ? "lg:order-1" : ""} ${mediaClassName ?? ""}`}
      >
        {media}
      </div>
    </div>
  );
}
