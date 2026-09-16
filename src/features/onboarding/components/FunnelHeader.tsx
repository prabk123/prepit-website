"use client";

import Image from "next/image";
import Link from "next/link";
import PrepItIcon from "@/components/shareable/PrepItIcon";

type FunnelHeaderProps = {
  progress: number;
  showProgress: boolean;
  onBack?: () => void;
};

export default function FunnelHeader({
  progress,
  showProgress,
  onBack,
}: FunnelHeaderProps) {
  return (
    <header
      className="shrink-0 bg-[var(--funnel-bg)]"
      style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
    >
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          aria-label="Back"
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-[var(--input-fill)] ${
            onBack ? "text-[var(--text-primary)]" : "invisible"
          }`}
        >
          <PrepItIcon name="chevronLeft" size={18} color="var(--text-primary)" />
        </button>
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="PrepIt" width={48} height={48} />
        </Link>
        <div className="h-10 w-10" />
      </div>
      {showProgress ? (
        <div className="mx-auto max-w-lg px-4 pb-4">
          <div className="h-2 overflow-hidden rounded-full bg-[var(--input-fill)]">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="h-4" />
      )}
    </header>
  );
}
