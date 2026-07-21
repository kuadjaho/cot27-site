import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Montserrat embarquée pour les images Open Graph.
 *
 * Ces images sont générées côté serveur par Satori, qui n'a pas accès aux
 * polices chargées par le navigateur : sans ce chargement explicite, elles
 * retombent sur la sans-serif système. Or le manuel de marque désigne
 * Montserrat comme l'alternative gratuite officielle à Gotham pour les
 * titres (p. 20), et une image de partage circule seule sur les réseaux.
 */
export async function montserratBold() {
  return readFile(
    path.join(process.cwd(), "src/assets/fonts/Montserrat-Bold.ttf")
  );
}
