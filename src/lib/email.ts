import type { Payload } from "payload";
import type { Locale } from "@/lib/i18n";
import { formatFCFA } from "@/lib/content";

/**
 * E-mails transactionnels de l'inscription. Deux moments :
 *  - « inscription reçue », juste après la création, quel que soit le mode ;
 *  - « paiement confirmé », déclenché par le webhook FedaPay.
 *
 * Règle absolue : un e-mail qui échoue ne doit jamais faire échouer une
 * inscription ou un paiement. Toute la logique d'envoi est donc encapsulée
 * ici dans un try/catch, et les appelants n'attendent pas le résultat.
 */

export type ModePaiement = "fedapay" | "virement" | "sur_place";

/** Données de contenu d'un e-mail, indépendantes du transport. */
type Contenu = {
  locale: Locale;
  prenom: string;
  reference: string; // ex. COT27-00042
  offre: string; // libellé déjà localisé (billet ou délégation)
  montant: number; // XOF
  confirmationUrl: string;
};

type BaseData = Contenu & { payload: Payload; to: string };

/** Message prêt à envoyer : sujet, corps HTML et corps texte. */
export type Message = { subject: string; html: string; text: string };

/** Référence lisible affichée au participant, dérivée de l'identifiant. */
export function formatReference(id: number | string): string {
  return `COT27-${String(id).padStart(5, "0")}`;
}

const BRAND = {
  bleu: "#004165",
  bleuNuit: "#00263c",
  jaune: "#f2df74",
  gris: "#5b6b74",
};

const T = {
  fr: {
    recueSujet: (ref: string) => `COT27 — Inscription reçue (${ref})`,
    confirmeSujet: (ref: string) => `COT27 — Paiement confirmé (${ref})`,
    bonjour: (p: string) => `Bonjour ${p},`,
    introRecue:
      "Nous avons bien reçu votre inscription à la Conférence Annuelle du District 130 — COT27, du 1er au 8 mai 2027 au Palais des Congrès de Cotonou.",
    introConfirme:
      "Votre paiement est confirmé : votre place à la Conférence Annuelle du District 130 — COT27 est garantie. Rendez-vous du 1er au 8 mai 2027 à Cotonou.",
    reference: "Référence",
    offre: "Formule",
    montant: "Montant",
    prochaine: "Prochaine étape",
    etapeFedapay:
      "Votre paiement en ligne est en cours de traitement. Vous recevrez un e-mail de confirmation dès qu'il sera validé.",
    etapeVirement:
      "Réglez par virement bancaire. Un membre du comité vous transmettra les coordonnées et confirmera votre place.",
    etapeSurPlace:
      "Réglez sur place le jour de la conférence. Votre place est réservée.",
    bouton: "Voir mon inscription",
    pied: "COT27 — Conférence Annuelle du District 130 Toastmasters International. Cet e-mail vous est adressé parce qu'une inscription a été faite avec votre adresse.",
  },
  en: {
    recueSujet: (ref: string) => `COT27 — Registration received (${ref})`,
    confirmeSujet: (ref: string) => `COT27 — Payment confirmed (${ref})`,
    bonjour: (p: string) => `Hello ${p},`,
    introRecue:
      "We have received your registration for the District 130 Annual Conference — COT27, from 1 to 8 May 2027 at the Palais des Congrès in Cotonou.",
    introConfirme:
      "Your payment is confirmed: your seat at the District 130 Annual Conference — COT27 is secured. See you from 1 to 8 May 2027 in Cotonou.",
    reference: "Reference",
    offre: "Package",
    montant: "Amount",
    prochaine: "Next step",
    etapeFedapay:
      "Your online payment is being processed. You will receive a confirmation email as soon as it is validated.",
    etapeVirement:
      "Pay by bank transfer. A committee member will send you the details and confirm your seat.",
    etapeSurPlace:
      "Pay on site on the day of the conference. Your seat is reserved.",
    bouton: "View my registration",
    pied: "COT27 — District 130 Annual Conference, Toastmasters International. You are receiving this email because a registration was made with your address.",
  },
} as const;

