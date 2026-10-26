/**
 * The online "withdraw from contract" function (PRE-360). EU law (in force
 * since June 2026) wants a clearly labelled link for the 14 days after a
 * website purchase; Ireland's transposition words it "Cancel contract here".
 * UK buyers get the same link (who sees it: `isEuCountry`). The 14 days and what happens to the
 * subscription are decided by the backend (`/billing/withdrawal`).
 */
export const WITHDRAWAL_PATH = "/withdraw";

/** The link's wording for a country. */
export function withdrawalLinkLabel(country: string | null | undefined): string {
  return country?.toUpperCase() === "IE" ? "Cancel contract here" : "Withdraw from contract here";
}

/** The page heading and confirm button follow the same wording. */
export function withdrawalWording(country: string | null | undefined): {
  title: string;
  confirm: string;
  noun: string;
  /** "withdraw from" / "cancel": what the visitor can do to their subscription. */
  verb: string;
} {
  return country?.toUpperCase() === "IE"
    ? { title: "Cancel your contract", confirm: "Confirm cancellation", noun: "cancellation", verb: "cancel" }
    : { title: "Withdraw from your contract", confirm: "Confirm withdrawal", noun: "withdrawal", verb: "withdraw from" };
}
