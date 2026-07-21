"use client";

import { useState } from "react";
import { schedule } from "@/lib/content";
import { kindStyles } from "@/lib/schedule-ui";
import { getDict, type Locale } from "@/lib/i18n";

export default function ScheduleTabs({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const [active, setActive] = useState(0);
  const day = schedule[active];

  return (
    <div>
      {/* Onglets jours */}
      <div className="flex flex-wrap gap-3">
        {schedule.map((d, i) => (
          <button
            key={d.date.fr}
            onClick={() => setActive(i)}
            className={`rounded-2xl border px-5 py-3 text-left transition ${
              i === active
                ? "border-loyal-700 bg-loyal-700 text-white shadow-lg"
                : "border-loyal-100 bg-white text-loyal-800 hover:border-loyal-300"
            }`}
          >
            <div
              className={`text-xs font-bold uppercase tracking-wider ${
                i === active ? "text-gold-300" : "text-maroon-600"
              }`}
            >
              {dict.program.day} {i + 1}
            </div>
            <div className="font-display text-sm font-bold">{d.label[locale]}</div>
          </button>
        ))}
      </div>

      {/* Timeline du jour */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-loyal-100 bg-white shadow-sm">
        <div className="border-b border-loyal-100 bg-loyal-50 px-6 py-4 font-display font-bold text-loyal-800">
          {day.date[locale]}
        </div>
        <ul className="divide-y divide-loyal-100/70">
          {day.items.map((item) => {
            const style = kindStyles[item.kind];
            return (
              <li
                key={item.time + item.title.fr}
                className="flex flex-col gap-2 px-6 py-5 sm:flex-row sm:items-start sm:gap-6"
              >
                <span className="nums w-16 shrink-0 text-sm font-bold text-loyal-700">
                  {item.time}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display font-bold text-loyal-900">
                      {item.title[locale]}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wider ${style.badge}`}
                    >
                      {style.label[locale]}
                    </span>
                  </div>
                  {item.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {item.description[locale]}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
