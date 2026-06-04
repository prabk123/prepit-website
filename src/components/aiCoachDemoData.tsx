export const AI_COACH_DEMO_SCENARIOS = [
  {
    userMessage: "Am I on track with my goals?",
    assistant:
      "You're hitting calories most days but protein is often 15–20g short, which can slow progress. I'd nudge your daily targets up on protein with a small calorie tweak. Review and tap Save if you want to apply it.",
    actionType: "goal_change" as const,
  },
] as const;
