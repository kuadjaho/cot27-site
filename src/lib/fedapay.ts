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

  // Défaillance FERMÉE, délibérément. La version précédente renvoyait `true`
  // quand aucun secret n'était configuré, en supposant que « pas de secret »
  // signifiait « mode démo ». Les deux variables sont indépendantes : les
  // paiements réels ne dépendent que de FEDAPAY_SECRET_KEY, si bien qu'un
  // déploiement en production ayant oublié FEDAPAY_WEBHOOK_SECRET encaissait
  // normalement tout en laissant n'importe qui marquer n'importe quelle
  // inscription comme payée par un simple POST sur l'URL du webhook.
  if (!secret) {
    console.error(
      "[fedapay] Webhook refusé : FEDAPAY_WEBHOOK_SECRET n'est pas configuré. " +
        "Renseignez-le avec la valeur fournie par le tableau de bord FedaPay, " +
        "sans quoi aucune confirmation de paiement ne peut être authentifiée."
    );
    return false;
  }

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
