export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

const fr = {
  meta: {
    title: "COT27 — Conférence du District 130 Toastmasters · Cotonou 2027",
    description:
      "COT27 : la Conférence Annuelle du District 130 Toastmasters à Cotonou, Bénin, du 1er au 8 mai 2027. Keynotes, concours d'art oratoire, ateliers et découverte du Bénin.",
  },
  nav: {
    home: "Accueil",
    discover: "Découvrir",
    program: "Programme",
    speakers: "Intervenants",
    benin: "Bénin",
    venue: "Infos pratiques",
    gallery: "Galerie",
    magazine: "Magazine",
    boutique: "Épinglettes",
    register: "S'inscrire",
  },
  discover: {
    title: "Découvrir COT27",
    subtitle:
      "Une semaine, douze pays, une scène : ce que la Conférence Annuelle du District 130 va changer pour vous.",
    visionKicker: "La vision",
    visionTitle: "Bien plus qu'une conférence",
    visionText1:
      "COT27 rassemble à Cotonou les orateurs, les leaders et les curieux de douze pays d'Afrique pour huit jours de keynotes, de concours, d'ateliers et de découverte du Bénin.",
    visionText2:
      "Standard international dans l'exécution, africaine dans les moyens de paiement et la performance réseau, béninoise dans l'âme : c'est la promesse de cette édition.",
    countriesKicker: "Le District 130",
    countriesTitle: "Douze pays, deux langues, une communauté",
    countriesNote:
      "Les douze pays du District 130, tels que publiés par le District.",
    startKicker: "Par où commencer ?",
    firstTimeCard: "Première conférence ?",
    firstTimeCardText: "Ce qui vous attend, comment vous préparer, le lexique à connaître.",
    employerCard: "Convaincre mon employeur",
    employerCardText: "L'argumentaire chiffré et la lettre-type prête à envoyer.",
    beninCard: "Destination Bénin",
    beninCardText: "Ouidah, Ganvié, Abomey, Pendjari : préparez le voyage autour de la conférence.",
  },
  firstTime: {
    title: "Première conférence ?",
    subtitle:
      "Bienvenue ! Voici tout ce qu'il faut savoir pour profiter de COT27 dès la première heure — même si vous n'avez jamais mis les pieds dans un club Toastmasters.",
    glossaryTitle: "Le petit lexique",
    cta: "Je réserve ma place",
  },
  employer: {
    title: "Convaincre mon employeur",
    subtitle:
      "COT27 est une formation autant qu'une conférence. Voici l'argumentaire — et la lettre prête à envoyer.",
    argsKicker: "L'argumentaire",
    letterKicker: "La lettre-type",
    letterTitle: "Prête à copier, adapter, envoyer",
    letterHint:
      "Remplacez les champs entre crochets, ajustez le ton, et envoyez. Disponible en français et en anglais via le sélecteur de langue du site.",
    copy: "Copier la lettre",
    copied: "Lettre copiée !",
    download: "Télécharger (.txt)",
  },
  benin: {
    title: "Destination Bénin",
    subtitle:
      "On ne traverse pas la moitié d'un continent pour ne voir qu'une salle de conférence. Le Bénin fait partie du programme.",
    excursionsKicker: "Les excursions officielles",
    excursionsTitle: "Quatre escales, une histoire",
    excursionsNote:
      "Transport, guide bilingue et déjeuner inclus. Places limitées — réservables avec votre inscription.",
    pratiqueKicker: "Préparer le voyage",
    pratiqueTitle: "Visa, santé, monnaie, climat",
    stayKicker: "Où loger",
    stayTitle: "Hôtels partenaires à tarif négocié",
    cultureKicker: "Culture",
    cultureTitle: "Le Bénin se raconte dans le magazine",
    cultureText:
      "Patrimoine, gastronomie, artisanat : la rubrique « Destination Bénin » du Magazine COT27 vous fait voyager avant le départ.",
    cultureCta: "Lire « Ouidah, Ganvié, Abomey : le Bénin en trois escales »",
  },
  hero: {
    kicker: "Conférence annuelle · District 130 · 12 pays",
    dates: "1er – 8 mai 2027 · Palais des Congrès, Cotonou · Bénin",
    theme: "Oser la parole, bâtir l'avenir",
    subtitle:
      "Huit jours de keynotes, de concours d'art oratoire, d'ateliers de leadership et de découverte du Bénin, avec les meilleurs orateurs de douze pays d'Afrique.",
    cta: "Réserver ma place",
    ctaSecondary: "Voir le programme",
    priceFrom: "À partir de {prix} · Mobile Money MTN & Moov",
    countdownTitle: "La conférence commence dans",
    days: "Jours",
    hours: "Heures",
    minutes: "Minutes",
    seconds: "Secondes",
  },
  stats: {
    participants: "Participants attendus",
    clubs: "Pays représentés",
    speakers: "Intervenants",
    workshops: "Ateliers & concours",
    liveTag: "En temps réel",
    liveInscrits: "inscrits",
    liveSuffix: "ont déjà réservé leur place pour COT27",
  },
  about: {
    kicker: "L'événement",
    title: "La plus grande célébration de l'art oratoire au Bénin",
    p1: "Chaque année, la Convention du District 130 rassemble les membres Toastmasters du Bénin et de la sous-région pour huit jours à Cotonou : trois jours de conférence du 6 au 8 mai, encadrés d'excursions au Bénin.",
    p2: "Concours de discours en français et en anglais, ateliers d'experts, cérémonie de remise des prix, gala de clôture : vivez une expérience qui transformera votre façon de communiquer et de diriger.",
    highlights: [
      {
        title: "Concours du District",
        text: "Finales des concours de discours humoristique, d'improvisation et de discours d'inspiration.",
      },
      {
        title: "Ateliers de haut niveau",
        text: "Des formations pratiques animées par des DTM et des conférenciers internationaux.",
      },
      {
        title: "Gala & remise de prix",
        text: "Une soirée de gala pour célébrer les clubs et les membres les plus distingués de l'année.",
      },
    ],
  },
  programPreview: {
    kicker: "Aperçu",
    // Le bandeau annonce huit jours (1er–8 mai), cette section n'en détaille
    // que trois : sans ce sous-titre, la page d'accueil se contredisait à vue
    // d'œil et l'explication n'existait que dans la FAQ.
    title: "Le cœur de la conférence",
    subtitle:
      "Trois jours intenses, du 6 au 8 mai, au sein d'une semaine béninoise qui commence le 1er. Les excursions se placent avant ou après.",
    seeAll: "Programme complet",
  },
  speakersPreview: {
    kicker: "Ils seront là",
    title: "Des intervenants d'exception",
    seeAll: "Tous les intervenants",
  },
  sponsors: {
    kicker: "Partenaires",
    title: "Ils soutiennent la convention",
    becomeSponsor: "Devenir partenaire",
  },
  ctaBanner: {
    title: "Prêt·e à vivre l'expérience ?",
    text: "Les places sont limitées. Inscrivez-vous dès maintenant et bénéficiez du tarif préférentiel.",
    button: "Je m'inscris",
  },
  program: {
    title: "Programme de la convention",
    subtitle:
      "Trois jours de conférences, concours et ateliers, du 6 au 8 mai. Le programme détaillé est susceptible d'évoluer.",
    day: "Jour",
  },
  speakers: {
    title: "Intervenants & invités",
    subtitle:
      "Conférenciers, officiels du district et invités d'honneur de COT27, du 1er au 8 mai 2027.",
    keynote: "Conférencier principal",
  },
  venue: {
    title: "Infos pratiques",
    subtitle: "Tout ce qu'il faut savoir pour préparer votre venue à Cotonou.",
    venueTitle: "Le lieu",
    venueName: "Palais des Congrès de Cotonou",
    venueText:
      "Situé au cœur de Cotonou, le Palais des Congrès offre un auditorium de 1 500 places, des salles d'ateliers modernes et un parking sécurisé.",
    address: "Boulevard de la Marina, Cotonou, Bénin",
    hotelsTitle: "Où loger",
    hotelsText:
      "Des tarifs négociés sont disponibles dans les hôtels partenaires. Mentionnez « COT27 — District 130 » lors de votre réservation.",
    perNight: "/ nuit",
    travelTitle: "Venir à Cotonou",
    faqTitle: "Questions fréquentes",
    mapTitle: "Plan d'accès",
  },
  gallery: {
    title: "Galerie",
    subtitle: "Retour en images sur les précédentes éditions de la convention.",
    edition: "Édition",
  },
  register: {
    title: "Inscription",
    subtitle:
      "Choisissez votre pass, remplissez le formulaire et réglez en ligne par Mobile Money ou carte bancaire.",
    step1: "1. Choisissez votre pass",
    step2: "2. Vos informations",
    step3: "3. Paiement",
    popular: "Populaire",
    selectTicket: "Choisir",
    selectedTicket: "Sélectionné",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Adresse e-mail",
    phone: "Téléphone (WhatsApp)",
    club: "Club Toastmasters (si membre)",
    clubPlaceholder: "Ex. : Cotonou Toastmasters Club",
    city: "Ville",
    country: "Pays",
    memberType: "Vous êtes",
    member: "Membre Toastmasters",
    guest: "Invité / Non-membre",
    paymentMethod: "Mode de paiement",
    payOnline: "Payer en ligne (Mobile Money / Carte)",
    payOnlineHint: "Paiement sécurisé via FedaPay",
    payOnsite: "Payer sur place",
    payOnsiteHint: "Réglez à l'accueil de la convention",
    total: "Total",
    submit: "Valider mon inscription",
    submitting: "Traitement en cours…",
    required: "Ce champ est requis",
    invalidEmail: "Adresse e-mail invalide",
    errorGeneric:
      "Une erreur est survenue. Veuillez réessayer ou nous contacter.",
    onlineUnavailable:
      "Le paiement en ligne ouvre prochainement. Votre inscription est enregistrée dès maintenant et vous réglerez par virement bancaire — les coordonnées vous seront envoyées par e-mail.",
  },
  tunnel: {
    steps: ["Billet", "Identité", "Récapitulatif", "Paiement"],
    next: "Continuer",
    back: "Retour",
    modeTitle: "Qui inscrivez-vous ?",
    modeSolo: "Moi-même",
    modeSoloHint: "Une inscription individuelle",
    modeDelegation: "Ma délégation",
    modeDelegationHint: "Club ou groupe — tarif dégressif dès 5 participants (−5 %), 10 (−10 %), 20 (−15 %)",
    optionsDelegationNote:
      "Excursion, gala et tote bag se réservent individuellement, par chaque membre, après l'inscription de la délégation.",
    delegationAtLeastOne: "Renseignez au moins un membre de la délégation.",
    requiredLegend: "* champs obligatoires",
    yourDetails: "Vos coordonnées",
    emailNotice: "C'est à cette adresse que nous enverrons votre billet et votre référence.",
    edit: "Modifier",
    fixErrors: "Vérifiez les champs signalés ci-dessus.",
    cgvRequired: "Cochez cette case pour continuer.",
    optionsTitle: "Vos options",
    optionsHint: "Modifiables jusqu'au 1er avril 2027.",
    promoTitle: "Code promo",
    promoPlaceholder: "Ex. : DISTRICT130",
    promoApply: "Appliquer",
    promoApplied: "Code appliqué",
    promoInvalid: "Code inconnu ou expiré",
    delegationMembers: "Les membres de votre délégation",
    delegationMembersHint:
      "Seuls prénom et nom suffisent pour l'instant — chaque membre recevra un lien pour compléter son profil. Vous êtes compté·e comme premier participant.",
    delegationRebate: "Remise délégation",
    addMember: "+ Ajouter un membre",
    removeMember: "Retirer",
    memberN: "Membre",
    responsableTitle: "Responsable de la délégation",
    recapBillet: "Pass",
    recapParticipants: "participants",
    recapOptions: "Options",
    recapPromo: "Code promo",
    recapSubtotal: "Sous-total",
    cgv: "J'accepte les conditions générales de vente et la politique d'annulation.",
    cancelPolicy:
      "Annulation sans frais jusqu'au 1er mars 2027 · remboursement à 50 % jusqu'au 1er avril 2027 · billet transférable à tout moment. (Politique à confirmer par le Comité Budget.)",
    payTitle: "Choisissez votre moyen de paiement",
    payMtn: "Mobile Money MTN",
    payMoov: "Mobile Money Moov",
    payCard: "Carte bancaire",
    payWire: "Virement bancaire",
    payFedapayHint: "Paiement sécurisé via FedaPay",
    payWireHint: "Coordonnées bancaires affichées après validation",
    resumeText: "Votre progression est enregistrée — gardez ce lien pour reprendre plus tard :",
    resumeCopy: "Copier",
    resumeCopied: "Copié !",
    resumeLoaded: "Progression restaurée — reprenez où vous en étiez.",
    totalLabel: "Total",
    perPerson: "par personne",
    participantsLabel: "participants",
    payNow: "Payer",
    finalize: "Valider mon inscription",
    reassureTitle: "Ce qui va se passer",
    reassureStep1: "Vous arrivez sur la page sécurisée de paiement FedaPay",
    reassureMomo2: "Une demande arrive sur votre téléphone MTN ou Moov",
    reassureMomo3: "Vous validez avec votre code PIN Mobile Money",
    reassureCard2: "Vous saisissez les informations de votre carte",
    reassureCard3: "Vous confirmez le paiement (3-D Secure)",
    reassureStep4: "Vous recevez un e-mail de confirmation avec votre référence",
    reassureFoot: "Paiement chiffré · aucun débit sans votre validation",
  },
  thanks: {
    title: "Inscription confirmée !",
    subtitle: "Merci ! Votre place pour COT27 est réservée.",
    titlePending: "Inscription enregistrée",
    subtitlePending: "Votre paiement est en cours de vérification.",
    titleFailed: "Paiement non abouti",
    subtitleFailed:
      "Votre place n'est pas encore réservée. Aucun montant n'a été prélevé.",
    shareWhatsapp: "Envoyer ma référence sur WhatsApp",
    shareWaText: "Ma référence d'inscription COT27 :",
    refLabel: "Référence d'inscription",
    paid: "Votre paiement a bien été reçu. Un e-mail de confirmation vous sera envoyé.",
    onsite:
      "Vous avez choisi de payer sur place. Présentez votre référence à l'accueil de la convention pour régler et récupérer votre badge.",
    pending:
      "Votre paiement est en cours de traitement. Vous recevrez une confirmation dès sa validation.",
    verifying: "Nous vérifions votre paiement…",
    verifyingHint:
      "Cela peut prendre quelques instants sur réseau mobile. Cette page se met à jour automatiquement, inutile de la rafraîchir.",
    justConfirmed:
      "Paiement confirmé ! Votre place est garantie. Un e-mail de confirmation vous a été envoyé.",
    failed:
      "Le paiement n'a pas abouti. Aucun montant n'a été prélevé. Vous pouvez réessayer.",
    retry: "Réessayer le paiement",
    wire: "Vous avez choisi le virement bancaire. Effectuez le virement en rappelant votre référence d'inscription — votre place est confirmée dès réception.",
    wireDetailsTitle: "Coordonnées bancaires",
    wireDetails:
      "Titulaire : District 130 Toastmasters — COT27 · Banque et IBAN communiqués par e-mail (coordonnées définitives en attente du Comité Budget).",
    delegationLabel: "Délégation",
    backHome: "Retour à l'accueil",
  },
  boutique: {
    title: "Épinglettes officielles",
    subtitle:
      "Réservez vos épinglettes Toastmasters. Elles sont commandées en groupe auprès de Toastmasters International, puis remises en main propre pendant la conférence.",
    fermeeTitre: "Réservations bientôt ouvertes",
    fermeeTexte:
      "Le catalogue est en cours de validation par le comité. Revenez très vite — ou inscrivez-vous à la lettre d'information pour être prévenu·e.",
    recapTitre: "Votre réservation",
    total: "Total",
    reserver: "Réserver fermement",
    envoi: "Envoi…",
    ajouter: "Ajouter",
    retirer: "Retirer",
    prenom: "Prénom",
    nom: "Nom",
    email: "E-mail",
    telephone: "Téléphone",
    club: "Club",
    fermee: "Les réservations sont fermées pour le moment.",
    erreur: "La réservation n'a pas abouti. Rechargez la page et réessayez.",
    merciTitre: "Réservation enregistrée !",
    merciSous: "Vos épinglettes vous attendront à la conférence.",
    refLabel: "Référence de réservation",
    aRegler: "Total à régler à la remise",
    merciNote:
      "Aucun paiement n'est demandé maintenant : vous réglerez au moment de la remise, pendant la conférence. Un e-mail de confirmation vous a été envoyé.",
    retour: "Retour à la boutique",
  },
  newsletter: {
    title: "Ne manquez pas l'ouverture des inscriptions",
    text: "Annonces des intervenants, ouverture du programme, coulisses : recevez l'essentiel de COT27, sans spam.",
    placeholder: "Votre adresse e-mail",
    button: "Me tenir informé·e",
    sending: "Envoi…",
    success: "C'est noté ! Vous serez parmi les premiers informés.",
    error: "Adresse invalide ou erreur réseau — réessayez.",
  },
  magazine: {
    title: "Le Magazine COT27",
    subtitle:
      "Le kiosque officiel de la conférence : portraits, coulisses, destination Bénin. En lecture fluide, pas en PDF.",
    readEdition: "Lire l'édition",
    articlesCount: "articles",
    backToKiosk: "Kiosque",
    backToEdition: "Retour à l'édition",
    toc: "Sommaire",
    readingTime: "min de lecture",
    by: "Par",
    share: "Partager l'article",
    shareWhatsapp: "WhatsApp",
    shareWaLead: "À lire : « {title} » — COT27, du 1er au 8 mai 2027 à Cotonou.",
    linkCopied: "Lien copié !",
    sponsored: "Partenaire de la conférence",
    publishedOn: "Publié le",
    downloadPdf: "Télécharger le PDF",
    otherArticles: "Dans la même édition",
    empty: "Les premières éditions arrivent bientôt.",
  },
  footer: {
    tagline:
      "COT27 — Conférence Annuelle du District 130 Toastmasters International, Cotonou, Bénin.",
    links: "Liens rapides",
    contact: "Contact",
    follow: "Suivez-nous",
    rights: "Tous droits réservés.",
    affiliation:
      "COT27 est la conférence annuelle du District 130 de Toastmasters International. Toastmasters International et son logo sont des marques déposées de Toastmasters International.",
    // Texte imposé par le manuel de marque Toastmasters (p. 34, Website
    // Guidelines) : il doit figurer en bas du site, dans sa formulation
    // exacte. La traduction est fournie à titre de courtoisie.
    tmDisclaimer:
      "The information on this website is for the sole use of Toastmasters' members, for Toastmasters business only. It is not to be used for solicitation and distribution of non-Toastmasters material or information.",
    tmDisclaimerFr:
      "Les informations de ce site sont destinées au seul usage des membres Toastmasters, pour les activités Toastmasters uniquement. Elles ne doivent pas servir à la sollicitation ni à la diffusion de contenus étrangers à Toastmasters.",
    disclaimer:
      "Site non officiel — contenus de démonstration à remplacer par les informations réelles de la convention.",
  },
};

