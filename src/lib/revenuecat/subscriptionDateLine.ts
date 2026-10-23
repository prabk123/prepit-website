/**
 * The line under the account page heading (PRE-335). In a free trial,
 * RevenueCat's expiration date is the end of the trial, which is when the
 * first payment is taken if the subscription renews. `inTrial` comes from
 * RevenueCat's `periodType`, never from dates or a fixed trial length.
 */
export function subscriptionDateLine(
  details: { expirationDate: Date | null; willRenew: boolean; inTrial: boolean },
  formatDate: (date: Date) => string,
): string | null {
  if (!details.expirationDate) return details.inTrial ? "Free trial." : null;
  const date = formatDate(details.expirationDate);
  if (details.inTrial) {
    return details.willRenew
      ? `Free trial. Your first payment is on ${date}.`
      : `Free trial ends on ${date}. You won't be charged.`;
  }
  return details.willRenew ? `Renews on ${date}.` : `Ends on ${date}. It won't renew.`;
}
