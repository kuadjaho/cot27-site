import type { Locale } from "./i18n";

export type Localized = Record<Locale, string>;

// ---------------------------------------------------------------------------
// Convention — informations générales (PLACEHOLDER : à remplacer)
// ---------------------------------------------------------------------------
export const convention = {
  // Date de début, utilisée pour le compte à rebours
  startDate: "2026-11-20T09:00:00+01:00",
  endDate: "2026-11-22T22:00:00+01:00",
  city: "Cotonou",
  venue: "Palais des Congrès de Cotonou",
  email: "convention@d130toastmasters.org",
  phone: "+229 01 97 00 00 00",
};

// ---------------------------------------------------------------------------
// Billetterie
// ---------------------------------------------------------------------------
export type Ticket = {
  key: string;
  name: Localized;
  price: number; // FCFA
  popular?: boolean;
  features: { fr: string[]; en: string[] };
};

export const tickets: Ticket[] = [
  {
    key: "member-early",
    name: { fr: "Pass Membre — Early Bird", en: "Member Pass — Early Bird" },
    price: 50000,
    popular: true,
    features: {
      fr: [
        "Accès aux 3 jours de convention",
        "Tous les ateliers et concours",
        "Pauses café et déjeuners",
        "Kit du participant",
      ],
      en: [
        "Access to all 3 convention days",
        "All workshops and contests",
        "Coffee breaks and lunches",
        "Attendee kit",
      ],
    },
  },
  {
    key: "guest",
    name: { fr: "Pass Invité / Non-membre", en: "Guest / Non-member Pass" },
    price: 65000,
    features: {
      fr: [
        "Accès aux 3 jours de convention",
        "Tous les ateliers et concours",
        "Pauses café et déjeuners",
        "Kit du participant",
      ],
      en: [
        "Access to all 3 convention days",
        "All workshops and contests",
        "Coffee breaks and lunches",
        "Attendee kit",
      ],
    },
  },
  {
    key: "gala",
    name: { fr: "Soirée de Gala uniquement", en: "Gala Dinner only" },
    price: 30000,
    features: {
      fr: [
        "Dîner de gala du samedi soir",
        "Cérémonie de remise des prix",
        "Soirée dansante",
      ],
      en: ["Saturday gala dinner", "Awards ceremony", "Dance party"],
    },
  },
  {
    key: "vip",
    name: { fr: "Pass VIP intégral", en: "All-inclusive VIP Pass" },
    price: 100000,
    features: {
      fr: [
        "Tout le Pass Membre + Gala inclus",
        "Placement prioritaire",
        "Dîner avec les conférenciers",
        "Photo officielle",
      ],
      en: [
        "Full Member Pass + Gala included",
        "Priority seating",
        "Dinner with the keynote speakers",
        "Official photo",
      ],
    },
  },
];

export function getTicket(key: string) {
  return tickets.find((t) => t.key === key);
}

export function formatFCFA(amount: number, locale: Locale) {
  return (
    new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US").format(amount) +
    " FCFA"
  );
}

// ---------------------------------------------------------------------------
// Programme
// ---------------------------------------------------------------------------
export type ScheduleItem = {
  time: string;
  title: Localized;
  description?: Localized;
  kind: "keynote" | "workshop" | "contest" | "ceremony" | "social" | "break";
};

export type ScheduleDay = {
  date: Localized;
  label: Localized;
  items: ScheduleItem[];
};

