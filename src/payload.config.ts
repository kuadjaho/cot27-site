import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";

import { Users, Media } from "./collections/admin";
import { Participants, Inscriptions, Paiements } from "./collections/billetterie";
import { Sessions, Intervenants, Sponsors } from "./collections/evenement";
import { Editions, Articles } from "./collections/magazine";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " · COT27",
    },
  },
  collections: [
    Users,
    Media,
    Participants,
    Inscriptions,
    Paiements,
    Sessions,
    Intervenants,
    Sponsors,
    Editions,
    Articles,
  ],
  editor: lexicalEditor(),
  // Localisation du CONTENU (titre/bio/corps en FR et EN) — indépendante de
  // la langue de l'interface d'admin.
  localization: {
    locales: [
      { label: "Français", code: "fr" },
      { label: "English", code: "en" },
    ],
    defaultLocale: "fr",
    fallback: true,
  },
  secret: process.env.PAYLOAD_SECRET || "dev-secret-a-changer",
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URI || "postgresql://127.0.0.1:5432/cot27",
    },
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
