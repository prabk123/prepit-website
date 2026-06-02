import PrepItIcon from "@/components/shareable/PrepItIcon";

/** Matches PrepItColors.light from fresca_app */
const C = {
  surface: "#FFFFFF",
  textPrimary: "#000000",
  textSecondary: "#7A7A82",
  textBody: "#4D4D59",
  border: "#E9E9EA",
  inputFill: "#F4F4F5",
  kcalTagBg: "rgba(255, 100, 79, 0.1)",
  kcalTagText: "#B24637",
} as const;

function GoalMacroWordTag({ word, grams }: { word: string; grams: number }) {
  return (
    <span className="inline-flex rounded-full bg-[#F4F4F5] px-2 py-1 text-[10px] leading-3 text-black">
      <span className="font-extrabold">{word} </span>
      <span className="font-medium">{grams}g</span>
    </span>
  );
}

function MacroInitialTag({ letter, grams }: { letter: string; grams: number }) {
  return (
    <span className="inline-flex rounded-full bg-[#F4F4F5] px-2 py-1 text-[10px] leading-3 text-black">
      <span className="font-extrabold">{letter}</span>
      <span className="font-medium">{` ${grams}g`}</span>
    </span>
  );
}

function KcalMacroTag({ kcal }: { kcal: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-1"
      style={{ backgroundColor: C.kcalTagBg }}
    >
      <PrepItIcon name="fire" size={10} color={C.kcalTagText} />
      <span className="text-[10px] font-extrabold leading-3" style={{ color: C.kcalTagText }}>
        {kcal} kcal
      </span>
    </span>
  );
}

function LogFoodPrimaryButton({ label, done }: { label: string; done?: boolean }) {
  if (done) {
    return (
      <div
        className="w-full rounded-lg py-2 text-center text-xs font-bold leading-[21px]"
        style={{ backgroundColor: C.inputFill, color: C.textBody }}
      >
        Done
      </div>
    );
  }

  return (
    <button
      type="button"
      className="w-full rounded-lg py-2 text-center text-xs font-bold leading-[21px] text-white"
      style={{ backgroundColor: C.textPrimary }}
      tabIndex={-1}
    >
      {label}
    </button>
  );
}

/** Matches [_LogFoodActionLayout] in ai_chat_action_cards.dart */
export function LogFoodActionCard({
  mealLabel,
  title,
  calories,
  carbsG,
  proteinG,
  fatsG,
  done,
  buttonLabel = "Log it",
}: {
  mealLabel: string;
  title: string;
  calories: number;
  carbsG: number;
  proteinG: number;
  fatsG: number;
  done?: boolean;
  buttonLabel?: string;
}) {
  return (
    <div
      className="mb-3 rounded-2xl border pl-4 pr-3 pt-4 pb-4"
      style={{ backgroundColor: C.surface, borderColor: C.border }}
    >
      <div className="flex items-center gap-2">
        <PrepItIcon name="calendarDay" size={14} color={C.textSecondary} />
        <span
          className="text-xs font-bold leading-[21px]"
          style={{ color: C.textSecondary }}
        >
          {mealLabel}
        </span>
      </div>

      <div className="mt-3">
        <p
          className="text-xs font-medium leading-[21px]"
          style={{ color: C.textPrimary }}
        >
          {title}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
          <KcalMacroTag kcal={calories} />
          <MacroInitialTag letter="C" grams={carbsG} />
          <MacroInitialTag letter="P" grams={proteinG} />
          <MacroInitialTag letter="F" grams={fatsG} />
        </div>
      </div>

      <div className="mt-4">
        <LogFoodPrimaryButton label={buttonLabel} done={done} />
      </div>
    </div>
  );
}

/** Matches [_GoalChangeActionCard] / [_FigmaConfirmActionCard] in ai_chat_action_cards.dart */
export function GoalChangeActionCard({
  goalDescription,
  calories,
  carbsG,
  proteinG,
  fatsG,
  done,
}: {
  goalDescription: string;
  calories: number;
  carbsG: number;
  proteinG: number;
  fatsG: number;
  done?: boolean;
}) {
  return (
    <div
      className="mb-3 rounded-2xl border pl-4 pr-3 pt-4 pb-4"
      style={{ backgroundColor: C.surface, borderColor: C.border }}
    >
      <div className="flex items-center gap-2">
        <PrepItIcon name="goal" size={14} color={C.textSecondary} />
        <span
          className="text-xs font-bold leading-[21px]"
          style={{ color: C.textSecondary }}
        >
          Goals
        </span>
      </div>

      <div className="mt-2">
        <p
          className="text-xs font-bold leading-[21px]"
          style={{ color: C.textPrimary }}
        >
          New goal
        </p>
        <p
          className="mt-2 text-xs font-medium leading-[21px]"
          style={{ color: C.textPrimary }}
        >
          {goalDescription}
        </p>
      </div>

      <div className="mt-4">
        <p
          className="text-xs font-bold leading-[21px]"
          style={{ color: C.textPrimary }}
        >
          New daily targets
        </p>
        <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
          <KcalMacroTag kcal={calories} />
          <GoalMacroWordTag word="Carbs" grams={carbsG} />
          <GoalMacroWordTag word="Protein" grams={proteinG} />
          <GoalMacroWordTag word="Fat" grams={fatsG} />
        </div>
      </div>

      <div className="mt-4">
        <LogFoodPrimaryButton label="Save" done={done} />
      </div>
    </div>
  );
}
