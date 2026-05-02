import Link from "next/link"
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import { Suspense } from "react";
import { NavLinks } from "./nav-links";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md h-20">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 h-full">
        {/* Logo */}
        <Link href="/" className="flex items-center h-full bg-gradient-to-t from-white to-gray-800 px-2 rounded-sm">
          <img
            src="/images/logo.png"
            alt="Troglodyte.AI Logo"
            className="h-full w-auto object-contain"
          />
        </Link>

        {/* Desktop Menu */}
        <NavLinks />

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
