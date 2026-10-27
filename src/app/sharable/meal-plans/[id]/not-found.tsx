import SharedPlanUnavailable from "@/components/shareable/SharedPlanUnavailable";

/** A shared link whose plan was deleted, or a mistyped link. */
export default function MealPlanNotFound() {
  return (
    <SharedPlanUnavailable lead="The link may be mistyped, or the plan may have been deleted. Ask whoever sent it to share it again, or make your own with PrepIt." />
  );
}
