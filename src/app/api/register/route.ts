import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getPayload } from "payload";
import config from "@payload-config";
import { getTicket } from "@/lib/content";
import { createFedapayCheckout, fedapayEnabled } from "@/lib/fedapay";
import { isLocale } from "@/lib/i18n";

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
  const ticketType = String(body.ticketType ?? "");
  const memberType = body.memberType === "guest" ? "guest" : "member";
  const locale = isLocale(String(body.locale)) ? String(body.locale) : "fr";

  if (!firstName || !lastName || !phone || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "INVALID_FIELDS" }, { status: 400 });
  }

  // Le montant est TOUJOURS recalculé côté serveur à partir du catalogue.
  const ticket = getTicket(ticketType);
  if (!ticket) {
    return NextResponse.json({ error: "INVALID_TICKET" }, { status: 400 });
  }

  const payload = await getPayload({ config });

  // Un participant par e-mail — réutilisé si déjà connu.
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
        districtRole: memberType === "member" ? "Membre Toastmasters" : "Invité",
        langue: locale as "fr" | "en",
      },
    }));

  const wantsOnline = body.paymentMethod === "fedapay" && fedapayEnabled();

  const inscription = await payload.create({
    collection: "inscriptions",
    data: {
      participant: participant.id,
      categorie: ticket.key as "early" | "standard" | "etudiant" | "vip",
      montant: ticket.price,
      devise: "XOF",
      statut: "en_attente",
      modePaiement: wantsOnline ? "fedapay" : "sur_place",
      qrToken: randomUUID(),
    },
  });

  // En production, NEXT_PUBLIC_SITE_URL garantit des URLs publiques correctes
  // pour les callbacks de paiement ; vide en dev → origine de la requête.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const thanksUrl = `${siteUrl}/${locale}/inscription/merci?ref=${inscription.id}`;

  if (wantsOnline) {
    try {
      const checkout = await createFedapayCheckout({
        amount: ticket.price,
        description: `COT27 — ${ticket.name.fr} — ${firstName} ${lastName}`,
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
            montant: ticket.price,
            devise: "XOF",
            statut: "initie",
          },
        });
        return NextResponse.json({ redirectUrl: checkout.url, ref: inscription.id });
      }
    } catch (error) {
      // Échec FedaPay → on bascule l'inscription en paiement sur place
      console.error("FedaPay checkout failed:", error);
      await payload.update({
        collection: "inscriptions",
        id: inscription.id,
        data: { modePaiement: "sur_place" },
      });
    }
  }

  return NextResponse.json({ redirectUrl: thanksUrl, ref: inscription.id });
}
