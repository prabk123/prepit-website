"use client";

import { useEffect, useState } from "react";

export default function EmailLink() {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center w-full">
      <div className="flex flex-col items-center gap-6 text-center w-full px-8">
        <img src="/prepit-long-logo.png" alt="Prepit logo" className="w-32" />
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Finish login on the app
        </h1>
        <a
          href={currentUrl || "#"}
          className="text-white bg-black px-8 py-3 w-full rounded-md"
        >
          Open App
        </a>
      </div>
    </main>
  );
}
