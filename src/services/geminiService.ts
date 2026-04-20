import { GoogleGenAI, Type } from '@google/genai';
import { ResultJSON, QuizScores } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generatePersonalityAnalysis(scores: QuizScores, typeId: string, variant: string): Promise<ResultJSON> {
  const prompt = `作为一个具有同理心且专业的心理学家，请基于用户的MBTI测试得分以及最终判定的人格类型 (${typeId.toUpperCase()}-${variant})，生成一份深入的性格分析报告。
${variant === 'A' ? 'A (Assertive, 自信型) 代表此人更加沉稳、自信，抗压能力强。' : 'T (Turbulent, 动荡型) 代表此人更加完美主义、在意他人看法、容易产生自我怀疑且更有驱动力。'}
用户的各项倾向分数为：
外向(E): ${scores.E}, 内向(I): ${scores.I}
实感(S): ${scores.S}, 直觉(N): ${scores.N}
思考(T): ${scores.T}, 情感(F): ${scores.F}
判断(J): ${scores.J}, 感受(P): ${scores.P}
自信(A): ${scores.A}, 动荡(T): ${scores.Tu}
(分数越高代表在该维度上的倾向越明显，满分为9分)

请严格按照提供的JSON Schema输出内容，注重语气亲切、积极向上，并且使用中文。

重要要求：
1. celebrities: 推荐3个著名的历史人物、明星或著名动漫角色，要求MBTI必须与用户完全一致（${typeId.toUpperCase()}）。请附带一句简短的描述，例如"史蒂夫·乔布斯 - 改变世界的愿景"
2. compatibility: 总结出：最佳伴侣(bestMatch)、最佳拍档(workPartner)、容易摩擦或需要包容(conflict)的MBTI类型，以及为什么（各一句话即可）。`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: '整体性格概述' },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: '优势列表' },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: '劣势或成长空间列表' },
          careerPath: { type: Type.ARRAY, items: { type: Type.STRING }, description: '适合的职业领域' },
          relationships: { type: Type.STRING, description: '情感与人际交往建议' },
          motto: { type: Type.STRING, description: '专属人生格言' },
          celebrities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ['name', 'description']
            }
          },
          compatibility: {
            type: Type.OBJECT,
            properties: {
              bestMatch: { type: Type.STRING },
              workPartner: { type: Type.STRING },
              conflict: { type: Type.STRING }
            },
            required: ['bestMatch', 'workPartner', 'conflict']
          }
        },
        required: ['summary', 'strengths', 'weaknesses', 'careerPath', 'relationships', 'motto', 'celebrities', 'compatibility']
      }
    }
  });

  const textResp = response.text || "{}";
  return JSON.parse(textResp) as ResultJSON;
}
