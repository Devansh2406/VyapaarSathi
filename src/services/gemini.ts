import { toast } from "sonner";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const isGeminiConfigured = () => !!API_KEY;

// Interfaces matching the UI components
export interface Insight {
  id: number;
  type: 'success' | 'warning' | 'info' | 'alert';
  icon: string;
  title: string;
  message: string;
  action: string;
  screen: string; // Target screen for navigation
  color: string;
}

export interface Suggestion {
  icon: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DemandPrediction {
  item: string;
  demand: 'High' | 'Medium' | 'Low';
  prediction: string;
  days: string;
  color: 'green' | 'yellow' | 'gray';
}

export interface ReorderSuggestion {
  item: string;
  current: number;
  suggested: number;
  reason: string;
  urgency: 'urgent' | 'medium';
}

export interface AIAnalysisResult {
  insights: Insight[];
  suggestions: Suggestion[];
  demandPrediction: DemandPrediction[];
  reorderSuggestions: ReorderSuggestion[];
}

// Helper to find a working model
async function getWorkingModel(): Promise<string | null> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );

    if (!response.ok) {
      console.error("Gemini Service: Failed to list models. Status:", response.status);
      const err = await response.text();
      console.error("Error Body:", err);
      if (err.includes("API_KEY_INVALID") || response.status === 400) {
        toast.error("Invalid API Key");
      } else {
        toast.error("Google Cloud Console: API not enabled?");
      }
      return null;
    }

    const data = await response.json();
    console.log("Gemini Service: Available Models:", data.models?.map((m: any) => m.name));

    const models = data.models || [];
    const candidates = [
      "models/gemini-1.5-flash",
      "models/gemini-1.5-flash-001",
      "models/gemini-1.5-pro",
      "models/gemini-pro"
    ];

    for (const c of candidates) {
      if (models.some((m: any) => m.name === c)) {
        return c.replace("models/", "");
      }
    }

    if (models.length > 0) {
      const firstGen = models.find((m: any) => m.name.includes("gemini"));
      if (firstGen) return firstGen.name.replace("models/", "");
    }

    return "gemini-1.5-flash";
  } catch (e) {
    console.error("Gemini Service: Network error listing models", e);
    return null;
  }
}

export const generateDashboardInsights = async (
  inventoryData: any[],
  salesData: any[]
): Promise<AIAnalysisResult | null> => {
  if (!API_KEY) {
    console.warn("Gemini Service: No API Key.");
    return null;
  }

  const modelName = await getWorkingModel();
  if (!modelName) return null;

  const prompt = `
    Analyze this store data (India context).
    Date: ${new Date().toLocaleDateString()}
    Inventory: ${JSON.stringify(inventoryData.slice(0, 10))}
    Sales: ${JSON.stringify(salesData.slice(0, 10))}

    Return ONLY raw JSON (no markdown) with this structure:
    {
      "insights": [{ 
        "id": 1, 
        "type": "info|success|warning|alert", 
        "title": "Title", 
        "message": "Message", 
        "action": "Button Label",
        "screen": "target_screen_id",
        "color": "from-blue-500 to-blue-600", 
        "icon": "💡" 
      }],
      "suggestions": [],
      "demandPrediction": [],
      "reorderSuggestions": []
    }

    IMPORTANT: "screen" must be one of: "dashboard", "sales", "inventory", "credits", "expenses".
  `;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini Service Error: ${errorText}`);
      toast.error(`AI Error: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) return null;

    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Gemini Service: Generation Error", error);
    return null;
  }
};
