/**
 * Shared meal plans: the warm dark page (D3) under the site header, with room
 * for the fixed navigation bar.
 */
export default function SharableMealPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full bg-page pt-16 text-ink lg:pt-[72px]">
      <div className="mx-auto flex w-full max-w-content flex-col gap-8 px-gutter pb-section pt-8 lg:gap-10 lg:pt-12">
        {children}
      </div>
    </div>
  );
}
