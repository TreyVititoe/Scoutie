export type TripPrefs = {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  travelersType: string;
  budget: number;
  budgetType: string;
  vibes: string[];
  stay: string[];
  /** v2 search-first fields */
  durationDays?: number;
  devotion?: "casual" | "balanced" | "ambitious";
  departureCity?: string;
  departureAirportCode?: string;
};

export type ScoutEvent = {
  id: string;
  name: string;
  image: string | null;
  date: string;
  time: string | null;
  venueName: string;
  venueCity: string;
  category: string;
  url: string;
  priceMin: number | null;
  priceMax: number | null;
  popularity: number;
};

export type ScoredEvent = ScoutEvent & {
  score: number;
  matchReason: string;
  additionalDates?: number;
};

export type Suggestion = {
  id: string;
  type: "activity" | "restaurant" | "site";
  title: string;
  description: string;
  estimatedCost: number | null;
  locationName: string;
  bestTime: string;
  bookingSearchQuery: string;
};

export type SearchResults = {
  exactMatches: ScoredEvent[];
  similarMatches: ScoredEvent[];
  topInArea: ScoredEvent[];
  expandedInterests: string[];
  aiSummary: string;
};

export type Flight = {
  id: string;
  airline: string;
  flightNumber: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  bookingUrl?: string;
};

export type Hotel = {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  totalPrice: number;
  image: string | null;
  amenities: string[];
  address: string;
  bookingUrl?: string;
};

export type TripCartItem = {
  id: string;
  type: "flight" | "hotel" | "event" | "activity" | "restaurant" | "site";
  title: string;
  subtitle?: string;
  price: number;
  image?: string | null;
  meta?: Record<string, unknown>;
};
