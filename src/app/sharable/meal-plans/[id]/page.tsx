import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getSharedMealPlan } from "@/lib/meal-plan";
import { isPlanIdLink } from "@/lib/share-token";
import { countRecipes, formatPlanRange } from "@/lib/plan-dates";
import MealPlanView from "@/components/shareable/MealPlanView";
import MakeYourOwnPlan from "@/components/shareable/MakeYourOwnPlan";
import SharedPlanBanner from "@/components/shareable/SharedPlanBanner";
import SharedPlanUnavailable from "@/components/shareable/SharedPlanUnavailable";
import SharedPlanViewTracker from "@/components/shareable/SharedPlanViewTracker";
import { APP_STORE_ID } from "@/lib/appStore";
import { defaultUnitSystemForCountry } from "@/lib/unit-conversion";

type Props = {
  params: Promise<{ id: string }>;
};

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let plan: Awaited<ReturnType<typeof getSharedMealPlan>>;
  try {
    plan = await getSharedMealPlan(id);
  } catch {
    // The page itself throws on the same failure, logs it and shows error.tsx;
    // this only keeps the tab title.
    return {
      title: "Shared meal plan",
      description: "A meal plan shared from PrepIt.",
      robots: { index: false, follow: false },
    };
  }

  if (!plan) {
    return {
      title: "Meal plan not found",
      description: "This shared meal plan isn't available. Make your own with PrepIt.",
      robots: { index: false, follow: false },
    };
  }

  const title = `Meal plan: ${formatPlanRange(plan.days)}`;
  const description = `${plural(plan.days.length, "day")} and ${plural(countRecipes(plan.days), "recipe")}, made with PrepIt, your personal AI nutritionist.`;

  // The preview image comes from opengraph-image.tsx and twitter-image.tsx
  // in this folder.
  return {
    title,
    description,
    openGraph: { title, description, type: "website", siteName: "PrepIt" },
    twitter: { card: "summary_large_image", title, description },
    itunes: { appId: APP_STORE_ID },
    robots: { index: false, follow: false },
  };
}

export default async function SharableMealPlanPage({ params }: Props) {
  const { id } = await params;
  const plan = await getSharedMealPlan(id);

  if (!plan && isPlanIdLink(id)) {
    // App builds 1.2.0 to 1.8.0 shared plans by database id. Those links are
    // refused (PRE-377); this line counts them without logging the id.
    console.info("[shared-meal-plan] Refused a plan id link");
    return (
      <SharedPlanUnavailable lead="Meal plan links shared from older versions of the PrepIt app no longer open. Make your own plan with PrepIt instead." />
    );
  }

  if (!plan) {
    notFound();
  }

  const recipeCount = countRecipes(plan.days);
  // Vercel sets the visitor's country; locally there is none, so Metric.
  const defaultUnitSystem = defaultUnitSystemForCountry((await headers()).get("x-vercel-ip-country"));

  return (
    <>
      <SharedPlanViewTracker
        planId={plan._id}
        dayCount={plan.days.length}
        recipeCount={recipeCount}
        hasGroceries={plan.groceries.length > 0}
        unitSystem={defaultUnitSystem}
      />

      <SharedPlanBanner />

      <header className="flex flex-col gap-3">
        <p className="text-eyebrow font-medium uppercase text-ink-muted">Shared meal plan</p>
        <h1 className="font-display text-chapter text-ink">{formatPlanRange(plan.days)}</h1>
        <p className="text-lead text-ink-secondary">
          {plural(plan.days.length, "day")} · {plural(recipeCount, "recipe")}
        </p>
      </header>

      <MealPlanView plan={plan} defaultUnitSystem={defaultUnitSystem} />

      <MakeYourOwnPlan />
    </>
  );
}
