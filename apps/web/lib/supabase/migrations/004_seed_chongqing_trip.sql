-- Seed curated community trip: Chongqing, China (4 days)

INSERT INTO trips (id, title, summary, destination, tier, start_date, end_date, total_estimated_cost, currency, status, is_public, share_slug, upvote_count, cover_image_url)
VALUES (
  gen_random_uuid(),
  'Hotpot, Mountains & the Yangtze in Chongqing',
  'Four days in China''s wildest megacity. Cliffside villages, mouth-numbing Sichuan hotpot, ancient temples carved into mountains, and a cruise through the Three Gorges.',
  'Chongqing, China',
  'balanced',
  NULL, NULL,
  1600,
  'USD',
  'saved',
  true,
  'chongqing4d',
  15,
  'https://images.unsplash.com/photo-1529921879218-f99546d03e64?w=800&h=500&fit=crop'
);

-- Day 1: Arrival, Old Town & Hotpot
INSERT INTO trip_days (id, trip_id, day_number, title, summary, estimated_cost)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM trips WHERE share_slug = 'chongqing4d'),
  1,
  'Old Chongqing & Your First Hotpot',
  'Dive into the old city -- stilted houses over the river, underground war tunnels, and the hotpot meal that will reset your spice tolerance.',
  280
);

INSERT INTO trip_items (id, trip_day_id, trip_id, item_type, title, description, start_time, end_time, duration_minutes, estimated_cost, location_name, location_lat, location_lng, rating, sort_order)
VALUES
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'activity', 'Hongya Cave (Hongyadong)', 'An 11-story stilted complex built into the riverside cliff. Looks like a scene from Spirited Away. Best at night when it''s lit up, but come during the day first to explore the shops and teahouses inside.', '10:00', '12:00', 120, 0, 'Hongyadong', 29.5633, 106.5780, 4.7, 0),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'restaurant', 'Lunch at Lao Huoguo (Old Hotpot)', 'No-frills local hotpot joint packed with Chongqing locals. Get the yuan yang (split pot) -- one side fiery red, one side mild. Order tripe, duck blood, lotus root, and hand-pulled noodles.', '12:30', '14:00', 90, 15, 'Jiefangbei District', 29.5585, 106.5775, 4.6, 1),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'activity', 'Ciqikou Ancient Town', '1,000-year-old porcelain trading town. Narrow stone alleys, street food stalls (try the chen mahua fried dough twists), tea houses, and local artisans. Skip the main drag and get lost in the back alleys.', '15:00', '17:30', 150, 0, 'Ciqikou Ancient Town', 29.5800, 106.4530, 4.5, 2),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'activity', 'Chongqing WWII Tunnels', 'Underground bomb shelters from WWII carved into the mountain. Now a museum about Chongqing''s role as China''s wartime capital. Eerie, cool (literally -- great escape from the heat), and fascinating.', '18:00', '19:00', 60, 5, 'Chongqing Underground Tunnels', 29.5590, 106.5760, 4.3, 3),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'restaurant', 'Dinner at Zhu''s Hotpot (Zhu Laowu)', 'The famous late-night hotpot spot. Tallow-based broth, insanely spicy. Order the beef omasum, quail eggs, and sweet potato noodles. Pair with cold Chongqing beer.', '20:00', '22:00', 120, 20, 'Jiulongpo District', 29.5280, 106.5120, 4.8, 4),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 1), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'activity', 'Hongyadong at Night', 'Come back to see it fully illuminated. The golden lights reflected in the Jialing River is the most iconic view of Chongqing.', '22:30', '23:30', 60, 0, 'Hongyadong', 29.5633, 106.5780, 4.9, 5);

-- Day 2: Dazu Rock Carvings Day Trip
INSERT INTO trip_days (id, trip_id, day_number, title, summary, estimated_cost)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM trips WHERE share_slug = 'chongqing4d'),
  2,
  'Dazu Rock Carvings & Sichuan Cuisine',
  'Day trip to a UNESCO World Heritage Site -- 50,000 Buddhist, Confucian, and Taoist carvings from the 9th century, hidden in the mountains outside the city.',
  350
);

