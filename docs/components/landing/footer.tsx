import Link from "next/link"

export function Footer() {
  return (
    <footer id="iletisim" className="border-t border-border/40 bg-background py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30">
              <span className="text-[#22C55E] font-bold">T</span>
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              Troglodyte<span className="text-[#22C55E]">.AI</span>
            </span>
          </Link>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2026 Troglodyte.AI. Tüm hakları saklıdır.
          </p>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link 
              href="#vizyon" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Vizyonumuz
            </Link>
            <Link 
              href="#teknoloji" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Teknoloji
            </Link>
            <Link 
              href="/dashboard" 
              className="text-sm text-[#22C55E] hover:text-[#22C55E]/80 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
