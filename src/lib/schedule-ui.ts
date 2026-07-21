import type { ScheduleItem } from "./content";
import type { Locale } from "./i18n";

/** Couleurs et libellés par type de créneau du programme. */
export const kindStyles: Record<
  ScheduleItem["kind"],
  { badge: string; label: Record<Locale, string> }
> = {
  keynote: {
    badge: "bg-gold-300 text-loyal-900",
    label: { fr: "Keynote", en: "Keynote" },
  },
  workshop: {
    badge: "bg-loyal-100 text-loyal-800",
    label: { fr: "Atelier", en: "Workshop" },
  },
  contest: {
    badge: "bg-maroon-600 text-white",
    label: { fr: "Concours", en: "Contest" },
  },
  ceremony: {
    badge: "bg-loyal-700 text-white",
    label: { fr: "Cérémonie", en: "Ceremony" },
  },
  social: {
    badge: "bg-gold-500/20 text-gold-600",
    label: { fr: "Social", en: "Social" },
  },
  break: {
    badge: "bg-slate-200 text-slate-600",
    label: { fr: "Pause", en: "Break" },
  },
};
