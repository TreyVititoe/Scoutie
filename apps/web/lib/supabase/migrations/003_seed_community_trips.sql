-- Seed 3 curated community trips for the homepage
-- Run this in Supabase SQL Editor after running 002_add_upvote_count.sql

-- ============================================================
-- TRIP 1: Austin, Texas (3 days)
-- ============================================================

INSERT INTO trips (id, title, summary, destination, tier, start_date, end_date, total_estimated_cost, currency, status, is_public, share_slug, upvote_count, cover_image_url)
VALUES (
  gen_random_uuid(),
  'Live Music, BBQ & Lake Days in Austin',
  'Three days of the best food, music, and outdoors Austin has to offer. From South Congress to Barton Springs, this trip hits every essential.',
  'Austin, Texas',
  'balanced',
  NULL, NULL,
  1850,
  'USD',
  'saved',
  true,
  'austin3days',
  24,
  'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800&h=500&fit=crop'
);

-- Austin Day 1: Arrival + South Congress + Live Music
INSERT INTO trip_days (id, trip_id, day_number, title, summary, estimated_cost)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM trips WHERE share_slug = 'austin3days'),
  1,
  'South Congress & Live Music',
  'Explore the iconic SoCo strip, grab legendary BBQ, and catch live music on 6th Street.',
  450
);

INSERT INTO trip_items (id, trip_day_id, trip_id, item_type, title, description, start_time, end_time, duration_minutes, estimated_cost, location_name, location_lat, location_lng, rating, sort_order)
VALUES
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'austin3days') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'austin3days'), 'restaurant', 'Breakfast at Jo''s Coffee', 'Iconic SoCo coffee shop. Get the iced turbo and take a photo at the "I love you so much" mural.', '08:30', '09:30', 60, 15, 'Jo''s Coffee - South Congress', 30.2484, -97.7503, 4.5, 0),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'austin3days') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'austin3days'), 'activity', 'Explore South Congress Avenue', 'Walk the strip -- vintage shops, murals, boot stores, and people-watching. Hit Allen''s Boots and Uncommon Objects.', '10:00', '12:30', 150, 0, 'South Congress Avenue', 30.2480, -97.7490, 4.7, 1),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'austin3days') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'austin3days'), 'restaurant', 'Lunch at Franklin Barbecue', 'The most famous BBQ in America. Brisket, pulled pork, sausage. Worth every minute of the wait.', '12:30', '14:00', 90, 35, 'Franklin Barbecue', 30.2701, -97.7312, 4.9, 2),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'austin3days') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'austin3days'), 'activity', 'Barton Springs Pool', 'Cool off in this spring-fed pool in Zilker Park. 68 degrees year-round. Pure Austin.', '15:00', '17:00', 120, 10, 'Barton Springs Pool', 30.2641, -97.7710, 4.8, 3),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'austin3days') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'austin3days'), 'restaurant', 'Dinner at Uchi', 'James Beard Award-winning Japanese restaurant. The hama chili and wagyu beef sashimi are unreal.', '19:00', '21:00', 120, 120, 'Uchi Austin', 30.2509, -97.7545, 4.8, 4),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'austin3days') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'austin3days'), 'event', 'Live Music on 6th Street', 'Bar hop the Dirty Sixth or hit Red River Cultural District for indie shows. Continental Club is a classic.', '21:30', '01:00', 210, 30, '6th Street', 30.2672, -97.7395, 4.6, 5);

-- Austin Day 2: Nature + Food Trucks + Sunset
INSERT INTO trip_days (id, trip_id, day_number, title, summary, estimated_cost)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM trips WHERE share_slug = 'austin3days'),
  2,
  'Greenbelt, Food Trucks & Sunset Bats',
  'Hike the greenbelt, hit the best food truck park in the city, and watch a million bats fly at sunset.',
  380
);

