// Intégration FedaPay (https://docs.fedapay.com) — passerelle de paiement
// populaire au Bénin (Mobile Money MTN/Moov + cartes bancaires).
//
// Sans FEDAPAY_SECRET_KEY dans .env, le site fonctionne en "mode démo" :
// les inscriptions sont enregistrées avec paiement sur place.

type CreateTransactionInput = {
  amount: number; // FCFA
  description: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  callbackUrl: string;
};

export function fedapayEnabled() {
  return Boolean(process.env.FEDAPAY_SECRET_KEY);
}

function apiBase() {
  return process.env.FEDAPAY_ENV === "live"
    ? "https://api.fedapay.com"
    : "https://sandbox-api.fedapay.com";
}

function headers() {
  return {
    Authorization: `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

/**
 * Crée une transaction FedaPay et retourne l'URL de paiement hébergée.
 * Retourne null si FedaPay n'est pas configuré.
 */
export async function createFedapayCheckout(
  input: CreateTransactionInput
): Promise<{ url: string; transactionId: string } | null> {
  if (!fedapayEnabled()) return null;

  const txRes = await fetch(`${apiBase()}/v1/transactions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      description: input.description,
      amount: input.amount,
      currency: { iso: "XOF" },
      callback_url: input.callbackUrl,
      customer: {
        firstname: input.firstName,
        lastname: input.lastName,
        email: input.email,
        phone_number: { number: input.phone, country: "BJ" },
      },
    }),
  });

  if (!txRes.ok) {
    console.error("FedaPay transaction error:", await txRes.text());
    throw new Error("FEDAPAY_CREATE_FAILED");
  }

  const txJson = await txRes.json();
  const transaction = txJson["v1/transaction"];

  const tokenRes = await fetch(
    `${apiBase()}/v1/transactions/${transaction.id}/token`,
    { method: "POST", headers: headers() }
  );

  if (!tokenRes.ok) {
    console.error("FedaPay token error:", await tokenRes.text());
    throw new Error("FEDAPAY_TOKEN_FAILED");
  }

  const tokenJson = await tokenRes.json();
  return { url: tokenJson.url, transactionId: String(transaction.id) };
}

/** Vérifie la signature d'un webhook FedaPay (header X-FEDAPAY-SIGNATURE). */
export async function verifyWebhookSignature(
  payload: string,
  signatureHeader: string | null
): Promise<boolean> {
  const secret = process.env.FEDAPAY_WEBHOOK_SECRET;
  if (!secret) return true; // pas de secret configuré → on accepte (mode démo)
  if (!signatureHeader) return false;

  // Format du header : "t=<timestamp>,s=<hmac-sha256>"
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("=") as [string, string])
  );
  if (!parts.t || !parts.s) return false;

  const { createHmac, timingSafeEqual } = await import("crypto");
  const expected = createHmac("sha256", secret)
    .update(`${parts.t}.${payload}`)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(parts.s));
  } catch {
    return false;
  }
}
