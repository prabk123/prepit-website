import { redirect } from "next/navigation";
import { LANDING_FUNNEL_ID } from "@/lib/funnel/landing";
import { bridgePath } from "@/lib/funnel/params";
import { parsePlanId } from "@/lib/pricing";

/**
 * The old sign-in step (PRE-264, PRE-302) is now the cart on `/start`
 * (PRE-437): old links, bookmarks and ads land there with their funnel and
 * plan. First-touch attribution lives in this browser, so it carries over.
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  redirect(bridgePath({ from: "landing", plan: parsePlanId(one(params.plan)), funnel: one(params.funnel) ?? LANDING_FUNNEL_ID }));
}
