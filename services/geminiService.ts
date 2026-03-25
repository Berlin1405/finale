
import { GoogleGenAI } from "@google/genai";
import { Finding } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getIntelligentSummary = async (findings: Finding[]) => {
  if (!process.env.API_KEY) return "AI Summary unavailable: API Key missing.";
  
  try {
    const findingsText = findings.map(f => `- ${f.type} at ${f.endpoint} (Severity: ${f.severity})`).join('\n');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a senior cybersecurity architect. Summarize the following API security scan results for a developer report. Highlight the most dangerous risks and suggest a roadmap for fixing them.
      
      Findings:
      ${findingsText}`,
      config: {
        systemInstruction: "Keep the summary technical but actionable. Use bullet points. Focus on BOLA and JWT risks specifically."
      }
    });

    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating AI summary. Check console.";
  }
};
