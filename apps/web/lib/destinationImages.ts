const DESTINATION_PHOTOS: Record<string, string> = {
  tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
  kyoto: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
  osaka: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80",
  japan: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80",
  bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
  bangkok: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
  thailand: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80",
  paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  france: "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800&q=80",
  london: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
  rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
  italy: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80",
  barcelona: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
  madrid: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=80",
  spain: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=800&q=80",
  lisbon: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80",
  portugal: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
  amsterdam: "https://images.unsplash.com/photo-1534351590666-13e3e96c5017?w=800&q=80",
  berlin: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80",
  prague: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80",
  vienna: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&q=80",
  santorini: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80",
  greece: "https://images.unsplash.com/photo-1503152394-c571994fd383?w=800&q=80",
  reykjavik: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&q=80",
  iceland: "https://images.unsplash.com/photo-1529888830731-7adc663dafcf?w=800&q=80",
  dublin: "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=800&q=80",
  ireland: "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=800&q=80",
  "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
  nyc: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
  "san francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80",
  "los angeles": "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800&q=80",
  chicago: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
  miami: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=800&q=80",
  seattle: "https://images.unsplash.com/photo-1538433572596-2913a8f8bbb7?w=800&q=80",
  boston: "https://images.unsplash.com/photo-1501979376754-2ff867a4f659?w=800&q=80",
  austin: "https://images.unsplash.com/photo-1545194445-dddb8f4487c6?w=800&q=80",
  nashville: "https://images.unsplash.com/photo-1545419913-775e3e82c7db?w=800&q=80",
  "new orleans": "https://images.unsplash.com/photo-1571893544028-06b07af6dade?w=800&q=80",
  honolulu: "https://images.unsplash.com/photo-1542259009477-d625272157b7?w=800&q=80",
  hawaii: "https://images.unsplash.com/photo-1507876466758-bc54f384809c?w=800&q=80",
  "cape town": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80",
  marrakech: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80",
  morocco: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80",
  cairo: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&q=80",
  egypt: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  istanbul: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
  turkey: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&q=80",
  singapore: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
  "hong kong": "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&q=80",
  seoul: "https://images.unsplash.com/photo-1538485399081-7c8970d28999?w=800&q=80",
  korea: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80",
  mumbai: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
  india: "https://images.unsplash.com/photo-1524613032530-449a5d94c285?w=800&q=80",
  sydney: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80",
  melbourne: "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&q=80",
  australia: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80",
  "rio de janeiro": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
  brazil: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
  "buenos aires": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80",
  argentina: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80",
  "mexico city": "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80",
  "cabo san lucas": "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80",
  cancun: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&q=80",
  tulum: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&q=80",
  mexico: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80",
  cuba: "https://images.unsplash.com/photo-1523592121529-f6dde35f079e?w=800&q=80",
  havana: "https://images.unsplash.com/photo-1523592121529-f6dde35f079e?w=800&q=80",
  "machu picchu": "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
  peru: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
  vancouver: "https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800&q=80",
  toronto: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=800&q=80",
  montreal: "https://images.unsplash.com/photo-1519178614-68673b201f36?w=800&q=80",
  canada: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800&q=80",
};

const FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
  "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
  "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&q=80",
  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
  "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=800&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getDestinationImage(destination: string | null | undefined): string {
  if (!destination) return FALLBACK_PHOTOS[0];
  const key = destination.toLowerCase().trim();

  if (DESTINATION_PHOTOS[key]) return DESTINATION_PHOTOS[key];

  for (const [name, url] of Object.entries(DESTINATION_PHOTOS)) {
    if (key.includes(name) || name.includes(key)) return url;
  }

  return FALLBACK_PHOTOS[hashString(key) % FALLBACK_PHOTOS.length];
}
