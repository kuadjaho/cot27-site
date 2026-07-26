import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getPayload } from "payload";
import config from "@payload-config";
import { getTicket, ticketOptions, computeTunnelTotal } from "@/lib/content";
import { createFedapayCheckout, fedapayEnabled } from "@/lib/fedapay";
import { isLocale, type Locale } from "@/lib/i18n";
import { sendInscriptionRecue, formatReference, type ModePaiement } from "@/lib/email";

const ONLINE_CHANNELS = ["mtn", "moov", "carte"] as const;

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const locale = isLocale(String(body.locale)) ? String(body.locale) : "fr";
  const mode = body.mode === "delegation" ? "delegation" : "solo";

  if (!firstName || !lastName || !phone || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "INVALID_FIELDS" }, { status: 400 });
  }

  const ticket = getTicket(String(body.ticketType ?? ""));
  if (!ticket) {
    return NextResponse.json({ error: "INVALID_TICKET" }, { status: 400 });
  }

  // Membres de délégation : lignes nettoyées, plafond de sécurité à 100.
  const membres =
    mode === "delegation" && Array.isArray(body.membres)
      ? body.membres
          .slice(0, 100)
          .map((m) => ({
            prenom: String((m as Record<string, unknown>)?.prenom ?? "").trim(),
            nom: String((m as Record<string, unknown>)?.nom ?? "").trim(),
            email:
              String((m as Record<string, unknown>)?.email ?? "").trim() || null,
          }))
          .filter((m) => m.prenom || m.nom || m.email)
      : [];

  if (mode === "delegation" && membres.length < 1) {
    return NextResponse.json({ error: "DELEGATION_EMPTY" }, { status: 400 });
  }

  const optionKeys =
    mode === "solo" && Array.isArray(body.options)
      ? body.options
          .map(String)
          .filter((k) => ticketOptions.some((o) => o.key === k))
      : [];

  const payload = await getPayload({ config });

  // Code promo : validé en base, jamais sur la foi du client.
  let promoPct = 0;
  let promoCode: string | null = null;
  const rawPromo = String(body.promoCode ?? "").trim().toUpperCase();
  if (rawPromo) {
    const found = await payload.find({
      collection: "codes-promo",
      where: { and: [{ code: { equals: rawPromo } }, { actif: { equals: true } }] },
      limit: 1,
    });
    if (found.docs[0]) {
      promoPct = found.docs[0].reductionPct;
      promoCode = rawPromo;
    }
  }

  // Le montant est TOUJOURS recalculé côté serveur.
  const participants = mode === "delegation" ? 1 + membres.length : 1;
  const pricing = computeTunnelTotal({
    ticketKey: ticket.key,
    optionKeys,
    participants,
    promoPct,
  });

  // Un participant (responsable) par e-mail — réutilisé si déjà connu.
  const existing = await payload.find({
    collection: "participants",
    where: { email: { equals: email } },
    limit: 1,
  });

  const participant =
    existing.docs[0] ??
    (await payload.create({
      collection: "participants",
      data: {
        prenom: firstName,
        nom: lastName,
        email,
        telephone: phone,
        club: String(body.club ?? "").trim() || null,
        ville: String(body.city ?? "").trim() || null,
        pays: String(body.country ?? "").trim() || "Bénin",
        districtRole:
          mode === "delegation"
            ? "Responsable de délégation"
            : body.memberType === "guest"
              ? "Invité"
              : "Membre Toastmasters",
        langue: locale as "fr" | "en",
      },
    }));

  const requestedChannel = ONLINE_CHANNELS.includes(
    body.paymentMethod as (typeof ONLINE_CHANNELS)[number]
  )
    ? (body.paymentMethod as (typeof ONLINE_CHANNELS)[number])
    : null;
  const wantsWire = body.paymentMethod === "virement";
  const wantsOnline = requestedChannel !== null && fedapayEnabled();

  const inscription = await payload.create({
    collection: "inscriptions",
    data: {
      participant: participant.id,
      categorie:
        mode === "delegation"
          ? "delegation"
          : (ticket.key as "early" | "standard" | "etudiant" | "vip"),
      montant: pricing.total,
      devise: "XOF",
      statut: "en_attente",
      optionsSelectionnees: optionKeys as ("excursions" | "gala" | "totebag")[],
      codePromo: promoCode,
      nombreParticipants: participants,
      membres: mode === "delegation" ? membres : undefined,
      modePaiement: wantsOnline ? "fedapay" : wantsWire ? "virement" : "sur_place",
      canal: requestedChannel ?? undefined,
      qrToken: randomUUID(),
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  // La page de confirmation est adressée par le jeton aléatoire de
  // l'inscription, jamais par son identifiant. Cet identifiant est un entier
  // séquentiel : l'utiliser dans l'URL permettait d'énumérer ?ref=1, 2, 3… et
  // de lire le nom, la catégorie et le montant de tous les inscrits du site.
  const thanksUrl = `${siteUrl}/${locale}/inscription/merci?ref=${inscription.qrToken}`;

  // « Inscription reçue » — envoyé quel que soit le mode, avec le mode RÉELLEMENT
  // retenu : si le paiement en ligne échoue plus bas, l'inscription bascule sur
  // « sur place » et l'e-mail doit le refléter. On attend l'envoi (encapsulé,
  // il ne peut pas lever) pour qu'il parte avant une éventuelle redirection.
  const offre =
    mode === "delegation"
      ? locale === "en"
        ? `Delegation (${participants} people)`
        : `Délégation (${participants} personnes)`
      : ticket.name[locale as Locale];
  const notifier = (modePaiement: ModePaiement) =>
    sendInscriptionRecue({
      payload,
      locale: locale as Locale,
      to: email,
      prenom: firstName,
      reference: formatReference(inscription.id),
      offre,
      montant: pricing.total,
      confirmationUrl: thanksUrl,
      modePaiement,
    });

  if (wantsOnline) {
    try {
      const checkout = await createFedapayCheckout({
        amount: pricing.total,
        description:
          // Le manuel de marque (p. 38) impose le numéro de District et les
          // mots « annual conference » sur chaque support — le libellé qui
          // apparaît sur le relevé bancaire du participant en est un.
          mode === "delegation"
            ? `COT27 District 130 Annual Conference — Délégation ${participants} pers. — ${firstName} ${lastName}`
            : `COT27 District 130 Annual Conference — ${ticket.name.fr} — ${firstName} ${lastName}`,
        firstName,
        lastName,
        email,
        phone,
        callbackUrl: thanksUrl,
      });

      if (checkout) {
        await payload.create({
          collection: "paiements",
          data: {
            inscription: inscription.id,
            fournisseur: "fedapay",
            referenceExterne: checkout.transactionId,
            montant: pricing.total,
            devise: "XOF",
            statut: "initie",
          },
        });
        await notifier("fedapay");
        return NextResponse.json({ redirectUrl: checkout.url, ref: inscription.qrToken });
      }
    } catch (error) {
      // Échec FedaPay → l'inscription bascule en paiement sur place
      console.error("FedaPay checkout failed:", error);
      await payload.update({
        collection: "inscriptions",
        id: inscription.id,
        data: { modePaiement: "sur_place" },
      });
    }
  }

  // Chemins virement, sur place, ou paiement en ligne indisponible/en échec :
  // l'inscription reste « en attente » avec un mode manuel, on notifie en
  // conséquence.
  await notifier(wantsWire ? "virement" : "sur_place");
  return NextResponse.json({ redirectUrl: thanksUrl, ref: inscription.qrToken });
}
