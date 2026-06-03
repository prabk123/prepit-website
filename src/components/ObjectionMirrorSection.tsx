"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import PrepItIcon from "@/components/shareable/PrepItIcon";

const STAGGER_MS = 120;

const CARDS = [
  {
    title: "Logging takes forever.",
    body: "Searching databases, guessing portions, scanning every barcode. You quit by week two.",
    icon: "clock" as const,
  },
  {
    title: "Calories don't tell me anything.",
    body: "You hit your numbers and still feel tired, hungry and foggy. The numbers don't explain why.",
    icon: "calories" as const,
  },
  {
    title: "They stop at tracking",
    body: "I didn't eat enough protein. Great, but how can I change that? What should I eat tonight?",
    icon: "info" as const,
  },
] as const;

const ICON_COLOR = "var(--black-100)";

function CardIcon({ icon }: { icon: (typeof CARDS)[number]["icon"] }) {
  const name = icon === "calories" ? "fire" : icon;
  return <PrepItIcon name={name} size={22} color={ICON_COLOR} />;
}

function AiIconChrome({ children }: { children: ReactNode }) {
  return (
    <div className="ai-icon-chrome" aria-hidden>
      <div className="ai-icon-chrome__inner">{children}</div>
    </div>
  );
}

function ObjectionCard({
  title,
  body,
  icon,
  visible,
  delayMs,
}: {
  title: string;
  body: ReactNode;
  icon: (typeof CARDS)[number]["icon"];
  visible: boolean;
  delayMs: number;
}) {
  return (
    <article
      className={`flex h-full flex-row gap-4 rounded-2xl border border-[var(--grey-10)] bg-white p-5 text-left shadow-sm md:flex-col lg:p-6 ${
        visible ? "objection-card-reveal" : "opacity-0"
      }`}
      style={visible ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      <AiIconChrome>
        <CardIcon icon={icon} />
      </AiIconChrome>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h3 className="text-base font-semibold leading-snug text-[var(--black-100)] lg:text-lg">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-[var(--grey-60)] lg:text-base lg:leading-[27px]">
          {body}
        </p>
      </div>
    </article>
  );
}

export default function ObjectionMirrorSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="objection-mirror"
      aria-labelledby="objection-mirror-heading"
      aria-describedby="objection-mirror-subtitle"
      className="flex w-full flex-col items-center bg-[var(--grey-5)] px-4 py-16 lg:px-20 lg:py-24"
    >
      <div className="flex w-full max-w-[1200px] flex-col items-center gap-10 text-center lg:gap-12">
        <div className="flex max-w-[720px] flex-col gap-4">
          <h2
            id="objection-mirror-heading"
            className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--black-100)] lg:text-[40px]"
            style={{ fontFamily: "var(--font-brand)" }}
          >
            Tracking always starts well. Then it gets annoying.
          </h2>
          <p
            id="objection-mirror-subtitle"
            className="text-base font-normal leading-relaxed text-[var(--grey-60)] lg:text-lg lg:leading-[27px]"
          >
            PrepIt fixes the three things that make every other app a chore.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 text-left md:grid-cols-3 md:gap-5">
          {CARDS.map((card, index) => (
            <ObjectionCard
              key={card.title}
              title={card.title}
              body={card.body}
              icon={card.icon}
              visible={revealed}
              delayMs={index * STAGGER_MS}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
