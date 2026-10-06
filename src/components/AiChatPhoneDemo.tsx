"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { GoalChangeActionCard, LogFoodActionCard } from "@/components/AiChatDemoCards";
import FakeLogScreenDemo from "@/components/FakeLogScreenDemo";
import { MicrophoneIcon } from "@/components/demoIcons";
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
const BUBBLE_TYPING_MS = 750;
const BUBBLE_READ_MS = 650;
const HOLD_MS = 4200;

/** Replies are split into bubbles on `---`, like the app's conversation. */
function splitBubbles(text: string) {
  return text
    .split(/\n?---\n?/)
    .map((part) => part.trim())
    .filter(Boolean);
}
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
    <div className="shrink-0 pt-2">
      <div className="flex justify-center pb-2">
        <div className="h-1 w-10 rounded-full bg-[#D3D3D5]" />
      </div>
      <div className="flex items-center justify-center gap-1.5 px-4 pb-2.5">
        <Image src="/logo.png" alt="" width={18} height={18} className="rounded-[5px]" />
        <span className="text-sm font-bold leading-5 text-[var(--black-100)]">Nutritionist</span>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end pb-3">
      <div className="max-w-[80%] rounded-xl rounded-br-[2px] bg-[#D3D3D5] px-3 py-2">
        <p className="text-[13px] leading-5 text-[var(--black-100)]">{text}</p>
      </div>
    </div>
  );
}

function AssistantBubbles({ bubbles, fadeIn = false }: { bubbles: string[]; fadeIn?: boolean }) {
  return (
    <div className="flex flex-col items-start gap-1 pb-3">
      {bubbles.map((bubble, i) => (
        <div
          key={i}
          className={`${fadeIn ? "nl-demo-fade " : ""}max-w-[85%] rounded-xl rounded-bl-[2px] bg-white px-3 py-2`}
        >
          <p className="text-[13px] leading-5 text-[var(--black-100)]">{bubble}</p>
        </div>
      ))}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="pb-3">
      <div className="inline-flex items-center gap-1 rounded-2xl bg-white px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="ai-chat-typing-dot h-[7px] w-[7px] rounded-full bg-[#7A7A82]"
            style={{ animationDelay: `${i * 240}ms` }}
          />
        ))}
      </div>
    </div>
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
    <div className="shrink-0 bg-white px-4 pt-2 pb-2.5">
      <div className="flex items-end gap-2">
        <div className="min-h-[40px] min-w-0 flex-1 rounded-xl bg-[var(--grey-5)] px-3 py-2.5">
          {hasText ? (
            <p className="text-[13px] leading-5 text-[var(--black-100)]">
              {text}
              {showCursor && (
                <span className="ml-px inline-block h-3.5 w-0.5 translate-y-0.5 animate-pulse bg-[var(--black-100)]" />
              )}
            </p>
          ) : (
            <p className="truncate text-[13px] leading-5 text-[#A6A6AC]">
              Ask about your nutrition...
            </p>
          )}
        </div>
        {hasText || sendActive ? (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--black-100)] transition-transform ${
              sendActive ? "scale-90" : ""
            }`}
          >
            <PrepItIcon name="arrowUp" size={16} color="#ffffff" />
          </div>
        ) : (
          <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--grey-5)]">
              <MicrophoneIcon size={16} color="var(--black-100)" />
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--grey-5)]">
              <PrepItIcon name="camera" size={16} color="var(--black-100)" />
            </div>
          </>
        )}
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
      className="absolute inset-x-0 bottom-0 z-10 flex flex-col overflow-hidden rounded-t-[24px] bg-[#F4F4F5] shadow-[0_-8px_40px_rgba(0,0,0,0.18)]"
      style={{ height: CHAT_SHEET_HEIGHT }}
    >
      {children}
    </div>
  );
}

type AiChatPhoneDemoProps = {
  scenarios: readonly DemoScenario[];
};

export default function AiChatPhoneDemo({ scenarios }: AiChatPhoneDemoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<DemoPhase>("typing");
  const [typedInput, setTypedInput] = useState("");
  const [streamedAssistant, setStreamedAssistant] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showAction, setShowAction] = useState(false);
  const [actionDone, setActionDone] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);
  const [displayScenario, setDisplayScenario] = useState<DemoScenario>(scenarios[0]);

  const scrollMessagesToBottom = useCallback(() => {
    const scrollEl = messagesScrollRef.current;
    if (!scrollEl) return;
    scrollEl.scrollTop = scrollEl.scrollHeight;
  }, []);

  useLayoutEffect(() => {
    scrollMessagesToBottom();
  }, [messages, streamedAssistant, showAction, actionDone, phase, fadeKey, scrollMessagesToBottom]);

  useEffect(() => {
    const scrollEl = messagesScrollRef.current;
    const contentEl = scrollEl?.firstElementChild;
    if (!scrollEl || !contentEl) return;

    const observer = new ResizeObserver(() => {
      scrollMessagesToBottom();
    });
    observer.observe(contentEl);
    return () => observer.disconnect();
  }, [fadeKey, scrollMessagesToBottom]);

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

        const bubbles = splitBubbles(current.assistant);
        for (let i = 0; i < bubbles.length; i += 1) {
          if (cancelled) return;
          if (i > 0) {
            setPhase("thinking");
            await wait(BUBBLE_TYPING_MS);
            if (cancelled) return;
          }
          setPhase("streaming");
          setStreamedAssistant(bubbles.slice(0, i + 1).join("\n---\n"));
          await wait(BUBBLE_READ_MS);
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
  }, [active, scenarios]);

  const listContent = (
    <div className="flex flex-col px-4 py-2">
      {messages.map((msg, i) =>
        msg.role === "user" ? (
          <UserBubble key={`u-${i}`} text={msg.text} />
        ) : (
          <div key={`a-${i}`}>
            <AssistantBubbles bubbles={splitBubbles(msg.text)} />
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
      {(phase === "thinking" || phase === "streaming") && streamedAssistant && (
        <AssistantBubbles bubbles={splitBubbles(streamedAssistant)} fadeIn />
      )}
      {phase === "thinking" && <TypingDots />}
    </div>
  );

  return (
    <div ref={containerRef} className="pointer-events-none w-full select-none">
      <PhoneShell>
        <div key={fadeKey} className="relative h-full nl-demo-fade">
          <FakeLogScreenDemo />
          <div className="absolute inset-0 z-[1] bg-black/35" aria-hidden />
          <AiChatBottomSheet>
            <ChatHeader />
            <div ref={messagesScrollRef} className="min-h-0 flex-1 overflow-hidden">
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
