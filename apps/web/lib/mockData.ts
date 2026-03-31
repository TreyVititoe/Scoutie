export type Flight = {
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  stops: number;
  price: number;
  link: string;
};

export type Hotel = {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  totalPrice: number;
  neighborhood: string;
  amenities: string[];
  link: string;
};

export type Experience = {
  id: string;
  name: string;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  price: number;
  duration: string;
  link: string;
};

export const mockFlights: Flight[] = [
  {
    id: "f1",
    airline: "Japan Airlines",
    departure: "LAX",
    arrival: "NRT",
    departTime: "11:30 AM",
    arriveTime: "3:45 PM+1",
    duration: "12h 15m",
    stops: 0,
    price: 687,
    link: "#",
  },
  {
    id: "f2",
    airline: "ANA",
    departure: "LAX",
    arrival: "HND",
    departTime: "1:15 PM",
    arriveTime: "5:30 PM+1",
    duration: "11h 15m",
    stops: 0,
    price: 723,
    link: "#",
  },
  {
    id: "f3",
    airline: "Delta",
    departure: "LAX",
    arrival: "NRT",
    departTime: "10:00 AM",
    arriveTime: "4:20 PM+1",
    duration: "14h 20m",
    stops: 1,
    price: 542,
    link: "#",
  },
  {
    id: "f4",
    airline: "United",
    departure: "LAX",
    arrival: "NRT",
    departTime: "12:45 PM",
    arriveTime: "5:00 PM+1",
    duration: "12h 15m",
    stops: 0,
    price: 614,
    link: "#",
  },
];

export const mockHotels: Hotel[] = [
  {
    id: "h1",
    name: "Park Hyatt Tokyo",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 2341,
    pricePerNight: 385,
    totalPrice: 2695,
    neighborhood: "Shinjuku",
    amenities: ["Pool", "Spa", "Gym", "Restaurant"],
    link: "#",
  },
  {
    id: "h2",
    name: "MUJI Hotel Ginza",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 876,
    pricePerNight: 198,
    totalPrice: 1386,
    neighborhood: "Ginza",
    amenities: ["Restaurant", "Lounge", "WiFi"],
    link: "#",
  },
  {
    id: "h3",
    name: "Shinjuku Granbell Hotel",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop",
    rating: 4.4,
    reviews: 1532,
    pricePerNight: 112,
    totalPrice: 784,
    neighborhood: "Shinjuku",
    amenities: ["WiFi", "Breakfast", "Laundry"],
    link: "#",
  },
  {
    id: "h4",
    name: "Aman Tokyo",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 654,
    pricePerNight: 620,
    totalPrice: 4340,
    neighborhood: "Otemachi",
    amenities: ["Pool", "Spa", "Gym", "Restaurant", "Bar"],
    link: "#",
  },
];

export const mockExperiences: Experience[] = [
  {
    id: "e1",
    name: "Tsukiji Outer Market Food Tour",
    image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop",
    category: "Food & Drink",
    rating: 4.9,
    reviews: 3210,
    price: 79,
    duration: "3 hours",
    link: "#",
  },
  {
    id: "e2",
    name: "Teamlab Borderless",
    image: "https://images.unsplash.com/photo-1549877452-9c387954fbc2?w=400&h=300&fit=crop",
    category: "Art & Culture",
    rating: 4.7,
    reviews: 5420,
    price: 32,
    duration: "2-3 hours",
    link: "#",
  },
  {
    id: "e3",
    name: "Mt. Fuji Day Trip",
    image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&h=300&fit=crop",
    category: "Adventure",
    rating: 4.8,
    reviews: 1890,
    price: 125,
    duration: "Full day",
    link: "#",
  },
  {
    id: "e4",
    name: "Shibuya & Harajuku Walking Tour",
    image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&h=300&fit=crop",
    category: "Culture",
    rating: 4.6,
    reviews: 982,
    price: 45,
    duration: "2.5 hours",
    link: "#",
  },
];
