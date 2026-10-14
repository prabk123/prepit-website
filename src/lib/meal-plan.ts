import { cache } from "react";
import { ObjectId } from "mongodb";
import { getSharedPlanFixture } from "./meal-plan-fixtures";
import type { SharedMealPlan } from "./types/meal-plan";

const RECIPE_PROJECTION = {
  title: 1,
  description: 1,
  image: 1,
  servings: 1,
  prep_time: 1,
  cooking_time: 1,
  nutritional_information: 1,
  tags: 1,
  instructions: 1,
  ingredients: 1,
  additional_notes: 1,
  source: 1,
  sourceType: 1,
};

/**
 * One shared plan by id, or null when the id is not a plan. Cached per
 * request, so the page, its metadata and its preview image read Mongo once.
 * A database failure is logged (plan id only) and rethrown, so the page shows
 * its error state rather than "not found".
 */
export const getMealPlanById = cache(
  async (id: string): Promise<SharedMealPlan | null> => {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const fixture = getSharedPlanFixture(id);
    if (fixture) return fixture;

    try {
      return await loadMealPlan(id);
    } catch (error) {
      console.error("[shared-meal-plan] Failed to load plan", {
        planId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
);

/**
 * The app builds a plan's grocery list in the background after the plan is
 * saved or changed (changes clear the list first). Older plans can have no
 * list at all, so an empty list only means "almost ready" when the plan was
 * saved, or a chat change started (`meta.lastUpdate.at`, restamped on each
 * attempt), in the last few minutes. `meta.updating` alone is not trusted: a
 * job that dies leaves it true until the owner opens the plan again.
 */
const GROCERY_BUILD_WINDOW_MS = 15 * 60 * 1000;

export function groceriesMayStillArrive(
  { created, lastUpdateAt }: { created?: string; lastUpdateAt?: string },
  now = Date.now(),
): boolean {
  return [created, lastUpdateAt].some((value) => {
    const time = value ? new Date(value).getTime() : NaN;
    return Number.isFinite(time) && now - time < GROCERY_BUILD_WINDOW_MS;
  });
}

async function loadMealPlan(id: string): Promise<SharedMealPlan | null> {
  // Imported here so a missing MONGODB_URI fails inside the logged try block.
  const { getDatabase } = await import("./mongodb");
  const db = await getDatabase();

  const results = await db
    .collection("plans")
    .aggregate([
      { $match: { _id: new ObjectId(id) } },
      { $unwind: { path: "$days", preserveNullAndEmptyArrays: true } },
      // Lookup each meal's recipe
      {
        $lookup: {
          from: "recipes",
          localField: "days.breakfast.recipe",
          foreignField: "_id",
          as: "days._breakfastRecipe",
          pipeline: [{ $project: RECIPE_PROJECTION }],
        },
      },
      {
        $lookup: {
          from: "recipes",
          localField: "days.lunch.recipe",
          foreignField: "_id",
          as: "days._lunchRecipe",
          pipeline: [{ $project: RECIPE_PROJECTION }],
        },
      },
      {
        $lookup: {
          from: "recipes",
          localField: "days.dinner.recipe",
          foreignField: "_id",
          as: "days._dinnerRecipe",
          pipeline: [{ $project: RECIPE_PROJECTION }],
        },
      },
      {
        $lookup: {
          from: "recipes",
          localField: "days.snack.recipe",
          foreignField: "_id",
          as: "days._snackRecipe",
          pipeline: [{ $project: RECIPE_PROJECTION }],
        },
      },
      {
        $addFields: {
          "days.breakfast": {
            $cond: {
              if: { $gt: [{ $size: "$days._breakfastRecipe" }, 0] },
              then: {
                recipe: { $arrayElemAt: ["$days._breakfastRecipe", 0] },
                servings: "$days.breakfast.servings",
              },
              else: null,
            },
          },
          "days.lunch": {
            $cond: {
              if: { $gt: [{ $size: "$days._lunchRecipe" }, 0] },
              then: {
                recipe: { $arrayElemAt: ["$days._lunchRecipe", 0] },
                servings: "$days.lunch.servings",
              },
              else: null,
            },
          },
          "days.dinner": {
            $cond: {
              if: { $gt: [{ $size: "$days._dinnerRecipe" }, 0] },
              then: {
                recipe: { $arrayElemAt: ["$days._dinnerRecipe", 0] },
                servings: "$days.dinner.servings",
              },
              else: null,
            },
          },
          "days.snack": {
            $cond: {
              if: { $gt: [{ $size: "$days._snackRecipe" }, 0] },
              then: {
                recipe: { $arrayElemAt: ["$days._snackRecipe", 0] },
                servings: "$days.snack.servings",
              },
              else: null,
            },
          },
        },
      },
      {
        $project: {
          "days._breakfastRecipe": 0,
          "days._lunchRecipe": 0,
          "days._dinnerRecipe": 0,
          "days._snackRecipe": 0,
        },
      },
      {
        $group: {
          _id: "$_id",
          days: { $push: "$days" },
          groceries: { $first: "$groceries" },
          created: { $first: "$created" },
          lastUpdateAt: { $first: "$meta.lastUpdate.at" },
        },
      },
      {
        $project: {
          _id: { $toString: "$_id" },
          days: 1,
          groceries: 1,
          created: 1,
          lastUpdateAt: 1,
        },
      },
    ])
    .toArray();

  if (results.length === 0) {
    return null;
  }

  // Round-trip through JSON to strip ObjectId buffers and Date objects
  // so the data is safe to pass as props to client components
  const { created, lastUpdateAt, ...raw } = JSON.parse(JSON.stringify(results[0])) as SharedMealPlan & {
    created?: string;
    lastUpdateAt?: string;
  };
  const plan: SharedMealPlan = raw;

  // A plan saved with no days unwinds to one empty day with no date.
  plan.days = (plan.days ?? []).filter((day) => Boolean(day?.date));
  plan.groceries = plan.groceries ?? [];
  plan.groceriesPending =
    plan.groceries.length === 0 && groceriesMayStillArrive({ created, lastUpdateAt });
  if (plan.days.length === 0) {
    return null;
  }

  // $push keeps $unwind order, but sort by date so the strip and the swipe
  // always agree.
  plan.days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const apiBaseUrl = process.env.PREPIT_API_BASE_URL || "";

  for (const day of plan.days) {
    for (const meal of ["breakfast", "lunch", "dinner", "snack"] as const) {
      const selection = day[meal];
      if (selection?.recipe) {
        selection.recipe._id = String(selection.recipe._id);
        if (selection.recipe.image && !selection.recipe.image.startsWith("http")) {
          selection.recipe.image = `${apiBaseUrl}${selection.recipe.image}`;
        }
      }
    }
  }

  return plan;
}
