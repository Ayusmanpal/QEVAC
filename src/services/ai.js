import { GoogleGenAI } from '@google/genai';

// Initialize the SDK lazily to avoid crash if API key is missing.
let ai = null;

const systemInstruction = `You are Qevac, an emergency evacuation AI. Your job is to generate fast, clear, life-saving evacuation plans. 
Always respond in strict JSON format. 
Be direct — no fluff. People's lives depend on clarity.
Expected JSON format:
{
  "primary_route": "string description",
  "alternate_routes": ["string", "string"],
  "avoid": ["string", "string"],
  "bring": ["string", "string"],
  "nearest_shelters": ["string", "string"],
  "estimated_time_minutes": number,
  "survival_tip": "one critical tip specific to this crisis type"
}`;

export async function generateEvacuationPlan({ location, crisisType, severity, blockedRoutes = [] }) {
  const prompt = `
Location: ${location}
Crisis Type: ${crisisType}
Severity: ${severity}
Reported blocked routes: ${blockedRoutes.length > 0 ? blockedRoutes.join(', ') : 'none'}

Generate an evacuation plan based on the criteria. Ensure the output is valid JSON.
`;

  try {
    if (!ai) {
      ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2, // Low temperature for factual, reliable outputs
      }
    });

    // Parse the JSON response
    const data = JSON.parse(response.text());
    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
