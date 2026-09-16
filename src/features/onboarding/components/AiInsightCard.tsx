import PrepItIcon from "@/components/shareable/PrepItIcon";

export default function AiInsightCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div
      className="rounded-2xl p-[2px]"
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--gradient-blue) 0%, var(--gradient-purple) 31%, var(--gradient-orange) 63%, var(--gradient-yellow) 97.5%)",
      }}
    >
      <div
        className="rounded-[14px] p-4"
        style={{
          backgroundImage:
            "linear-gradient(90deg, color-mix(in srgb, var(--gradient-blue) 10%, var(--ai-fill-base)) 0%, color-mix(in srgb, var(--gradient-purple) 10%, var(--ai-fill-base)) 31%, color-mix(in srgb, var(--gradient-orange) 10%, var(--ai-fill-base)) 63%, color-mix(in srgb, var(--gradient-yellow) 10%, var(--ai-fill-base)) 97.5%)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center">
            <PrepItIcon name="sparkles" size={18} color="var(--black-100)" />
          </span>
          <p className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold leading-[21px] text-[var(--black-100)]">
            {title}
          </p>
        </div>
        <p className="mt-2 text-sm font-medium leading-5 text-[var(--grey-80)]">
          {body}
        </p>
      </div>
    </div>
  );
}
