import type { NutritionalGoals } from "@/lib/prepitApi";
import type { OnboardingState } from "@/features/onboarding/state";
import { kgToLb } from "@/features/onboarding/mappings";
import PrepItIcon from "@/components/shareable/PrepItIcon";
import AiInsightCard from "@/features/onboarding/components/AiInsightCard";

function insightTitle(goal: string | null): string {
  switch (goal) {
    case "Lose fat":
      return "Built for fat loss";
    case "Build muscle":
      return "Built for muscle gain";
    case "Improve energy":
      return "Built for steadier energy";
    case "Stay fuller":
      return "Built to keep you satisfied";
    case "Eat healthier":
      return "Your nutrition baseline is set";
    case "Maintain":
      return "Your maintenance targets are set";
    case "Fuel training":
      return "Fueled for training and recovery";
    default:
      return "Your plan is ready";
  }
}

function insightBody(goal: string | null): string {
  switch (goal) {
    case "Lose fat":
      return "Your daily targets are set to support steady fat loss.";
    case "Build muscle":
      return "Your daily targets are set to support muscle gain.";
    case "Improve energy":
      return "Your targets are tuned for steadier energy throughout the day.";
    case "Stay fuller":
      return "Your targets focus on protein and balance to help you stay satisfied.";
    case "Eat healthier":
      return "Your targets give you a balanced baseline to build healthier habits.";
    case "Maintain":
      return "Your targets match your current weight and activity level.";
    case "Fuel training":
      return "Your targets support your workouts and recovery.";
    default:
      return "Your daily targets are ready to go.";
  }
}

export function planProjection(
  state: OnboardingState,
  effectiveGoalSpeed?: number,
) {
  const pace = effectiveGoalSpeed ?? state.goalSpeed;
  const change = Math.abs(state.goalWeight - state.weight);
  if (pace <= 0 || change === 0) return null;
  const weeks = change / pace;
  const date = new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000);
  return {
    date: date.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
    change,
    pace,
    losing: state.goalWeight < state.weight,
  };
}

export default function PlanSummary({
  state,
  goals,
  effectiveGoalSpeed,
}: {
  state: OnboardingState;
  goals: NutritionalGoals | null;
  effectiveGoalSpeed?: number;
}) {
  const projection = planProjection(state, effectiveGoalSpeed);
  const unit = state.unit === "Imperial" ? "lb" : "kg";
  const changeDisplay =
    projection &&
    (state.unit === "Imperial" ? kgToLb(projection.change) : projection.change);
  const paceDisplay =
    projection &&
    (state.unit === "Imperial" ? projection.pace * 2.20462 : projection.pace);

  return (
    <div>
      <AiInsightCard
        title={
          projection
            ? `On track to ${projection.losing ? "lose" : "gain"} ${Number(changeDisplay).toFixed(0)} ${unit} by ${projection.date}`
            : insightTitle(state.goal)
        }
        body={
          projection
            ? `Welcome — I've set a sustainable pace of about ${Number(paceDisplay).toFixed(2)} ${unit} per week. Log meals in plain English and I'll help you stay on track. You can adjust your goals anytime in Settings.`
            : `Welcome — ${insightBody(state.goal)} Log meals in plain English and I'll help you stay on track. You can adjust your goals anytime in Settings.`
        }
      />
      <h2 className="mt-6 text-base font-bold">Daily targets</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Target
          icon="fire"
          color="#FF644F"
          label="Calories"
          value={goals ? `${Math.round(goals.calories).toLocaleString()} cal` : "—"}
        />
        <Target
          icon="wheat"
          color="#F38C61"
          label="Carbs"
          value={goals ? `${Math.round(goals.carbs).toLocaleString()}g` : "—"}
        />
        <Target
          icon="scale"
          color="#809FF9"
          label="Protein"
          value={goals ? `${Math.round(goals.protein).toLocaleString()}g` : "—"}
        />
        <Target
          icon="leaf"
          color="#258400"
          label="Fat"
          value={goals ? `${Math.round(goals.fats).toLocaleString()}g` : "—"}
        />
      </div>
    </div>
  );
}

function Target({
  icon,
  color,
  label,
  value,
}: {
  icon: "fire" | "wheat" | "scale" | "leaf";
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[var(--input-fill)] p-4">
      <PrepItIcon name={icon} size={24} color={color} />
      <div>
        <p className="text-base font-semibold">{value}</p>
        <p className="text-xs font-medium text-[var(--text-secondary)]">{label}</p>
      </div>
    </div>
  );
}
