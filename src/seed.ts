/**
 * Seed de développement — `npm run seed`
 * Crée : un utilisateur admin, l'édition Early Bird du magazine et
 * trois articles bilingues FR/EN (contenus placeholder réalistes).
 * Idempotent : ne recrée rien qui existe déjà.
 */
import { getPayload } from "payload";
import config from "@payload-config";

// --- Helpers Lexical --------------------------------------------------------
const text = (t: string) => ({
  type: "text",
  text: t,
  format: 0,
  detail: 0,
  mode: "normal",
  style: "",
  version: 1,
});

const block = (type: string, t: string, extra: Record<string, unknown> = {}) => ({
  type,
  children: [text(t)],
  direction: "ltr" as const,
  format: "" as const,
  indent: 0,
  version: 1,
  ...extra,
});

const p = (t: string) => block("paragraph", t, { textFormat: 0 });
const h2 = (t: string) => block("heading", t, { tag: "h2" });
const quote = (t: string) => block("quote", t);

const root = (...children: ReturnType<typeof block>[]) => ({
  root: {
    type: "root",
    children,
    direction: "ltr" as const,
    format: "" as const,
    indent: 0,
    version: 1,
  },
});

async function run() {
  const payload = await getPayload({ config });

  // --- Utilisateur admin ----------------------------------------------------
  const users = await payload.find({ collection: "users", limit: 1 });
  if (users.totalDocs === 0) {
    await payload.create({
      collection: "users",
      data: {
        email: "admin@cot27.org",
        password: "cot27-admin",
        nom: "Admin COT27",
        role: "admin",
      },
    });
    console.log("✔ Utilisateur admin créé : admin@cot27.org / cot27-admin (À CHANGER)");
  } else {
    console.log("• Utilisateur admin déjà présent");
  }

  // --- Édition Early Bird ---------------------------------------------------
  const editions = await payload.find({
    collection: "editions",
    where: { slug: { equals: "early-bird-2026" } },
    limit: 1,
  });

  let editionId: number;
  if (editions.totalDocs === 0) {
    const edition = await payload.create({
      collection: "editions",
      locale: "fr",
      data: {
        slug: "early-bird-2026",
        type: "early-bird",
        titre: "COT27 Magazine — Édition Early Bird",
        description:
          "La première édition du magazine officiel de COT27 : découvrez la vision de la conférence, la destination Bénin et les visages du District 130.",
        publieLe: new Date("2026-10-01").toISOString(),
      },
    });
    await payload.update({
      collection: "editions",
      id: edition.id,
      locale: "en",
      data: {
        titre: "COT27 Magazine — Early Bird Edition",
        description:
          "The first edition of the official COT27 magazine: discover the conference vision, destination Benin and the faces of District 130.",
      },
    });
    editionId = edition.id;
    console.log("✔ Édition Early Bird créée");
  } else {
    editionId = editions.docs[0].id;
    console.log("• Édition Early Bird déjà présente");
  }

  // --- Articles -------------------------------------------------------------
  const articles: {
    slug: string;
    rubrique: "portrait" | "destination" | "conference" | "district" | "art-oratoire";
    auteur: string;
    publieLe: string;
    fr: { titre: string; chapo: string; corps: ReturnType<typeof root> };
    en: { titre: string; chapo: string; corps: ReturnType<typeof root> };
  }[] = [
    {
      slug: "cotonou-vous-attend",
      rubrique: "conference",
      auteur: "Kevin Adjaho",
      publieLe: "2026-10-01",
      fr: {
        titre: "Cotonou vous attend : dans les coulisses de COT27",
        chapo:
          "Du 1er au 8 mai 2027, le District 130 se donne rendez-vous au Palais des Congrès de Cotonou. Récit d'une préparation qui mobilise sept comités et douze pays.",
        corps: root(
          p("Il est huit heures, un samedi matin de juillet, et la salle de réunion du comité d'organisation bruisse déjà de trois langues. Le français domine, l'anglais répond, et entre les deux, ce dialecte propre aux Toastmasters fait de « motions », de « timers » et d'applaudissements calibrés."),
          h2("Une conférence, sept comités"),
          p("Derrière COT27, il y a une mécanique de précision : sept comités, des dizaines de bénévoles, et un objectif que personne ne perd de vue — accueillir 450 participants venus de douze pays dans les meilleures conditions que le District 130 ait jamais offertes."),
          p("Du Comité Scientifique qui bâtit la grille des sessions au Comité Logistique qui négocie les tarifs hôteliers, chaque fiche de poste est un engagement écrit. La communication, le sponsoring, l'accueil, les finances et la technologie complètent l'attelage."),
          quote("Nous ne préparons pas un événement. Nous préparons un souvenir que chaque participant emportera chez lui."),
          h2("Le pari du numérique"),
          p("COT27 sera la première conférence du District à s'appuyer sur une plateforme numérique complète : inscription en ligne avec Mobile Money, programme consultable hors connexion, magazine numérique — celui que vous lisez en ce moment — et une archive qui restera en ligne bien après la cérémonie de clôture."),
          p("Rendez-vous en mai 2027. D'ici là, ce magazine vous ouvrira, édition après édition, les coulisses d'une aventure panafricaine.")
        ),
      },
      en: {
        titre: "Cotonou awaits: behind the scenes of COT27",
        chapo:
          "From May 1 to 8, 2027, District 130 gathers at the Palais des Congrès in Cotonou. The story of a preparation involving seven committees and twelve countries.",
        corps: root(
          p("It is eight o'clock on a Saturday morning in July, and the organizing committee's meeting room already hums in three languages. French leads, English answers, and in between flows that dialect unique to Toastmasters, made of motions, timers and calibrated applause."),
          h2("One conference, seven committees"),
          p("Behind COT27 lies precision machinery: seven committees, dozens of volunteers, and one goal nobody loses sight of — welcoming 450 participants from twelve countries in the best conditions District 130 has ever offered."),
          p("From the Scientific Committee building the session grid to the Logistics Committee negotiating hotel rates, every role sheet is a written commitment. Communication, sponsorship, hospitality, finance and technology complete the team."),
          quote("We are not preparing an event. We are preparing a memory every participant will carry home."),
          h2("The digital bet"),
          p("COT27 will be the District's first conference powered by a complete digital platform: online registration with Mobile Money, an offline-ready program, a digital magazine — the one you are reading right now — and an archive that will remain online long after the closing ceremony."),
          p("See you in May 2027. Until then, this magazine will open the doors, edition after edition, to a pan-African adventure.")
        ),
      },
    },
    {
      slug: "benin-trois-escales",
      rubrique: "destination",
      auteur: "Rédaction COT27",
      publieLe: "2026-10-01",
      fr: {
        titre: "Ouidah, Ganvié, Abomey : le Bénin en trois escales",
        chapo:
          "Venir à COT27, c'est aussi découvrir un pays. Trois excursions officielles emmèneront les participants sur les routes de l'histoire et de la lagune.",
        corps: root(
          p("On ne traverse pas la moitié d'un continent pour ne voir qu'une salle de conférence. Le comité d'organisation a donc fait de la découverte du Bénin un pilier de COT27, avec trois excursions officielles réservables dès l'inscription."),
          h2("Ouidah, la mémoire"),
          p("À une heure de Cotonou, Ouidah porte l'histoire dans chacune de ses pierres. La Route des Esclaves, ponctuée de monuments jusqu'à la Porte du Non-Retour face à l'océan, est un pèlerinage que l'on n'oublie pas. Le Temple des Pythons et le Musée d'Histoire complètent une journée dense en émotions."),
          h2("Ganvié, la lagune"),
          p("Bâtie sur pilotis au milieu du lac Nokoué, Ganvié est surnommée la Venise de l'Afrique. On y circule en pirogue entre les maisons, le marché flottant et les écoles sur l'eau. Une leçon d'adaptation et d'ingéniosité vieille de quatre siècles."),
          h2("Abomey, les rois"),
          p("Les palais royaux d'Abomey, inscrits au patrimoine mondial de l'UNESCO, racontent la puissance du royaume du Dahomey. Bas-reliefs, trônes et tentures — dont les motifs inspirent l'identité visuelle de COT27 — y attendent les visiteurs curieux."),
          quote("Le Bénin ne se visite pas. Il se raconte, et il vous raconte."),
          p("Les trois excursions seront proposées avant et après le cœur de conférence, avec transport, guide bilingue et déjeuner inclus. Les places sont limitées — réservez-les avec votre inscription.")
        ),
      },
      en: {
        titre: "Ouidah, Ganvié, Abomey: Benin in three stops",
        chapo:
          "Coming to COT27 also means discovering a country. Three official excursions will take participants along the roads of history and the lagoon.",
        corps: root(
          p("You do not cross half a continent to see only a conference room. The organizing committee has made discovering Benin a pillar of COT27, with three official excursions bookable at registration."),
          h2("Ouidah, the memory"),
          p("An hour from Cotonou, Ouidah carries history in every stone. The Slave Route, lined with monuments down to the Door of No Return facing the ocean, is a pilgrimage you never forget. The Python Temple and the History Museum complete an emotionally dense day."),
          h2("Ganvié, the lagoon"),
          p("Built on stilts in the middle of Lake Nokoué, Ganvié is nicknamed the Venice of Africa. You move by pirogue between houses, the floating market and schools on the water. A four-century-old lesson in adaptation and ingenuity."),
          h2("Abomey, the kings"),
          p("The royal palaces of Abomey, a UNESCO World Heritage site, tell the power of the Dahomey kingdom. Bas-reliefs, thrones and tapestries — whose patterns inspire COT27's visual identity — await curious visitors."),
          quote("You do not visit Benin. It tells itself, and it tells you."),
          p("All three excursions will run before and after the conference core, with transport, bilingual guide and lunch included. Seats are limited — book them with your registration.")
        ),
      },
    },
    {
      slug: "art-oratoire-nouvelle-generation",
      rubrique: "art-oratoire",
      auteur: "Rédaction COT27",
      publieLe: "2026-10-01",
      fr: {
        titre: "La nouvelle génération de l'art oratoire ouest-africain",
        chapo:
          "Des clubs universitaires de Cotonou aux scènes de Lagos, une génération d'orateurs redéfinit la prise de parole en Afrique de l'Ouest. COT27 sera leur scène.",
        corps: root(
          p("Ils ont moins de trente ans, jonglent entre le français, l'anglais et leurs langues maternelles, et considèrent la scène comme un droit plutôt qu'un privilège. La nouvelle génération d'orateurs du District 130 ne demande pas la parole : elle la prend."),
          h2("Des clubs qui débordent"),
          p("Dans les universités d'Abomey-Calavi, de Ouagadougou ou de Douala, les clubs Toastmasters affichent complet. Les sessions se tiennent dans des amphithéâtres, les listes d'attente s'allongent, et les concours internes attirent des publics qui dépassent les murs."),
          h2("Le concours comme tremplin"),
          p("Les concours d'art oratoire de COT27 — discours d'inspiration, improvisation, humour, en français comme en anglais — couronneront les meilleurs orateurs du district. Pour beaucoup, c'est le premier pas vers les scènes internationales."),
          quote("Quand je monte sur scène, je porte la voix de tous ceux qu'on n'a jamais écoutés."),
          p("À Cotonou, en mai 2027, cette génération aura une semaine, une scène et douze pays pour se faire entendre. Le rendez-vous est pris.")
        ),
      },
      en: {
        titre: "The new generation of West African public speaking",
        chapo:
          "From Cotonou's university clubs to the stages of Lagos, a generation of speakers is redefining public speaking in West Africa. COT27 will be their stage.",
        corps: root(
          p("They are under thirty, juggle French, English and their mother tongues, and consider the stage a right rather than a privilege. District 130's new generation of speakers does not ask for the floor: it takes it."),
          h2("Clubs bursting at the seams"),
          p("In the universities of Abomey-Calavi, Ouagadougou or Douala, Toastmasters clubs are full. Sessions fill lecture halls, waiting lists grow, and internal contests draw audiences beyond the walls."),
          h2("Contests as a springboard"),
          p("COT27's speech contests — international speech, table topics, humorous speech, in French and in English — will crown the district's best speakers. For many, it is the first step toward international stages."),
          quote("When I step on stage, I carry the voice of everyone who was never listened to."),
          p("In Cotonou, in May 2027, this generation will have one week, one stage and twelve countries to make itself heard. The date is set.")
        ),
      },
    },
  ];

  for (const a of articles) {
    const existing = await payload.find({
      collection: "articles",
      where: { slug: { equals: a.slug } },
      limit: 1,
    });
    if (existing.totalDocs > 0) {
      console.log(`• Article déjà présent : ${a.slug}`);
      continue;
    }
    const created = await payload.create({
      collection: "articles",
      locale: "fr",
      data: {
        slug: a.slug,
        edition: editionId,
        rubrique: a.rubrique,
        auteur: a.auteur,
        publieLe: new Date(a.publieLe).toISOString(),
        titre: a.fr.titre,
        chapo: a.fr.chapo,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        corps: a.fr.corps as any,
      },
    });
    await payload.update({
      collection: "articles",
      id: created.id,
      locale: "en",
      data: {
        titre: a.en.titre,
        chapo: a.en.chapo,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        corps: a.en.corps as any,
      },
    });
    console.log(`✔ Article créé : ${a.slug}`);
  }

  console.log("Seed terminé.");
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
