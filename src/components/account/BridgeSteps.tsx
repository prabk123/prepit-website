const STEPS = ["Sign in", "Choose your plan", "Get the app"] as const;

/**
 * The bridge's three steps (PRE-323, PRE-325): sign in, choose a plan, get
 * the app. `current` is 0-based; earlier steps show a tick.
 */
export default function BridgeSteps({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol aria-label="Steps" className="flex w-full items-center justify-center gap-2 text-small">
      {STEPS.map((label, index) => {
        const state = index < current ? "done" : index === current ? "current" : "todo";
        return (
          <li
            key={label}
            aria-current={state === "current" ? "step" : undefined}
            className={`flex items-center gap-2 ${state === "todo" ? "text-ink-muted" : "text-ink"}`}
          >
            <span
              aria-hidden
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                state === "todo" ? "border border-line-strong" : "bg-primary text-on-primary"
              }`}
            >
              {state === "done" ? "✓" : index + 1}
            </span>
            <span className={state === "current" ? "font-medium" : "hidden sm:inline"}>{label}</span>
            {index < STEPS.length - 1 && <span aria-hidden className="h-px w-4 bg-line-strong" />}
          </li>
        );
      })}
    </ol>
  );
}
