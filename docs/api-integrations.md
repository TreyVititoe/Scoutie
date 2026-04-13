# Walter -- API Integrations & Affiliate Tracking

Last updated: 2026-04-13

---

## Current Integrations

### Flights
| Field | Details |
|-------|---------|
| **Provider** | SerpAPI (Google Flights scraper) |
| **Env Var** | `SERPAPI_KEY` |
| **Route** | `POST /api/flights` |
| **Service File** | `lib/services/flights.ts` |
| **Data** | Airline, times, duration, stops, price, booking URL |
| **Affiliate Status** | NONE -- links to Google Flights with no tracking |
| **Affiliate Opportunity** | Google Flights doesn't have a traditional affiliate program. Could swap to Skyscanner Affiliate API or Kiwi.com Partner API for trackable links with commission. |
| **Cost** | SerpAPI: $50/mo for 5,000 searches |

### Hotels
| Field | Details |
|-------|---------|
| **Provider** | RapidAPI wrapper for Booking.com (`booking-com15.p.rapidapi.com`) |
| **Env Var** | `RAPIDAPI_KEY`, `RAPIDAPI_HOTELS_HOST` |
| **Route** | `POST /api/hotels` |
| **Service File** | `lib/services/hotels.ts` |
| **Data** | Name, rating, reviews, price/night, total, image, neighborhood, coordinates |
| **Affiliate Status** | NONE -- uses third-party wrapper, not official Booking.com affiliate API |
| **Affiliate Opportunity** | Apply to Booking.com Affiliate Partner Program for official API with trackable links. 25-40% commission on completed stays. |
| **Cost** | RapidAPI: varies by plan (freemium) |

### Events
| Field | Details |
|-------|---------|
| **Provider** | Ticketmaster Discovery API |
| **Env Var** | `TICKETMASTER_API_KEY` |
| **Route** | `POST /api/search` |
| **Service File** | `lib/services/ticketmaster.ts` |
| **Data** | Event name, date/time, venue, category, images, prices (often null), URL |
| **Affiliate Status** | NONE -- direct Ticketmaster URLs with no tracking params |
| **Affiliate Opportunity** | Apply to Ticketmaster Affiliate Program via Impact Radius. Append tracking parameters to event URLs. Commission varies. |
| **Cost** | Free (5,000 calls/day) |

### AI
| Field | Details |
|-------|---------|
| **Provider** | Anthropic (Claude Haiku 4.5) |
| **Env Var** | `ANTHROPIC_API_KEY` |
| **Routes** | `/api/generate`, `/api/suggestions`, `/api/packing-list`, `/api/trips/refine` |
| **Service File** | `lib/services/claude.ts` |
| **Data** | Trip itineraries, activity/restaurant/site suggestions, packing lists, trip summaries |
| **Affiliate Status** | N/A (internal) |
| **Cost** | Per-token billing |

### Maps & Geocoding
| Field | Details |
|-------|---------|
| **Provider** | Mapbox |
| **Env Var** | `NEXT_PUBLIC_MAPBOX_TOKEN` |
| **Uses** | Server-side geocoding for Ticketmaster radius search, client-side map display |
| **Affiliate Status** | N/A |
| **Cost** | Free tier: 600K requests/mo |

### Database & Auth
| Field | Details |
|-------|---------|
| **Provider** | Supabase (PostgreSQL + Auth) |
| **Env Vars** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Uses** | User accounts, trips, quiz responses, saved trips, affiliate click tracking, community upvotes |
| **Cost** | Free tier / Pro plan |

---

## Missing Integrations -- To Add

### Hostels
| Field | Details |
|-------|---------|
| **Best Provider** | Hostelworld Affiliate API |
| **Alternative** | Hostelz.com API |
| **Affiliate Program** | Hostelworld Affiliate Program -- 20-50% commission on bookings |
| **What it provides** | Hostel listings, ratings, prices, availability, photos, booking links |
| **Priority** | HIGH -- fills accommodation gap for budget travelers |
| **Status** | NOT STARTED |
| **Notes** | Apply at hostelworld.com/affiliates. They provide API access after approval. |

### Vacation Rentals
| Field | Details |
|-------|---------|
| **Best Provider** | VRBO/Expedia via Expedia Affiliate Network (EAN) |
| **Alternative** | Tripadvisor Rentals API, Homestay.com |
| **Affiliate Program** | Expedia Affiliate Network -- commission on completed bookings |
| **What it provides** | Vacation rental listings, prices, photos, amenities, booking links |
| **Why not Airbnb** | Airbnb has no public API and no affiliate program. Cannot integrate. |
| **Priority** | HIGH -- vacation rentals are a huge market segment |
| **Status** | NOT STARTED |
| **Notes** | Apply at expediapartnersolutions.com. VRBO data comes through EAN. |

### Activities & Tours
| Field | Details |
|-------|---------|
| **Best Provider** | Viator Partner API (owned by Tripadvisor) |
| **Alternative** | GetYourGuide Partner API, Klook Affiliate |
| **Affiliate Program** | Viator: 8% commission. GetYourGuide: 8% commission. |
| **What it provides** | Tours, experiences, cooking classes, adventure activities, day trips |
| **Priority** | HIGH -- biggest gap in the product right now. Claude suggests activities but can't book them. |
| **Status** | NOT STARTED |
| **Notes** | Viator has the largest inventory. Apply at viator.com/partner. API docs available after approval. |

