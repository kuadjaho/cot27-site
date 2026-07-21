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
    program: "Programme",
    speakers: "Intervenants",
    venue: "Infos pratiques",
    gallery: "Galerie",
    magazine: "Magazine",
    register: "S'inscrire",
  },
  hero: {
    kicker: "Conférence annuelle · District 130 · 12 pays",
    dates: "1er – 8 mai 2027 · Palais des Congrès, Cotonou · Bénin",
    theme: "Oser la parole, bâtir l'avenir",
    subtitle:
      "Huit jours de keynotes, de concours d'art oratoire, d'ateliers de leadership et de découverte du Bénin, avec les meilleurs orateurs de douze pays d'Afrique.",
    cta: "Réserver ma place",
    ctaSecondary: "Voir le programme",
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
  },
  about: {
    kicker: "L'événement",
    title: "La plus grande célébration de l'art oratoire au Bénin",
    p1: "Chaque année, la Convention du District 130 rassemble les membres Toastmasters du Bénin et de la sous-région pour trois jours d'apprentissage, de compétition et de célébration.",
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
    title: "Trois jours intenses",
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
      "Trois jours de conférences, concours et ateliers. Le programme détaillé est susceptible d'évoluer.",
    day: "Jour",
  },
  speakers: {
    title: "Intervenants & invités",
    subtitle:
      "Conférenciers, officiels du district et invités d'honneur de la Convention 2026.",
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
      "Des tarifs négociés sont disponibles dans les hôtels partenaires. Mentionnez « Convention D130 » lors de votre réservation.",
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
      "Choisissez votre pass, remplissez le formulaire et réglez en ligne par Mobile Money ou carte bancaire — ou sur place.",
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
      "Le paiement en ligne n'est pas encore activé — votre inscription sera enregistrée avec paiement sur place.",
  },
  thanks: {
    title: "Inscription confirmée !",
    subtitle: "Merci ! Votre place pour COT27 est réservée.",
    refLabel: "Référence d'inscription",
    paid: "Votre paiement a bien été reçu. Un e-mail de confirmation vous sera envoyé.",
    onsite:
      "Vous avez choisi de payer sur place. Présentez votre référence à l'accueil de la convention pour régler et récupérer votre badge.",
    pending:
      "Votre paiement est en cours de traitement. Vous recevrez une confirmation dès sa validation.",
    backHome: "Retour à l'accueil",
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
    program: "Program",
    speakers: "Speakers",
    venue: "Practical info",
    gallery: "Gallery",
    magazine: "Magazine",
    register: "Register",
  },
  hero: {
    kicker: "Annual Conference · District 130 · 12 countries",
    dates: "May 1 – 8, 2027 · Palais des Congrès, Cotonou · Benin",
    theme: "Dare to Speak, Build the Future",
    subtitle:
      "Eight days of keynotes, speech contests, leadership workshops and discovering Benin, with the best speakers from twelve African countries.",
    cta: "Reserve my seat",
    ctaSecondary: "View program",
    countdownTitle: "The conference starts in",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
  },
  stats: {
    participants: "Expected attendees",
    clubs: "Countries represented",
    speakers: "Speakers",
    workshops: "Workshops & contests",
  },
  about: {
    kicker: "The event",
    title: "Benin's biggest celebration of public speaking",
    p1: "Every year, the District 130 Convention gathers Toastmasters members from Benin and the sub-region for three days of learning, competition and celebration.",
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
    title: "Three intense days",
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
      "Three days of keynotes, contests and workshops. The detailed schedule may evolve.",
    day: "Day",
  },
  speakers: {
    title: "Speakers & guests",
    subtitle:
      "Keynote speakers, district officers and guests of honor of the 2026 Convention.",
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
      "Negotiated rates are available at partner hotels. Mention “D130 Convention” when booking.",
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
      "Choose your pass, fill in the form and pay online by Mobile Money or card — or on site.",
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
      "Online payment is not enabled yet — your registration will be saved with on-site payment.",
  },
  thanks: {
    title: "Registration confirmed!",
    subtitle: "Thank you! Your seat for COT27 is reserved.",
    refLabel: "Registration reference",
    paid: "Your payment has been received. A confirmation email will be sent to you.",
    onsite:
      "You chose to pay on site. Show your reference at the convention welcome desk to pay and collect your badge.",
    pending:
      "Your payment is being processed. You will receive a confirmation once validated.",
    backHome: "Back to home",
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
    disclaimer:
      "Unofficial site — demo content to be replaced with the convention's real information.",
  },
};

const dictionaries = { fr, en } as const;

export function getDict(locale: Locale) {
  return dictionaries[locale];
}

export type Dict = ReturnType<typeof getDict>;
