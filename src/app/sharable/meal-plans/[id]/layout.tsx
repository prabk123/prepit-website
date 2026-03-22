import Image from "next/image";
import Link from "next/link";

export default function SharableMealPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "#F4F4F5" }}
    >
      {/* Page content */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 mt-20">
        {children}
      </main>
    </div>
  );
}
