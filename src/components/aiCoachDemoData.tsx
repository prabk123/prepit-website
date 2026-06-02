export const PROMPT_CHIPS = [
  {
    prompt: "What should I eat tonight with 500 calories left?",
    outcome: null as string | null,
  },
  {
    prompt: "I had a chicken wrap and an apple for lunch.",
    outcome: "logs it",
  },
  {
    prompt: "Am I on track with my goals?",
    outcome: "suggests a goal change",
  },
  {
    prompt: "Why am I always hungry at 4pm?",
    outcome: null,
  },
] as const;

export type AiCoachDemoIndex = 0 | 1 | 2 | 3;

export const AI_COACH_DEMO_SCENARIOS = [
  {
    userMessage: PROMPT_CHIPS[0].prompt,
    assistant:
      "You've got about 500 cal and 42g protein left today. A salmon rice bowl or chicken stir-fry would hit protein and keep your Energy signal steady through the evening.",
  },
  {
    userMessage: PROMPT_CHIPS[1].prompt,
    assistant:
      "Here's what I'd log for lunch: review the items and tap Log it when it looks right.",
    actionType: "log_food" as const,
  },
  {
    userMessage: PROMPT_CHIPS[2].prompt,
    assistant:
      "You're hitting calories most days but protein is often 15–20g short, which can slow progress. I'd nudge your daily targets up on protein with a small calorie tweak. Review and tap Save if you want to apply it.",
    actionType: "goal_change" as const,
  },
  {
    userMessage: PROMPT_CHIPS[3].prompt,
    assistant:
      "Looking at your log, lunch is often light on protein and fibre, which can leave you hungry by mid-afternoon. A 15–20g protein snack around 2:30pm (Greek yogurt, nuts, or cheese) usually helps without blowing your day.",
  },
] as const;
