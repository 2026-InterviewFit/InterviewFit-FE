"use client";

import { motion } from "framer-motion";
import { HERO } from "@/lib/constants";

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-8 pt-20 pb-12 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
        className="font-serif text-[clamp(64px,9vw,144px)] font-medium leading-[0.95] tracking-[-0.04em] text-ink"
      >
        {HERO.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: easeOut }}
        className="mx-auto mt-8 max-w-xl text-base text-muted"
      >
        {HERO.subtitle}
      </motion.p>
    </section>
  );
}