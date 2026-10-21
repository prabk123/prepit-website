function Bone({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-surface-raised motion-reduce:animate-none ${className}`} />;
}

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-tile border border-line bg-surface p-4 sm:p-5 ${className}`}>{children}</div>
  );
}

/** Same shapes as the loaded page, so nothing jumps when the plan arrives. */
export default function MealPlanLoading() {
  return (
    <div role="status" aria-label="Loading meal plan" className="flex flex-col gap-8 lg:gap-10">
      <Card className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Bone className="h-12 w-12 rounded-xl" />
          <div>
            <Bone className="h-6 w-60" />
            <Bone className="mt-2 h-4 w-72 max-w-[60vw]" />
          </div>
        </div>
        <Bone className="h-14 w-64 rounded-control" />
      </Card>

      <div className="flex flex-col gap-3">
        <Bone className="h-3 w-32" />
        <Bone className="h-12 w-64 sm:h-16 sm:w-96" />
        <Bone className="h-5 w-36" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-4">
          <Card className="grid grid-cols-7">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Bone className="h-3 w-7" />
                <Bone className="h-11 w-11 rounded-control" />
              </div>
            ))}
          </Card>
          <Card>
            <div className="flex items-center gap-4 rounded-2xl bg-surface-raised p-4">
              <Bone className="h-8 w-8 rounded-control bg-line-strong" />
              <div>
                <Bone className="h-3 w-32 bg-line-strong" />
                <Bone className="mt-2 h-5 w-20 bg-line-strong" />
              </div>
            </div>
            {["Breakfast", "Lunch", "Dinner"].map((label) => (
              <div key={label} className="mt-5">
                <Bone className="mb-3 h-3 w-20" />
                <div className="flex items-center gap-4">
                  <Bone className="h-[72px] w-[72px] shrink-0" />
                  <div className="flex-1">
                    <Bone className="h-4 w-full" />
                    <Bone className="mt-2 h-3 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <Card className="flex items-center justify-between">
            <Bone className="h-4 w-12" />
            <Bone className="h-9 w-40 rounded-control" />
          </Card>
          <Card className="flex items-center gap-3">
            <Bone className="h-6 w-6 rounded-control" />
            <div className="flex-1">
              <Bone className="h-4 w-24" />
              <Bone className="mt-2 h-3 w-20" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
