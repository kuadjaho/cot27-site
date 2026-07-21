# COT27 — Conformité au manuel de marque Toastmasters

Document de travail à l'attention du Comité Communication, Marketing et Technologies.
Référence : *Toastmasters International Brand Manual*, version 2.0, révision 03/2026, 41 pages.
Contacts officiels : `brand@toastmasters.org` (marque, validations) et `trademarks@toastmasters.org` (marques déposées).

Ce document ne remplace pas le manuel. Il liste ce que le site respecte, ce qu'il reste à faire valider, et les deux décisions que le comité doit trancher.

---

## 1. Ce que le manuel autorise explicitement

La page 38, « District Conference Guidelines », est la base juridique de tout le projet :

> *You may create a custom logo, theme, and/or slogan for your conference providing they don't infringe on the copyrights or trademarks of other organizations. This exception is for the conference only.*

COT27 a donc le droit à son identité propre — logo, thème, slogan, look and feel. C'est la **seule exception** à la règle qui interdit par ailleurs aux clubs et aux Districts de créer leurs propres logos (page 12).

Cette exception lève le risque « Non-conformité à la marque Toastmasters », classé *élevé* dans le cahier des charges n°5. Elle ne le lève toutefois qu'à condition de respecter les points de la section 2.

---

## 2. État de conformité du site

### Conforme

| Règle | Page | Comment le site s'y conforme |
|---|---|---|
| Mention obligatoire du numéro de District et des mots « annual conference » sur chaque support | 38d | Présent dans le bandeau d'accueil et dans le pied de page, donc sur **toutes** les pages |
| Disclaimer obligatoire en bas de site | 34a | Affiché mot pour mot en anglais, avec une traduction française de courtoisie en locale FR |
| Interdiction de réhéberger des matériaux pris sur toastmasters.org | 34b | Les fichiers récupérés sur leur serveur web ont été supprimés. Seul le SVG officiel du Brand Portal est utilisé |
| Logo Toastmasters seul, non altéré, jamais côte à côte avec un autre logo | 38b | Bloc d'affiliation dédié en pied de page, isolé par une bordure, sans aucun autre logo |
| Taille minimale du logo : 72 px en web | 8 | Affiché à 96 px de large |
| Sponsors dans une section dédiée, jamais à côté du logo Toastmasters | 38e | Section sponsors sur l'accueil, séparée du pied de page par deux sections |
| Polices : alternatives gratuites officielles | 20-21 | Montserrat pour les titres, Source Sans 3 pour le texte — y compris dans les images de partage, où la police est désormais embarquée |
| Logo posé sur une couleur de la palette | 12 | Le bloc d'affiliation est sur Loyal Blue `#004165`, et non sur le bleu nuit du reste du pied de page |

### Conforme sous réserve d'interprétation

| Point | Page | État réel |
|---|---|---|
| Palette de marque | 13 | Les quatre couleurs officielles sont définies (`#004165`, `#772432`, `#A9B2B1`, `#F2DF74`), mais le fichier `globals.css` déclare **25 jetons de couleur, dont 21 sont hors palette** : nuances dérivées (bleus assombris, ors) et extension béninoise décorative. Le manuel n'interdit ces couleurs que **derrière le logo** (p. 12) ; l'exception « District Conference » (p. 38a) autorise par ailleurs une identité propre. Ce n'est donc pas une infraction, mais **le site ne doit pas les présenter comme « la charte Toastmasters »**. |
| Accent jaune | 13 | Happy Yellow `#F2DF74` est disponible, mais les boutons d'appel à l'action utilisent `#e8c94a`, une nuance fabriquée. Recevable au titre de l'identité de conférence ; à trancher si l'on veut un alignement strict. |

### À faire valider avant la mise en ligne publique

| Objet | Auprès de qui | Fondement |
|---|---|---|
| **Le thème de la conférence** | Brand Team, `brand@toastmasters.org` | p. 38 : « All District conference themes must be approved prior to distribution » |
| **Le site lui-même** | Brand Team, `brand@toastmasters.org` | p. 34 : « For questions and approval on websites » |
| L'identité visuelle COT27 (logo, look and feel) | District Director, puis Brand Team | Cahier des charges n°5 + p. 38 |

À noter : le cahier des charges ne mentionnait qu'une validation par le District Director. Le manuel en exige **deux de plus**, auprès de la Brand Team de Toastmasters International. Les délais sont à anticiper dans le sprint S0.

