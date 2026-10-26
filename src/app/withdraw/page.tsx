import type { Metadata } from "next";
import { headers } from "next/headers";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import NarrowCard from "@/components/ui/NarrowCard";
import { COUNTRY_HEADER, parseCountryCode } from "@/lib/markets";
import WithdrawFromContract from "./WithdrawFromContract";

export const metadata: Metadata = {
  title: "Withdraw from your contract",
  description: "Withdraw from a PrepIt subscription within 14 days of signing up on the website, for a full refund.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  itunes: null,
};

/**
 * The online withdrawal function (PRE-360): sign in, see what withdrawing
 * does, confirm, get a dated confirmation. Kept apart from /account.
 */
export default async function WithdrawPage() {
  const country = parseCountryCode((await headers()).get(COUNTRY_HEADER));
  return (
    <NarrowCard>
      <HideSiteFinalCta />
      <WithdrawFromContract country={country} />
    </NarrowCard>
  );
}
