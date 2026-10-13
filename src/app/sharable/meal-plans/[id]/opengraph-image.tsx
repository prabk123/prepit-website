import { renderSharedPlanOg, sharedPlanOgAlt, sharedPlanOgSize } from "@/lib/shared-plan-og";

export const alt = sharedPlanOgAlt;
export const size = sharedPlanOgSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return renderSharedPlanOg(id);
}
