/**
 * The plan email's pages (/my-plan, /email-preferences) arrive with
 * `?token=`, which opens the saved plan and can delete it, until the page
 * takes it out of the address. Analytics never keeps it.
 */
export function withoutEmailToken(value: string): string {
  if (!/[?&]token=/.test(value)) return value;
  return value
    .replace(/([?&])token=[^&#]*&?/g, "$1")
    .replace(/[?&](?=#|$)/, "");
}
