import type { ReactNode } from "react";
import ScreenCard from "@/components/features/ScreenCard";
import { Chip, Split, V9Section } from "@/components/landing/v9/V9Sections";
import { appCapture } from "@/lib/captures";

type PlanSection = {
  id: string;
  title: string;
  lead: string;
  chips?: string[];
  note?: ReactNode;
  screen: { name: string; alt: string };
};

/**
 * Three real screens in order, from Charlie's copy deck (docs/copy/04-plans.md):
 * the plan questions, a swap, then the grocery list. The weekly calorie
 * pattern lives on Your nutritionist and the Today's plan widget on Widgets
 * and Siri, so neither is repeated here.
 */
const SECTIONS: PlanSection[] = [
  {
    id: "how-it-plans",
    title: "It asks first, then plans.",
    lead: "Which days to cover, whether to plan every meal, snacks, your budget and how much variety you like. Then you check the week, day by day, before you confirm.",
    chips: ["Up to 7 days", "Your budget", "Your tastes"],
    screen: {
      name: "27-plan-questions",
      alt: "The nutritionist asking about budget and how much variety you'd like this week",
    },
  },
  {
    id: "swaps",
    title: "Don't fancy it? Swap it.",
    lead: "Not in the mood for Monday's dinner? Ask for something else and it changes the meal, and the shopping list with it. Every meal comes with its nutrition and cooking steps.",
    chips: ["“Swap Thursday's dinner”", "Cooking steps"],
    screen: { name: "27b-plan-swap", alt: "Asking for alternatives to Monday's dinner and getting three options" },
  },
  {
    id: "grocery-list",
    title: "One shopping list, by aisle.",
    lead: "One list for the week, grouped by aisle, with an estimated cost. Tick things off as you shop, or share it with whoever's doing the shop.",
    note: "Estimates use typical supermarket prices where you live. They aren't live store prices.",
    screen: { name: "13-grocery-list", alt: "The week's grocery list with an estimated cost, grouped by aisle" },
  },
];

/** /features/meal-plans (PRE-453): the plan questions, a swap and the grocery list, on alternating band and cream. */
export default function MealPlansFeature() {
  return (
    <>
      {SECTIONS.map((section, index) => {
        // Band first, as in the prototype; the screen sits on the left of the band sections.
        const band = index % 2 === 0;
        const headingId = `${section.id}-heading`;
        return (
          <V9Section key={section.id} id={section.id} name={`meal-plans-${section.id}`} labelledBy={headingId} band={band}>
            <Split
              reverse={band}
              text={
                <>
                  <h2 id={headingId} className="font-display text-chapter text-ink text-balance">
                    {section.title}
                  </h2>
                  <p className="max-w-[34em] text-lead text-ink-secondary text-pretty">{section.lead}</p>
                  {section.chips && (
                    <div className="flex flex-wrap gap-2">
                      {section.chips.map((chip) => (
                        <Chip key={chip}>{chip}</Chip>
                      ))}
                    </div>
                  )}
                  {section.note && <p className="text-small text-ink-muted">{section.note}</p>}
                </>
              }
              media={<ScreenCard capture={appCapture(section.screen.name, section.screen.alt)} />}
            />
          </V9Section>
        );
      })}
    </>
  );
}