INSERT INTO trip_items (id, trip_day_id, trip_id, item_type, title, description, start_time, end_time, duration_minutes, estimated_cost, location_name, location_lat, location_lng, rating, sort_order)
VALUES
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'austin3days') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'austin3days'), 'restaurant', 'Breakfast Tacos at Veracruz All Natural', 'The migas taco is a religious experience. Cash only, always a line, always worth it.', '08:00', '09:00', 60, 12, 'Veracruz All Natural', 30.2626, -97.7232, 4.8, 0),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'austin3days') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'austin3days'), 'activity', 'Hike the Barton Creek Greenbelt', 'Shady trails, swimming holes, and limestone cliffs. The Sculpture Falls trail is the best 3-mile loop.', '09:30', '12:00', 150, 0, 'Barton Creek Greenbelt', 30.2590, -97.7950, 4.7, 1),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'austin3days') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'austin3days'), 'restaurant', 'Lunch at Rainey Street Food Trucks', 'Hop between food trucks on one of Austin''s best streets. Try Bufalina''s pizza truck or Cuantos Tacos.', '12:30', '14:00', 90, 20, 'Rainey Street', 30.2565, -97.7390, 4.5, 2),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'austin3days') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'austin3days'), 'activity', 'Kayak on Lady Bird Lake', 'Rent a kayak or SUP and paddle under the Congress Ave bridge. Skyline views from the water.', '15:00', '17:00', 120, 40, 'Lady Bird Lake', 30.2620, -97.7440, 4.6, 3),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'austin3days') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'austin3days'), 'activity', 'Watch the Congress Bridge Bats', '1.5 million Mexican free-tailed bats emerge at sunset from under the bridge. Best from March to October.', '19:30', '20:30', 60, 0, 'Congress Avenue Bridge', 30.2621, -97.7448, 4.7, 4),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'austin3days') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'austin3days'), 'restaurant', 'Dinner at Loro', 'Aaron Franklin + Tyson Cole collab. Asian smokehouse. Smoked turkey rice and brisket dumplings.', '20:45', '22:15', 90, 55, 'Loro Austin', 30.2488, -97.7600, 4.7, 5);

-- Austin Day 3: East Side + Departure
INSERT INTO trip_days (id, trip_id, day_number, title, summary, estimated_cost)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM trips WHERE share_slug = 'austin3days'),
  3,
  'East Austin & Farewell',
  'Explore the creative East Side, hit a brewery, and grab one last legendary meal before heading out.',
  320
);

INSERT INTO trip_items (id, trip_day_id, trip_id, item_type, title, description, start_time, end_time, duration_minutes, estimated_cost, location_name, location_lat, location_lng, rating, sort_order)
VALUES
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'austin3days') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'austin3days'), 'restaurant', 'Brunch at Paperboy', 'Open-air brunch spot in East Austin. Egg-in-a-hole sandwich on sourdough is the move.', '09:00', '10:30', 90, 25, 'Paperboy', 30.2635, -97.7270, 4.6, 0),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'austin3days') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'austin3days'), 'activity', 'Street Art & Galleries on East Side', 'Walk East 6th and East Cesar Chavez. HOPE Outdoor Gallery vibes, murals everywhere, local galleries.', '10:30', '12:30', 120, 0, 'East Austin', 30.2620, -97.7250, 4.5, 1),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'austin3days') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'austin3days'), 'activity', 'Craft Beer at Lazarus Brewing', 'Chill brewery in a converted church. Great IPAs, patio vibes, and tacos from the kitchen.', '12:30', '14:00', 90, 30, 'Lazarus Brewing', 30.2585, -97.7230, 4.5, 2),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'austin3days') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'austin3days'), 'restaurant', 'Last Meal at La Barbecue', 'If Franklin had a rival, this is it. El Sancho brisket sandwich. No line, same quality.', '14:30', '15:30', 60, 30, 'La Barbecue', 30.2590, -97.7210, 4.8, 3);

-- ============================================================
-- TRIP 2: Quebec City, Canada (4 days)
-- ============================================================

INSERT INTO trips (id, title, summary, destination, tier, start_date, end_date, total_estimated_cost, currency, status, is_public, share_slug, upvote_count, cover_image_url)
VALUES (
  gen_random_uuid(),
  'Old World Charm in Quebec City',
  'Four days in the most European city in North America. Cobblestone streets, French cuisine, historic fortifications, and winter magic.',
  'Quebec City, Canada',
  'balanced',
  NULL, NULL,
  2400,
  'USD',
  'saved',
  true,
  'quebec4days',
  18,
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=500&fit=crop'
);

