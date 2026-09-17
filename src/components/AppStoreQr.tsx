"use client";

import { useEffect, useState } from "react";
import { APP_STORE_URL } from "@/lib/appStore";

export default function AppStoreQr({ className = "" }: { className?: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("qrcode").then(({ default: QRCode }) =>
      QRCode.toDataURL(APP_STORE_URL, {
        width: 168,
        margin: 1,
        color: { dark: "#111111", light: "#ffffff" },
      }).then((url) => {
        if (!cancelled) setSrc(url);
      }),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={`flex h-[168px] w-[168px] items-center justify-center rounded-2xl bg-white p-2 ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="QR code to download PrepIt on the App Store" className="h-full w-full" />
      ) : (
        <div className="h-full w-full animate-pulse rounded-xl bg-neutral-100" />
      )}
    </div>
  );
}