export const schedule: ScheduleDay[] = [
  {
    date: { fr: "Vendredi 20 novembre", en: "Friday, November 20" },
    label: { fr: "Ouverture & Concours", en: "Opening & Contests" },
    items: [
      {
        time: "09:00",
        title: { fr: "Accueil & enregistrement", en: "Welcome & registration" },
        kind: "break",
      },
      {
        time: "10:00",
        title: { fr: "Cérémonie d'ouverture", en: "Opening ceremony" },
        description: {
          fr: "Défilé des clubs, hymnes et discours du Directeur de District.",
          en: "Parade of clubs, anthems and District Director's address.",
        },
        kind: "ceremony",
      },
      {
        time: "11:30",
        title: {
          fr: "Keynote : « Oser la parole »",
          en: "Keynote: “Dare to Speak”",
        },
        description: {
          fr: "Conférence d'ouverture par notre invitée d'honneur.",
          en: "Opening keynote by our guest of honor.",
        },
        kind: "keynote",
      },
      {
        time: "13:00",
        title: { fr: "Déjeuner networking", en: "Networking lunch" },
        kind: "break",
      },
      {
        time: "14:30",
        title: {
          fr: "Concours de discours humoristique (FR)",
          en: "Humorous speech contest (FR)",
        },
        kind: "contest",
      },
      {
        time: "16:30",
        title: {
          fr: "Concours d'improvisation (EN)",
          en: "Table Topics contest (EN)",
        },
        kind: "contest",
      },
      {
        time: "19:00",
        title: { fr: "Cocktail de bienvenue", en: "Welcome cocktail" },
        kind: "social",
      },
    ],
  },
  {
    date: { fr: "Samedi 21 novembre", en: "Saturday, November 21" },
    label: { fr: "Ateliers & Gala", en: "Workshops & Gala" },
    items: [
      {
        time: "09:00",
        title: {
          fr: "Atelier : Leadership au féminin",
          en: "Workshop: Women in leadership",
        },
        kind: "workshop",
      },
      {
        time: "09:00",
        title: {
          fr: "Atelier : Storytelling percutant",
          en: "Workshop: Powerful storytelling",
        },
        kind: "workshop",
      },
      {
        time: "11:00",
        title: {
          fr: "Atelier : De l'orateur au coach",
          en: "Workshop: From speaker to coach",
        },
        kind: "workshop",
      },
      {
        time: "13:00",
        title: { fr: "Déjeuner", en: "Lunch" },
        kind: "break",
      },
      {
        time: "14:30",
        title: {
          fr: "Concours de discours d'inspiration (FR)",
          en: "International speech contest (FR)",
        },
        description: {
          fr: "La grande finale du district — le vainqueur représentera le D130.",
          en: "The district grand final — the winner will represent D130.",
        },
        kind: "contest",
      },
      {
        time: "17:00",
        title: {
          fr: "Assemblée du Conseil de District",
          en: "District Council meeting",
        },
        kind: "ceremony",
      },
      {
        time: "20:00",
        title: {
          fr: "Soirée de Gala & remise des prix",
          en: "Gala dinner & awards ceremony",
        },
        description: {
          fr: "Tenue de soirée exigée. Dîner, distinctions et soirée dansante.",
          en: "Formal attire required. Dinner, awards and dance party.",
        },
        kind: "social",
      },
    ],
  },
  {
    date: { fr: "Dimanche 22 novembre", en: "Sunday, November 22" },
    label: { fr: "Formation & Clôture", en: "Training & Closing" },
    items: [
      {
        time: "09:30",
        title: {
          fr: "Masterclass : Réussir son mandat de leader",
          en: "Masterclass: Succeeding as a club leader",
        },
        kind: "workshop",
      },
      {
        time: "11:00",
        title: {
          fr: "Keynote de clôture : « Bâtir l'avenir »",
          en: "Closing keynote: “Build the Future”",
        },
        kind: "keynote",
      },
      {
        time: "12:30",
        title: {
          fr: "Cérémonie de clôture & passation",
          en: "Closing ceremony & handover",
        },
        kind: "ceremony",
      },
      {
        time: "13:30",
        title: { fr: "Déjeuner d'au revoir", en: "Farewell lunch" },
        kind: "social",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Intervenants (PLACEHOLDER)
// ---------------------------------------------------------------------------
export type Speaker = {
  name: string;
  title: Localized;
  bio: Localized;
  keynote?: boolean;
  initials: string;
  hue: number; // pour l'avatar dégradé
};

export const speakers: Speaker[] = [
  {
    name: "Aïchatou Dossou, DTM",
    title: { fr: "Conférencière principale", en: "Keynote speaker" },
    bio: {
      fr: "Distinguished Toastmaster, coach en leadership et fondatrice de trois clubs au Bénin. Elle ouvrira la convention avec sa keynote « Oser la parole ».",
      en: "Distinguished Toastmaster, leadership coach and founder of three clubs in Benin. She will open the convention with her keynote “Dare to Speak”.",
    },
    keynote: true,
    initials: "AD",
    hue: 210,
  },
  {
    name: "Kwame Mensah, DTM",
    title: { fr: "Conférencier de clôture", en: "Closing keynote" },
    bio: {
      fr: "Champion régional d'art oratoire et entrepreneur, il partagera sa vision « Bâtir l'avenir » pour la jeunesse ouest-africaine.",
      en: "Regional public speaking champion and entrepreneur, he will share his vision “Build the Future” for West African youth.",
    },
    keynote: true,
    initials: "KM",
    hue: 350,
  },
  {
    name: "Élodie Hounkpatin",
    title: { fr: "Directrice de District 130", en: "District 130 Director" },
    bio: {
      fr: "À la tête du District 130, elle pilote la croissance des clubs Toastmasters au Bénin et dans la sous-région.",
      en: "At the head of District 130, she drives the growth of Toastmasters clubs in Benin and the sub-region.",
    },
    initials: "EH",
    hue: 45,
  },
  {
    name: "Dr Rachidi Alao",
    title: {
      fr: "Atelier « Storytelling percutant »",
      en: "Workshop “Powerful storytelling”",
    },
    bio: {
      fr: "Enseignant-chercheur en communication, il forme depuis 15 ans les cadres et dirigeants à l'art du récit.",
      en: "Communication professor and researcher, he has trained executives in the art of storytelling for 15 years.",
    },
    initials: "RA",
    hue: 160,
  },
  {
    name: "Fatoumata Diallo",
    title: {
      fr: "Atelier « Leadership au féminin »",
      en: "Workshop “Women in leadership”",
    },
    bio: {
      fr: "Présidente de division et mentore, elle accompagne les femmes leaders dans toute l'Afrique francophone.",
      en: "Division director and mentor, she supports women leaders across French-speaking Africa.",
    },
    initials: "FD",
    hue: 280,
  },
  {
    name: "Jean-Baptiste Agossou",
    title: {
      fr: "Maître de cérémonie",
      en: "Master of ceremonies",
    },
    bio: {
      fr: "Voix bien connue des conventions du district, il animera les trois jours avec énergie et humour.",
      en: "A well-known voice of district conventions, he will host the three days with energy and humor.",
    },
    initials: "JA",
    hue: 20,
  },
];

// ---------------------------------------------------------------------------
// Hôtels partenaires (PLACEHOLDER)
// ---------------------------------------------------------------------------
export type Hotel = {
  name: string;
  distance: Localized;
  price: number; // FCFA / nuit
  stars: number;
};

export const hotels: Hotel[] = [
  {
    name: "Hôtel de la Marina",
    distance: { fr: "5 min à pied du Palais", en: "5 min walk from the venue" },
    price: 45000,
    stars: 4,
  },
  {
    name: "Résidence Les Cocotiers",
    distance: { fr: "10 min en voiture", en: "10 min by car" },
    price: 30000,
    stars: 3,
  },
  {
    name: "Bénin Royal Hôtel",
    distance: { fr: "15 min en voiture", en: "15 min by car" },
    price: 55000,
    stars: 4,
  },
];

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------
export type Faq = { q: Localized; a: Localized };

export const faqs: Faq[] = [
  {
    q: {
      fr: "Dois-je être membre Toastmasters pour participer ?",
      en: "Do I need to be a Toastmasters member to attend?",
    },
    a: {
      fr: "Non ! La convention est ouverte à tous. Les invités et curieux sont les bienvenus avec le Pass Invité.",
      en: "No! The convention is open to everyone. Guests are welcome with the Guest Pass.",
    },
  },
  {
    q: {
      fr: "Comment puis-je payer mon inscription ?",
      en: "How can I pay for my registration?",
    },
    a: {
      fr: "En ligne par Mobile Money (MTN, Moov) ou carte bancaire, ou en espèces à l'accueil de la convention.",
      en: "Online by Mobile Money (MTN, Moov) or bank card, or in cash at the convention welcome desk.",
    },
  },
  {
    q: {
      fr: "Ai-je besoin d'un visa pour venir au Bénin ?",
      en: "Do I need a visa to travel to Benin?",
    },
    a: {
      fr: "Les ressortissants de la CEDEAO n'ont pas besoin de visa. Pour les autres pays, l'e-Visa s'obtient en ligne en 48 h sur evisa.gouv.bj.",
      en: "ECOWAS nationals do not need a visa. Other nationalities can get an e-Visa online within 48 h at evisa.gouv.bj.",
    },
  },
  {
    q: {
      fr: "Le déjeuner est-il inclus dans le pass ?",
      en: "Is lunch included in the pass?",
    },
    a: {
      fr: "Oui, les pauses café et les déjeuners des trois jours sont inclus dans les pass Membre, Invité et VIP.",
      en: "Yes, coffee breaks and lunches for all three days are included in the Member, Guest and VIP passes.",
    },
  },
  {
    q: {
      fr: "Puis-je me faire rembourser en cas d'empêchement ?",
      en: "Can I get a refund if I can no longer attend?",
    },
    a: {
      fr: "Les inscriptions sont remboursables à 100 % jusqu'à 30 jours avant l'événement, puis transférables à un autre participant.",
      en: "Registrations are 100% refundable up to 30 days before the event, then transferable to another attendee.",
    },
  },
];

// ---------------------------------------------------------------------------
// Voyage
// ---------------------------------------------------------------------------
export const travelTips: { title: Localized; text: Localized; icon: string }[] =
  [
    {
      icon: "✈️",
      title: { fr: "En avion", en: "By plane" },
      text: {
        fr: "L'aéroport international Cardinal Bernardin Gantin (COO) est à 20 min du Palais des Congrès. Taxis et VTC disponibles.",
        en: "Cardinal Bernardin Gantin International Airport (COO) is 20 min from the venue. Taxis and ride-hailing available.",
      },
    },
    {
      icon: "🚌",
      title: { fr: "Par la route", en: "By road" },
      text: {
        fr: "Des navettes seront organisées depuis Lomé, Lagos et Porto-Novo. Détails communiqués aux inscrits.",
        en: "Shuttles will be organized from Lomé, Lagos and Porto-Novo. Details shared with registered attendees.",
      },
    },
    {
      icon: "🛂",
      title: { fr: "Formalités", en: "Formalities" },
      text: {
        fr: "e-Visa en ligne pour les non-CEDEAO. Pensez à votre carnet de vaccination (fièvre jaune).",
        en: "Online e-Visa for non-ECOWAS nationals. Bring your vaccination card (yellow fever).",
      },
    },
  ];

// ---------------------------------------------------------------------------
// Galerie (PLACEHOLDER — remplacer par de vraies photos dans /public/gallery)
// ---------------------------------------------------------------------------
export type GalleryEdition = {
  year: number;
  city: string;
  theme: Localized;
  photos: { caption: Localized; hue: number }[];
};

export const galleryEditions: GalleryEdition[] = [
  {
    year: 2025,
    city: "Cotonou",
    theme: { fr: "Ensemble, plus loin", en: "Together, further" },
    photos: [
      { caption: { fr: "Cérémonie d'ouverture", en: "Opening ceremony" }, hue: 210 },
      { caption: { fr: "Finale du concours de discours", en: "Speech contest final" }, hue: 350 },
      { caption: { fr: "Atelier leadership", en: "Leadership workshop" }, hue: 45 },
      { caption: { fr: "Soirée de gala", en: "Gala dinner" }, hue: 280 },
      { caption: { fr: "Remise des prix", en: "Awards ceremony" }, hue: 160 },
      { caption: { fr: "Photo de famille", en: "Group photo" }, hue: 20 },
    ],
  },
  {
    year: 2024,
    city: "Porto-Novo",
    theme: { fr: "La parole en action", en: "Words into action" },
    photos: [
      { caption: { fr: "Défilé des clubs", en: "Parade of clubs" }, hue: 190 },
      { caption: { fr: "Concours d'improvisation", en: "Table Topics contest" }, hue: 320 },
      { caption: { fr: "Networking", en: "Networking" }, hue: 60 },
      { caption: { fr: "Gala de clôture", en: "Closing gala" }, hue: 250 },
    ],
  },
  {
    year: 2023,
    city: "Abomey-Calavi",
    theme: { fr: "Oser grandir", en: "Dare to grow" },
    photos: [
      { caption: { fr: "Keynote d'ouverture", en: "Opening keynote" }, hue: 230 },
      { caption: { fr: "Ateliers pratiques", en: "Hands-on workshops" }, hue: 130 },
      { caption: { fr: "Célébration des lauréats", en: "Winners celebration" }, hue: 10 },
      { caption: { fr: "Clôture", en: "Closing" }, hue: 300 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Sponsors (PLACEHOLDER)
// ---------------------------------------------------------------------------
export const sponsors: { name: string; tier: "gold" | "silver" }[] = [
  { name: "Bénin Télécom", tier: "gold" },
  { name: "Banque Atlantique", tier: "gold" },
  { name: "Air Côte d'Ivoire", tier: "silver" },
  { name: "Sobebra", tier: "silver" },
  { name: "La Roche Hôtels", tier: "silver" },
  { name: "Canal+ Bénin", tier: "silver" },
];