-- Quebec Day 1: Old Quebec & Chateau Frontenac
INSERT INTO trip_days (id, trip_id, day_number, title, summary, estimated_cost)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM trips WHERE share_slug = 'quebec4days'),
  1,
  'Old Quebec & Chateau Frontenac',
  'Arrive and dive straight into the walled city. Wander cobblestone streets, explore the iconic chateau, and eat like you''re in France.',
  550
);

INSERT INTO trip_items (id, trip_day_id, trip_id, item_type, title, description, start_time, end_time, duration_minutes, estimated_cost, location_name, location_lat, location_lng, rating, sort_order)
VALUES
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'activity', 'Walk the Dufferin Terrace', 'Boardwalk along the cliff beside Chateau Frontenac with views of the St. Lawrence River. Start your trip here.', '10:00', '11:00', 60, 0, 'Dufferin Terrace', 46.8117, -71.2040, 4.8, 0),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'activity', 'Explore Chateau Frontenac', 'Tour the most photographed hotel in the world. Even if you don''t stay here, walk the grand halls and rooftop bar.', '11:00', '12:30', 90, 20, 'Fairmont Le Chateau Frontenac', 46.8122, -71.2033, 4.9, 1),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'restaurant', 'Lunch at Chez Muffy', 'Farm-to-table French-Canadian cuisine in a converted 1822 warehouse. Try the duck confit.', '12:30', '14:00', 90, 65, 'Chez Muffy', 46.8135, -71.2005, 4.7, 2),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'activity', 'Wander Petit Champlain', 'The oldest commercial district in North America. Narrow streets, artisan shops, murals, and the famous Breakneck Stairs.', '14:30', '16:30', 120, 0, 'Quartier Petit Champlain', 46.8115, -71.2025, 4.8, 3),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'restaurant', 'Dinner at Le Saint-Amour', 'One of Quebec''s finest. French haute cuisine under a retractable glass ceiling. Tasting menu is the move.', '19:00', '21:30', 150, 150, 'Le Saint-Amour', 46.8130, -71.2085, 4.8, 4);

-- Quebec Day 2: Fortifications & Lower Town
INSERT INTO trip_days (id, trip_id, day_number, title, summary, estimated_cost)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM trips WHERE share_slug = 'quebec4days'),
  2,
  'Fortifications & French Canada',
  'Walk the only fortified city walls in North America, explore the old port, and dive deep into French-Canadian culture.',
  420
);

INSERT INTO trip_items (id, trip_day_id, trip_id, item_type, title, description, start_time, end_time, duration_minutes, estimated_cost, location_name, location_lat, location_lng, rating, sort_order)
VALUES
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'restaurant', 'Breakfast at Paillard', 'Best croissants and pastries in the city. Grab a cafe au lait and a pain au chocolat.', '08:30', '09:30', 60, 15, 'Paillard', 46.8140, -71.2075, 4.6, 0),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'activity', 'Walk the Fortification Walls', '4.6km walk along the ramparts. The only walled city north of Mexico. Cannons, gates, and panoramic views.', '10:00', '12:00', 120, 0, 'Fortifications of Quebec', 46.8130, -71.2080, 4.7, 1),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'activity', 'Citadelle of Quebec', 'Active military fortress since 1673. Watch the changing of the guard ceremony. Museum inside.', '12:30', '14:00', 90, 18, 'Citadelle of Quebec', 46.8085, -71.2080, 4.6, 2),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'restaurant', 'Lunch at Le Cochon Dingue', 'Casual French bistro in Old Port. Mussels and frites, French onion soup, and people-watching.', '14:00', '15:30', 90, 35, 'Le Cochon Dingue', 46.8130, -71.1995, 4.5, 3),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'activity', 'Old Port & Antique District', 'Browse antique shops on Rue Saint-Paul. The oldest street in the city, lined with galleries and curiosities.', '16:00', '18:00', 120, 0, 'Rue Saint-Paul', 46.8145, -71.2010, 4.5, 4),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'restaurant', 'Dinner at Legende', 'Modern Quebecois cuisine celebrating local ingredients. Bison tartare, foie gras, and Quebec cheeses.', '19:00', '21:00', 120, 95, 'Legende par la Taniere', 46.8138, -71.2055, 4.7, 5);

