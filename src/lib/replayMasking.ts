/**
 * What session recordings show of a typed field (PRE-570).
 *
 * Recordings mask everything typed on the site (`maskAllInputs`), except inside
 * an element marked with `REPLAY_UNMASKED_ATTRIBUTE`: the quiz, whose answers
 * we want to see in replays. Password fields stay masked everywhere.
 */
export const REPLAY_UNMASKED_ATTRIBUTE = "data-replay-unmasked";

type InputLike = { type?: unknown; closest?: (selector: string) => unknown } | null | undefined;

export function replayInputText(text: string, element: InputLike): string {
  const shown =
    element != null &&
    element.type !== "password" &&
    typeof element.closest === "function" &&
    Boolean(element.closest(`[${REPLAY_UNMASKED_ATTRIBUTE}]`));
  return shown ? text : "*".repeat(text.length);
}
