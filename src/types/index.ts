export interface TripPreferences {
  destination: string;
  startDate: string;
  endDate: string;
  budget: BudgetRange;
  travelers: number;
  interests: Interest[];
  accommodation: AccommodationType;
  pace: TripPace;
}

export type BudgetRange = "budget" | "moderate" | "premium" | "luxury";

export type Interest =
  | "culture"
  | "food"
  | "nightlife"
  | "outdoors"
  | "shopping"
  | "relaxation"
  | "adventure"
  | "history"
  | "art"
  | "music"
  | "sports"
  | "family";

export type AccommodationType = "hotel" | "airbnb" | "hostel" | "resort" | "any";

export type TripPace = "relaxed" | "moderate" | "packed";

export interface FlightOption {
  id: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  affiliateUrl: string;
  departureAirport: string;
  arrivalAirport: string;
}

export interface AccommodationOption {
  id: string;
  name: string;
  type: AccommodationType;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  totalPrice: number;
  imageUrl: string;
  highlights: string[];
  affiliateUrl: string;
  location: string;
}

export interface EventOption {
  id: string;
  name: string;
  category: string;
  date: string;
  time: string;
  price: number;
  rating: number;
  imageUrl: string;
  description: string;
  affiliateUrl: string;
  location: string;
}

export interface DayItinerary {
  day: number;
  date: string;
  activities: Activity[];
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  cost: number;
  category: string;
  affiliateUrl?: string;
}

export interface TripPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  flights: FlightOption[];
  accommodations: AccommodationOption[];
  events: EventOption[];
  itinerary: DayItinerary[];
  summary: string;
}

export interface SavedTrip {
  id: string;
  plan: TripPlan;
  preferences: TripPreferences;
  createdAt: string;
  name: string;
}
