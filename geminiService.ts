
import { GoogleGenAI, Type } from "@google/genai";
import { CHARACTER_PROMPTS, GLOBAL_SYSTEM_INSTRUCTION } from "./constants";
import { CharacterId, Message } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Increased max retries and more conservative backoff for 429s
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      
      const errorMessage = err?.message || '';
      const isRateLimit = 
        err?.status === 429 || 
        errorMessage.includes('429') || 
        errorMessage.includes('RESOURCE_EXHAUSTED') || 
        errorMessage.includes('quota');

      if (isRateLimit && i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 5000 + Math.random() * 2000;
        console.warn(`Quota reached. Retrying attempt ${i + 1}/${maxRetries} in ${Math.round(waitTime)}ms...`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export const getCharacterResponse = async (
  characterId: CharacterId,
  history: Message[],
  userInput: string,
  isProactive: boolean = false
) => {
  return withRetry(async () => {
    // Detailed prompt for proactive initiation following the Event + Mood + Hook structure
    const proactiveInstruction = `
ابدأ كلام جديد معايا النهاردة.
لازم الرسالة تتبع الترتيب ده بالظبط وبشكل طبيعي جداً:
1. احكي حاجة بسيطة حصلتلك النهاردة (موقف في الشغل، في الشارع، شربت قهوة، سمعت أغنية..).
2. قول انت حاسس بإيه دلوقتي (مبسوط، تعبان، بتهزر، سرحان..).
3. اختم بسؤال أو جملة تخليني أرد عليك (هوك).

الشروط:
- الكلام لازم يكون بالعامية المصرية وتلقائي تماماً كأنك بتبعت لواحد صاحبك على واتساب.
- الرسالة لازم تكون قصيرة جداً (سطر واحد أو اتنين بالكتير).
- ممنوع الرغي أو الكلام الرسمي.
- التزم بشخصيتك وقصتك.
`;

    const promptText = isProactive ? proactiveInstruction : userInput;

    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: [
        ...history.slice(-10).map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: promptText }] }
      ],
      config: {
        systemInstruction: `${GLOBAL_SYSTEM_INSTRUCTION}\n${CHARACTER_PROMPTS[characterId]}\nREMEMBER: EXTREMELY SHORT, NATURAL EGYPTIAN WHATSAPP STYLE.`,
        temperature: 0.9,
      }
    });

    const response = await model;
    return response.text || "أنا مش عارف أقول إيه حالياً...";
  });
};

export const translateMessage = async (text: string, toLanguage: 'ar' | 'en') => {
  if (!text) return text;
  
  return withRetry(async () => {
    const prompt = toLanguage === 'en' 
      ? `Translate to casual English (ONLY translation): "${text}"`
      : `Translate to casual Egyptian Arabic (ONLY translation): "${text}"`;

    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });

    const response = await model;
    return response.text?.trim() || text;
  });
};
