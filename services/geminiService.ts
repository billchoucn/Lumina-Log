
import { GoogleGenAI, Type } from "@google/genai";
import { WorkLog } from "../types";

const API_KEY = process.env.API_KEY || "";

export const generateSummary = async (logs: WorkLog[], startDate: string, endDate: string, templateStructure?: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const logContext = logs.map(log => `
Date: ${log.date}
Title: ${log.title}
Category: ${log.category || 'Uncategorized'}
Content: ${log.content}
Tasks: ${log.tasks.map(t => `[${t.completed ? 'x' : ' '}] ${t.text}`).join(', ')}
  `).join('\n---\n');

  const templatePrompt = templateStructure 
    ? `Specific template instructions to follow: ${templateStructure}` 
    : `The summary should include:
1. Core Work Content: High-level overview.
2. Key Accomplishments: Bullet points of major results.
3. Pending/Next Steps: Future tasks.
4. Challenges & Solutions: Any blockers encountered and how they were/can be resolved.
5. Keywords: 5-8 relevant industry/professional tags.`;

  const prompt = `
Act as a senior professional assistant. Analyze the following work logs from ${startDate} to ${endDate} and generate a highly professional, structured work summary.

${templatePrompt}

Strictly follow these output requirements:
Output the result in a JSON format matching this schema:
{
  "coreContent": "Overview string (Summarize core activities based on template)",
  "outcomes": ["result 1", "result 2"],
  "pendingItems": ["task 1", "task 2"],
  "blockers": "Description of blockers",
  "solutions": "Description of solutions",
  "keywords": ["tag1", "tag2"],
  "fullMarkdown": "A complete, beautiful markdown version for export, formatted professionally"
}

Work Logs Data:
${logContext}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coreContent: { type: Type.STRING },
            outcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
            pendingItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            blockers: { type: Type.STRING },
            solutions: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            fullMarkdown: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const polishContent = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Professionalize and polish the following work log content. Maintain a 沉稳 (calm) and formal tone. Correct grammar and improve flow while keeping it concise.
  
  Content: ${text}`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });
  
  return response.text;
};

export const categorizeLog = async (title: string, content: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Analyze the following work log and classify it into exactly ONE professional category (e.g., "研发技术", "会议沟通", "项目管理", "行政事务", "客户支持", "学习成长", "市场营销"). Return ONLY the category name.
  
  Title: ${title}
  Content: ${content}`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text.trim() || "其他事务";
  } catch (e) {
    return "其他事务";
  }
};
