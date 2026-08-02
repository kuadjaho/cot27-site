# COT27 — état du projet

Site de la **Conférence Annuelle du District 130 Toastmasters** — Cotonou,
1er–8 mai 2027, 12 pays, bilingue FR/EN.

## ⚠️ À lire avant de développer

**La plateforme officielle n'est peut-être plus celle-ci.** Le 27 juillet 2026,
Josias DOSSOUGOIN — Responsable Technologies et Plateformes Numériques du
comité, dont la fiche de poste couvre explicitement le site, la plateforme
d'inscription et la base de données — a décidé de **tout gérer sur Odoo, site
inclus**, et a acheté un VPS.

Ce dépôt est donc une **contribution**, pas la plateforme retenue. Demander où
en est l'arbitrage avant de proposer de nouvelles fonctionnalités. Le risque
principal est de laisser deux plateformes avancer en parallèle : deux bases
d'inscrits, deux vérités sur les paiements.

Kevin ADJAHO, propriétaire de ce dépôt, est **Responsable du Magazine** — pas
de la technologie.

**Question ouverte non instruite :** Odoo intègre Stripe, PayPal, Adyen, mais
pas FedaPay/MTN/Moov. Pour un public béninois payant en Mobile Money, c'est le
cœur du tunnel.

## Démarrer

```bash
brew services start postgresql@16   # base « cot27 » requise
npm run dev                          # http://localhost:3000
```

Administration Payload sur `/admin`. `npm run seed` charge un jeu de données.

## Vérifier

```bash
npx tsc --noEmit && npm test && npm run build
```

Le CI GitHub Actions enchaîne tsc → tests → `payload migrate` → build sur une
base vierge. **Arrêter le serveur de dev avant `npm run build`** : ils se
disputent le dossier `.next`.

## Ce que le projet contient

Next.js 15 + Payload CMS 3 + PostgreSQL. Tunnel d'inscription 4 étapes avec
délégations et barème dégressif, paiement FedaPay (Mobile Money + carte),
e-mails transactionnels bilingues, hub Magazine, réservation d'épinglettes,
PWA avec programme hors ligne, 41 tests, migrations versionnées.

## Ce qui bloque réellement

1. **Les contenus sont fictifs** — intervenants, programme, photos, articles.
   Le site l'affiche lui-même en pied de page.
2. **Aucun SMTP réel** — les e-mails partent vers un compte de test et
   n'atteignent personne, y compris les réinitialisations de mot de passe.
3. **Pas déployé** — projet Vercel créé, mais la base de données manque.

## Deux règles à ne pas casser

- **`reservations` a `create: () => false`** (`src/collections/boutique.ts`).
  Une réservation ne naît que par `/api/boutique/reserver`, qui relit les prix
  en base et recalcule le total. Sans cela, un visiteur peut se réserver des
  épinglettes à 0 F qui entrent dans la liste d'achat payée en dollars.
- **Le montant d'une inscription est toujours recalculé côté serveur**
  (`computeTunnelTotal` dans `src/lib/content.ts`). Le client n'envoie jamais
  un prix.

## Conformité de marque

`CONFORMITE-MARQUE.md` documente l'analyse du manuel Toastmasters page par
page, et les deux décisions à faire trancher par la Brand Team : l'expiration
du branding après la conférence (p. 38) et la contradiction entre le
disclaimer imposé (p. 34) et la cible non-membres. Palette et polices imposées
— toute proposition qui s'en écarte est irrecevable.