function layout(opts: {
  locale: Locale;
  titre: string;
  intro: string;
  lignes: [string, string][];
  encadre?: string;
  boutonLabel: string;
  boutonUrl: string;
  pied: string;
}): string {
  const rows = opts.lignes
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:${BRAND.gris};font-size:14px">${k}</td>` +
        `<td style="padding:6px 0;text-align:right;font-weight:700;color:${BRAND.bleuNuit};font-size:14px">${v}</td></tr>`
    )
    .join("");
  const encadre = opts.encadre
    ? `<p style="margin:24px 0 0;padding:16px;background:#eaf3f9;border-radius:12px;color:${BRAND.bleu};font-size:14px;line-height:1.5">${opts.encadre}</p>`
    : "";
  return `<!doctype html><html lang="${opts.locale}"><body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px">
  <div style="background:${BRAND.bleuNuit};border-radius:16px 16px 0 0;padding:28px 32px;text-align:center">
    <span style="display:inline-block;width:36px;height:36px;line-height:36px;border-radius:999px;background:${BRAND.jaune};color:${BRAND.bleuNuit};font-weight:800;font-size:15px">27</span>
    <div style="margin-top:8px;color:#fff;font-weight:700;letter-spacing:2px;font-size:14px">COT27 · COTONOU 2027</div>
  </div>
  <div style="background:#fff;border-radius:0 0 16px 16px;padding:32px">
    <h1 style="margin:0 0 16px;font-size:20px;color:${BRAND.bleuNuit}">${opts.titre}</h1>
    <p style="margin:0 0 20px;color:#33434c;font-size:15px;line-height:1.6">${opts.intro}</p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e3e9ee;border-bottom:1px solid #e3e9ee">${rows}</table>
    ${encadre}
    <div style="text-align:center;margin:28px 0 4px">
      <a href="${opts.boutonUrl}" style="display:inline-block;background:${BRAND.bleu};color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:999px">${opts.boutonLabel}</a>
    </div>
  </div>
  <p style="margin:20px 8px 0;color:${BRAND.gris};font-size:12px;line-height:1.5;text-align:center">${opts.pied}</p>
</div></body></html>`;
}

function toText(intro: string, lignes: [string, string][], etape: string, url: string): string {
  const corps = lignes.map(([k, v]) => `${k} : ${v}`).join("\n");
  return `${intro}\n\n${corps}\n\n${etape}\n\n${url}`;
}

async function envoyer(
  payload: Payload,
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> {
  try {
    const info = await payload.sendEmail({ to, subject, html, text });
    // En développement (compte de test Ethereal), afficher l'URL d'aperçu.
    try {
      const nodemailer = await import("nodemailer");
      const url = nodemailer.getTestMessageUrl?.(info as never);
      if (url) console.log(`[email] aperçu : ${url}`);
    } catch {
      /* nodemailer indisponible : on ignore, l'envoi a eu lieu */
    }
  } catch (error) {
    // On journalise sans relancer : l'inscription et le paiement priment.
    console.error(`[email] échec d'envoi à ${to} (${subject}) :`, error);
  }
}

function lignesRecap(t: (typeof T)[Locale], d: Contenu): [string, string][] {
  return [
    [t.reference, d.reference],
    [t.offre, d.offre],
    [t.montant, formatFCFA(d.montant, d.locale)],
  ];
}

/**
 * Construit — sans rien envoyer — le message « inscription reçue ». Fonction
 * pure : c'est elle qu'on teste, l'envoi n'étant qu'un transport.
 */
export function buildInscriptionRecue(
  d: Contenu & { modePaiement: ModePaiement }
): Message {
  const t = T[d.locale];
  const etape =
    d.modePaiement === "fedapay"
      ? t.etapeFedapay
      : d.modePaiement === "virement"
        ? t.etapeVirement
        : t.etapeSurPlace;
  const lignes = lignesRecap(t, d);
  return {
    subject: t.recueSujet(d.reference),
    html: layout({
      locale: d.locale,
      titre: t.bonjour(d.prenom),
      intro: t.introRecue,
      lignes,
      encadre: `<strong>${t.prochaine} :</strong> ${etape}`,
      boutonLabel: t.bouton,
      boutonUrl: d.confirmationUrl,
      pied: t.pied,
    }),
    text: toText(t.introRecue, lignes, etape, d.confirmationUrl),
  };
}

/** Construit — sans rien envoyer — le message « paiement confirmé ». */
export function buildPaiementConfirme(d: Contenu): Message {
  const t = T[d.locale];
  const lignes = lignesRecap(t, d);
  return {
    subject: t.confirmeSujet(d.reference),
    html: layout({
      locale: d.locale,
      titre: t.bonjour(d.prenom),
      intro: t.introConfirme,
      lignes,
      boutonLabel: t.bouton,
      boutonUrl: d.confirmationUrl,
      pied: t.pied,
    }),
    text: toText(t.introConfirme, lignes, "", d.confirmationUrl),
  };
}

/** « Inscription reçue » — envoyé juste après la création, tous modes confondus. */
export async function sendInscriptionRecue(
  data: BaseData & { modePaiement: ModePaiement }
): Promise<void> {
  const { subject, html, text } = buildInscriptionRecue(data);
  await envoyer(data.payload, data.to, subject, html, text);
}

/** « Paiement confirmé » — déclenché par le webhook FedaPay sur `approved`. */
export async function sendPaiementConfirme(data: BaseData): Promise<void> {
  const { subject, html, text } = buildPaiementConfirme(data);
  await envoyer(data.payload, data.to, subject, html, text);
}