INSERT INTO trip_items (id, trip_day_id, trip_id, item_type, title, description, start_time, end_time, duration_minutes, estimated_cost, location_name, location_lat, location_lng, rating, sort_order)
VALUES
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'restaurant', 'Breakfast: Chongqing Small Noodles', 'xiao mian from a street stall. Spicy, garlicky, topped with peanuts and scallions. The quintessential Chongqing breakfast -- costs about $1.50.', '07:30', '08:15', 45, 2, 'Jiefangbei District', 29.5580, 106.5770, 4.5, 0),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'transport', 'Bus to Dazu', 'Take the direct bus from Caiyuanba Bus Station to Dazu. About 2 hours through the Sichuan countryside. Comfortable, cheap, and scenic.', '08:30', '10:30', 120, 8, 'Caiyuanba Bus Station', 29.5385, 106.5560, 4.0, 1),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'activity', 'Baoding Mountain Carvings', 'The main site. 10,000+ carvings along a horseshoe-shaped cliff. The 31-meter Reclining Buddha and the Thousand-Armed Avalokitesvara are jaw-dropping. Hire an English-speaking guide at the entrance.', '11:00', '14:00', 180, 20, 'Dazu Rock Carvings - Baoding', 29.7015, 105.7175, 4.9, 2),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'restaurant', 'Lunch in Dazu Town', 'Local Sichuan restaurant near the site. Try the hui guo rou (twice-cooked pork) and mapo tofu -- you''re in the heartland of Sichuan cuisine.', '14:00', '15:00', 60, 10, 'Dazu Town', 29.7060, 105.7200, 4.3, 3),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'activity', 'Bei Mountain Carvings', 'Smaller, older, and less crowded than Baoding. Carvings dating back to 892 AD. The detail on the Peacock King and the Wheel of Life is incredible.', '15:30', '17:00', 90, 15, 'Dazu Rock Carvings - Beishan', 29.7100, 105.7230, 4.6, 4),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 2), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'restaurant', 'Dinner: Chongqing Grilled Fish', 'Back in the city, hit a kao yu (grilled fish) restaurant. Whole fish grilled over coals then swimming in chili oil, Sichuan peppercorns, and vegetables. Absolutely addictive.', '20:00', '21:30', 90, 18, 'Jiefangbei District', 29.5590, 106.5780, 4.7, 5);

-- Day 3: Yangtze & Mountain City
INSERT INTO trip_days (id, trip_id, day_number, title, summary, estimated_cost)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM trips WHERE share_slug = 'chongqing4d'),
  3,
  'Yangtze River & the Mountain City',
  'Ride the city''s famous infrastructure -- monorails through buildings, cable cars over the Yangtze, and elevators up cliffs. Then cruise the river at night.',
  320
);

