"use client";

import { useEffect, useState } from "react";

export default function EmailLink() {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(
      `prepit://email-signin?link=${encodeURIComponent(window.location.href)}`
    );
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center w-full bg-gray-100">
      <div className="flex flex-col items-center gap-6 text-center w-full max-w-sm p-6 bg-white rounded-2xl m-4">
        <img src="/prepit-long-logo.png" alt="Prepit logo" className="w-32" />
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Finish login on the app
        </h1>
        <a
          href={currentUrl || "#"}
          className="text-white bg-black px-8 py-3 w-full rounded-2xl"
        >
          Open App
        </a>
      </div>
    </main>
  );
}
