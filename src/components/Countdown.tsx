"use client";

import { useEffect, useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";
import { convention } from "@/lib/content";

function remaining() {
  const diff = new Date(convention.startDate).getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff / 3_600_000) % 24),
    m: Math.floor((diff / 60_000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  // null au premier rendu pour éviter tout écart d'hydratation SSR/client
  const [time, setTime] = useState<ReturnType<typeof remaining> | null>(null);

  useEffect(() => {
    setTime(remaining());
    const id = setInterval(() => setTime(remaining()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { value: time?.d, label: dict.hero.days },
    { value: time?.h, label: dict.hero.hours },
    { value: time?.m, label: dict.hero.minutes },
    { value: time?.s, label: dict.hero.seconds },
  ];

  return (
    <div>
      <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-gold-300/90">
        {dict.hero.countdownTitle}
      </p>
      <div className="mt-4 flex justify-center gap-3 sm:gap-4">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="w-[4.5rem] rounded-2xl border border-white/15 bg-white/5 px-2 py-3 text-center backdrop-blur sm:w-20 sm:py-4"
          >
            <div className="font-display text-3xl font-extrabold tabular-nums text-white sm:text-4xl">
              {unit.value === undefined ? "–" : String(unit.value).padStart(2, "0")}
            </div>
            <div className="mt-1 text-[0.65rem] font-semibold uppercase tracking-wider text-white/60">
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
