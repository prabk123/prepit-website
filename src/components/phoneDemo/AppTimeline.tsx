import PrepItIcon from "@/components/shareable/PrepItIcon";

export type TimelineKind = "completed" | "current" | "future";

export type TimelineRow = {
  month: string;
  day: string;
  title: string;
  dateRange?: string;
  subtitle?: string;
  kind: TimelineKind;
};

export function AppTimeline({
  items,
  pressedIndex,
}: {
  items: readonly TimelineRow[];
  pressedIndex?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      {items.map((item, index) => (
        <TimelineItemRow
          key={`${item.title}-${index}`}
          item={item}
          isFirst={index === 0}
          isLast={index === items.length - 1}
          pressed={pressedIndex === index && item.kind === "current"}
        />
      ))}
    </div>
  );
}

function TimelineItemRow({
  item,
  isFirst,
  isLast,
  pressed,
}: {
  item: TimelineRow;
  isFirst: boolean;
  isLast: boolean;
  pressed: boolean;
}) {
  const isCurrent = item.kind === "current";
  const isCompleted = item.kind === "completed";
  const dotSize = isCurrent ? 10 : 8;

  return (
    <div className="flex items-stretch gap-4">
      <div className="w-9 shrink-0 pt-4 text-center">
        <p className="text-xs font-bold leading-[18px] text-[#A6A6AC]">{item.month}</p>
        <p className="text-sm font-semibold leading-[17px] text-black">{item.day}</p>
      </div>

      <div className="relative w-[15px] shrink-0">
        {!isFirst && (
          <div
            className="absolute left-1/2 w-px -translate-x-1/2"
            style={{
              top: 0,
              height: 22 + dotSize / 2,
              backgroundImage:
                "repeating-linear-gradient(to bottom, #D3D3D5 0 3px, transparent 3px 6px)",
            }}
          />
        )}
        {!isLast && (
          <div
            className="absolute left-1/2 w-px -translate-x-1/2"
            style={{
              top: 22 + dotSize / 2,
              bottom: -4,
              backgroundImage:
                "repeating-linear-gradient(to bottom, #D3D3D5 0 3px, transparent 3px 6px)",
            }}
          />
        )}
        <div
          className="absolute left-1/2 top-[22px] -translate-x-1/2 rounded-full"
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: isCurrent || isCompleted ? "#FF644F" : "#FFFFFF",
            border: isCurrent || isCompleted ? undefined : "1.5px solid #D3D3D5",
          }}
        />
      </div>

      <div
        className={`min-w-0 flex-1 rounded-xl px-4 py-3 ${
          isCurrent ? "bg-[#F4F4F5]" : "bg-[#F0F0F2]"
        } ${pressed ? "scale-95" : ""}`}
        style={{ transition: "transform 220ms cubic-bezier(0.33, 1, 0.68, 1)" }}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p
              className={`text-xs leading-[18px] ${
                isCurrent
                  ? "font-bold text-black"
                  : isCompleted
                    ? "font-medium text-[#7A7A82]"
                    : "font-medium text-black"
              }`}
            >
              {item.title}
            </p>
            {item.dateRange && (
              <p className="mt-1 text-xs font-semibold leading-[18px] text-[#7A7A82]">
                {item.dateRange}
              </p>
            )}
            {item.subtitle && (
              <p className="mt-1 text-xs leading-[18px] text-[#7A7A82]">{item.subtitle}</p>
            )}
          </div>
          {isCompleted ? (
            <PrepItIcon name="checkmark" size={18} color="#258400" />
          ) : isCurrent ? (
            <PrepItIcon name="chevronRight" size={18} color="#7A7A82" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
