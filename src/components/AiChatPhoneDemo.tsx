"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { GoalChangeActionCard, LogFoodActionCard } from "@/components/AiChatDemoCards";
import type { AiCoachDemoIndex } from "@/components/aiCoachDemoData";
import FakeLogScreenDemo from "@/components/FakeLogScreenDemo";
import PrepItIcon from "@/components/shareable/PrepItIcon";

const PHONE_INNER_WIDTH = 288;
const IPHONE_LOGICAL_WIDTH = 390;
const IPHONE_LOGICAL_HEIGHT = 844;
const PHONE_INNER_HEIGHT = Math.round(
  PHONE_INNER_WIDTH * (IPHONE_LOGICAL_HEIGHT / IPHONE_LOGICAL_WIDTH),
);

/** Matches [AiChatBottomSheet] maxChildSize / initialChildSize (0.92). */
const CHAT_SHEET_HEIGHT = Math.round(PHONE_INNER_HEIGHT * 0.92);

const TYPE_MS = 42;
const THINK_MS = 900;
const STREAM_MS = 14;
const HOLD_MS = 4200;
const RESET_MS = 500;
const SEND_MS = 320;

type DemoPhase =
  | "typing"
  | "send"
  | "thinking"
  | "streaming"
  | "action"
  | "hold"
  | "reset";

type ActionType = "log_food" | "goal_change";

type DemoScenario = {
  userMessage: string;
  assistant: string;
  actionType?: ActionType;
};

type ChatMessage =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string };

function PhoneShell({ children }: { children: React.ReactNode }) {
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

function ChatHeader() {
  return (
    <div className="shrink-0 bg-white pt-2">
      <div className="flex justify-center pb-2">
        <div className="h-1.5 w-12 rounded-full bg-[#D3D3D5]" />
      </div>
      <div className="flex items-center gap-1.5 px-4 pb-2">
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--grey-5)]"
          tabIndex={-1}
        >
          <PrepItIcon name="history" size={14} color="var(--black-100)" />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
          <Image src="/logo.png" alt="" width={18} height={18} className="rounded-[5px]" />
          <span className="text-sm font-bold leading-5 text-[var(--black-100)]">
            Nutritionist
          </span>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--grey-5)]"
          tabIndex={-1}
        >
          <PrepItIcon name="edit" size={14} color="var(--black-100)" />
        </button>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end pb-3">
      <div className="max-w-[85%] rounded-xl rounded-br-[2px] bg-[var(--grey-5)] px-4 py-3">
        <p className="text-[13px] leading-5 text-[var(--black-100)]">{text}</p>
      </div>
    </div>
  );
}

function AssistantText({ text }: { text: string }) {
  return (
    <div className="pb-3">
      <p className="text-[13px] leading-5 text-[var(--black-100)]">{text}</p>
    </div>
  );
}

function ThinkingShimmer() {
  return (
    <p className="ai-chat-thinking pb-3 text-[13px] leading-5">Thinking...</p>
  );
}

function ScenarioActionCard({
  actionType,
  done,
}: {
  actionType: ActionType;
  done: boolean;
}) {
  switch (actionType) {
    case "log_food":
      return (
        <LogFoodActionCard
          mealLabel="Lunch"
          title="Chicken wrap & apple"
          calories={485}
          carbsG={48}
          proteinG={28}
          fatsG={14}
          done={done}
        />
      );
    case "goal_change":
      return (
        <GoalChangeActionCard
          goalDescription="Steady fat loss with higher protein to support muscle"
          calories={1850}
          carbsG={180}
          proteinG={150}
          fatsG={55}
          done={done}
        />
      );
    default:
      return null;
  }
}

