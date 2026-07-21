import type { CollectionConfig } from "payload";

const staffOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);
const publicRead = { read: () => true, create: staffOnly, update: staffOnly, delete: staffOnly };

/** Session du programme — §5.2. */
export const Sessions: CollectionConfig = {
  slug: "sessions",
  admin: {
    useAsTitle: "titre",
    group: "Événement",
    defaultColumns: ["titre", "type", "debut", "salle", "langue"],
  },
  access: publicRead,
  fields: [
    { name: "titre", type: "text", required: true, localized: true },
    { name: "resume", type: "textarea", localized: true },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Keynote", value: "keynote" },
        { label: "Atelier", value: "atelier" },
        { label: "Panel", value: "panel" },
        { label: "Concours", value: "concours" },
        { label: "Cérémonie", value: "ceremonie" },
        { label: "Business Meeting", value: "business" },
        { label: "Social", value: "social" },
        { label: "Pause", value: "pause" },
      ],
    },
    { name: "debut", type: "date", required: true, admin: { date: { pickerAppearance: "dayAndTime" } } },
    { name: "fin", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
    { name: "salle", type: "text" },
    {
      name: "langue",
      type: "select",
      defaultValue: "fr",
      options: [
        { label: "Français", value: "fr" },
        { label: "English", value: "en" },
        { label: "Bilingue", value: "bilingue" },
      ],
    },
    { name: "capacite", type: "number" },
    {
      name: "intervenants",
      type: "relationship",
      relationTo: "intervenants",
      hasMany: true,
    },
    { name: "supportUrl", type: "text" },
  ],
};

/** Intervenant — §5.2. */
export const Intervenants: CollectionConfig = {
  slug: "intervenants",
  admin: {
    useAsTitle: "nom",
    group: "Événement",
    defaultColumns: ["nom", "pays", "keynote"],
  },
  access: publicRead,
  fields: [
    { name: "nom", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "URL de la fiche, ex. aichatou-dossou" },
    },
    { name: "titre", type: "text", localized: true },
    { name: "bio", type: "textarea", localized: true },
    { name: "pays", type: "text" },
    { name: "photo", type: "upload", relationTo: "media" },
    { name: "keynote", type: "checkbox", defaultValue: false },
    {
      name: "distinctions",
      type: "array",
      fields: [{ name: "distinction", type: "text" }],
    },
    {
      name: "reseaux",
      type: "array",
      fields: [
        { name: "plateforme", type: "text" },
        { name: "url", type: "text" },
      ],
    },
  ],
};

/** Sponsor — §5.2. */
export const Sponsors: CollectionConfig = {
  slug: "sponsors",
  admin: {
    useAsTitle: "nom",
    group: "Événement",
    defaultColumns: ["nom", "palier"],
  },
  access: publicRead,
  fields: [
    { name: "nom", type: "text", required: true },
    {
      name: "palier",
      type: "select",
      required: true,
      options: [
        { label: "Platine", value: "platine" },
        { label: "Or", value: "or" },
        { label: "Argent", value: "argent" },
        { label: "Bronze", value: "bronze" },
        { label: "Institutionnel", value: "institutionnel" },
      ],
    },
    { name: "logo", type: "upload", relationTo: "media" },
    { name: "siteUrl", type: "text" },
    { name: "description", type: "textarea", localized: true },
    {
      name: "contreparties",
      type: "array",
      fields: [{ name: "contrepartie", type: "text", localized: true }],
    },
  ],
};
