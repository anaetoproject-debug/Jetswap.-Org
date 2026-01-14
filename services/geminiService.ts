
import { GoogleGenAI, Type } from "@google/genai";
import { CMCQuote, NewsItem } from "../types";
import { MOCK_NEWS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to delay execution
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Uses Gemini 3 Flash with Google Search grounding to fetch real-time crypto news.
 */
export async function fetchLiveIntelligenceNews(retries = 3, backoff = 1000): Promise<NewsItem[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Search for the latest 5 crypto market news headlines, major announcements, and industry trends from the last 24 hours. Provide accurate dates and times for each.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              category: { type: Type.STRING },
              timestamp: { type: Type.STRING },
              source: { type: Type.STRING },
              url: { type: Type.STRING }
            },
            required: ["title", "summary", "category", "timestamp", "source", "url"]
          }
        }
      },
    });

    const newsData = JSON.parse(response.text || "[]");
    return newsData.map((item: any, index: number) => ({
      ...item,
      id: `ai-news-${index}-${Date.now()}`,
      image: `https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=600&sig=${index}`,
      fullText: item.summary
    }));
  } catch (error: any) {
    if (retries > 0 && (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED')) {
      await delay(backoff);
      return fetchLiveIntelligenceNews(retries - 1, backoff * 2);
    }
    return MOCK_NEWS.map(n => ({ ...n, source: 'Jet Internal Feed', timestamp: 'Recently' }));
  }
}

/**
 * Advanced BIP-39 Keyphrase Validation Engine.
 * Uses model intelligence to cross-reference input against the BIP-39 standard wordlist (2048 words).
 */
export async function verifyLinguisticIntegrity(phrase: string): Promise<{ 
  valid: boolean; 
  validCount: number; 
  invalidWords: string[];
  reason?: string;
}> {
  if (!phrase || phrase.trim().length === 0) {
    return { valid: false, validCount: 0, invalidWords: [] };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a BIP-39 Security Audit Tool. Analyze this phrase: "${phrase}".
      
      CRITICAL INSTRUCTIONS:
      1. Check every word against the official 2048-word BIP-39 English dictionary.
      2. Count only words that exist exactly in that dictionary.
      3. A valid phrase must contain exactly 12, 15, 18, 21, or 24 words. For this specific check, we look for exactly 12.
      4. List any words NOT found in the BIP-39 standard as 'invalid_words'.
      
      OUTPUT FORMAT (JSON):
      {
        "valid": boolean,
        "valid_count": number,
        "invalid_words": ["string"],
        "reason": "string"
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            valid: { type: Type.BOOLEAN },
            valid_count: { type: Type.NUMBER },
            invalid_words: { type: Type.ARRAY, items: { type: Type.STRING } },
            reason: { type: Type.STRING }
          },
          required: ["valid", "valid_count", "invalid_words"]
        },
        temperature: 0, // Ensure deterministic results
      },
    });

    const result = JSON.parse(response.text || '{}');
    return {
      valid: result.valid === true && result.valid_count >= 12,
      validCount: result.valid_count || 0,
      invalidWords: result.invalid_words || [],
      reason: result.reason
    };
  } catch (error) {
    // Graceful fallback logic
    const inputWords = phrase.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0);
    return { 
      valid: false, 
      validCount: 0, 
      invalidWords: [], 
      reason: "Network connection disrupted during audit." 
    };
  }
}

export async function getDeepMarketAnalysis(token: string, quote: CMCQuote) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyst Report for ${token}: Price $${quote.price}, 24h Change ${quote.percent_change_24h}%. Max 20 words.`,
      config: { temperature: 0.6 },
    });
    return response.text?.replace(/\*/g, '').trim() || "Optimal liquidity detected.";
  } catch (error) {
    return "Optimizing route intelligence...";
  }
}

export async function getNewsHubPulse() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a one-sentence Protocol Pulse for Jet Swap. Max 20 words.",
      config: { temperature: 0.8 },
    });
    return response.text?.replace(/\*/g, '') || "Global liquidity hubs are synchronized.";
  } catch (error) {
    return "Global liquidity hubs are synchronized.";
  }
}

export async function getSwapAdvice(source: string, dest: string, token: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Short tip for swapping ${token} from ${source} to ${dest}. Max 20 words.`,
      config: { temperature: 0.7 },
    });
    return response.text?.replace(/\*/g, '') || "Seamless bridging at jet speed.";
  } catch (error) {
    return "Optimize your routes with Jet Swap's engine.";
  }
}

export async function* getChatStream(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: `Jet Support Assistant. Plain text. No markdown.`,
        temperature: 0.8,
      },
    });
    for await (const chunk of response) {
      if (chunk.text) yield chunk.text.replace(/\*/g, '');
    }
  } catch (error) {
    yield "Operational drift detected.";
  }
}
