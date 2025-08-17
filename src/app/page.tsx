import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <Image
          src="/prepit-long-logo.png"
          alt="Prepit logo"
          width={400}
          height={120}
          priority
          className="h-auto w-64 sm:w-80 md:w-96"
        />
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Coming soon
        </h1>
      </div>
    </main>
  );
}
