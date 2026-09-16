"use client";

type SelectItemProps = {
  label: string;
  description?: string;
  selected: boolean;
  onTap: () => void;
};

export default function SelectItem({
  label,
  description,
  selected,
  onTap,
}: SelectItemProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      className={`w-full rounded-xl border px-4 py-4 text-center transition ${
        selected
          ? "border-[var(--primary)] bg-[var(--border)]"
          : "border-[var(--border-strong)] bg-[var(--surface)] hover:border-[var(--primary)]"
      }`}
    >
      <div className="text-base font-medium leading-6 text-[var(--text-primary)]">{label}</div>
      {description ? (
        <div className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">{description}</div>
      ) : null}
    </button>
  );
}
