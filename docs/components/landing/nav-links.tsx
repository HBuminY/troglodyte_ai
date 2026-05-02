"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navLinks = [
  { label: "Vizyonumuz", href: "#vizyon" },
  { label: "Teknoloji", href: "#teknoloji" },
  { label: "Etki", href: "#etki" },
  { label: "İletişim", href: "#iletisim" },
]

export function NavLinks() {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  if (!isLandingPage) return null;

  return (
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
  );
}