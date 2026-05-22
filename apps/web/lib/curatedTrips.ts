/**
 * Curated trips Walter ships with. These appear on the landing grouped by
 * category and serve as starting points: clicking one pre-fills walter_prefs
 * with the destination, duration, and description, then routes to /clarify.
 *
 * Walter voice: cinematic, no hype, no "amazing" / "stunning" / "must-see".
 * Title lines are facts about the place, in the register of a filmmaker.
 */

export type TripCategory =
  | "coastlines"
  | "wild"
  | "cities"
  | "northern"
  | "table";

export type CuratedTrip = {
  id: string;
  category: TripCategory;
  destination: string;
  title: string;
  description: string;
  totalCost: number;
  durationDays: number;
  image: string;
  tier?: string;
};

export const CATEGORY_LABELS: Record<TripCategory, string> = {
  coastlines: "Coastlines",
  wild: "Wild and remote",
  cities: "Cities",
  northern: "Northern light",
  table: "Where they eat well",
};

export const CATEGORY_TAGLINES: Record<TripCategory, string> = {
  coastlines: "Water, salt, light at the right hour.",
  wild: "Mountains, glaciers, silence.",
  cities: "Where the trip can fit in a long weekend.",
  northern: "Cold-weather cinematic. Aurora season counts.",
  table: "Pick the city because of what you'll eat there.",
};

export const CATEGORY_ORDER: TripCategory[] = [
  "coastlines",
  "wild",
  "cities",
  "northern",
  "table",
];

