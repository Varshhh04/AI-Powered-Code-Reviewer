import { GoogleGenAI, Type } from "@google/genai";

export async function analyzeCode(code: string, language: string) {
  // In AI Studio Build, the GEMINI_API_KEY is automatically injected.
  // For local development, it can be provided via VITE_GEMINI_API_KEY in a .env file.
  let apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Fallback to process.env for AI Studio environment
  if (!apiKey && typeof process !== 'undefined') {
    apiKey = process.env.GEMINI_API_KEY;
  }
  
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please ensure it is configured in the Secrets panel (AI Studio) or in a .env file as VITE_GEMINI_API_KEY (locally).");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
    const prompt = `
    You are a highly critical Senior Software Architect performing a deep-dive code review.
    Your goal is to find EVERY flaw, bug, security risk, and inefficiency in the provided code.
    Do not be polite; be technically precise and rigorous.

    CRITICAL INSTRUCTIONS:
    1. SYNTAX & LOGIC: Check for syntax errors, undefined variables, type mismatches, and logical flaws.
    2. SECURITY: Look for SQL injection, XSS, hardcoded secrets, unsafe functions (eval, etc.), and improper input validation.
    3. PERFORMANCE: Identify $O(n^2)$ or worse complexities, memory leaks, unnecessary allocations, and redundant operations.
    4. BEST PRACTICES: Enforce SOLID, DRY, and Clean Code principles. Flag "code smells".
    5. SCORING: Be harsh. A score of 10 is perfect, production-ready code. Most student/casual code should score between 3-6.

    Code to analyze:
    \`\`\`
    ${code}
    \`\`\`
    
    (User thinks this is ${language}. If the code is nonsensical or not code at all, flag it as a critical bug).

    RESPONSE FORMAT (JSON ONLY):
    {
      "detectedLanguage": "string",
      "detectedIssues": [
        { 
          "type": "bug" | "security" | "style" | "performance", 
          "description": "Detailed explanation of the flaw and how to fix it", 
          "line": number, 
          "severity": "low" | "medium" | "high" 
        }
      ],
      "timeComplexity": "string (e.g. O(n^2))",
      "optimizationSuggestions": ["Specific actionable improvement"],
      "codeQualityScore": number (1-10),
      "seniorFeedback": "A blunt, honest summary of the code's health."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLanguage: { type: Type.STRING },
            detectedIssues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  description: { type: Type.STRING },
                  line: { type: Type.NUMBER },
                  severity: { type: Type.STRING }
                },
                required: ["type", "description", "line", "severity"]
              }
            },
            timeComplexity: { type: Type.STRING },
            optimizationSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            codeQualityScore: { type: Type.NUMBER },
            seniorFeedback: { type: Type.STRING }
          },
          required: ["detectedLanguage", "detectedIssues", "timeComplexity", "optimizationSuggestions", "codeQualityScore", "seniorFeedback"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
}
