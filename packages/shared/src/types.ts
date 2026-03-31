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
};

export type SearchResults = {
  exactMatches: ScoredEvent[];
  similarMatches: ScoredEvent[];
  topInArea: ScoredEvent[];
  expandedInterests: string[];
  aiSummary: string;
};
