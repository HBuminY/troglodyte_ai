import { Snowflake, Flame, Shield } from "lucide-react"

const features = [
  {
    icon: Snowflake,
    title: "Doğal Soğutma",
    description: "Yıl boyu 4-15 °C kaya oyma serinliği ile enerji israfını bitiriyoruz.",
    color: "#3B82F6",
  },
  {
    icon: Flame,
    title: "Endüstriyel Simbiyoz",
    description: "Veri merkezi atık ısısını tarımsal seralara taşıyoruz.",
    color: "#F97316",
  },
  {
    icon: Shield,
    title: "SKDM Uyumlu",
    description: "Karbon pasaportunu tek tuşla oluşturun, SKDM vergilerinden kaçının.",
    color: "#22C55E",
  },
]

export function Features() {
  return (
    <section id="teknoloji" className="relative py-24 border-t border-border/40 bg-card/30">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Neden Troglodyte.AI?
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Doğanın sunduğu avantajları yapay zeka ile birleştiriyoruz
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-xl border border-border bg-background p-8 transition-all hover:border-muted-foreground/30"
            >
              {/* Icon */}
              <div
                className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ 
                  backgroundColor: `${feature.color}15`,
                  border: `1px solid ${feature.color}30`
                }}
              >
                <feature.icon 
                  className="h-7 w-7" 
                  style={{ color: feature.color }} 
                />
              </div>

              {/* Title */}
              <h3 className="mb-3 text-xl font-semibold text-foreground">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative Line */}
              <div 
                className="absolute bottom-0 left-8 right-8 h-[2px] rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: feature.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
