import { notFound } from "next/navigation";

/** Attrape toute route inconnue sous /fr ou /en → 404 stylée du segment. */
export default function CatchAll() {
  notFound();
}
