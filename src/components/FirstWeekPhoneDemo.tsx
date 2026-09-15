"use client";

import { useEffect, useRef, useState } from "react";
import PrepItIcon from "@/components/shareable/PrepItIcon";
import { AppTimeline, type TimelineRow } from "@/components/phoneDemo/AppTimeline";
import {
  PhoneDemoShell,
  ScaledDesign,
} from "@/components/phoneDemo/PhoneDemoShell";

const CONSULTATION_ITEMS: TimelineRow[] = [
  {
    month: "Jun",
    day: "2",
    title: "Getting to know you",
    dateRange: "A short chat about your routine and goals",
    kind: "completed",
  },
  {
    month: "Jun",
    day: "5",
    title: "What I've noticed so far",
    dateRange: "See patterns from your logs and pick a focus",
    kind: "current",
  },
  {
    month: "Jun",
    day: "9",
    title: "Week-in-review",
    dateRange: "Look back at the week and plan what's next",
    kind: "future",
  },
];

const CHECK_IN_ITEMS: TimelineRow[] = [
  {
    month: "Jun",
    day: "9",
    title: "Weekly check-in",
    dateRange: "2 Jun – 8 Jun",
    subtitle: "Reflect on your week and get a personalised review of your progress.",
    kind: "current",
  },
  {
    month: "Jun",
    day: "16",
    title: "Next check-in",
    kind: "future",
  },
];

const REPORT = {
  weekRange: "2 Jun – 8 Jun",
  headline: "Solid logging — protein needs attention",
  summary:
    "You logged all seven days and stayed close to your calorie target on weekdays. Weekend meals ran higher and protein dipped below target on three days, which can make hunger creep back mid-week.",
  keyInsight:
    "Your weekday structure is working. Adding ~15g protein at lunch on weekend days would close the gap without changing your overall plan.",
  nextFocusTitle: "Front-load protein at lunch",
  nextFocusDetail:
    "Aim for 30g+ protein at lunch on Saturday and Sunday — Greek yogurt, eggs, or chicken — to keep Satiety steady through the afternoon.",
  cards: [
    {
      label: "Calorie balance",
      value: "~375 cal/day deficit",
      sublabel: "2016 cal eaten / 2391 cal burned avg · 7 day(s) compared",
      bars: [1920, 1885, 2010, 1955, 2280, 2195, 1870],
      target: 2000,
    },
    {
      label: "Protein",
      value: "118g avg / 130g target",
      sublabel: "Hit on 4 of 7 logged days",
      bars: [132, 128, 125, 131, 108, 112, 129],
      target: 130,
    },
    {
      label: "Logging",
      value: "7 of 7 days",
      sublabel: "7 logged days this week",
    },
    {
      label: "Weight trend",
      value: "-0.4 kg/week",
      sublabel: "On pace for your goal · Based on last 4 weeks since 12 May",
    },
  ],
} as const;

type Phase = "consultation" | "tapSession" | "checkIn" | "tapCheckIn" | "report";

function HomeHeader() {
  return (
    <div className="pt-[47px]">
      <div className="flex h-14 items-center px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={40} height={40} className="rounded-[11px]" />
        <div className="flex flex-1 items-center justify-center gap-1">
          <PrepItIcon name="chevronLeft" size={20} color="#000000" />
          <p className="text-xs font-bold tracking-[0.35px] text-black">TODAY</p>
          <PrepItIcon name="chevronRight" size={20} color="#B4B4BC" />
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-semibold text-black">
          J
        </div>
      </div>
    </div>
  );
}

function HomeCard({
  title,
  items,
  pressedIndex,
}: {
  title: string;
  items: readonly TimelineRow[];
  pressedIndex?: number;
}) {
  return (
    <div className="mx-4 rounded-2xl bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <PrepItIcon name="sparkles" size={20} color="#FF644F" />
        <p className="text-base font-bold leading-6 text-black">{title}</p>
      </div>
      <AppTimeline items={items} pressedIndex={pressedIndex} />
    </div>
  );
}

function ConsultationHome({ pressed }: { pressed: boolean }) {
  return (
    <div className="h-[844px] bg-[#F4F4F5]">
      <HomeHeader />
      <div className="pt-2">
        <HomeCard
          title="Your next session is ready"
          items={CONSULTATION_ITEMS}
          pressedIndex={pressed ? 1 : undefined}
        />
      </div>
    </div>
  );
}

function CheckInHome({ pressed }: { pressed: boolean }) {
  return (
    <div className="h-[844px] bg-[#F4F4F5]">
      <HomeHeader />
      <div className="pt-2">
        <HomeCard
          title="Your journey"
          items={CHECK_IN_ITEMS}
          pressedIndex={pressed ? 0 : undefined}
        />
      </div>
    </div>
  );
}

