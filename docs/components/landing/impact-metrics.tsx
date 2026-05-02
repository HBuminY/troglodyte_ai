"use client"

import { Thermometer, Leaf, Euro } from "lucide-react"

const metrics = [
  {
    value: "850 kW",
    label: "Aktarılan Atık Isı",
    description: "Anlık enerji transferi",
    icon: Thermometer,
    color: "#F97316",
    glowClass: "neon-glow-orange",
  },
  {
    value: "1.438 kg",
    label: "Net Karbon Tasarrufu CO₂e",
    description: "Günlük karbon azaltımı",
    icon: Leaf,
    color: "#22C55E",
    glowClass: "neon-glow-green",
  },
  {
    value: "₺ Canlı",
    label: "SKDM Karbon Kazancı",
    description: "Gerçek zamanlı hesaplama",
    icon: Euro,
    color: "#22C55E",
    glowClass: "neon-glow-green",
  },
]

export function ImpactMetrics() {
  return (
    <section id="etki" className="relative py-24 border-t border-border/40">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Anlık Etki Metrikleri
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Sistemimiz 7/24 çalışarak gerçek zamanlı veri üretiyor
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="group relative rounded-xl border border-border bg-card p-8 transition-all hover:border-muted-foreground/30"
            >
              {/* Icon */}
              <div
                className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ 
                  backgroundColor: `${metric.color}15`,
                  border: `1px solid ${metric.color}30`
                }}
              >
                <metric.icon 
                  className="h-7 w-7" 
                  style={{ color: metric.color }} 
                />
              </div>

              {/* Value */}
              <div 
                className="mb-2 text-4xl font-bold tracking-tight"
                style={{ color: metric.color }}
              >
                {metric.value}
              </div>

              {/* Label */}
              <h3 className="mb-1 text-lg font-semibold text-foreground">
                {metric.label}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground">
                {metric.description}
              </p>

              {/* Live Indicator */}
              <div className="absolute top-6 right-6 flex items-center gap-2">
                <div 
                  className="h-2 w-2 rounded-full animate-pulse"
                  style={{ backgroundColor: metric.color }}
                />
                <span className="text-xs text-muted-foreground">Canlı</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
