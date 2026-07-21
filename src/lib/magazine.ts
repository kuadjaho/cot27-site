import type { Locale } from "./i18n";

// ---------------------------------------------------------------------------
// Types minimaux du JSON Lexical stocké par Payload
// ---------------------------------------------------------------------------
export type LexicalText = {
  type: "text";
  text: string;
  format?: number; // bitmask : 1=bold, 2=italic, 8=underline…
};

export type LexicalNode = {
  type: string;
  tag?: string; // pour heading : h2, h3…
  children?: (LexicalNode | LexicalText)[];
  fields?: { url?: string; newTab?: boolean };
  listType?: "bullet" | "number" | "check";
  [key: string]: unknown;
};

export type LexicalDoc = { root: LexicalNode };

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------
export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function nodeText(node: LexicalNode | LexicalText): string {
  if ("text" in node && typeof node.text === "string") return node.text;
  const children = (node as LexicalNode).children ?? [];
  return children.map(nodeText).join("");
}

/** Titres h2 du corps de l'article → sommaire latéral. */
export function extractHeadings(doc: LexicalDoc | null | undefined) {
  if (!doc?.root?.children) return [];
  return (doc.root.children as LexicalNode[])
    .filter((n) => n.type === "heading" && n.tag === "h2")
    .map((n) => {
      const text = nodeText(n);
      return { text, id: slugify(text) };
    });
}

/** Temps de lecture estimé (200 mots/min), en minutes. */
export function readingTimeMinutes(doc: LexicalDoc | null | undefined) {
  if (!doc?.root) return 1;
  const words = nodeText(doc.root).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export const rubriqueLabels: Record<string, Record<Locale, string>> = {
  portrait: { fr: "Portrait", en: "Portrait" },
  destination: { fr: "Destination Bénin", en: "Destination Benin" },
  conference: { fr: "Conférence", en: "Conference" },
  district: { fr: "District 130", en: "District 130" },
  "art-oratoire": { fr: "Art oratoire", en: "Public speaking" },
};

export const editionTypeLabels: Record<string, Record<Locale, string>> = {
  "early-bird": { fr: "Édition Early Bird", en: "Early Bird Edition" },
  officiel: { fr: "Édition Officielle", en: "Official Edition" },
  "post-conference": { fr: "Édition Post-conférence", en: "Post-conference Edition" },
};
