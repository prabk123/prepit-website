"use client";

import { useEffect, useState } from "react";
import { PRIMARY_BUTTON_CLASS } from "@/components/ui/buttons";

/** Hands the sign-in link this page was opened with back to the app. */
export default function OpenAppButton() {
  const [appUrl, setAppUrl] = useState("");

  useEffect(() => {
    setAppUrl(`prepit://email-signin?link=${encodeURIComponent(window.location.href)}`);
  }, []);

  return (
    <a href={appUrl || "#"} className={PRIMARY_BUTTON_CLASS}>
      Open PrepIt
    </a>
  );
}
