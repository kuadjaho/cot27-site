import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import sharp from "sharp";

import { Users, Media } from "./collections/admin";
import { Participants, Inscriptions, Paiements } from "./collections/billetterie";
import { Sessions, Intervenants, Sponsors } from "./collections/evenement";
import { Editions, Articles } from "./collections/magazine";
import { Abonnes, Brouillons, CodesPromo } from "./collections/marketing";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Ce secret signe les jetons de session de l'administration. Une valeur de
 * repli en dur, publiée dans l'historique du dépôt, permettrait à quiconque
 * la connaît de forger une session administrateur et d'exporter l'intégralité
 * du fichier des inscrits — noms, adresses e-mail, téléphones, montants.
 *
 * En production, l'absence de PAYLOAD_SECRET empêche donc le démarrage plutôt
 * que de laisser tourner le site avec un secret connu de tous. En
 * développement, une valeur locale suffit et n'expose rien.
 */
function payloadSecret(): string {
  const secret = process.env.PAYLOAD_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "PAYLOAD_SECRET est obligatoire en production. Générez-en un avec " +
        "`openssl rand -base64 32` et placez-le dans les variables " +
        "d'environnement du serveur. Le site refuse de démarrer sans."
    );
  }

  return "developpement-local-non-secret";
}

/**
 * Transport e-mail. En production, on branche le SMTP du comité via les
 * variables SMTP_*. Sans elles — en développement — l'adaptateur crée un
 * compte de test Ethereal et journalise une URL d'aperçu pour chaque message :
 * on vérifie le rendu réel des e-mails sans avoir besoin d'un vrai serveur.
 *
 * Un envoi qui échoue ne doit jamais interrompre une inscription ou un
 * paiement ; les appelants de payload.sendEmail encapsulent donc l'appel.
 */
function emailAdapter() {
  const common = {
    defaultFromName: "COT27 · District 130",
    defaultFromAddress: process.env.SMTP_FROM || "no-reply@cot27.org",
  };

  if (process.env.SMTP_HOST) {
    return nodemailerAdapter({
      ...common,
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      },
    });
  }

  // Aucun SMTP configuré : compte de test Ethereal (URL d'aperçu en console).
  return nodemailerAdapter(common);
}

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
    Abonnes,
    CodesPromo,
    Brouillons,
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
  secret: payloadSecret(),
  email: emailAdapter(),
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
