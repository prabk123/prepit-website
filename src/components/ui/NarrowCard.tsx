import Image from "next/image";
import type { ReactNode } from "react";

/**
 * The centred white card with the logo used by the one-task pages: the email
 * sign-in link, sign-in, checkout and account. Children sit under the logo.
 */
export default function NarrowCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full justify-center bg-page px-4 pb-section pt-28 text-ink lg:pt-36">
      <div className="flex w-full max-w-md flex-col items-center gap-8 rounded-card border border-line bg-surface px-6 py-10 text-center sm:px-10">
        <Image src="/logo.png" alt="PrepIt" width={56} height={56} priority />
        {children}
      </div>
    </div>
  );
}
