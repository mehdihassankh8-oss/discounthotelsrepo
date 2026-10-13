import { GoogleGenAI } from '@google/genai';
import { HOTELS_DATA } from '../data/hotels';

const hotelsSummary = HOTELS_DATA.map((h) => ({
  name: h.name,
  stars: h.starCategory,
  area: h.area,
  landmark: h.landmark,
  startingPricePKR: h.startingPricePKR,
  publicRackPricePKR: h.publicRackPricePKR,
  popularFor: h.popularFor.join(', '),
  facilities: h.facilities.slice(0, 5).join(', '),
  features: h.rooms.map((r) => `${r.name} (${r.bedType}, PKR ${r.discountRatePKR}/night)`).join('; '),
}));

export async function askKarachiConcierge(userPrompt: string): Promise<string> {
  const apiKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');

  // If no API key or failed network, use contextual heuristic matcher
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return generateFallbackRecommendation(userPrompt);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are the chief Karachi Hospitality Concierge at DiscountHotels.pk, a Karachi hotel booking service offering specially negotiated rates at star hotels.
Answer the user's inquiry with warmth, local Pakistani knowledge (Karachi traffic, distance between Clifton, Saddar, Shahrah-e-Faisal, Airport, security, dining, corporate hubs), and specific hotel recommendations from our catalog.

Here are the hotels currently available in our Karachi portfolio:
${JSON.stringify(hotelsSummary, null, 2)}

Key principles:
1. Recommend 1-3 specific hotels with exact rates in PKR.
2. Highlight unique DiscountHotels.pk perks (negotiated rates versus the hotel's published rate, extras such as breakfast and airport transfers where included, payment by bank transfer only after the hotel confirms the room).
3. Be concise (2 to 3 paragraphs max), polished, professional.

User question: ${userPrompt}`,
    });

    return response.text || generateFallbackRecommendation(userPrompt);
  } catch (error) {
    console.warn('Gemini API call failed, falling back to local concierge engine:', error);
    return generateFallbackRecommendation(userPrompt);
  }
}

function generateFallbackRecommendation(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('airport') || p.includes('transit') || p.includes('flight')) {
    return `For airport transit or early flight departures, **Ramada Plaza by Wyndham Karachi Airport** is the premier choice. Located just 3 minutes from Jinnah Terminal, it offers 24/7 complimentary airport shuttles, soundproof rooms, and early breakfast from 5:00 AM. Our rate is **PKR 24,000/night** (Rack rate: PKR 34,000, saving you 29%).`;
  }

  if (p.includes('clifton') || p.includes('sea') || p.includes('beach') || p.includes('dha') || p.includes('kitchen') || p.includes('long')) {
    return `For ocean breezes and upscale quiet stays near Dolmen Mall & Sea View, we highly recommend **Zaver Pearl Suites Clifton**. Featuring serviced suites with kitchenettes, Arabian Sea views, and resident security, it is ideal for extended corporate visits and families. DiscountHotels.pk exclusive rate starts at **PKR 29,500/night** (Rack rate: PKR 42,000), with up to 40% discount on 30+ night long stays.`;
  }

  if (p.includes('corporate') || p.includes('business') || p.includes('meeting') || p.includes('faisal') || p.includes('budget')) {
    return `For corporate business stays along Karachi's central commercial artery, **Embassy Inn Hotel** on Shahrah-e-Faisal provides excellent value at **PKR 12,500/night** with high-speed internet and breakfast. For 5-star executive prestige with club lounge access and meeting facilities, **Pearl Continental Hotel** (PKR 38,500/night) and **Mövenpick Hotel** (PKR 36,000/night) in Civil Lines are the undisputed market leaders.`;
  }

  return `Welcome to **DiscountHotels.pk**! Karachi offers distinct hospitality zones depending on your itinerary:

• **Civil Lines / Saddar (5-Star Heritage):** Pearl Continental and Mövenpick for high-level corporate delegations, Governor House meetings, and central access.
• **Clifton & Marine Promenade:** Zaver Pearl Suites for scenic Arabian Sea views, dining near Dolmen Mall, and long stays with kitchenettes.
• **Airport Corridor:** Ramada Plaza for 24/7 direct airport shuttles.
• **Shahrah-e-Faisal:** Embassy Inn and Days Inn for cost-effective corporate tariffs.

All bookings through DiscountHotels.pk include guaranteed transparent pricing, 0% booking fees, and optional Pay at Hotel in PKR.`;
}
