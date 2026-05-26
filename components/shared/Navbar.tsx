"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BRAND,
  MARKETING_NAV_ITEMS,
  APP_NAV_ITEMS,
} from "@/lib/constants";

interface NavbarProps {
  variant?: "default" | "auth" | "app";
}

export default function Navbar({
  variant = "default",
}: NavbarProps) {
  const isApp = variant === "app";

  const navItems = isApp
    ? APP_NAV_ITEMS
    : MARKETING_NAV_ITEMS;

  const logoHref = isApp
    ? "/dashboard"
    : "/";

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="sticky top-0 z-50 w-full bg-bg/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-8">
        <Link
          href={logoHref}
          className="font-serif text-2xl font-medium tracking-tight text-ink"
        >
          {BRAND.name}
        </Link>

        {variant !== "auth" && (
          <div className="flex items-center gap-1 rounded-full bg-chip px-2 py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-white hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {variant === "default" && (
          <Link
            href="/dashboard"
            className="flex h-10 items-center gap-1.5 rounded-full bg-navy px-5 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
          >
            시작하기
            <span aria-hidden>→</span>
          </Link>
        )}

        {variant === "app" && (
          <div className="flex items-center gap-3">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-chip text-sm">
              🔔
            </button>

            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-medium text-white">
              은
            </button>
          </div>
        )}
      </div>
    </motion.nav>
  );
}