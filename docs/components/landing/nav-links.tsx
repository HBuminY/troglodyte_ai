"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const navLinks = [
  { label: "Vizyonumuz", href: "#vizyon" },
  { label: "Teknoloji", href: "#teknoloji" },
  { label: "Etki", href: "#etki" },
  { label: "İletişim", href: "#iletisim" },
]

export function NavLinks() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // This listener ensures that any auth state change (Login, Logout, Token Refresh)
    // triggers a server-side refresh of the current route and layouts.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

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