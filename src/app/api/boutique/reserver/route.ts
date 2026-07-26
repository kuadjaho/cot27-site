import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getPayload } from "payload";
import config from "@payload-config";
import { normaliserPanier, composerReservation } from "@/lib/boutique";
import { isLocale, type Locale } from "@/lib/i18n";
import { sendReservationRecue } from "@/lib/email";

/**
 * Création d'une réservation d'épinglettes.
 *
 * C'est le SEUL chemin de création : la collection `reservations` a
 * `create: () => false`. Tout est recalculé ici à partir des prix relus en
 * base — le corps de la requête n'apporte que des slugs, des quantités et
 * l'identité de l'acheteur.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const prenom = String(body.prenom ?? "").trim();
  const nom = String(body.nom ?? "").trim();
  const email = String(body.email ?? "").trim();
  const telephone = String(body.telephone ?? "").trim();
  const locale: Locale = isLocale(String(body.locale)) ? (String(body.locale) as Locale) : "fr";

  if (
    !prenom ||
    !nom ||
    !telephone ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  ) {
    return NextResponse.json({ error: "INVALID_FIELDS" }, { status: 400 });
  }

  const panier = normaliserPanier(body.panier);
  if (panier.length === 0) {
    return NextResponse.json({ error: "EMPTY_CART" }, { status: 400 });
  }

  const payload = await getPayload({ config });

  // La boutique doit être ouverte — elle est livrée fermée, et le comité
  // l'ouvre depuis l'administration une fois les prix vérifiés.
  const reglages = await payload.findGlobal({ slug: "boutique" });
  if (!reglages?.ouverte) {
    return NextResponse.json({ error: "CLOSED" }, { status: 409 });
  }

  // Prix relus EN BASE, jamais reçus du client.
  const { docs: articles } = await payload.find({
    collection: "epinglettes",
    where: {
      and: [
        { actif: { equals: true } },
        { slug: { in: panier.map((l) => l.slug) } },
      ],
    },
    locale,
    limit: 100,
    pagination: false,
  });

  const { lignes, total, introuvables } = composerReservation(
    panier,
    articles.map((a) => ({
      slug: a.slug as string,
      nom: a.nom as string,
      prixFcfa: a.prixFcfa as number,
    }))
  );

  // Une réservation PARTIELLE, que l'acheteur validerait sans s'en apercevoir,
  // est pire qu'un refus : on annule tout et on lui demande de recharger.
  if (introuvables.length > 0 || lignes.length === 0 || total <= 0) {
    return NextResponse.json(
      { error: "UNAVAILABLE", introuvables },
      { status: 409 }
    );
  }

  const token = randomUUID();
  const reservation = await payload.create({
    collection: "reservations",
    data: {
      token,
      prenom,
      nom,
      email,
      telephone,
      club: String(body.club ?? "").trim() || null,
      pays: String(body.pays ?? "").trim() || null,
      statut: "confirmee", // réservation ferme ; le règlement se fait à la remise
      lignes: lignes.map((l) => ({
        slug: l.slug,
        nom: l.nom,
        prixUnitaire: l.prixUnitaire,
        quantite: l.quantite,
      })),
      totalFcfa: total,
      modePaiement: "sur_place",
      note: String(body.note ?? "").trim().slice(0, 500) || null,
    },
  });

  // Référence lisible, dérivée de l'identifiant une fois connu.
  const reference = `COT27-P${String(reservation.id).padStart(4, "0")}`;
  await payload.update({
    collection: "reservations",
    id: reservation.id,
    data: { reference },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  await sendReservationRecue({
    payload,
    locale,
    to: email,
    prenom,
    reference,
    lignes,
    total,
    confirmationUrl: `${siteUrl}/${locale}/boutique/merci?ref=${token}`,
  });

  return NextResponse.json({ ok: true, reference, ref: token, total });
}
