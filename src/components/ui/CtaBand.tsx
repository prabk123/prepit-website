import type { ReactNode } from "react";
import Glow from "@/components/ui/Glow";

type CtaBandProps = {
  title: string;
  /** The final line, set in the brand gradient. */
  line?: string;
  /** Usually <AppStoreCta qrCaption="Scan with your iPhone camera" />. */
  cta: ReactNode;
  id?: string;
  className?: string;
};

/** The closing call to action: big headline, gradient line, App Store button and QR code. */
export default function CtaBand({ title, line, cta, id, className }: CtaBandProps) {
  return (
    <div
      className={`relative isolate flex flex-col items-start gap-8 overflow-hidden rounded-card border border-line bg-surface px-5 py-14 sm:px-10 lg:px-16 lg:py-20 ${className ?? ""}`}
    >
      <Glow style={{ left: "85%", top: "20%", width: "70%" }} />
      <div className="flex flex-col gap-4">
        <h2 id={id} className="font-display text-chapter text-ink text-balance">
          {title}
        </h2>
        {line && <p className="w-fit text-gradient-brand text-lead font-medium">{line}</p>}
      </div>
      {cta}
    </div>
  );
}
