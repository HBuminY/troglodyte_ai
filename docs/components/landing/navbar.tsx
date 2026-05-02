import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import { Suspense } from "react";

const navLinks = [
  { label: "Vizyonumuz", href: "#vizyon" },
  { label: "Teknoloji", href: "#teknoloji" },
  { label: "Etki", href: "#etki" },
  { label: "İletişim", href: "#iletisim" },
]

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4">
          <img
            src="/images/logo.jpeg"
            alt="Troglodyte.AI Logo"
            className="h-16 w-16 object-contain"
          />
          <span className="text-2xl font-bold text-foreground tracking-tight">
            Troglodyte<span className="text-[#22C55E]">.AI</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="hidden md:flex items-center gap-4">
          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : (
            <Suspense>
              <AuthButton />
            </Suspense>
          )}
        </div>

        {/* Mobile Menu Button - Left for basic CSS-based toggle or separate client component later if needed */}
        <div className="md:hidden flex items-center gap-2">
          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : (
            <Suspense>
              <AuthButton />
            </Suspense>
          )}
        </div>
      </nav>
    </header>
  )
}
