import { NextRequest, NextResponse } from "next/server";
import type { TripPreferences } from "@/types";
import { generateMockPlan } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  const preferences: TripPreferences = await request.json();

  // TODO: Replace with real Claude API call when API key is configured
  // For now, use smart mock data generation
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: `You are a travel planning AI. Based on these preferences, generate a detailed trip plan as JSON.

Preferences:
- Destination: ${preferences.destination}
- Dates: ${preferences.startDate} to ${preferences.endDate}
- Budget: ${preferences.budget}
- Travelers: ${preferences.travelers}
- Interests: ${preferences.interests.join(", ")}
- Accommodation: ${preferences.accommodation}
- Pace: ${preferences.pace}

Return ONLY valid JSON matching this structure (no markdown, no explanation):
{
  "id": "unique-id",
  "destination": "city name",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "totalBudget": number,
  "summary": "brief trip summary",
  "flights": [{ "id": "f1", "airline": "name", "departureTime": "HH:MM AM", "arrivalTime": "HH:MM PM", "duration": "Xh Ym", "stops": 0, "price": number, "affiliateUrl": "#", "departureAirport": "CODE", "arrivalAirport": "CODE" }],
  "accommodations": [{ "id": "a1", "name": "name", "type": "hotel|airbnb|hostel|resort", "rating": 4.5, "reviewCount": number, "pricePerNight": number, "totalPrice": number, "imageUrl": "", "highlights": ["str"], "affiliateUrl": "#", "location": "area" }],
  "events": [{ "id": "e1", "name": "name", "category": "category", "date": "YYYY-MM-DD", "time": "HH:MM AM", "price": number, "rating": 4.5, "imageUrl": "", "description": "desc", "affiliateUrl": "#", "location": "area" }],
  "itinerary": [{ "day": 1, "date": "YYYY-MM-DD", "activities": [{ "time": "HH:MM AM", "title": "title", "description": "desc", "cost": number, "category": "category" }] }]
}

Provide 3 flight options, 3 accommodation options, 4-6 events, and a day-by-day itinerary. Use realistic prices and details for ${preferences.destination}.`,
            },
          ],
        }),
      });

      const data = await response.json();
      const content = data.content?.[0]?.text;
      if (content) {
        const plan = JSON.parse(content);
        return NextResponse.json(plan);
      }
    } catch {
      // Fall through to mock data
    }
  }

  // Generate mock data as fallback
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const plan = generateMockPlan(preferences);
  return NextResponse.json(plan);
}
