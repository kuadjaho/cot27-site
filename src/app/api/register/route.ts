import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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

  const wantsOnline = body.paymentMethod === "fedapay" && fedapayEnabled();

  const registration = await prisma.registration.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      club: String(body.club ?? "").trim() || null,
      city: String(body.city ?? "").trim() || null,
      country: String(body.country ?? "").trim() || "Bénin",
      memberType,
      ticketType: ticket.key,
      amount: ticket.price,
      status: "PENDING",
      paymentMethod: wantsOnline ? "fedapay" : "onsite",
      locale,
    },
  });

  // En production, NEXT_PUBLIC_SITE_URL garantit des URLs publiques correctes
  // pour les callbacks de paiement ; vide en dev → origine de la requête.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const thanksUrl = `${siteUrl}/${locale}/inscription/merci?ref=${registration.id}`;

  if (wantsOnline) {
    try {
      const checkout = await createFedapayCheckout({
        amount: ticket.price,
        description: `Convention D130 2026 — ${ticket.name.fr} — ${firstName} ${lastName}`,
        firstName,
        lastName,
        email,
        phone,
        callbackUrl: thanksUrl,
      });

      if (checkout) {
        await prisma.registration.update({
          where: { id: registration.id },
          data: { paymentRef: checkout.transactionId },
        });
        return NextResponse.json({ redirectUrl: checkout.url, ref: registration.id });
      }
    } catch (error) {
      // Échec FedaPay → on bascule l'inscription en paiement sur place
      console.error("FedaPay checkout failed:", error);
      await prisma.registration.update({
        where: { id: registration.id },
        data: { paymentMethod: "onsite" },
      });
    }
  }

  return NextResponse.json({ redirectUrl: thanksUrl, ref: registration.id });
}
