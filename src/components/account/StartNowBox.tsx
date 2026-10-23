"use client";

import { useEffect, useState } from "react";
import {
  readStartNowChoice,
  startNowChoice,
  WITHDRAWAL_CONSENT_TEXT,
  writeStartNowChoice,
  type StartNowAskedOn,
} from "@/lib/withdrawalConsent";

/**
 * The UK/EEA "start my access now" box (PRE-356, lib/withdrawalConsent.ts),
 * above the sign-in buttons. Unticked unless this tab already ticked it, and
 * optional: the buttons work either way. The answer waits in this tab until
 * checkout saves it on the RevenueCat customer.
 */
export default function StartNowBox({ askedOn }: { askedOn: StartNowAskedOn }) {
  const [ticked, setTicked] = useState(() => readStartNowChoice()?.startNow ?? false);

  // Seen and left unticked is an answer too, so checkout doesn't ask again.
  useEffect(() => {
    if (!readStartNowChoice()) writeStartNowChoice(startNowChoice(false, askedOn, new Date()));
  }, [askedOn]);

  return (
    <label className="flex items-start gap-2.5 text-left text-small text-ink-secondary">
      <input
        type="checkbox"
        className="mt-px size-5 flex-none accent-primary"
        checked={ticked}
        onChange={(event) => {
          setTicked(event.target.checked);
          writeStartNowChoice(startNowChoice(event.target.checked, askedOn, new Date()));
        }}
      />
      {WITHDRAWAL_CONSENT_TEXT}
    </label>
  );
}
