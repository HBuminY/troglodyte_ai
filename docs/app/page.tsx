import { Hero as LandingHero } from "@/components/landing/hero";
import { ImpactMetrics } from "@/components/landing/impact-metrics";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default async function Home() {
  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <LandingHero />
      <div className="w-full max-w-5xl px-5 space-y-20 py-20">
        <ImpactMetrics />
        <Features />
      </div>
      <div className="w-full pt-10">
        <Footer />
      </div>

      <div className="fixed bottom-4 right-4 z-50">
        <ThemeSwitcher />
      </div>
    </div>
  );
}
