"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useWebSession } from "@/components/account/useWebSession";
import { WITHDRAWAL_PATH, withdrawalLinkLabel } from "@/lib/contractWithdrawal";
import { isEuCountry } from "@/lib/euCountries";
import { visitorCountry } from "@/lib/landingAnalytics";
import { fetchWithdrawalStatus } from "@/lib/prepitApi";
import { trackWebFunnelEvent, WEB_FUNNEL_EVENTS } from "@/lib/webFunnelAnalytics";

/** UK and EEA visitors, and unknown countries, as at checkout. */
function showsWithdrawalLink(country: string | null): boolean {
  return isEuCountry(country ?? undefined);
}

const noSubscribe = () => () => {};

/**
 * The visitor's country from the proxy's cookie. `ready` is false while
 * rendering on the server, so server HTML is the same for everyone.
 */
function useVisitorCountry(): { ready: boolean; country: string | null } {
  const country = useSyncExternalStore<string | null | undefined>(noSubscribe, visitorCountry, () => undefined);
  return country === undefined ? { ready: false, country: null } : { ready: true, country };
}

/**
 * "Withdraw from contract here" ("Cancel contract here" in Ireland) in the
 * footer for UK and EEA visitors (PRE-360). Shown all the time there: the
 * page itself says whether this account is inside its 14 days.
 */
export function FooterWithdrawalLink({ className }: { className: string }) {
  const { ready, country } = useVisitorCountry();
  if (!ready || !showsWithdrawalLink(country)) return null;
  return (
    <Link
      href={WITHDRAWAL_PATH}
      className={className}
      onClick={() => trackWebFunnelEvent(WEB_FUNNEL_EVENTS.withdrawalLinkClick, { placement: "footer" })}
    >
      {withdrawalLinkLabel(country)}
    </Link>
  );
}

/**
 * The same link on /account, only while the signed-in buyer's website
 * subscription is inside its 14 days. Kept outside the account page's own
 * component.
 */
export function AccountWithdrawalLink({ className }: { className: string }) {
  const { session } = useWebSession();
  const { ready, country } = useVisitorCountry();
  const uid = session.status === "signedIn" ? session.user.uid : null;
  const [eligibleFor, setEligibleFor] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !ready || !showsWithdrawalLink(country)) return;
    let cancelled = false;
    fetchWithdrawalStatus()
      .then((status) => {
        if (!cancelled && status.state === "eligible") setEligibleFor(uid);
      })
      .catch(() => {
        // The footer link still reaches the page.
      });
    return () => {
      cancelled = true;
    };
  }, [uid, ready, country]);

  if (!uid || eligibleFor !== uid) return null;
  return (
    <Link
      href={WITHDRAWAL_PATH}
      className={className}
      onClick={() => trackWebFunnelEvent(WEB_FUNNEL_EVENTS.withdrawalLinkClick, { placement: "account" })}
    >
      {withdrawalLinkLabel(country)}
    </Link>
  );
}