-- Quebec Day 3: Montmorency Falls & Ile d'Orleans
INSERT INTO trip_days (id, trip_id, day_number, title, summary, estimated_cost)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM trips WHERE share_slug = 'quebec4days'),
  3,
  'Montmorency Falls & Ile d''Orleans',
  'Day trip to a waterfall taller than Niagara and a pastoral island of farms, vineyards, and chocolate shops.',
  380
);

INSERT INTO trip_items (id, trip_day_id, trip_id, item_type, title, description, start_time, end_time, duration_minutes, estimated_cost, location_name, location_lat, location_lng, rating, sort_order)
VALUES
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'activity', 'Montmorency Falls', '83 meters tall -- 30m taller than Niagara. Take the cable car up, walk the suspension bridge over the falls. Jaw-dropping.', '09:00', '11:30', 150, 20, 'Parc de la Chute-Montmorency', 46.8907, -71.1478, 4.8, 0),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'activity', 'Drive Ile d''Orleans', 'Cross the bridge to this island frozen in time. Strawberry farms, cider houses, and lavender fields. Rent a car or bike.', '12:00', '13:30', 90, 40, 'Ile d''Orleans', 46.9000, -71.0500, 4.7, 1),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'restaurant', 'Lunch at Panache Mobile', 'Food truck on the island serving local Quebecois cuisine. Fresh ingredients straight from surrounding farms.', '13:30', '14:30', 60, 25, 'Ile d''Orleans', 46.8950, -71.0400, 4.4, 2),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'activity', 'Chocolaterie de l''Ile d''Orleans', 'Artisan chocolate factory with tastings. Try the ice cider chocolate truffles -- uniquely Quebecois.', '15:00', '16:00', 60, 20, 'Chocolaterie de l''Ile d''Orleans', 46.8620, -71.0680, 4.6, 3),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'restaurant', 'Dinner at Initiale', 'Michelin-worthy tasting menu in the old city. Seven courses of modern French-Quebecois cuisine. Dress up.', '19:30', '22:00', 150, 180, 'Restaurant Initiale', 46.8140, -71.2030, 4.9, 4);

-- Quebec Day 4: Morning Markets & Departure
INSERT INTO trip_days (id, trip_id, day_number, title, summary, estimated_cost)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM trips WHERE share_slug = 'quebec4days'),
  4,
  'Markets, Crepes & Au Revoir',
  'A relaxed final morning hitting the markets, grabbing crepes, and soaking in the last views.',
  250
);

INSERT INTO trip_items (id, trip_day_id, trip_id, item_type, title, description, start_time, end_time, duration_minutes, estimated_cost, location_name, location_lat, location_lng, rating, sort_order)
VALUES
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 4), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'restaurant', 'Crepes at Le Billig', 'Buckwheat crepes with local ingredients. The smoked salmon and cream cheese crepe is perfect.', '09:00', '10:00', 60, 20, 'Le Billig', 46.8132, -71.2062, 4.6, 0),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 4), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'activity', 'Grand Marche de Quebec', 'The city''s main market. Local cheeses, maple products, charcuterie, and baked goods. Stock up on souvenirs.', '10:30', '12:00', 90, 50, 'Grand Marche de Quebec', 46.8095, -71.2340, 4.5, 1),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'quebec4days') AND day_number = 4), (SELECT id FROM trips WHERE share_slug = 'quebec4days'), 'activity', 'Plains of Abraham', 'Massive urban park where the famous 1759 battle happened. Walk the grounds with views over the river. Perfect last stop.', '12:30', '14:00', 90, 0, 'Plains of Abraham', 46.8010, -71.2170, 4.7, 2);