export const CURATED_TRIPS: CuratedTrip[] = [
  // ── COASTLINES ───────────────────────────────────────
  {
    id: "curated-lisbon-5d",
    category: "coastlines",
    destination: "Lisbon, Portugal",
    title: "Tile-tiled hills above the Atlantic.",
    description: "Long walks, fado in tiny rooms, grilled fish and white wine.",
    totalCost: 1800,
    durationDays: 5,
    image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=85&auto=format&fit=crop",
    tier: "Walter's pick",
  },
  {
    id: "curated-cinque-terre-6d",
    category: "coastlines",
    destination: "Cinque Terre, Italy",
    title: "Five villages on the Ligurian rocks.",
    description: "Trails between towns, focaccia, swimming off the rocks.",
    totalCost: 2400,
    durationDays: 6,
    image: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-santorini-7d",
    category: "coastlines",
    destination: "Santorini, Greece",
    title: "White cliffs over the caldera.",
    description: "Slow mornings, late dinners, sunset that earns the cliché.",
    totalCost: 2800,
    durationDays: 7,
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-algarve-5d",
    category: "coastlines",
    destination: "Algarve, Portugal",
    title: "Limestone caves and quiet beach towns.",
    description: "Cliff hikes, grilled sardines, sand still warm at nine.",
    totalCost: 1600,
    durationDays: 5,
    image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-big-sur-4d",
    category: "coastlines",
    destination: "Big Sur, California",
    title: "Highway One, fog, redwoods at the edge.",
    description: "Drive slow, hike short, eat at Nepenthe, watch the light go.",
    totalCost: 1400,
    durationDays: 4,
    image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-amalfi-6d",
    category: "coastlines",
    destination: "Amalfi Coast, Italy",
    title: "Cliffside villages and lemon trees.",
    description: "Boat days, pasta with lemon, late espresso on a balcony.",
    totalCost: 2700,
    durationDays: 6,
    image: "https://images.unsplash.com/photo-1530538987395-032d1800fdd4?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-mallorca-6d",
    category: "coastlines",
    destination: "Mallorca, Spain",
    title: "Limestone coves and quiet harbors.",
    description: "Tramuntana drives, cala swims, dinner in Sóller.",
    totalCost: 2200,
    durationDays: 6,
    image: "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=1200&q=85&auto=format&fit=crop",
  },

  // ── WILD AND REMOTE ──────────────────────────────────
  {
    id: "curated-patagonia-10d",
    category: "wild",
    destination: "Patagonia, Chile",
    title: "Wind, glaciers, granite towers.",
    description: "Torres del Paine W trek, lodges between hikes, big sky.",
    totalCost: 3800,
    durationDays: 10,
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=85&auto=format&fit=crop",
    tier: "Walter's pick",
  },
  {
    id: "curated-banff-6d",
    category: "wild",
    destination: "Banff, Canada",
    title: "Lakes the color of glass.",
    description: "Lake Louise, Moraine, hot springs after a long hike.",
    totalCost: 2200,
    durationDays: 6,
    image: "https://images.unsplash.com/photo-1609825488888-3a766db05542?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-dolomites-7d",
    category: "wild",
    destination: "Dolomites, Italy",
    title: "Italian Alps without the crowds.",
    description: "Via ferrata, rifugio dinners, glacier light at dawn.",
    totalCost: 2600,
    durationDays: 7,
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-scottish-highlands-6d",
    category: "wild",
    destination: "Scottish Highlands",
    title: "Rain, peat, single-track roads.",
    description: "Isle of Skye, distilleries, B&Bs with peat fires.",
    totalCost: 1900,
    durationDays: 6,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-yosemite-5d",
    category: "wild",
    destination: "Yosemite, California",
    title: "Granite walls and tall pines.",
    description: "Half Dome views, valley loops, dinner in Wawona.",
    totalCost: 1700,
    durationDays: 5,
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-lauterbrunnen-6d",
    category: "wild",
    destination: "Lauterbrunnen, Switzerland",
    title: "Seventy-two waterfalls in one valley.",
    description: "Jungfrau views, Schilthorn cable car, fondue after.",
    totalCost: 2900,
    durationDays: 6,
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-aoraki-8d",
    category: "wild",
    destination: "South Island, New Zealand",
    title: "Southern Alps, glacier lakes, dark sky.",
    description: "Aoraki, Milford Sound, Te Anau under the southern stars.",
    totalCost: 3400,
    durationDays: 8,
    image: "https://images.unsplash.com/photo-1554072675-66db59dba46f?w=1200&q=85&auto=format&fit=crop",
  },

  // ── CITIES ───────────────────────────────────────────
  {
    id: "curated-tokyo-7d",
    category: "cities",
    destination: "Tokyo, Japan",
    title: "Quiet shrines and louder ramen.",
    description: "Tsukiji breakfasts, Shimokitazawa nights, a Sunday in Shibuya.",
    totalCost: 2800,
    durationDays: 7,
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85&auto=format&fit=crop",
    tier: "Walter's pick",
  },
  {
    id: "curated-mexico-city-5d",
    category: "cities",
    destination: "Mexico City, Mexico",
    title: "Murals, mezcal, walking everywhere.",
    description: "Roma Norte cafés, Coyoacán markets, a Sunday at Chapultepec.",
    totalCost: 1500,
    durationDays: 5,
    image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-new-york-5d",
    category: "cities",
    destination: "New York, NY",
    title: "Five days, four boroughs, one slice.",
    description: "Walk the Highline, an MFA dinner in Bushwick, jazz late.",
    totalCost: 2200,
    durationDays: 5,
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-berlin-5d",
    category: "cities",
    destination: "Berlin, Germany",
    title: "Cold beer in the late summer.",
    description: "Tempelhof picnics, gallery hopping in Mitte, döner at 2am.",
    totalCost: 1700,
    durationDays: 5,
    image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-barcelona-6d",
    category: "cities",
    destination: "Barcelona, Spain",
    title: "Gaudí and the long lunch.",
    description: "Boqueria mornings, Sagrada Família, beach naps, late tapas.",
    totalCost: 1900,
    durationDays: 6,
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-paris-5d",
    category: "cities",
    destination: "Paris, France",
    title: "Cafés, galleries, golden hour.",
    description: "Marais walks, Musée d'Orsay, a Tuesday at the opera.",
    totalCost: 2300,
    durationDays: 5,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-copenhagen-5d",
    category: "cities",
    destination: "Copenhagen, Denmark",
    title: "Bicycles, harbors, design that earns the word.",
    description: "Nyhavn, Refshaleøen swimming, dinner in Vesterbro.",
    totalCost: 2400,
    durationDays: 5,
    image: "https://images.unsplash.com/photo-1559511260-66a654ae982a?w=1200&q=85&auto=format&fit=crop",
  },

  // ── NORTHERN LIGHT ───────────────────────────────────
  {
    id: "curated-reykjavik-6d",
    category: "northern",
    destination: "Reykjavík, Iceland",
    title: "Five hours of daylight, twenty hours of awe.",
    description: "Golden Circle drive, hot springs, aurora chasing past midnight.",
    totalCost: 2140,
    durationDays: 6,
    image: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=1200&q=85&auto=format&fit=crop",
    tier: "Walter's pick",
  },
  {
    id: "curated-tromso-5d",
    category: "northern",
    destination: "Tromsø, Norway",
    title: "Arctic Circle, aurora season.",
    description: "Cable car at dusk, sami camp dinner, northern lights at 1am.",
    totalCost: 2700,
    durationDays: 5,
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-faroe-7d",
    category: "northern",
    destination: "Faroe Islands",
    title: "Eighteen islands, North Atlantic light.",
    description: "Sheep on every cliff, tunnels under the sea, fish smoked yesterday.",
    totalCost: 3100,
    durationDays: 7,
    image: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-lofoten-6d",
    category: "northern",
    destination: "Lofoten, Norway",
    title: "Fishing villages under green sky.",
    description: "Red rorbu cabins, cod racks at dusk, no one in sight.",
    totalCost: 2800,
    durationDays: 6,
    image: "https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-hokkaido-7d",
    category: "northern",
    destination: "Hokkaido, Japan",
    title: "Powder snow, ramen at minus ten.",
    description: "Niseko slopes, onsens at night, sapporo izakaya crawl.",
    totalCost: 3200,
    durationDays: 7,
    image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-abisko-5d",
    category: "northern",
    destination: "Abisko, Sweden",
    title: "Above the Arctic Circle, the lights are guaranteed.",
    description: "Sky Station chairlift at night, ice hotel side trip, sami culture.",
    totalCost: 2500,
    durationDays: 5,
    image: "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-denali-7d",
    category: "northern",
    destination: "Denali, Alaska",
    title: "Sixty-mile views, brown bears, the highest peak.",
    description: "Park Road bus, Wonder Lake camping, salmon at the lodge.",
    totalCost: 2800,
    durationDays: 7,
    image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1200&q=85&auto=format&fit=crop",
  },

  // ── WHERE THEY EAT WELL ──────────────────────────────
  {
    id: "curated-san-sebastian-5d",
    category: "table",
    destination: "San Sebastián, Spain",
    title: "Pintxos until you tap out.",
    description: "Bar crawls in Parte Vieja, Michelin lunch, surf at Zurriola.",
    totalCost: 2100,
    durationDays: 5,
    image: "https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=1200&q=85&auto=format&fit=crop",
    tier: "Walter's pick",
  },
  {
    id: "curated-bologna-5d",
    category: "table",
    destination: "Bologna, Italy",
    title: "The fat one. For good reason.",
    description: "Tagliatelle al ragù, mortadella, balsamic in Modena.",
    totalCost: 1800,
    durationDays: 5,
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-oaxaca-5d",
    category: "table",
    destination: "Oaxaca, Mexico",
    title: "Mole, mezcal, markets.",
    description: "Seven moles, a tlayuda stand, mezcal tasting in Etla.",
    totalCost: 1400,
    durationDays: 5,
    image: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-lyon-6d",
    category: "table",
    destination: "Lyon, France",
    title: "Bouchons, river light, no rush.",
    description: "Quenelles, Halles Paul Bocuse, Beaujolais a half hour away.",
    totalCost: 2200,
    durationDays: 6,
    image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-tokyo-table-5d",
    category: "table",
    destination: "Tokyo (food edition), Japan",
    title: "Eat your way through one city.",
    description: "Sushi at Tsukiji, ramen in Shinjuku, omakase in Nakameguro.",
    totalCost: 2900,
    durationDays: 5,
    image: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-naples-5d",
    category: "table",
    destination: "Naples, Italy",
    title: "Pizza in the place it was invented.",
    description: "Da Michele, Sorbillo, sfogliatella for breakfast.",
    totalCost: 1700,
    durationDays: 5,
    image: "https://images.unsplash.com/photo-1583416750470-965b2707b355?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "curated-penang-6d",
    category: "table",
    destination: "Penang, Malaysia",
    title: "Hawker centers, kopitiams, char kway teow at dawn.",
    description: "Gurney Drive, Chulia Street, Old Town breakfast crawl.",
    totalCost: 1600,
    durationDays: 6,
    image: "https://images.unsplash.com/photo-1597211833712-5e41faa202ea?w=1200&q=85&auto=format&fit=crop",
  },
];
