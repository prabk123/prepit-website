import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMealPlanById } from "@/lib/meal-plan";
import MealPlanView from "@/components/shareable/MealPlanView";

type Props = {
  params: Promise<{ id: string }>;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const plan = await getMealPlanById(id);

  if (!plan) {
    return { title: "Meal Plan Not Found" };
  }

  const startDate = formatDate(plan.days[0].date);
  const endDate = formatDate(plan.days[plan.days.length - 1].date);
  const recipeCount = plan.days.reduce((count, day) => {
    if (day.breakfast) count++;
    if (day.lunch) count++;
    if (day.dinner) count++;
    if (day.snack) count++;
    return count;
  }, 0);

  const title = `Meal Plan: ${startDate} - ${endDate}`;
  const description = `${plan.days.length}-day meal plan with ${recipeCount} recipes. Made with PrepIt.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function SharableMealPlanPage({ params }: Props) {
  const { id } = await params;
  const plan = await getMealPlanById(id);

  if (!plan) {
    notFound();
  }

  return <MealPlanView plan={plan} />;
}
