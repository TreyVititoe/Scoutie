import type { TripPlan, TripPreferences } from "@/types";

export function generateMockPlan(prefs: TripPreferences): TripPlan {
  const nights = Math.ceil(
    (new Date(prefs.endDate).getTime() - new Date(prefs.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const budgetMultiplier =
    prefs.budget === "budget" ? 0.5 :
    prefs.budget === "moderate" ? 1 :
    prefs.budget === "premium" ? 1.8 :
    3;

  const baseFlightPrice = Math.round(250 * budgetMultiplier);
  const baseHotelPrice = Math.round(80 * budgetMultiplier);

  return {
    id: crypto.randomUUID(),
    destination: prefs.destination,
    startDate: prefs.startDate,
    endDate: prefs.endDate,
    totalBudget: Math.round((baseFlightPrice + baseHotelPrice * nights + 50 * nights) * prefs.travelers),
    summary: `A ${nights}-night ${prefs.pace} trip to ${prefs.destination} for ${prefs.travelers} traveler${prefs.travelers > 1 ? "s" : ""}, focused on ${prefs.interests.slice(0, 3).join(", ")}.`,
    flights: [
      {
        id: "f1",
        airline: "Delta Air Lines",
        departureTime: "8:30 AM",
        arrivalTime: "2:45 PM",
        duration: "6h 15m",
        stops: 0,
        price: baseFlightPrice,
        affiliateUrl: "#",
        departureAirport: "JFK",
        arrivalAirport: prefs.destination.slice(0, 3).toUpperCase(),
      },
      {
        id: "f2",
        airline: "United Airlines",
        departureTime: "11:00 AM",
        arrivalTime: "6:30 PM",
        duration: "7h 30m",
        stops: 1,
        price: Math.round(baseFlightPrice * 0.8),
        affiliateUrl: "#",
        departureAirport: "JFK",
        arrivalAirport: prefs.destination.slice(0, 3).toUpperCase(),
      },
      {
        id: "f3",
        airline: "American Airlines",
        departureTime: "3:15 PM",
        arrivalTime: "10:00 PM",
        duration: "6h 45m",
        stops: 0,
        price: Math.round(baseFlightPrice * 1.1),
        affiliateUrl: "#",
        departureAirport: "LAX",
        arrivalAirport: prefs.destination.slice(0, 3).toUpperCase(),
      },
    ],
    accommodations: [
      {
        id: "a1",
        name: `${prefs.destination} Grand Hotel`,
        type: "hotel",
        rating: 4.5,
        reviewCount: 2847,
        pricePerNight: baseHotelPrice,
        totalPrice: baseHotelPrice * nights,
        imageUrl: "",
        highlights: ["Free WiFi", "Pool", "City Center"],
        affiliateUrl: "#",
        location: `Downtown ${prefs.destination}`,
      },
      {
        id: "a2",
        name: `Cozy ${prefs.destination} Apartment`,
        type: "airbnb",
        rating: 4.8,
        reviewCount: 312,
        pricePerNight: Math.round(baseHotelPrice * 0.9),
        totalPrice: Math.round(baseHotelPrice * 0.9 * nights),
        imageUrl: "",
        highlights: ["Kitchen", "Balcony", "Local Neighborhood"],
        affiliateUrl: "#",
        location: `${prefs.destination} Old Town`,
      },
      {
        id: "a3",
        name: `${prefs.destination} Boutique Inn`,
        type: "hotel",
        rating: 4.3,
        reviewCount: 965,
        pricePerNight: Math.round(baseHotelPrice * 1.2),
        totalPrice: Math.round(baseHotelPrice * 1.2 * nights),
        imageUrl: "",
        highlights: ["Breakfast Included", "Rooftop Bar", "Spa"],
        affiliateUrl: "#",
        location: `${prefs.destination} Arts District`,
      },
    ],
    events: [
      {
        id: "e1",
        name: `${prefs.destination} Walking Tour`,
        category: "culture",
        date: prefs.startDate,
        time: "10:00 AM",
        price: Math.round(15 * budgetMultiplier),
        rating: 4.7,
        imageUrl: "",
        description: `Explore the best of ${prefs.destination} with a local guide. Visit iconic landmarks, hidden gems, and learn fascinating stories.`,
        affiliateUrl: "#",
        location: `Central ${prefs.destination}`,
      },
      {
        id: "e2",
        name: `Local Food Experience`,
        category: "food",
        date: prefs.startDate,
        time: "6:00 PM",
        price: Math.round(35 * budgetMultiplier),
        rating: 4.9,
        imageUrl: "",
        description: `Taste the authentic flavors of ${prefs.destination}. Visit local markets, try street food, and dine at a hidden restaurant.`,
        affiliateUrl: "#",
        location: `${prefs.destination} Market District`,
      },
      {
        id: "e3",
        name: `Sunset Experience`,
        category: "outdoors",
        date: prefs.endDate,
        time: "5:30 PM",
        price: Math.round(20 * budgetMultiplier),
        rating: 4.6,
        imageUrl: "",
        description: `Watch the sunset from the best viewpoint in ${prefs.destination}. Includes a welcome drink and photo opportunities.`,
        affiliateUrl: "#",
        location: `${prefs.destination} Viewpoint`,
      },
      {
        id: "e4",
        name: `${prefs.destination} Museum Pass`,
        category: "art",
        date: prefs.startDate,
        time: "All Day",
        price: Math.round(25 * budgetMultiplier),
        rating: 4.4,
        imageUrl: "",
        description: `Skip-the-line access to the top 3 museums in ${prefs.destination}. Valid for the duration of your stay.`,
        affiliateUrl: "#",
        location: `Various locations`,
      },
    ],
    itinerary: Array.from({ length: nights + 1 }, (_, i) => {
      const date = new Date(prefs.startDate);
      date.setDate(date.getDate() + i);
      return {
        day: i + 1,
        date: date.toISOString().split("T")[0],
        activities: [
          { time: "9:00 AM", title: i === 0 ? "Arrive & Check In" : "Breakfast", description: i === 0 ? `Arrive at ${prefs.destination}, get settled in` : "Start the day at a local café", cost: i === 0 ? 0 : 12, category: "food" },
          { time: "11:00 AM", title: `Explore ${i === 0 ? "the neighborhood" : "local area"}`, description: `Discover the sights of ${prefs.destination}`, cost: 0, category: "culture" },
          { time: "1:00 PM", title: "Lunch", description: "Try a local restaurant", cost: Math.round(20 * budgetMultiplier), category: "food" },
          { time: "3:00 PM", title: i % 2 === 0 ? "Cultural activity" : "Free time", description: i % 2 === 0 ? "Visit a local attraction" : "Rest or explore on your own", cost: i % 2 === 0 ? Math.round(15 * budgetMultiplier) : 0, category: i % 2 === 0 ? "culture" : "relaxation" },
          { time: "7:00 PM", title: "Dinner", description: "Evening dining experience", cost: Math.round(30 * budgetMultiplier), category: "food" },
        ],
      };
    }),
  };
}
