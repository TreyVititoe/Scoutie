import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PlanningMode = "destination" | "timeline";
export type TravelerType = "solo" | "couple" | "family" | "friends" | "business";
export type FlightClass = "economy" | "premium_economy" | "business" | "first" | "no_preference";
export type FlightPriority = "cheapest" | "shortest" | "best_value" | "fewest_stops";
export type AccommodationType = "hotel" | "vacation_rental" | "hostel" | "resort" | "boutique";
export type ActivityInterest =
  | "adventure"
  | "culture"
  | "food"
  | "nightlife"
  | "nature"
  | "relaxation"
  | "shopping"
  | "history"
  | "art"
  | "sports"
  | "live_events"
  | "family_fun"
  | "photography";
export type TripPace = "relaxed" | "moderate" | "packed";
export type DiningPreference = "budget" | "mid_range" | "fine_dining" | "mixed";
export type BudgetMode = "total_trip" | "per_day";

export interface QuizState {
  // Step tracking
  currentStep: number;
  totalSteps: 10;

  // Step 1: Planning mode
  planningMode: PlanningMode | null;

  // Step 2: Destination or dates
  destinations: string[];
  surpriseMe: boolean;
  startDate: string | null;
  endDate: string | null;
  flexibleDates: boolean;
  tripDurationDays: number | null;

  // Step 3: Travelers
  travelersCount: number;
  travelerType: TravelerType | null;
  childrenCount: number;
  childrenAges: number[];
  accessibilityNeeds: string[];

  // Step 4: Budget
  budgetMode: BudgetMode;
  budgetAmount: number | null;
  budgetCurrency: string;
  budgetFlexible: boolean;

  // Step 5: Flights
  departureCity: string;
  flightClass: FlightClass;
  flightPriority: FlightPriority;
  preferredAirlines: string[];
  carryOnOnly: boolean;

  // Step 6: Accommodation
  accommodationTypes: AccommodationType[];
  accommodationMustHaves: string[];
  locationPreference: string;

  // Step 7: Activities
  activityInterests: ActivityInterest[];

  // Step 8: Pace
  pace: TripPace | null;

  // Step 9: Dining
  diningPreference: DiningPreference | null;
  dietaryRestrictions: string[];

  // Step 10: Review (no extra state needed)
}

export interface QuizActions {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setPlanningMode: (mode: PlanningMode) => void;
  setDestinations: (destinations: string[]) => void;
  setSurpriseMe: (val: boolean) => void;
  setStartDate: (date: string | null) => void;
  setEndDate: (date: string | null) => void;
  setFlexibleDates: (val: boolean) => void;
  setTripDurationDays: (days: number | null) => void;
  setTravelersCount: (count: number) => void;
  setTravelerType: (type: TravelerType) => void;
  setChildrenCount: (count: number) => void;
  setChildrenAges: (ages: number[]) => void;
  setAccessibilityNeeds: (needs: string[]) => void;
  setBudgetMode: (mode: BudgetMode) => void;
  setBudgetAmount: (amount: number | null) => void;
  setBudgetCurrency: (currency: string) => void;
  setBudgetFlexible: (val: boolean) => void;
  setDepartureCity: (city: string) => void;
  setFlightClass: (cls: FlightClass) => void;
  setFlightPriority: (priority: FlightPriority) => void;
  setPreferredAirlines: (airlines: string[]) => void;
  setCarryOnOnly: (val: boolean) => void;
  setAccommodationTypes: (types: AccommodationType[]) => void;
  setAccommodationMustHaves: (mustHaves: string[]) => void;
  setLocationPreference: (pref: string) => void;
  toggleActivityInterest: (interest: ActivityInterest) => void;
  setPace: (pace: TripPace) => void;
  setDiningPreference: (pref: DiningPreference) => void;
  setDietaryRestrictions: (restrictions: string[]) => void;
  resetQuiz: () => void;
}

const initialState: QuizState = {
  currentStep: 1,
  totalSteps: 10,
  planningMode: null,
  destinations: [],
  surpriseMe: false,
  startDate: null,
  endDate: null,
  flexibleDates: false,
  tripDurationDays: null,
  travelersCount: 1,
  travelerType: null,
  childrenCount: 0,
  childrenAges: [],
  accessibilityNeeds: [],
  budgetMode: "total_trip",
  budgetAmount: null,
  budgetCurrency: "USD",
  budgetFlexible: false,
  departureCity: "",
  flightClass: "economy",
  flightPriority: "best_value",
  preferredAirlines: [],
  carryOnOnly: false,
  accommodationTypes: [],
  accommodationMustHaves: [],
  locationPreference: "",
  activityInterests: [],
  pace: null,
  diningPreference: null,
  dietaryRestrictions: [],
};

export const useQuizStore = create<QuizState & QuizActions>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 10) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),

      setPlanningMode: (planningMode) => set({ planningMode }),
      setDestinations: (destinations) => set({ destinations }),
      setSurpriseMe: (surpriseMe) => set({ surpriseMe }),
      setStartDate: (startDate) => set({ startDate }),
      setEndDate: (endDate) => set({ endDate }),
      setFlexibleDates: (flexibleDates) => set({ flexibleDates }),
      setTripDurationDays: (tripDurationDays) => set({ tripDurationDays }),

      setTravelersCount: (travelersCount) => set({ travelersCount }),
      setTravelerType: (travelerType) => set({ travelerType }),
      setChildrenCount: (childrenCount) => set({ childrenCount }),
      setChildrenAges: (childrenAges) => set({ childrenAges }),
      setAccessibilityNeeds: (accessibilityNeeds) => set({ accessibilityNeeds }),

      setBudgetMode: (budgetMode) => set({ budgetMode }),
      setBudgetAmount: (budgetAmount) => set({ budgetAmount }),
      setBudgetCurrency: (budgetCurrency) => set({ budgetCurrency }),
      setBudgetFlexible: (budgetFlexible) => set({ budgetFlexible }),

      setDepartureCity: (departureCity) => set({ departureCity }),
      setFlightClass: (flightClass) => set({ flightClass }),
      setFlightPriority: (flightPriority) => set({ flightPriority }),
      setPreferredAirlines: (preferredAirlines) => set({ preferredAirlines }),
      setCarryOnOnly: (carryOnOnly) => set({ carryOnOnly }),

      setAccommodationTypes: (accommodationTypes) => set({ accommodationTypes }),
      setAccommodationMustHaves: (accommodationMustHaves) => set({ accommodationMustHaves }),
      setLocationPreference: (locationPreference) => set({ locationPreference }),

      toggleActivityInterest: (interest) =>
        set((s) => ({
          activityInterests: s.activityInterests.includes(interest)
            ? s.activityInterests.filter((i) => i !== interest)
            : [...s.activityInterests, interest],
        })),

      setPace: (pace) => set({ pace }),
      setDiningPreference: (diningPreference) => set({ diningPreference }),
      setDietaryRestrictions: (dietaryRestrictions) => set({ dietaryRestrictions }),

      resetQuiz: () => set(initialState),
    }),
    {
      name: "scoutie-quiz",
    }
  )
);
