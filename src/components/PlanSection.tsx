import MealPlanReviewPhoneDemo from "@/components/MealPlanReviewPhoneDemo";
import PrepItIcon, { type PrepItIconName } from "@/components/shareable/PrepItIcon";

const FEATURES: { title: string; body: string; icon: PrepItIconName }[] = [
  {
    title: "Meal structures, not chef recipes",
    body: "Protein, carb, and veg with portions — sized to your targets, diet, and how you actually cook",
    icon: "restaurant",
  },
  {
    title: "Skip what you won't cook",
    body: "Eating out or skipping breakfast holds calorie room. The rest of the day still lands near your goal",
    icon: "calendar",
  },
  {
    title: "Groceries and a budget",
    body: "A shopping list with an estimated cost. Ask Nutritionist to swap any meal — you confirm first",
    icon: "basket",
  },
];

export default function PlanSection() {
  return (
    <section
      id="plans"
      aria-labelledby="plans-heading"
      aria-describedby="plans-body"
      className="flex w-full flex-col items-center bg-white px-4 py-16 lg:px-20 lg:py-24"
    >
      <div className="flex w-full max-w-[1200px] flex-col-reverse items-center gap-12 lg:flex-row-reverse lg:items-center lg:gap-16">
        <div className="flex min-w-0 flex-1 flex-col gap-8 text-left">
          <div className="flex flex-col gap-4">
            <h2
              id="plans-heading"
              className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--black-100)] lg:text-[40px]"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              A plan that looks like how you actually eat
            </h2>
            <p
              id="plans-body"
              className="text-base font-normal leading-relaxed text-[var(--grey-60)] lg:text-lg lg:leading-[27px]"
            >
              Your nutritionist drafts the week as meal structures — not a
              cookbook. Confirm the draft, shop the list, swap anything in chat.
            </p>
          </div>

          <ul className="flex flex-col gap-5">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex gap-3 text-left">
                <div className="ai-icon-chrome mt-0.5 shrink-0" aria-hidden>
                  <div className="ai-icon-chrome__inner">
                    <PrepItIcon name={feature.icon} size={20} color="var(--black-100)" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold leading-snug text-[var(--black-100)]">
                    {feature.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--grey-60)] lg:text-base lg:leading-[27px]">
                    {feature.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex w-full shrink-0 justify-center lg:w-[340px]">
          <MealPlanReviewPhoneDemo />
        </div>
      </div>
    </section>
  );
}