INSERT INTO trip_items (id, trip_day_id, trip_id, item_type, title, description, start_time, end_time, duration_minutes, estimated_cost, location_name, location_lat, location_lng, rating, sort_order)
VALUES
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'activity', 'Liziba Monorail Station', 'The famous monorail that goes THROUGH a residential building. Stand on the platform inside the apartment block as the train arrives through the wall. Peak cyberpunk.', '09:00', '09:45', 45, 2, 'Liziba Station', 29.5530, 106.5480, 4.6, 0),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'activity', 'Yangtze River Cable Car', 'Glide over the Yangtze River in a vintage cable car. 5-minute ride with panoramic views of both banks and the mountain city skyline. One of the last urban cable cars in China.', '10:00', '10:30', 30, 3, 'Yangtze River Cableway', 29.5620, 106.5830, 4.7, 1),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'activity', 'Luohan Temple', '1,000-year-old Buddhist temple hidden behind modern skyscrapers. 500 painted arhat statues, each with a unique expression. Incense smoke, chanting monks, total serenity in the chaos.', '11:00', '12:00', 60, 2, 'Luohan Temple', 29.5605, 106.5785, 4.5, 2),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'restaurant', 'Lunch: Dan Dan Noodles & Street Food', 'Walk through Bayi Hao Alley for street food. Dan dan noodles, jianbing (savory crepes), grilled skewers with cumin and chili. Eat like a local for under $5.', '12:30', '13:30', 60, 5, 'Bayi Hao Alley', 29.5575, 106.5765, 4.4, 3),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'activity', 'Eling Park Overlook', 'Hilltop park with the best panoramic view of where the Yangtze and Jialing rivers merge. The scale of this city from up here is mind-bending -- skyscrapers on every mountain.', '14:30', '16:00', 90, 2, 'Eling Park', 29.5555, 106.5540, 4.5, 4),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'restaurant', 'Dinner at Lao Sichuan Restaurant', 'Classic Sichuan banquet. Order the la zi ji (chicken buried in dried chilies), shui zhu yu (boiled fish in chili oil), and kong xin cai (morning glory with garlic).', '18:30', '20:00', 90, 25, 'Yuzhong District', 29.5560, 106.5740, 4.6, 5),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 3), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'activity', 'Yangtze Night Cruise', 'Two-river cruise along the Yangtze and Jialing. The entire mountain city lit up at night from the water. Book the basic cruise (not the dinner cruise) -- it''s the same views for a third of the price.', '21:00', '22:30', 90, 20, 'Chaotianmen Dock', 29.5650, 106.5870, 4.7, 6);

-- Day 4: Wulong Karst & Departure
INSERT INTO trip_days (id, trip_id, day_number, title, summary, estimated_cost)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM trips WHERE share_slug = 'chongqing4d'),
  4,
  'Wulong Karst & Farewell',
  'Half-day trip to the otherworldly karst landscapes from Transformers: Age of Extinction. Massive sinkholes, natural bridges, and glass skywalks.',
  350
);

INSERT INTO trip_items (id, trip_day_id, trip_id, item_type, title, description, start_time, end_time, duration_minutes, estimated_cost, location_name, location_lat, location_lng, rating, sort_order)
VALUES
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 4), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'transport', 'Bullet Train to Wulong', 'High-speed rail from Chongqing North Station. 2 hours through tunnels and valleys. Then a short bus to the scenic area.', '07:00', '09:00', 120, 15, 'Chongqing North Station', 29.6170, 106.5530, 4.2, 0),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 4), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'activity', 'Three Natural Bridges', 'Three massive limestone natural bridges over 200m tall, connected by sinkholes so deep they have their own weather. The scale is humbling. Descend by elevator, hike through the canyon between them.', '09:30', '12:00', 150, 40, 'Wulong Karst - Three Bridges', 29.3250, 107.7580, 4.9, 1),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 4), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'restaurant', 'Lunch at Wulong Village', 'Simple mountain village restaurant. Try the local lamb stew and hand-made noodles. Honest food in a stunning setting.', '12:30', '13:30', 60, 10, 'Wulong Town', 29.3300, 107.7600, 4.2, 2),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 4), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'activity', 'Longshuixia Gorge', 'Narrow slot canyon with a boardwalk along the river at the bottom. Lush green walls, waterfalls, mist. Feels like entering another world. Less touristy than Three Bridges.', '14:00', '15:30', 90, 30, 'Longshuixia Gorge', 29.3200, 107.7550, 4.7, 3),
(gen_random_uuid(), (SELECT id FROM trip_days WHERE trip_id = (SELECT id FROM trips WHERE share_slug = 'chongqing4d') AND day_number = 4), (SELECT id FROM trips WHERE share_slug = 'chongqing4d'), 'restaurant', 'Last Meal: Chongqing Hot Chicken', 'Back in the city for one final fiery meal. la zi ji at a local joint -- an entire plate of dried chilies with chicken pieces hidden inside. Find the chicken, embrace the burn, say goodbye.', '19:30', '21:00', 90, 15, 'Yuzhong District', 29.5560, 106.5740, 4.5, 4);
