import { getDict, type Locale } from "@/lib/i18n";
import type { Speaker } from "@/lib/content";

export default function SpeakerCard({
  speaker,
  locale,
}: {
  speaker: Speaker;
  locale: Locale;
}) {
  const dict = getDict(locale);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-loyal-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div
        className="flex h-44 items-center justify-center"
        style={{
          background: `linear-gradient(135deg, hsl(${speaker.hue} 55% 28%), hsl(${speaker.hue} 65% 45%))`,
        }}
      >
        <span className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/40 bg-white/15 font-display text-3xl font-extrabold text-white backdrop-blur">
          {speaker.initials}
        </span>
      </div>
      {speaker.keynote && (
        <span className="absolute right-4 top-4 rounded-full bg-gold-400 px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-loyal-900">
          {dict.speakers.keynote}
        </span>
      )}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg font-bold text-loyal-800">{speaker.name}</h3>
        <p className="mt-1 text-sm font-semibold text-maroon-600">
          {speaker.title[locale]}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {speaker.bio[locale]}
        </p>
      </div>
    </article>
  );
}