### Restaurant Reservations
| Field | Details |
|-------|---------|
| **Best Provider** | OpenTable Affiliate API |
| **Alternative** | Resy (no public API), TheFork (Europe only) |
| **Affiliate Program** | OpenTable: $1 per seated diner via Commission Junction |
| **What it provides** | Restaurant search, availability, cuisine type, price range, reservation links |
| **Priority** | MEDIUM -- Claude already suggests restaurants, adding booking makes them actionable |
| **Status** | NOT STARTED |
| **Notes** | OpenTable affiliate via CJ Affiliate. TheFork has broader European coverage. |

### Car Rentals
| Field | Details |
|-------|---------|
| **Best Provider** | Rentalcars.com Affiliate API (owned by Booking Holdings) |
| **Alternative** | Kayak, Discover Cars, Economy Bookings |
| **Affiliate Program** | Rentalcars.com: up to 50% commission on net revenue |
| **What it provides** | Car rental search, pricing, vehicle types, pickup/dropoff locations |
| **Priority** | MEDIUM -- useful for multi-city and road trip itineraries |
| **Status** | NOT STARTED |
| **Notes** | Apply at rentalcars.com/affiliates. Uses Booking Holdings affiliate network. |

### Travel Insurance
| Field | Details |
|-------|---------|
| **Best Provider** | SafetyWing API |
| **Alternative** | InsureMyTrip (aggregator, 15-25% commission), World Nomads |
| **Affiliate Program** | SafetyWing: 10% recurring commission. InsureMyTrip: 15-25% per policy. |
| **What it provides** | Insurance quotes, coverage details, purchase links |
| **Priority** | MEDIUM -- high margin upsell at trip review/booking stage |
| **Status** | NOT STARTED |
| **Notes** | SafetyWing is developer-friendly with a simple API. InsureMyTrip is an aggregator with higher commissions. |

### Attraction Tickets
| Field | Details |
|-------|---------|
| **Best Provider** | Tiqets Partner API |
| **Alternative** | Musement (owned by TUI), Headout |
| **Affiliate Program** | Tiqets: 5-8% commission. Musement: varies. |
| **What it provides** | Museum tickets, theme parks, city passes, skip-the-line tickets |
| **Priority** | LOW -- overlap with Viator/GetYourGuide for many attractions |
| **Status** | NOT STARTED |

### Weather
| Field | Details |
|-------|---------|
| **Best Provider** | OpenWeatherMap |
| **Alternative** | WeatherAPI, Visual Crossing |
| **Affiliate Program** | None (utility API) |
| **What it provides** | Forecasts, historical weather, hourly/daily data |
| **Priority** | LOW -- would improve packing list accuracy |
| **Status** | NOT STARTED |
| **Cost** | Free tier: 1,000 calls/day |

---

## Affiliate Revenue Summary

### Currently Earning: $0

### Potential Revenue Per Booking (estimated)

| Category | Commission Model | Est. Revenue/Booking |
|----------|-----------------|---------------------|
| Hotels (Booking.com official) | 25-40% of Booking.com commission | $15-60 |
| Hostels (Hostelworld) | 20-50% commission | $3-10 |
| Vacation Rentals (VRBO/Expedia) | Commission on booking | $20-80 |
| Activities (Viator) | 8% commission | $5-25 |
| Events (Ticketmaster) | Varies via Impact Radius | $2-10 |
| Restaurants (OpenTable) | $1 per seated diner | $1-4 |
| Car Rentals (Rentalcars.com) | Up to 50% net revenue | $10-40 |
| Insurance (SafetyWing) | 10% recurring | $5-15 |

### Priority Order for Implementation

1. **Booking.com Affiliate** -- highest volume, highest value, already have the integration (just need official API)
2. **Hostelworld** -- fills accommodation gap for budget tier
3. **VRBO/Expedia** -- fills accommodation gap for premium tier
4. **Viator** -- fills the biggest feature gap (bookable activities)
5. **Ticketmaster Affiliate** -- already have integration, just need tracking params
6. **Car Rentals** -- good for multi-day trips
7. **OpenTable** -- makes restaurant suggestions bookable
8. **SafetyWing** -- high-margin upsell
9. **Tiqets** -- nice to have

---

## Action Items

- [ ] Apply to Booking.com Affiliate Partner Program
- [ ] Apply to Hostelworld Affiliate Program
- [ ] Apply to Expedia Affiliate Network (VRBO)
- [ ] Apply to Viator Partner Program
- [ ] Apply to Ticketmaster Affiliate via Impact Radius
- [ ] Apply to Rentalcars.com Affiliate Program
- [ ] Apply to OpenTable via CJ Affiliate
- [ ] Apply to SafetyWing Affiliate Program
- [ ] Once approved: integrate each API, add affiliate tracking to booking URLs
- [ ] Add affiliate click tracking for all outbound booking links (existing Supabase `affiliate_clicks` table)
