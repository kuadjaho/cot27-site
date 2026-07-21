import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/fedapay";

// Webhook FedaPay : configurez l'URL <site>/api/payment/webhook dans votre
// tableau de bord FedaPay pour les événements "transaction.approved" etc.
export async function POST(request: NextRequest) {
  const payload = await request.text();

  const valid = await verifyWebhookSignature(
    payload,
    request.headers.get("x-fedapay-signature")
  );
  if (!valid) {
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 401 });
  }

  let event: { name?: string; entity?: { id?: number | string; status?: string } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const transactionId = event.entity?.id;
  if (!transactionId) return NextResponse.json({ ok: true });

  const statusMap: Record<string, string> = {
    approved: "PAID",
    transferred: "PAID",
    canceled: "CANCELLED",
    declined: "CANCELLED",
  };

  const newStatus = event.entity?.status ? statusMap[event.entity.status] : undefined;
  if (newStatus) {
    await prisma.registration.updateMany({
      where: { paymentRef: String(transactionId) },
      data: { status: newStatus },
    });
  }

  return NextResponse.json({ ok: true });
}
