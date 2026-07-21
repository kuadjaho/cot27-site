import type { CollectionConfig } from "payload";

const staffOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);
const publicRead = { read: () => true, create: staffOnly, update: staffOnly, delete: staffOnly };

/** Édition du magazine COT27 (kiosque §4.3). */
export const Editions: CollectionConfig = {
  slug: "editions",
  admin: {
    useAsTitle: "titre",
    group: "Magazine",
    defaultColumns: ["titre", "type", "publieLe"],
  },
  access: publicRead,
  fields: [
    { name: "titre", type: "text", required: true, localized: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "URL stable de l'édition, ex. early-bird-2026" },
    },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Early Bird", value: "early-bird" },
        { label: "Officiel", value: "officiel" },
        { label: "Post-conférence", value: "post-conference" },
      ],
    },
    { name: "description", type: "textarea", localized: true },
    { name: "couverture", type: "upload", relationTo: "media" },
    { name: "publieLe", type: "date", required: true },
    {
      name: "pdf",
      type: "upload",
      relationTo: "media",
      admin: { description: "PDF haute définition optionnel" },
    },
  ],
};

/** Article du magazine — corps en Lexical (HTML sémantique, pas de PDF encapsulé). */
export const Articles: CollectionConfig = {
  slug: "articles",
  admin: {
    useAsTitle: "titre",
    group: "Magazine",
    defaultColumns: ["titre", "edition", "rubrique", "auteur", "publieLe"],
  },
  access: publicRead,
  fields: [
    { name: "titre", type: "text", required: true, localized: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "edition",
      type: "relationship",
      relationTo: "editions",
      required: true,
    },
    { name: "chapo", type: "textarea", localized: true, required: true },
    { name: "corps", type: "richText", localized: true, required: true },
    { name: "auteur", type: "text", required: true },
    {
      name: "rubrique",
      type: "select",
      required: true,
      options: [
        { label: "Portrait", value: "portrait" },
        { label: "Destination Bénin", value: "destination" },
        { label: "Conférence", value: "conference" },
        { label: "District 130", value: "district" },
        { label: "Art oratoire", value: "art-oratoire" },
      ],
    },
    { name: "imageCouverture", type: "upload", relationTo: "media" },
    {
      name: "tempsLecture",
      type: "number",
      admin: { description: "Minutes — calculé automatiquement si vide" },
    },
    { name: "publieLe", type: "date", required: true },
  ],
};
