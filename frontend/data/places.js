// src/data/places.js
export const trip_places = [
  {
    id: 1,
    image: "/images/paris.jpg",
    name: "Paris, France",
    description: "Experience the romantic charm of Paris with its iconic landmarks and exquisite cuisine.",
    rating: 4,
    duration: { days: 5, nights: 4 },
    itinerary: [
      "Day 1: Arrival in Paris - Eiffel Tower visit & Seine River Cruise at sunset",
      "Day 2: Louvre Museum masterpieces & stroll through Champs-Élysées",
      "Day 3: Notre-Dame Cathedral exploration & artistic Montmartre district",
      "Day 4: Day trip to Versailles Palace and its magnificent gardens",
      "Day 5: Last-minute shopping at Galeries Lafayette & departure"
    ],
    price: "$1,200",
    includes: ["Return flights", "4-star hotel accommodation", "All guided tours", "Daily breakfast", "Metro pass", "Museum entries"],
    highlights: ["Eiffel Tower", "Louvre Museum", "Seine River Cruise", "Versailles Palace"]
  },
  {
    id: 2,
    image: "/images/manali.jpg",
    name: "Manali, India",
    description: "Escape to the Himalayas and discover serenity and adventure in the mountains.",
    rating: 4.5,
    duration: { days: 4, nights: 3 },
    itinerary: [
      "Day 1: Arrival in Manali - Check into mountain resort & local market exploration",
      "Day 2: Adventure day at Solang Valley - Paragliding, zorbing, and cable car rides",
      "Day 3: Visit to Rohtang Pass (subject to weather) - Snow activities and mountain views",
      "Day 4: Hadimba Temple visit & departure with unforgettable memories"
    ],
    price: "$600",
    includes: ["Mountain resort accommodation", "All local transportation", "Adventure activity packages", "All meals included", "Experienced local guide"],
    highlights: ["Solang Valley Adventures", "Rohtang Pass", "Hadimba Temple", "Mountain Views"]
  },
  {
    id: 3,
    image: "/images/dubai.jpg",
    name: "Dubai, UAE",
    description: "Discover luxury shopping, ultramodern architecture, and vibrant nightlife in Dubai.",
    rating: 4,
    duration: { days: 4, nights: 3 },
    itinerary: [
      "Day 1: Arrival - Burj Khalifa observation deck visit & Dubai Fountain show",
      "Day 2: Dubai Mall shopping & afternoon desert safari with camel riding",
      "Day 3: Palm Jumeirah monorail ride & Atlantis Aquaventure waterpark",
      "Day 4: Gold Souk exploration & departure from Dubai International Airport"
    ],
    price: "$900",
    includes: ["5-star hotel accommodation", "Burj Khalifa entry tickets", "Desert safari experience", "Dubai Metro card", "Airport transfers"],
    highlights: ["Burj Khalifa", "Desert Safari", "Dubai Mall", "Palm Jumeirah"]
  },
  {
    id: 4,
    image: "/images/tokyo.jpg",
    name: "Tokyo, Japan",
    description: "Immerse yourself in Japan's unique culture, cutting-edge technology, and delicious cuisine.",
    rating: 5,
    duration: { days: 6, nights: 5 },
    itinerary: [
      "Day 1: Arrival in Tokyo - Shibuya Crossing experience & Harajuku fashion district",
      "Day 2: Asakusa Sensoji Temple & Tokyo Skytree observation deck",
      "Day 3: Day trip to Mount Fuji and Hakone hot springs",
      "Day 4: Tsukiji Fish Market breakfast & Imperial Palace gardens",
      "Day 5: Akihabara electronics town & Shinjuku Gyoen National Garden",
      "Day 6: Last-minute souvenir shopping & departure from Narita Airport"
    ],
    price: "$1,500",
    includes: ["Business hotel accommodation", "Bullet train to Mount Fuji", "All temple entries", "Traditional kaiseki meal", "Pocket WiFi device"],
    highlights: ["Mount Fuji", "Shibuya Crossing", "Traditional Temples", "Bullet Train Experience"]
  },
  {
    id: 5,
    image: "/images/bali.jpg",
    name: "Bali, Indonesia",
    description: "Enjoy pristine beaches, ancient temples, and lush nature in Bali's tropical paradise.",
    rating: 4,
    duration: { days: 5, nights: 4 },
    itinerary: [
      "Day 1: Arrival in Bali - Check into beachfront villa & Kuta Beach sunset",
      "Day 2: Ubud monkey forest & traditional Balinese dance performance",
      "Day 3: Tegallalang rice terraces & Tirta Empul water temple purification",
      "Day 4: Nusa Penida island day trip - Kelingking Beach and Angel's Billabong",
      "Day 5: Uluwatu Temple cliff views & departure with tropical memories"
    ],
    price: "$800",
    includes: ["Beachfront villa accommodation", "All airport and island transfers", "Traditional massage therapy", "All temple entries", "Daily breakfast"],
    highlights: ["Ubud Monkey Forest", "Tegallalang Rice Terraces", "Nusa Penida Island", "Beachfront Villa"]
  }
];