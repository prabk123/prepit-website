export default function DemoProgressDivider({
  progress,
}: {
  progress: number;
}) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <div className="relative h-[3px] w-full bg-[var(--grey-10)]" aria-hidden>
      <div
        className="absolute inset-y-0 left-0"
        style={{
          width: `${clamped * 100}%`,
          backgroundImage:
            "linear-gradient(90deg, var(--gradient-blue) 0%, var(--gradient-purple) 31%, var(--gradient-orange) 63%, var(--gradient-yellow) 97.5%)",
        }}
      />
    </div>
  );
}
