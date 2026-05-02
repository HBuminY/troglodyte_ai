import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#22C55E]/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#F97316]/5 via-transparent to-transparent" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 px-4 py-2">
          <Sparkles className="h-4 w-4 text-[#22C55E]" />
          <span className="text-sm text-[#22C55E]">TR71 Kapadokya Bölgesi</span>
        </div>

        {/* Main Headline */}
        <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {"Geçmişin Kayalarından,"}
          <br />
          <span className="bg-gradient-to-r from-[#22C55E] to-[#22C55E]/70 bg-clip-text text-transparent">
            {"Geleceğin Bulutlarına"}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-3xl text-balance text-lg text-muted-foreground leading-relaxed">
          {"Kapadokya'nın atıl kaya oyma depolarını sıfır soğutma maliyetli "}
          <span className="text-[#22C55E] font-medium">{"'Yeşil Veri Merkezlerine'"}</span>
          {" dönüştürüyoruz. Atık ısıyı seralara yönlendirerek sanayiciyi "}
          <span className="text-[#F97316] font-medium">karbon vergisinden</span>
          {" kurtarıyoruz."}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#22C55E] px-8 py-3.5 text-base font-semibold text-[#0A0A0A] transition-all hover:bg-[#22C55E]/90 neon-glow-green"
          >
            Canlı Panoyu İncele
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="#teknoloji"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-8 py-3.5 text-base font-semibold text-foreground transition-all hover:bg-muted/50 hover:border-muted-foreground/50"
          >
            Teknolojimizi Keşfet
          </Link>
        </div>

        {/* Stats Preview */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span>Sistem Aktif</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#22C55E] font-semibold">850 kW</span>
            <span>Anlık Isı Transferi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#F97316] font-semibold">1.438 kg</span>
            <span>{"CO₂e Bugün Tasarruf"}</span>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
