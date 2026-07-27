"use client";

import { useEffect } from "react";

/**
 * Efface le brouillon du tunnel, monté par la page de remerciement.
 *
 * L'effacement se faisait auparavant juste avant la redirection vers FedaPay,
 * c'est-à-dire AVANT que l'inscription soit acquise : un échec Mobile Money
 * ramenait la personne devant un tunnel vide, à tout ressaisir. Ici, on est
 * arrivé au bout — le brouillon n'a plus de raison d'être.
 */
export default function ClearDraft({ storageKey }: { storageKey: string }) {
  useEffect(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* stockage indisponible (navigation privée stricte) : sans conséquence */
    }
  }, [storageKey]);

  return null;
}