function Composer({
  text,
  showCursor,
  sendActive,
}: {
  text: string;
  showCursor: boolean;
  sendActive?: boolean;
}) {
  const hasText = text.length > 0;

  return (
    <div className="shrink-0 border-t border-[var(--grey-10)] bg-white px-4 pt-2 pb-2.5">
      <div className="flex items-end gap-2">
        <div className="min-h-[40px] flex-1 rounded-xl bg-[var(--grey-5)] px-3 py-2.5">
          {hasText ? (
            <p className="text-[13px] leading-5 text-[var(--black-100)]">
              {text}
              {showCursor && (
                <span className="ml-px inline-block h-3.5 w-0.5 translate-y-0.5 animate-pulse bg-[var(--black-100)]" />
              )}
            </p>
          ) : (
            <p className="text-[13px] leading-5 text-[var(--grey-60)]">Ask about your nutrition...</p>
          )}
        </div>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform ${
            hasText || sendActive
              ? "bg-[var(--black-100)]"
              : "bg-[var(--grey-10)]"
          } ${sendActive ? "scale-95" : ""}`}
        >
          <PrepItIcon
            name="arrowUp"
            size={14}
            color={hasText || sendActive ? "#ffffff" : "var(--grey-40)"}
          />
        </div>
      </div>
    </div>
  );
}

function AiChatBottomSheet({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-10 flex flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)]"
      style={{ height: CHAT_SHEET_HEIGHT }}
    >
      {children}
    </div>
  );
}

type AiChatPhoneDemoProps = {
  scenarios: readonly DemoScenario[];
  onScenarioChange?: (index: AiCoachDemoIndex) => void;
};

export default function AiChatPhoneDemo({ scenarios, onScenarioChange }: AiChatPhoneDemoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<DemoPhase>("typing");
  const [typedInput, setTypedInput] = useState("");
  const [streamedAssistant, setStreamedAssistant] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showAction, setShowAction] = useState(false);
  const [actionDone, setActionDone] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);
  const [displayScenario, setDisplayScenario] = useState<DemoScenario>(scenarios[0]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;
    let scenarioIndex = 0;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeout = setTimeout(() => {
          if (!cancelled) resolve();
        }, ms);
      });

    const runCycle = async () => {
      while (!cancelled) {
        const current = scenarios[scenarioIndex];
        setDisplayScenario(current);
        onScenarioChange?.(scenarioIndex as AiCoachDemoIndex);

        setPhase("typing");
        setTypedInput("");
        setStreamedAssistant("");
        setMessages([]);
        setShowAction(false);
        setActionDone(false);
        setFadeKey((k) => k + 1);

        for (let i = 1; i <= current.userMessage.length; i += 1) {
          if (cancelled) return;
          setTypedInput(current.userMessage.slice(0, i));
          await wait(TYPE_MS);
        }

        if (cancelled) return;
        setPhase("send");
        await wait(SEND_MS);

        if (cancelled) return;
        setMessages([{ role: "user", text: current.userMessage }]);
        setTypedInput("");
        setPhase("thinking");
        await wait(THINK_MS);

        if (cancelled) return;
        setPhase("streaming");
        for (let i = 1; i <= current.assistant.length; i += 1) {
          if (cancelled) return;
          setStreamedAssistant(current.assistant.slice(0, i));
          await wait(STREAM_MS);
        }

        if (cancelled) return;
        setMessages([
          { role: "user", text: current.userMessage },
          { role: "assistant", text: current.assistant },
        ]);
        setStreamedAssistant("");

        if (current.actionType) {
          setPhase("action");
          setShowAction(true);
          await wait(1200);
          if (
            current.actionType === "log_food" ||
            current.actionType === "goal_change"
          ) {
            setActionDone(true);
            await wait(800);
          }
        }

        if (cancelled) return;
        setPhase("hold");
        await wait(HOLD_MS);

        if (cancelled) return;
        setPhase("reset");
        await wait(RESET_MS);
        scenarioIndex = (scenarioIndex + 1) % scenarios.length;
      }
    };

    void runCycle();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [active, scenarios, onScenarioChange]);

  const listContent = (
    <div className="flex flex-col px-4 py-2">
      {messages.map((msg, i) =>
        msg.role === "user" ? (
          <UserBubble key={`u-${i}`} text={msg.text} />
        ) : (
          <div key={`a-${i}`}>
            <AssistantText text={msg.text} />
            {showAction &&
              displayScenario.actionType &&
              i === messages.length - 1 && (
                <div className="nl-demo-fade">
                  <ScenarioActionCard
                    actionType={displayScenario.actionType}
                    done={actionDone}
                  />
                </div>
              )}
          </div>
        ),
      )}
      {phase === "thinking" && <ThinkingShimmer />}
      {phase === "streaming" && streamedAssistant && (
        <AssistantText text={streamedAssistant} />
      )}
    </div>
  );

  return (
    <div ref={containerRef} className="w-full">
      <PhoneShell>
        <div key={fadeKey} className="relative h-full nl-demo-fade">
          <FakeLogScreenDemo />
          <div className="absolute inset-0 z-[1] bg-black/35" aria-hidden />
          <AiChatBottomSheet>
            <ChatHeader />
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {listContent}
            </div>
            <Composer
              text={phase === "typing" ? typedInput : ""}
              showCursor={phase === "typing"}
              sendActive={phase === "send"}
            />
          </AiChatBottomSheet>
        </div>
      </PhoneShell>
    </div>
  );
}