const en: typeof fr = {
  meta: {
    title: "COT27 — District 130 Toastmasters Conference · Cotonou 2027",
    description:
      "COT27: the Annual Conference of Toastmasters District 130 in Cotonou, Benin, May 1–8, 2027. Keynotes, speech contests, workshops and discovering Benin.",
  },
  nav: {
    home: "Home",
    discover: "Discover",
    program: "Program",
    speakers: "Speakers",
    benin: "Benin",
    venue: "Practical info",
    gallery: "Gallery",
    magazine: "Magazine",
    boutique: "Pins",
    register: "Register",
  },
  discover: {
    title: "Discover COT27",
    subtitle:
      "One week, twelve countries, one stage: what the District 130 Annual Conference will change for you.",
    visionKicker: "The vision",
    visionTitle: "Much more than a conference",
    visionText1:
      "COT27 gathers in Cotonou the speakers, leaders and the curious from twelve African countries for eight days of keynotes, contests, workshops and discovering Benin.",
    visionText2:
      "International in execution, African in payment methods and network performance, Beninese at heart: that is this edition's promise.",
    countriesKicker: "District 130",
    countriesTitle: "Twelve countries, two languages, one community",
    countriesNote:
      "The twelve countries of District 130, as published by the District.",
    startKicker: "Where to start?",
    firstTimeCard: "First conference?",
    firstTimeCardText: "What to expect, how to prepare, the glossary to know.",
    employerCard: "Convince my employer",
    employerCardText: "The evidence-based case and the ready-to-send letter.",
    beninCard: "Destination Benin",
    beninCardText: "Ouidah, Ganvié, Abomey, Pendjari: plan the journey around the conference.",
  },
  firstTime: {
    title: "First conference?",
    subtitle:
      "Welcome! Here is everything you need to enjoy COT27 from the very first hour — even if you have never set foot in a Toastmasters club.",
    glossaryTitle: "The little glossary",
    cta: "Reserve my seat",
  },
  employer: {
    title: "Convince my employer",
    subtitle:
      "COT27 is as much a training as a conference. Here is the case — and the letter ready to send.",
    argsKicker: "The case",
    letterKicker: "The template letter",
    letterTitle: "Ready to copy, adapt and send",
    letterHint:
      "Replace the bracketed fields, adjust the tone, and send. Available in French and English via the site's language switcher.",
    copy: "Copy the letter",
    copied: "Letter copied!",
    download: "Download (.txt)",
  },
  benin: {
    title: "Destination Benin",
    subtitle:
      "You do not cross half a continent to see only a conference room. Benin is part of the program.",
    excursionsKicker: "Official excursions",
    excursionsTitle: "Four stops, one story",
    excursionsNote:
      "Transport, bilingual guide and lunch included. Limited seats — bookable with your registration.",
    pratiqueKicker: "Planning the trip",
    pratiqueTitle: "Visa, health, currency, weather",
    stayKicker: "Where to stay",
    stayTitle: "Partner hotels at negotiated rates",
    cultureKicker: "Culture",
    cultureTitle: "Benin tells its story in the magazine",
    cultureText:
      "Heritage, gastronomy, craftsmanship: the “Destination Benin” section of the COT27 Magazine takes you travelling before departure.",
    cultureCta: "Read “Ouidah, Ganvié, Abomey: Benin in three stops”",
  },
  hero: {
    kicker: "Annual Conference · District 130 · 12 countries",
    dates: "May 1 – 8, 2027 · Palais des Congrès, Cotonou · Benin",
    theme: "Dare to Speak, Build the Future",
    subtitle:
      "Eight days of keynotes, speech contests, leadership workshops and discovering Benin, with the best speakers from twelve African countries.",
    cta: "Reserve my seat",
    ctaSecondary: "View program",
    priceFrom: "From {prix} · MTN & Moov Mobile Money",
    countdownTitle: "The conference starts in",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
  },
  stats: {
    liveTag: "Live",
    liveInscrits: "registered",
    liveSuffix: "have already booked their seat for COT27",
    participants: "Expected attendees",
    clubs: "Countries represented",
    speakers: "Speakers",
    workshops: "Workshops & contests",
  },
  about: {
    kicker: "The event",
    title: "Benin's biggest celebration of public speaking",
    p1: "Every year, the District 130 Convention gathers Toastmasters members from Benin and the sub-region for eight days in Cotonou: three conference days from 6 to 8 May, framed by excursions across Benin.",
    p2: "Speech contests in French and English, expert-led workshops, awards ceremony, closing gala: live an experience that will transform the way you communicate and lead.",
    highlights: [
      {
        title: "District contests",
        text: "Finals of the humorous speech, table topics and international speech contests.",
      },
      {
        title: "World-class workshops",
        text: "Hands-on training sessions led by DTMs and international speakers.",
      },
      {
        title: "Gala & awards",
        text: "A gala evening to celebrate the year's most distinguished clubs and members.",
      },
    ],
  },
  programPreview: {
    kicker: "Overview",
    title: "The heart of the conference",
    subtitle:
      "Three intense days, 6–8 May, within a Benin week that starts on the 1st. Excursions take place before or after.",
    seeAll: "Full program",
  },
  speakersPreview: {
    kicker: "They will be there",
    title: "Outstanding speakers",
    seeAll: "All speakers",
  },
  sponsors: {
    kicker: "Partners",
    title: "They support the convention",
    becomeSponsor: "Become a sponsor",
  },
  ctaBanner: {
    title: "Ready to live the experience?",
    text: "Seats are limited. Register now and enjoy the early-bird rate.",
    button: "Register now",
  },
  program: {
    title: "Convention program",
    subtitle:
      "Three days of keynotes, contests and workshops, 6–8 May. The detailed schedule may evolve.",
    day: "Day",
  },
  speakers: {
    title: "Speakers & guests",
    subtitle:
      "Keynote speakers, district officers and guests of honour of COT27, 1–8 May 2027.",
    keynote: "Keynote speaker",
  },
  venue: {
    title: "Practical info",
    subtitle: "Everything you need to prepare your trip to Cotonou.",
    venueTitle: "The venue",
    venueName: "Palais des Congrès de Cotonou",
    venueText:
      "Located in the heart of Cotonou, the Palais des Congrès offers a 1,500-seat auditorium, modern workshop rooms and secure parking.",
    address: "Boulevard de la Marina, Cotonou, Benin",
    hotelsTitle: "Where to stay",
    hotelsText:
      "Negotiated rates are available at partner hotels. Mention “COT27 — District 130” when booking.",
    perNight: "/ night",
    travelTitle: "Getting to Cotonou",
    faqTitle: "Frequently asked questions",
    mapTitle: "Access map",
  },
  gallery: {
    title: "Gallery",
    subtitle: "A look back at previous editions of the convention.",
    edition: "Edition",
  },
  register: {
    title: "Registration",
    subtitle:
      "Choose your pass, fill in the form and pay online by Mobile Money or card.",
    step1: "1. Choose your pass",
    step2: "2. Your details",
    step3: "3. Payment",
    popular: "Popular",
    selectTicket: "Select",
    selectedTicket: "Selected",
    firstName: "First name",
    lastName: "Last name",
    email: "Email address",
    phone: "Phone (WhatsApp)",
    club: "Toastmasters club (if member)",
    clubPlaceholder: "E.g.: Cotonou Toastmasters Club",
    city: "City",
    country: "Country",
    memberType: "You are",
    member: "Toastmasters member",
    guest: "Guest / Non-member",
    paymentMethod: "Payment method",
    payOnline: "Pay online (Mobile Money / Card)",
    payOnlineHint: "Secure payment via FedaPay",
    payOnsite: "Pay on site",
    payOnsiteHint: "Pay at the convention welcome desk",
    total: "Total",
    submit: "Confirm my registration",
    submitting: "Processing…",
    required: "This field is required",
    invalidEmail: "Invalid email address",
    errorGeneric: "Something went wrong. Please try again or contact us.",
    onlineUnavailable:
      "Online payment opens shortly. Your registration is recorded now and you will pay by bank transfer — details will be emailed to you.",
  },
  tunnel: {
    steps: ["Ticket", "Identity", "Summary", "Payment"],
    next: "Continue",
    back: "Back",
    modeTitle: "Who are you registering?",
    modeSolo: "Myself",
    modeSoloHint: "An individual registration",
    modeDelegation: "My delegation",
    modeDelegationHint: "Club or group — volume discount from 5 attendees (−5%), 10 (−10%), 20 (−15%)",
    optionsDelegationNote:
      "Excursion, gala and tote bag are booked individually, by each member, after the delegation is registered.",
    delegationAtLeastOne: "Add at least one delegation member.",
    requiredLegend: "* required fields",
    yourDetails: "Your details",
    emailNotice: "This is where we will send your ticket and your reference.",
    edit: "Edit",
    fixErrors: "Please check the fields flagged above.",
    cgvRequired: "Tick this box to continue.",
    optionsTitle: "Your add-ons",
    optionsHint: "Changeable until April 1, 2027.",
    promoTitle: "Promo code",
    promoPlaceholder: "E.g. DISTRICT130",
    promoApply: "Apply",
    promoApplied: "Code applied",
    promoInvalid: "Unknown or expired code",
    delegationMembers: "Your delegation members",
    delegationMembersHint:
      "First and last name are enough for now — each member will receive a link to complete their profile. You count as the first attendee.",
    delegationRebate: "Delegation discount",
    addMember: "+ Add a member",
    removeMember: "Remove",
    memberN: "Member",
    responsableTitle: "Delegation lead",
    recapBillet: "Pass",
    recapParticipants: "attendees",
    recapOptions: "Add-ons",
    recapPromo: "Promo code",
    recapSubtotal: "Subtotal",
    cgv: "I accept the terms of sale and the cancellation policy.",
    cancelPolicy:
      "Free cancellation until March 1, 2027 · 50% refund until April 1, 2027 · ticket transferable at any time. (Policy to be confirmed by the Budget Committee.)",
    payTitle: "Choose your payment method",
    payMtn: "MTN Mobile Money",
    payMoov: "Moov Mobile Money",
    payCard: "Bank card",
    payWire: "Bank transfer",
    payFedapayHint: "Secure payment via FedaPay",
    payWireHint: "Bank details shown after confirmation",
    resumeText: "Your progress is saved — keep this link to resume later:",
    resumeCopy: "Copy",
    resumeCopied: "Copied!",
    resumeLoaded: "Progress restored — pick up where you left off.",
    totalLabel: "Total",
    perPerson: "per person",
    participantsLabel: "attendees",
    payNow: "Pay",
    finalize: "Complete my registration",
    reassureTitle: "What happens next",
    reassureStep1: "You land on FedaPay's secure payment page",
    reassureMomo2: "A request arrives on your MTN or Moov phone",
    reassureMomo3: "You approve with your Mobile Money PIN",
    reassureCard2: "You enter your card details",
    reassureCard3: "You confirm the payment (3-D Secure)",
    reassureStep4: "You receive a confirmation email with your reference",
    reassureFoot: "Encrypted payment · nothing is charged without your approval",
  },
  thanks: {
    title: "Registration confirmed!",
    subtitle: "Thank you! Your seat for COT27 is reserved.",
    titlePending: "Registration recorded",
    subtitlePending: "Your payment is being verified.",
    titleFailed: "Payment did not go through",
    subtitleFailed:
      "Your seat is not reserved yet. Nothing was charged.",
    shareWhatsapp: "Send my reference on WhatsApp",
    shareWaText: "My COT27 registration reference:",
    refLabel: "Registration reference",
    paid: "Your payment has been received. A confirmation email will be sent to you.",
    onsite:
      "You chose to pay on site. Show your reference at the convention welcome desk to pay and collect your badge.",
    pending:
      "Your payment is being processed. You will receive a confirmation once validated.",
    verifying: "We're checking your payment…",
    verifyingHint:
      "This may take a moment on mobile networks. This page updates automatically — no need to refresh.",
    justConfirmed:
      "Payment confirmed! Your seat is secured. A confirmation email is on its way.",
    failed:
      "The payment didn't go through. Nothing was charged. You can try again.",
    retry: "Retry payment",
    wire: "You chose bank transfer. Make the transfer quoting your registration reference — your seat is confirmed upon receipt.",
    wireDetailsTitle: "Bank details",
    wireDetails:
      "Account holder: District 130 Toastmasters — COT27 · Bank and IBAN sent by email (final details pending the Budget Committee).",
    delegationLabel: "Delegation",
    backHome: "Back to home",
  },
  boutique: {
    title: "Official pins",
    subtitle:
      "Reserve your Toastmasters pins. They are ordered as one group order from Toastmasters International, then handed over in person during the conference.",
    fermeeTitre: "Reservations opening soon",
    fermeeTexte:
      "The catalogue is being validated by the committee. Check back soon — or join the newsletter to be notified.",
    recapTitre: "Your reservation",
    total: "Total",
    reserver: "Reserve firmly",
    envoi: "Sending…",
    ajouter: "Add",
    retirer: "Remove",
    prenom: "First name",
    nom: "Last name",
    email: "Email",
    telephone: "Phone",
    club: "Club",
    fermee: "Reservations are closed for now.",
    erreur: "The reservation did not go through. Reload the page and try again.",
    merciTitre: "Reservation recorded!",
    merciSous: "Your pins will be waiting for you at the conference.",
    refLabel: "Reservation reference",
    aRegler: "Total due on collection",
    merciNote:
      "No payment is required now: you will pay when you collect them, during the conference. A confirmation email has been sent to you.",
    retour: "Back to the shop",
  },
  newsletter: {
    title: "Don't miss the registration opening",
    text: "Speaker announcements, programme releases, behind the scenes: get the essentials of COT27, no spam.",
    placeholder: "Your email address",
    button: "Keep me posted",
    sending: "Sending…",
    success: "Noted! You will be among the first to know.",
    error: "Invalid address or network error — please try again.",
  },
  magazine: {
    title: "The COT27 Magazine",
    subtitle:
      "The conference's official newsstand: portraits, behind the scenes, destination Benin. Fluid reading, not a PDF.",
    readEdition: "Read the edition",
    articlesCount: "articles",
    backToKiosk: "Newsstand",
    backToEdition: "Back to the edition",
    toc: "Contents",
    readingTime: "min read",
    by: "By",
    share: "Share article",
    shareWhatsapp: "WhatsApp",
    shareWaLead: "Worth reading: “{title}” — COT27, 1–8 May 2027 in Cotonou.",
    linkCopied: "Link copied!",
    sponsored: "Conference partner",
    publishedOn: "Published on",
    downloadPdf: "Download PDF",
    otherArticles: "More from this edition",
    empty: "The first editions are coming soon.",
  },
  footer: {
    tagline:
      "COT27 — Annual Conference of Toastmasters International District 130, Cotonou, Benin.",
    links: "Quick links",
    contact: "Contact",
    follow: "Follow us",
    rights: "All rights reserved.",
    affiliation:
      "COT27 is the annual conference of Toastmasters International District 130. Toastmasters International and its logo are registered trademarks of Toastmasters International.",
    // Mandated verbatim by the Toastmasters Brand Manual (p. 34).
    tmDisclaimer:
      "The information on this website is for the sole use of Toastmasters' members, for Toastmasters business only. It is not to be used for solicitation and distribution of non-Toastmasters material or information.",
    // Pas de traduction en anglais : le texte imposé est déjà en anglais.
    tmDisclaimerFr: "",
    disclaimer:
      "Unofficial site — demo content to be replaced with the convention's real information.",
  },
};

const dictionaries = { fr, en } as const;

export function getDict(locale: Locale) {
  return dictionaries[locale];
}

export type Dict = ReturnType<typeof getDict>;
