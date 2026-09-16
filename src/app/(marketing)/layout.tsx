import NavigationWrapper from "@/components/NavigationWrapper";
import DownloadCTA from "@/components/DownloadCTA";
import Footer from "@/components/Footer";
import SmartBanner from "@/components/SmartBanner";
import FloatingGetAppButton from "@/components/FloatingGetAppButton";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SmartBanner />
      <FloatingGetAppButton />
      <div className="flex min-h-screen flex-col items-center bg-white">
        <NavigationWrapper />
        <main className="w-full">{children}</main>
        <DownloadCTA />
        <Footer />
      </div>
    </>
  );
}
