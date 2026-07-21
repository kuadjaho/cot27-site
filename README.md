# Convention du District 130 — Toastmasters Bénin 2026

Site officiel de la convention : vitrine bilingue (FR/EN), billetterie en ligne
(FedaPay — Mobile Money & carte bancaire), base des inscriptions et espace admin.

## Démarrage

```bash
npm install
npm run db:push   # crée la base SQLite (prisma/dev.db)
npm run dev       # http://localhost:3000
```

## Structure

| URL | Description |
|---|---|
| `/fr` · `/en` | Accueil (hero, compte à rebours, aperçus) |
| `/fr/programme` | Agenda détaillé sur 3 jours (onglets) |
| `/fr/intervenants` | Conférenciers & invités |
| `/fr/infos` | Lieu, hôtels, voyage, FAQ |
| `/fr/galerie` | Photos des éditions précédentes |
| `/fr/inscription` | Billetterie : choix du pass → formulaire → paiement |
| `/fr/admin` | Tableau de bord (mot de passe : `ADMIN_PASSWORD` du `.env`) |
| `/api/admin/export` | Export CSV des inscriptions |
| `/api/payment/webhook` | Webhook FedaPay (transaction.approved → statut PAID) |

## Paiement en ligne (FedaPay)

Sans clé FedaPay, le site tourne en **mode démo** : les inscriptions sont
enregistrées avec « paiement sur place ». Pour activer le paiement en ligne :

1. Créez un compte sur [fedapay.com](https://fedapay.com) (sandbox d'abord).
2. Renseignez `FEDAPAY_SECRET_KEY` dans `.env` (`FEDAPAY_ENV="sandbox"` ou `"live"`).
3. Dans le dashboard FedaPay, ajoutez le webhook `https://<votre-site>/api/payment/webhook`
   et copiez son secret dans `FEDAPAY_WEBHOOK_SECRET`.

Alternative béninoise : [KkiaPay](https://kkiapay.me) — la logique est isolée dans
`src/lib/fedapay.ts`, facile à adapter.

## Personnaliser le contenu

Tout le contenu placeholder est centralisé :

- **`src/lib/content.ts`** — dates, lieu, billets & tarifs, programme,
  intervenants, hôtels, FAQ, galerie, sponsors (chaque texte existe en `fr`/`en`).
- **`src/lib/i18n.ts`** — textes d'interface FR/EN.
- Photos réelles : déposez-les dans `public/` et remplacez les dégradés
  placeholder de `src/app/[locale]/galerie/page.tsx`.

## Mise en production

- La base SQLite convient au développement. En production (Vercel, etc.),
  passez à PostgreSQL/Turso : changez `provider` dans `prisma/schema.prisma`
  et `DATABASE_URL`, puis `npm run db:push`.
- Changez `ADMIN_PASSWORD` et `ADMIN_COOKIE_SECRET`.
- Renseignez `NEXT_PUBLIC_SITE_URL` avec l'URL publique (callbacks de paiement).
