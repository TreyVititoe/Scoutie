import type { FlightClass, ActivityInterest } from "@/lib/stores/quizStore";

export type Category = "flights" | "stays" | "events" | "picks";

export interface SearchState {
  category: Category;
  where: string;
  whereOrigin?: string;
  startDate: string | null;
  endDate: string | null;
  flexibleDates: boolean;
  adults: number;
  children: number;
  infants: number;
  cabin?: FlightClass;
  vibe?: ActivityInterest[];
  interests?: ActivityInterest[];
}

export type SubmitHandler = (state: SearchState) => void;

export const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: "flights", label: "Flights", icon: "flight" },
  { id: "stays", label: "Stays", icon: "hotel" },
  { id: "events", label: "Events", icon: "local_activity" },
  { id: "picks", label: "Walter's Picks", icon: "auto_awesome" },
];

export const FOURTH_SLOT_LABEL: Record<Category, string> = {
  flights: "Cabin",
  stays: "Vibe",
  events: "Interests",
  picks: "Vibe",
};
