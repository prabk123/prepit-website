/**
 * Full-width buttons for the narrow account cards (sign-in, checkout,
 * account): black primary with white text, and the outlined secondary.
 */
export const PRIMARY_BUTTON_CLASS =
  "inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-button bg-primary px-7 text-body font-bold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50";

export const SECONDARY_BUTTON_CLASS =
  "inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-button border border-line-strong bg-surface px-7 text-body font-bold text-ink transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50";

/** A text button, e.g. "Sign out". */
export const TEXT_BUTTON_CLASS =
  "text-small font-medium text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus";
