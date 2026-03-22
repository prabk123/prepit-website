export interface NutritionalInformation {
  calories: number;
  carbs: number;
  fats: number;
  proteins: number;
  saturated_fats?: number;
  polyunsaturated_fats?: number;
  monounsaturated_fats?: number;
  trans_fats?: number;
  cholesterol?: number;
  sodium?: number;
  potassium?: number;
  fiber?: number;
  sugar?: number;
  vitamin_a?: number;
  vitamin_c?: number;
  calcium?: number;
  iron?: number;
}

export interface RecipeIngredient {
  raw?: string;
  quantity?: number;
  ingredient: string;
  emoji?: string;
  trailing_text?: string;
  unit?: UnitInfo;
  ingredient_conversion?: {
    unit?: string;
    factor?: number;
    plural?: string;
    displayName?: string;
    pluralDisplayName?: string;
  };
}

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  image: string;
  servings: number;
  prep_time: number;
  cooking_time: number;
  nutritional_information: NutritionalInformation;
  tags: string[];
  instructions: string[];
  ingredients: RecipeIngredient[];
  additional_notes: string[];
  source?: string;
  sourceType?: string;
}

export interface MealSelection {
  recipe: Recipe;
  servings: number;
}

export interface UnitConversion {
  unit?: string;
  factor?: number;
  plural?: string;
  displayName?: string;
  pluralDisplayName?: string;
}

export interface UnitInfo {
  measurement?: string;
  system?: string;
  category?: string;
  plural?: string;
  displayName?: string;
  pluralDisplayName?: string;
  canConvert?: boolean;
  conversion?: UnitConversion;
}

export type UnitSystem = "metric" | "imperial";

export interface Grocery {
  category: string;
  raw?: string;
  quantity?: number;
  ingredient: string;
  emoji?: string;
  trailing_text?: string;
  unit?: UnitInfo;
  ingredient_conversion?: UnitConversion;
}

export interface PlanDay {
  date: string;
  breakfast: MealSelection | null;
  lunch: MealSelection | null;
  dinner: MealSelection | null;
  snack: MealSelection | null;
}

export interface SharedMealPlan {
  _id: string;
  days: PlanDay[];
  groceries: Grocery[];
}
