export const PLANS = {
  standard: {
    name: "Standard Plan",
    price: 50000, // $500 in cents
    priceDisplay: "$500",
    features: [
      "Hotels",
      "Car Rentals",
      "Flights",
      "Buy Now Pay Later (BNPL)",
      "Built-in CRM",
      "Deals & Proposals",
      "Track User Activity",
      "Secured User Flow",
      "Multi-Currency",
      "Crypto Payments",
    ],
    excluded: ["Activities", "Resorts", "Cruises"],
  },
  premium: {
    name: "Premium Plan",
    price: 100000, // $1,000 in cents
    priceDisplay: "$1,000",
    features: [
      "Activities",
      "Resorts",
      "Cruises",
    ],
    excluded: [],
  },
} as const;

export const TUBIRA_URL = "https://tubira.ai";

