import { ObjectId } from "mongodb";
import { getDatabase } from "./mongodb";
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

export async function getMealPlanById(
  id: string
): Promise<SharedMealPlan | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

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
        },
      },
      {
        $project: {
          _id: { $toString: "$_id" },
          days: 1,
          groceries: 1,
        },
      },
    ])
    .toArray();

  if (results.length === 0) {
    return null;
  }

  // Round-trip through JSON to strip ObjectId buffers and Date objects
  // so the data is safe to pass as props to client components
  const plan = JSON.parse(JSON.stringify(results[0])) as SharedMealPlan;
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
