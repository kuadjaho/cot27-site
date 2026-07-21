import type { Locale } from "./i18n";

export type Localized = Record<Locale, string>;

// ---------------------------------------------------------------------------
// Convention — informations générales (PLACEHOLDER : à remplacer)
// ---------------------------------------------------------------------------
export const convention = {
  // COT27 — Conférence Annuelle du District 130, Cotonou, 1er–8 mai 2027
  startDate: "2027-05-01T09:00:00+01:00",
  endDate: "2027-05-08T22:00:00+01:00",
  city: "Cotonou",
  venue: "Palais des Congrès de Cotonou",
  email: "contact@cot27.org",
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

// Catégories alignées sur le §5.2 du cahier des spécifications.
// TARIFS PLACEHOLDER — à valider par le Comité Budget, Finances et Ventes.
export const tickets: Ticket[] = [
  {
    key: "early",
    name: { fr: "Early Bird", en: "Early Bird" },
    price: 75000,
    popular: true,
    features: {
      fr: [
        "Accès à toute la conférence",
        "Ateliers, keynotes et concours",
        "Pauses café et déjeuners",
        "Kit du participant",
      ],
      en: [
        "Access to the full conference",
        "Workshops, keynotes and contests",
        "Coffee breaks and lunches",
        "Attendee kit",
      ],
    },
  },
  {
    key: "standard",
    name: { fr: "Standard", en: "Standard" },
    price: 95000,
    features: {
      fr: [
        "Accès à toute la conférence",
        "Ateliers, keynotes et concours",
        "Pauses café et déjeuners",
        "Kit du participant",
      ],
      en: [
        "Access to the full conference",
        "Workshops, keynotes and contests",
        "Coffee breaks and lunches",
        "Attendee kit",
      ],
    },
  },
  {
    key: "etudiant",
    name: { fr: "Étudiant", en: "Student" },
    price: 40000,
    features: {
      fr: [
        "Accès à toute la conférence",
        "Sur justificatif étudiant",
        "Pauses café et déjeuners",
      ],
      en: [
        "Access to the full conference",
        "Valid student ID required",
        "Coffee breaks and lunches",
      ],
    },
  },
  {
    key: "vip",
    name: { fr: "VIP intégral", en: "All-inclusive VIP" },
    price: 150000,
    features: {
      fr: [
        "Tout le pass Standard + Gala inclus",
        "Placement prioritaire",
        "Dîner avec les conférenciers",
        "Excursion Ouidah ou Ganvié offerte",
      ],
      en: [
        "Full Standard pass + Gala included",
        "Priority seating",
        "Dinner with the keynote speakers",
        "Complimentary Ouidah or Ganvié excursion",
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

// Cœur de conférence (le programme complet du 1er au 8 mai — arrivées,
// excursions, formations — sera fourni par le Comité Scientifique).
export const schedule: ScheduleDay[] = [
  {
    date: { fr: "Jeudi 6 mai 2027", en: "Thursday, May 6, 2027" },
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
    date: { fr: "Vendredi 7 mai 2027", en: "Friday, May 7, 2027" },
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
    date: { fr: "Samedi 8 mai 2027", en: "Saturday, May 8, 2027" },
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
    year: 2026,
    city: "Libreville — LBV26",
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
// Découvrir — pays du District 130 (8 nommés au cahier des charges ; le
// district en compte 12 — compléter la liste avec le Comité Communication)
// ---------------------------------------------------------------------------
export const countries: { flag: string; name: Localized }[] = [
  { flag: "🇧🇯", name: { fr: "Bénin", en: "Benin" } },
  { flag: "🇧🇫", name: { fr: "Burkina Faso", en: "Burkina Faso" } },
  { flag: "🇨🇲", name: { fr: "Cameroun", en: "Cameroon" } },
  { flag: "🇨🇬", name: { fr: "Congo", en: "Congo" } },
  { flag: "🇨🇩", name: { fr: "RD Congo", en: "DR Congo" } },
  { flag: "🇬🇦", name: { fr: "Gabon", en: "Gabon" } },
  { flag: "🇳🇬", name: { fr: "Nigeria", en: "Nigeria" } },
  { flag: "🇹🇩", name: { fr: "Tchad", en: "Chad" } },
];

// ---------------------------------------------------------------------------
// Première conférence ? — repères pour les nouveaux participants
// ---------------------------------------------------------------------------
export const firstTimeSteps: { icon: string; title: Localized; text: Localized }[] = [
  {
    icon: "🎟️",
    title: { fr: "Choisissez votre pass", en: "Choose your pass" },
    text: {
      fr: "Membre ou non, tout le monde est bienvenu. Le pass donne accès aux keynotes, ateliers, concours et pauses networking. Le gala et les excursions sont des options.",
      en: "Member or not, everyone is welcome. The pass covers keynotes, workshops, contests and networking breaks. The gala and excursions are add-ons.",
    },
  },
  {
    icon: "🗓️",
    title: { fr: "Composez votre semaine", en: "Build your week" },
    text: {
      fr: "Huit jours, mais un cœur de conférence sur trois : arrivez pour les concours, restez pour le gala. Les excursions se placent avant ou après.",
      en: "Eight days, with a three-day conference core: arrive for the contests, stay for the gala. Excursions fit before or after.",
    },
  },
  {
    icon: "🤝",
    title: { fr: "Venez pour les gens", en: "Come for the people" },
    text: {
      fr: "Une conférence Toastmasters, c'est 450 personnes qui applaudissent vos premiers pas. Personne ne reste seul plus de cinq minutes.",
      en: "A Toastmasters conference is 450 people cheering your first steps. Nobody stays alone for more than five minutes.",
    },
  },
  {
    icon: "👔",
    title: { fr: "Prévoyez deux tenues", en: "Pack two outfits" },
    text: {
      fr: "Tenue professionnelle décontractée en journée, tenue de soirée pour le gala du samedi. En mai à Cotonou : léger, respirant, un parapluie.",
      en: "Business casual by day, formal attire for the Saturday gala. May in Cotonou: light, breathable, plus an umbrella.",
    },
  },
];

export const glossary: { term: string; def: Localized }[] = [
  {
    term: "Table Topics",
    def: {
      fr: "Concours d'improvisation : 1 à 2 minutes sur un sujet découvert sur scène.",
      en: "Impromptu speaking contest: 1–2 minutes on a topic revealed on stage.",
    },
  },
  {
    term: "DTM",
    def: {
      fr: "Distinguished Toastmaster — la plus haute distinction du parcours éducatif.",
      en: "Distinguished Toastmaster — the highest award in the educational program.",
    },
  },
  {
    term: "District 130",
    def: {
      fr: "La région Toastmasters qui regroupe les clubs de 12 pays d'Afrique francophone et anglophone.",
      en: "The Toastmasters region gathering clubs from 12 French- and English-speaking African countries.",
    },
  },
  {
    term: "Business Meeting",
    def: {
      fr: "L'assemblée du district : votes, budgets et élection des futurs dirigeants.",
      en: "The district assembly: votes, budgets and election of future leaders.",
    },
  },
];

// ---------------------------------------------------------------------------
// Convaincre mon employeur — argumentaire + lettre-type (§3.2 A-4)
// ---------------------------------------------------------------------------
export const employerArguments: { icon: string; title: Localized; text: Localized }[] = [
  {
    icon: "📈",
    title: { fr: "Un retour direct sur le poste", en: "Direct return on the job" },
    text: {
      fr: "Prise de parole, animation de réunion, feedback structuré : les ateliers travaillent des compétences utilisées dès le lundi suivant.",
      en: "Public speaking, meeting facilitation, structured feedback: the workshops train skills used the very next Monday.",
    },
  },
  {
    icon: "🌍",
    title: { fr: "Un réseau de 12 pays", en: "A 12-country network" },
    text: {
      fr: "450 cadres, entrepreneurs et leaders d'Afrique de l'Ouest et centrale réunis au même endroit pendant une semaine.",
      en: "450 executives, entrepreneurs and leaders from West and Central Africa gathered in one place for a week.",
    },
  },
  {
    icon: "💼",
    title: { fr: "Un coût maîtrisé", en: "A controlled cost" },
    text: {
      fr: "Pass à partir de 75 000 FCFA, tarifs hôteliers négociés, déjeuners inclus : moins cher qu'une formation classique de deux jours.",
      en: "Passes from 75,000 FCFA, negotiated hotel rates, lunches included: cheaper than a standard two-day training.",
    },
  },
];

export const employerLetter: Localized = {
  fr: `Objet : Demande de participation à la Conférence COT27 — Cotonou, 1er–8 mai 2027

Madame, Monsieur,

Je souhaite participer à la Conférence Annuelle du District 130 Toastmasters (COT27), qui se tiendra au Palais des Congrès de Cotonou du 1er au 8 mai 2027.

Cette conférence internationale réunit 450 professionnels venus de 12 pays autour d'ateliers de communication, de leadership et de prise de parole en public, animés par des formateurs certifiés et des conférenciers internationaux.

Concrètement, cette participation apportera à notre équipe :
- des compétences immédiatement applicables (présentations, animation de réunions, feedback) ;
- un réseau professionnel régional dans 12 pays d'Afrique ;
- une montée en autonomie sur la conduite de projets, par la pratique du leadership Toastmasters.

Le coût de participation (pass conférence à partir de 75 000 FCFA, hébergement à tarif négocié) reste inférieur à celui d'une formation professionnelle classique de deux jours, pour une semaine complète de développement.

Je vous propose d'en discuter et reste à votre disposition pour préciser le programme.

Cordialement,
[Votre nom]`,
  en: `Subject: Request to attend the COT27 Conference — Cotonou, May 1–8, 2027

Dear [Manager's name],

I would like to attend the Annual Conference of Toastmasters District 130 (COT27), held at the Palais des Congrès in Cotonou from May 1 to 8, 2027.

This international conference gathers 450 professionals from 12 countries for workshops on communication, leadership and public speaking, led by certified trainers and international keynote speakers.

Concretely, attending will bring our team:
- immediately applicable skills (presentations, meeting facilitation, feedback);
- a regional professional network across 12 African countries;
- greater autonomy in project leadership, through hands-on Toastmasters practice.

The cost (conference pass from 75,000 FCFA, negotiated hotel rates) is below that of a standard two-day corporate training, for a full week of development.

I would be happy to discuss this and can provide the detailed program.

Best regards,
[Your name]`,
};

// ---------------------------------------------------------------------------
// Portail Bénin — excursions & pratique (§3.2 C)
// ---------------------------------------------------------------------------
export const excursions: {
  key: string;
  hue: number;
  icon: string;
  name: Localized;
  tagline: Localized;
  text: Localized;
  duration: Localized;
}[] = [
  {
    key: "ouidah",
    hue: 25,
    icon: "🏛️",
    name: { fr: "Ouidah", en: "Ouidah" },
    tagline: { fr: "La mémoire", en: "The memory" },
    text: {
      fr: "La Route des Esclaves jusqu'à la Porte du Non-Retour, le Temple des Pythons, le Musée d'Histoire : une journée d'émotion à une heure de Cotonou.",
      en: "The Slave Route down to the Door of No Return, the Python Temple, the History Museum: an emotional day one hour from Cotonou.",
    },
    duration: { fr: "1 journée", en: "Full day" },
  },
  {
    key: "ganvie",
    hue: 175,
    icon: "🛶",
    name: { fr: "Ganvié", en: "Ganvié" },
    tagline: { fr: "La lagune", en: "The lagoon" },
    text: {
      fr: "La « Venise de l'Afrique » : cité lacustre sur pilotis, marché flottant et écoles sur l'eau, à découvrir en pirogue sur le lac Nokoué.",
      en: "The “Venice of Africa”: a stilt city, floating market and schools on the water, explored by pirogue on Lake Nokoué.",
    },
    duration: { fr: "½ journée", en: "Half day" },
  },
  {
    key: "abomey",
    hue: 350,
    icon: "👑",
    name: { fr: "Abomey", en: "Abomey" },
    tagline: { fr: "Les rois", en: "The kings" },
    text: {
      fr: "Les palais royaux du Dahomey, classés UNESCO : bas-reliefs, trônes et tentures dont les motifs inspirent l'identité de COT27.",
      en: "The UNESCO-listed royal palaces of Dahomey: bas-reliefs, thrones and tapestries whose patterns inspire COT27's identity.",
    },
    duration: { fr: "1 journée", en: "Full day" },
  },
  {
    key: "pendjari",
    hue: 90,
    icon: "🐘",
    name: { fr: "Pendjari", en: "Pendjari" },
    tagline: { fr: "La savane", en: "The savanna" },
    text: {
      fr: "L'un des derniers grands sanctuaires de faune d'Afrique de l'Ouest : éléphants, lions et hippopotames. Extension safari de 2–3 jours après la conférence.",
      en: "One of West Africa's last great wildlife sanctuaries: elephants, lions and hippos. A 2–3 day safari extension after the conference.",
    },
    duration: { fr: "2–3 jours", en: "2–3 days" },
  },
];

export const beninPratique: { icon: string; title: Localized; text: Localized }[] = [
  {
    icon: "🛂",
    title: { fr: "e-Visa en 48 h", en: "e-Visa in 48 h" },
    text: {
      fr: "Ressortissants CEDEAO : pas de visa. Autres pays : e-Visa en ligne sur evisa.gouv.bj (≈ 50 €, 48 h de délai).",
      en: "ECOWAS nationals: no visa. Others: online e-Visa at evisa.gouv.bj (≈ €50, 48 h processing).",
    },
  },
  {
    icon: "💉",
    title: { fr: "Fièvre jaune", en: "Yellow fever" },
    text: {
      fr: "Le carnet de vaccination fièvre jaune est exigé à l'entrée. Prophylaxie antipaludique recommandée.",
      en: "A yellow fever vaccination card is required on entry. Antimalarial prophylaxis recommended.",
    },
  },
  {
    icon: "💱",
    title: { fr: "Franc CFA (XOF)", en: "CFA franc (XOF)" },
    text: {
      fr: "1 € ≈ 656 FCFA (parité fixe). Cartes acceptées dans les hôtels ; Mobile Money (MTN, Moov) roi partout ailleurs.",
      en: "€1 ≈ 656 FCFA (fixed peg). Cards accepted in hotels; Mobile Money (MTN, Moov) rules everywhere else.",
    },
  },
  {
    icon: "🌦️",
    title: { fr: "Climat en mai", en: "May weather" },
    text: {
      fr: "27–31 °C, début de saison des pluies : averses brèves, soleil généreux. Vêtements légers et parapluie.",
      en: "27–31 °C, early rainy season: brief showers, generous sun. Light clothing and an umbrella.",
    },
  },
  {
    icon: "✈️",
    title: { fr: "Aéroport COO", en: "COO airport" },
    text: {
      fr: "L'aéroport international Cardinal Bernardin Gantin est à 20 min du Palais des Congrès. Navettes COT27 pour les participants.",
      en: "Cardinal Bernardin Gantin International Airport is 20 min from the venue. COT27 shuttles for attendees.",
    },
  },
  {
    icon: "🗣️",
    title: { fr: "Langues", en: "Languages" },
    text: {
      fr: "Français langue officielle, anglais parlé dans le milieu des affaires — et une conférence intégralement bilingue.",
      en: "French is the official language, English widely spoken in business — and the conference is fully bilingual.",
    },
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