Le thème actuellement affiché sur le site (« Oser la parole, bâtir l'avenir ») est un **placeholder** et n'a été soumis à personne.

---

## 3. Deux décisions à trancher par le comité

### 3.1 L'héritage numérique se heurte à la règle d'expiration

Le manuel est sans ambiguïté (p. 38) :

> *Conference logos, themes, and/or slogans may be used for the District Conference only, and cannot be used once the conference is over.*

Or le cahier des charges n°5 fait de l'héritage numérique un objectif central : « Aucun site de District ne laisse d'héritage numérique. COT27 doit produire une archive permanente, indexée, consultable », avec un sprint S8 dédié et un hébergement pré-payé cinq ans.

**Les deux ne sont pas compatibles en l'état.** Après le 8 mai 2027, la marque COT27 — nom, thème, slogan, mark « 27 » — ne peut plus être utilisée.

Pistes à arbitrer avec la Brand Team :

1. **Archive dé-brandée** : le contenu (magazines, photos, replays, rapports) survit sous une identité neutre de District 130, sans le branding COT27. C'est l'option la plus sûre.
2. **Demande d'usage de marque** : soumettre une *Trademark Use Request* pour un usage historique et documentaire du branding COT27 après l'événement. Le manuel prévoit d'ailleurs qu'un ancien logo « should only be used in an historical context ».
3. **Archive fermée** : geler le site en lecture seule et accepter qu'il ne soit plus promu.

**Conséquence technique immédiate** : le branding doit rester **centralisé et substituable**, pour qu'un retrait après mai 2027 soit une opération d'une ligne et non une chasse au trésor.

État réel, mesuré :

- ✅ La marque « 27 » et le nom sont désormais centralisés dans l'objet `brand` de `src/lib/content.ts`. Ils étaient auparavant codés en dur dans la barre de navigation, le pied de page et les deux images de partage.
- ⚠️ La chaîne « COT27 » subsiste dans **14 fichiers de code** (configuration Payload, jeu de données de test, manifeste PWA, mises en page, routes d'API, collections). Ces occurrences sont majoritairement techniques — libellés d'administration, préfixes de référence — mais elles devront être passées en revue avant la bascule.
- ⚠️ Le thème est dans `src/lib/i18n.ts` sous `hero.theme`, en deux exemplaires (FR et EN). Il faudra le sortir vers `brand` le jour où le vrai thème sera validé.

### 3.2 Le disclaimer obligatoire contredit la cible « non-membres »

Le texte imposé par la page 34 dit que le site est « à l'usage exclusif des membres Toastmasters ». Or le cahier des charges vise explicitement 25 % de trafic non-membre, avec une page « Première conférence ? » conçue pour des personnes qui n'ont jamais mis les pieds dans un club.

Le disclaimer est affiché, comme l'exige le manuel. Mais la question de fond mérite d'être posée à la Brand Team : **un site de conférence de District ouvert au public relève-t-il de cette clause**, pensée pour les sites internes de clubs ? La réponse conditionne toute la stratégie d'acquisition non-membre.

---

## 4. Règles à respecter par les contributeurs de contenu

Pour toute personne qui produira des visuels, des articles de magazine ou des supports COT27 :

- **Ne jamais altérer le logo Toastmasters** : pas de perspective, pas d'étirement, pas de changement de proportions, de couleurs ou d'éléments (p. 12).
- **Ne jamais l'intégrer à un objet, un mot ou un nombre** (p. 38) — il ne peut pas devenir le « O » d'un mot, ni être fondu dans le « 27 ».
- **Ne jamais le placer à côté d'un autre logo**, y compris un logo de sponsor ou de partenaire institutionnel (p. 38).
- **Ne rien superposer au logo** : texte, slogan, symbole ou image (p. 12).
- **Ne pas mettre de lueur à motif derrière le logo** (p. 12). Le motif d'Abomey du site est un fond décoratif ; il ne doit jamais servir de fond direct au logo Toastmasters.
- **Ne pas réhéberger** de contenu pris sur toastmasters.org — on peut y faire un lien, pas le recopier (p. 34). Les fichiers du Brand Portal, eux, sont fournis pour être utilisés.
- **Typographie** : pas de word art, d'ombres portées ni de déformation des polices (p. 20).
- Les logos officiels sont dans `~/Downloads/ToastmastersLogo/` et `~/Downloads/ToastmastersWordmark/`, en SVG couleur, trois couleurs, niveaux de gris, blanc et noir.

---

## 5. Le District 130 compte douze pays

Bénin · Burkina Faso · Cameroun · Centrafrique · Congo · Gabon · Guinée Équatoriale · Niger · Nigeria · RD Congo · São Tomé-et-Príncipe · Tchad

Source : visuel officiel publié par la page Facebook vérifiée « Toastmasters District 130 » le 6 juillet 2024. Le cahier des charges n°5 n'en nommait que huit — il omettait la Centrafrique, la Guinée Équatoriale, le Niger et São Tomé-et-Príncipe. La liste du site a été corrigée ; il reste à corriger le cahier des charges lui-même.

---

## 6. Méthode et limites de ce document

Les règles citées ici ont été relevées **page par page dans le PDF du manuel**, avec extraction texte fiable (`pdftotext -layout`). Une première lecture par extraction artisanale avait produit un texte corrompu et plusieurs conclusions fausses — notamment une palette inventée (`#781327`, prétendu « Rich Maroon ») et une confusion entre couleur de palette et extrémité de dégradé. Toute reprise de ce travail doit repartir du PDF, pas de ce document.

Le site a ensuite été audité par une batterie d'agents indépendants, chacun sur une dimension du manuel, avec vérification adversariale de chaque constat sous deux angles distincts — exactitude du fait dans le code, et exactitude de l'interprétation de la règle. Sur **35 constats produits, 28 ont été réfutés** : dans la grande majorité des cas parce qu'ils étendaient au site entier une règle qui ne vise que le logo. C'est le biais principal à surveiller quand on lit ce manuel.

Les constats survivants ont été corrigés, y compris trois qui portaient sur **ce document lui-même** : il affirmait la conformité de la palette en citant une couleur absente du code, et la centralisation du branding alors que la marque était codée en dur dans quatre fichiers. Les deux affirmations ont été rendues vraies plutôt que retirées.
