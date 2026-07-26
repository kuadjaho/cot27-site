import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Preuve sociale : nombre d'inscrits réels, pour le compteur de la page
 * d'accueil.
 *
 * Deux garde-fous d'honnêteté :
 *  - on ne compte PAS les paiements en ligne abandonnés (« en attente » +
 *    FedaPay) : ce ne sont pas des inscriptions réelles. On garde les paiements
 *    payés, et les inscriptions manuelles (virement / sur place) qui traduisent
 *    un engagement.
 *  - en dessous d'un seuil, `show` est faux et le compteur ne s'affiche pas :
 *    mieux vaut rien qu'une salle qui paraît vide.
 *
 * Un « inscrit » est une personne, pas une ligne : une délégation de vingt
 * compte pour vingt (champ `nombreParticipants`).
 */
const SEUIL = 25;

export type InscritsStats = { total: number; show: boolean };

export async function getInscritsStats(): Promise<InscritsStats> {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "inscriptions",
      where: { statut: { not_equals: "annulee" } },
      depth: 0, // on ne lit que l'inscription elle-même, jamais le participant
      limit: 5000,
      pagination: false,
    });

    let total = 0;
    for (const inscription of docs) {
      if (
        inscription.statut === "en_attente" &&
        inscription.modePaiement === "fedapay"
      ) {
        continue; // paiement en ligne jamais confirmé : on l'ignore
      }
      total += inscription.nombreParticipants ?? 1;
    }

    return { total, show: total >= SEUIL };
  } catch {
    // Base indisponible : le compteur ne doit jamais casser la page d'accueil.
    return { total: 0, show: false };
  }
}