-- ============================================================
-- TRIP 3: Portofino, Italy (3 days)
-- ============================================================

INSERT INTO trips (id, title, summary, destination, tier, start_date, end_date, total_estimated_cost, currency, status, is_public, share_slug, upvote_count, cover_image_url)
VALUES (
  gen_random_uuid(),
  'La Dolce Vita on the Italian Riviera',
  'Three days in the jewel of the Ligurian coast. Pastel harbors, cliff-side hikes, the best pesto on earth, and sunsets that stop time.',
  'Portofino, Italy',
  'premium',
  NULL, NULL,
  3200,
  'USD',
  'saved',
  true,
  'portofino3d',
  31,
  'https://images.unsplash.com/photo-1569880153113-76d33fc5591f?w=800&h=500&fit=crop'
);

-- Portofino Day 1: Harbor, Castle & Seafood
INSERT INTO trip_days (id, trip_id, day_number, title, summary, estimated_cost)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM trips WHERE share_slug = 'portofino3d'),
  1,
  'The Harbor & Castello Brown',
  'Arrive at the picture-perfect harbor, climb to the castle for panoramic views, and feast on Ligurian seafood.',
  950
);

INSERT INTO trip_items (id, trip_day_id, trip_id, item_type, title, description, start_time, end_time, duration_minutes, estimated_cost, location_name, location_lat, location_lng, rating, sort_order)
VALUES
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'portofino3d') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'portofino3d'), 'activity', 'Piazzetta di Portofino', 'The iconic harbor square. Grab a seat, order an Aperol spritz, and watch the yachts. This is the postcard.', '10:00', '11:30', 90, 25, 'Piazzetta di Portofino', 44.3035, 9.2095, 4.8, 0),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'portofino3d') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'portofino3d'), 'activity', 'Hike to Castello Brown', '15-minute climb through gardens to a medieval castle with 360-degree views of the harbor, sea, and coastline.', '11:30', '13:00', 90, 8, 'Castello Brown', 44.3025, 9.2115, 4.7, 1),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'portofino3d') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'portofino3d'), 'restaurant', 'Lunch at Da Puny', 'Harbor-front trattoria. The trofie al pesto is made fresh daily -- this is where pesto was born. Book ahead.', '13:30', '15:00', 90, 80, 'Ristorante Puny', 44.3033, 9.2092, 4.6, 2),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'portofino3d') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'portofino3d'), 'activity', 'Swim at Paraggi Beach', 'The only sandy beach near Portofino. Crystal-clear turquoise water in a sheltered cove. Rent a sun bed.', '15:30', '17:30', 120, 40, 'Paraggi Beach', 44.3090, 9.2140, 4.5, 3),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'portofino3d') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'portofino3d'), 'restaurant', 'Dinner at Cracco Portofino', 'Celebrity chef Carlo Cracco''s Riviera outpost. Modern Italian with Ligurian ingredients. Terrace overlooking the harbor at sunset.', '20:00', '22:30', 150, 200, 'Cracco Portofino', 44.3038, 9.2088, 4.8, 4);

-- Portofino Day 2: San Fruttuoso & Boat Day
INSERT INTO trip_days (id, trip_id, day_number, title, summary, estimated_cost)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM trips WHERE share_slug = 'portofino3d'),
  2,
  'San Fruttuoso & the Sea',
  'Hike or boat to a hidden abbey, snorkel over an underwater statue, and cruise the coastline at golden hour.',
  850
);

