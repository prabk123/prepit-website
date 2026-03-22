function Bone({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ backgroundColor: "#E4E4E7" }}
    />
  );
}

export default function MealPlanLoading() {
  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div>
        <Bone className="h-7 w-48" />
        <Bone className="mt-2 h-4 w-24" />
      </div>

      {/* Unit toggle */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-4">
        <Bone className="h-4 w-10" />
        <Bone className="h-8 w-40 rounded-full" />
      </div>

      {/* Grocery card */}
      <div className="flex items-center gap-3 rounded-2xl bg-white p-4">
        <Bone className="h-6 w-6 rounded-full" />
        <div className="flex-1">
          <Bone className="h-4 w-24" />
          <Bone className="mt-1.5 h-3 w-20" />
        </div>
        <div className="flex -space-x-2">
          {[0, 1, 2].map((i) => (
            <Bone key={i} className="h-9 w-9 rounded-full border-2 border-white" />
          ))}
        </div>
      </div>

      {/* Week calendar */}
      <div className="rounded-2xl bg-white p-4">
        <div className="flex justify-between">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Bone className="h-3 w-6" />
              <Bone className="h-10 w-10 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Day content */}
      <div className="rounded-2xl bg-white p-4">
        {/* Calorie summary */}
        <div
          className="flex items-center gap-4 rounded-2xl p-4"
          style={{ backgroundColor: "#F4F4F5" }}
        >
          <Bone className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <Bone className="h-5 w-20" />
            <Bone className="mt-1 h-3 w-28" />
          </div>
        </div>

        {/* Meal sections */}
        {["Breakfast", "Lunch", "Dinner"].map((label) => (
          <div key={label} className="mt-4">
            <Bone className="mb-3 h-4 w-16" />
            <div className="flex items-center gap-4">
              <Bone className="h-16 w-16 shrink-0 rounded-xl" />
              <div className="flex-1">
                <Bone className="h-4 w-full" />
                <Bone className="mt-1.5 h-4 w-3/4" />
                <div className="mt-2 flex gap-4">
                  <Bone className="h-3 w-14" />
                  <Bone className="h-3 w-14" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
