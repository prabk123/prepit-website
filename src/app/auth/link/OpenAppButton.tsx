"use client";

import { useEffect, useState } from "react";

const buttonClass =
  "inline-flex h-14 w-full items-center justify-center rounded-button bg-primary px-7 text-body font-bold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus";

/** Hands the sign-in link this page was opened with back to the app. */
export default function OpenAppButton() {
  const [appUrl, setAppUrl] = useState("");

  useEffect(() => {
    setAppUrl(`prepit://email-signin?link=${encodeURIComponent(window.location.href)}`);
  }, []);

  return (
    <a href={appUrl || "#"} className={buttonClass}>
      Open PrepIt
    </a>
  );
}
