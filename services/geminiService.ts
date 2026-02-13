import { GoogleGenAI } from "@google/genai";
import { AiAnalysisResult, ThreatLog } from "../types";

const processEnvApiKey = process.env.API_KEY;

// Fallback mock if no API key is present, to prevent app crash in preview environments without keys
const mockAnalysis = async (): Promise<AiAnalysisResult> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    summary: "Simulated AI Analysis: The attacker attempted a standard SQL injection attack targeting the authentication bypass.",
    vector: "Input Validation Failure",
    remediation: "Ensure all user inputs are parameterized. Check WAF rules for SQLi patterns.",
    confidence: 0.95
  };
};

export const analyzeThreat = async (threat: ThreatLog): Promise<AiAnalysisResult> => {
  if (!processEnvApiKey) {
    console.warn("No API_KEY found. Using mock AI response.");
    return mockAnalysis();
  }

  try {
    const ai = new GoogleGenAI({ apiKey: processEnvApiKey });
    
    // Using gemini-2.5-flash-latest for fast analysis of text logs
    const model = "gemini-3-flash-preview"; 
    
    const prompt = `
      As a senior cybersecurity analyst, analyze this raw threat log from a honeypot:
      
      Payload: "${threat.payload}"
      Tactic: ${threat.tactic}
      Technique: ${threat.technique}
      Source IP Country: ${threat.country}
      
      Provide a response in JSON format with the following keys:
      - summary: A concise explanation of what the attacker is trying to do.
      - vector: The specific attack vector or vulnerability being exploited.
      - remediation: Actionable steps to block or mitigate this specific pattern.
      - confidence: A number between 0 and 1 indicating confidence in this assessment.
      
      Do not include markdown code blocks, just the raw JSON string.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json", 
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    const result = JSON.parse(text) as AiAnalysisResult;
    return result;
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    return {
        summary: "AI Analysis failed due to an error.",
        vector: "Unknown",
        remediation: "Check system logs.",
        confidence: 0
    };
  }
};