function MiniBars({
  values,
  target,
}: {
  values: readonly number[];
  target: number;
}) {
  const max = Math.max(...values, target);
  return (
    <div className="mt-3 flex h-14 items-end gap-1">
      {values.map((value, index) => (
        <div key={index} className="flex min-w-0 flex-1 flex-col items-center justify-end">
          <div
            className="w-full rounded-sm bg-[#FF644F]"
            style={{ height: `${Math.max(8, (value / max) * 56)}px` }}
          />
        </div>
      ))}
    </div>
  );
}

function CheckInReport({ scrolling }: { scrolling: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !scrolling) return;
    el.scrollTo({ top: 0 });
    const id = window.setTimeout(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, 400);
    return () => window.clearTimeout(id);
  }, [scrolling]);

  return (
    <div className="flex h-[844px] flex-col bg-[#F4F4F5] pt-[47px]">
      <div className="flex items-center px-4 py-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4F4F5]">
          <PrepItIcon name="chevronLeft" size={16} color="#000000" />
        </div>
        <p className="flex-1 text-center text-sm font-bold text-black">Weekly Check-In</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4F4F5]">
          <PrepItIcon name="close" size={16} color="#000000" />
        </div>
      </div>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <p className="text-xs font-semibold text-[#7A7A82]">{REPORT.weekRange}</p>
        <p className="mt-3 text-lg font-bold leading-snug text-black">{REPORT.headline}</p>
        <p className="mt-2 text-sm font-medium leading-relaxed text-[#4D4D59]">
          {REPORT.summary}
        </p>

        <div className="mt-5 rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold text-[#7A7A82]">Lose fat</p>
          <p className="mt-1 text-sm font-bold text-black">78.2 kg → 72.0 kg</p>
          <p className="mt-1 text-xs text-[#7A7A82]">On track · -0.4 kg/week vs -0.5 kg/week goal</p>
        </div>

        {REPORT.cards.map((card) => (
          <div key={card.label} className="mt-2 rounded-2xl bg-white p-4">
            <p className="text-xs font-semibold text-[#7A7A82]">{card.label}</p>
            <p className="mt-1 text-sm font-bold text-black">{card.value}</p>
            <p className="mt-1 text-xs text-[#7A7A82]">{card.sublabel}</p>
            {"bars" in card && card.bars && (
              <MiniBars values={card.bars} target={card.target} />
            )}
          </div>
        ))}

        <div className="mt-4 rounded-2xl bg-white p-4">
          <p className="text-xs font-bold text-black">Key insight</p>
          <p className="mt-2 text-sm leading-relaxed text-[#4D4D59]">{REPORT.keyInsight}</p>
        </div>
        <div className="mt-3 rounded-2xl bg-white p-4">
          <p className="text-xs font-bold text-black">Focus for next week</p>
          <p className="mt-2 text-sm font-semibold text-black">{REPORT.nextFocusTitle}</p>
          <p className="mt-1 text-sm leading-relaxed text-[#4D4D59]">
            {REPORT.nextFocusDetail}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FirstWeekPhoneDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("consultation");
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeout = setTimeout(() => {
          if (!cancelled) resolve();
        }, ms);
      });

    const run = async () => {
      while (!cancelled) {
        setFadeKey((k) => k + 1);
        setPhase("consultation");
        await wait(2200);
        if (cancelled) return;
        setPhase("tapSession");
        await wait(350);
        if (cancelled) return;
        setPhase("checkIn");
        await wait(2000);
        if (cancelled) return;
        setPhase("tapCheckIn");
        await wait(350);
        if (cancelled) return;
        setPhase("report");
        await wait(6200);
        if (cancelled) return;
        await wait(400);
      }
    };

    void run();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [active]);

  const home =
    phase === "consultation" || phase === "tapSession" ? (
      <ConsultationHome pressed={phase === "tapSession"} />
    ) : phase === "checkIn" || phase === "tapCheckIn" ? (
      <CheckInHome pressed={phase === "tapCheckIn"} />
    ) : null;

  return (
    <div ref={containerRef} className="w-full">
      <PhoneDemoShell>
        <div key={fadeKey} className="nl-demo-fade relative h-full overflow-hidden">
          {home && (
            <ScaledDesign>
              {home}
            </ScaledDesign>
          )}
          {phase === "report" && (
            <ScaledDesign>
              <CheckInReport scrolling />
            </ScaledDesign>
          )}
        </div>
      </PhoneDemoShell>
    </div>
  );
}