INSERT INTO trip_items (id, trip_day_id, trip_id, item_type, title, description, start_time, end_time, duration_minutes, estimated_cost, location_name, location_lat, location_lng, rating, sort_order)
VALUES
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'portofino3d') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'portofino3d'), 'restaurant', 'Breakfast at Bar Morena', 'Cornetto and cappuccino at this local bar on the piazzetta. Simple, perfect, Italian.', '08:00', '09:00', 60, 10, 'Bar Morena', 44.3032, 9.2090, 4.4, 0),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'portofino3d') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'portofino3d'), 'activity', 'Hike to San Fruttuoso', 'Stunning 2.5-hour coastal trail through forests and cliffs to a hidden medieval abbey in a cove. Bring water.', '09:30', '12:00', 150, 0, 'San Fruttuoso Abbey', 44.3135, 9.1775, 4.9, 1),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'portofino3d') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'portofino3d'), 'restaurant', 'Lunch at the Abbey', 'Simple seafood at the beachside restaurant next to the abbey. Fried calamari, focaccia, cold white wine.', '12:00', '13:30', 90, 45, 'San Fruttuoso', 44.3135, 9.1775, 4.5, 2),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'portofino3d') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'portofino3d'), 'activity', 'Snorkel the Christ of the Abyss', 'Underwater bronze statue of Christ in 15m of water. You can see it snorkeling on a clear day. Surreal experience.', '13:30', '15:00', 90, 30, 'Christ of the Abyss', 44.3130, 9.1770, 4.8, 3),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'portofino3d') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'portofino3d'), 'activity', 'Boat back to Portofino', 'Take the ferry back along the coast. Golden hour light on the cliffs and villages. Much easier than hiking back.', '15:30', '16:15', 45, 15, 'Portofino Harbor', 44.3035, 9.2095, 4.6, 4),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'portofino3d') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'portofino3d'), 'restaurant', 'Dinner at La Stella', 'Hidden up the hill behind the harbor. Family-run, no tourists. Pansoti in walnut sauce and grilled branzino.', '20:00', '22:00', 120, 90, 'Ristorante La Stella', 44.3028, 9.2080, 4.7, 5);

-- Portofino Day 3: Santa Margherita & Farewell
INSERT INTO trip_days (id, trip_id, day_number, title, summary, estimated_cost)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM trips WHERE share_slug = 'portofino3d'),
  3,
  'Santa Margherita & Arrivederci',
  'Explore the neighboring town, hit the local market, gelato crawl, and one last sunset on the Riviera.',
  600
);

INSERT INTO trip_items (id, trip_day_id, trip_id, item_type, title, description, start_time, end_time, duration_minutes, estimated_cost, location_name, location_lat, location_lng, rating, sort_order)
VALUES
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'portofino3d') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'portofino3d'), 'activity', 'Walk to Santa Margherita Ligure', 'Beautiful 30-minute coastal walk along the road to the larger neighboring town. Or take the boat for 5 minutes.', '09:00', '09:45', 45, 0, 'Santa Margherita Ligure', 44.3343, 9.2135, 4.5, 0),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'portofino3d') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'portofino3d'), 'activity', 'Santa Margherita Market', 'The daily fish and produce market on the waterfront. Locals buying dinner ingredients. Pure Liguria.', '10:00', '11:00', 60, 0, 'Santa Margherita Market', 44.3348, 9.2125, 4.4, 1),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'portofino3d') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'portofino3d'), 'restaurant', 'Focaccia at Panificio Canale', 'The best focaccia di Recco (cheese-filled) on the coast. Locals line up. Under 5 euros for perfection.', '11:00', '11:30', 30, 5, 'Santa Margherita Ligure', 44.3345, 9.2130, 4.7, 2),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'portofino3d') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'portofino3d'), 'restaurant', 'Gelato at Gelateria Centrale', 'Three scoops of the best gelato in town. Try pistachio, stracciatella, and lemon. Sit on the harbor wall.', '12:00', '12:30', 30, 8, 'Santa Margherita Ligure', 44.3340, 9.2120, 4.6, 3),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'portofino3d') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'portofino3d'), 'restaurant', 'Last Lunch at Trattoria da Pezzi', 'Classic Ligurian trattoria. Minestrone alla Genovese, stuffed anchovies, and local Vermentino wine.', '13:00', '14:30', 90, 55, 'Santa Margherita Ligure', 44.3346, 9.2118, 4.6, 4),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'portofino3d') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'portofino3d'), 'activity', 'Sunset at Portofino Lighthouse', 'Walk to the lighthouse at the tip of the peninsula. Watch the sun drop into the Mediterranean. The perfect ending.', '18:30', '20:00', 90, 0, 'Faro di Portofino', 44.2975, 9.2165, 4.9, 5);
