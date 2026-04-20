import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import OpenAI from 'openai';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Domestic Model Config
const domesticApiKey = process.env.DEEPSEEK_API_KEY;
const domesticBaseURL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
const domesticModel = process.env.DOMESTIC_AI_MODEL || 'deepseek-chat';

// Gemini Config (as fallback)
const geminiApiKey = process.env.GEMINI_API_KEY;
const genAI = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

const openai = domesticApiKey ? new OpenAI({
  apiKey: domesticApiKey,
  baseURL: domesticBaseURL,
}) : null;

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    env: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasDeepSeekKey: !!process.env.DEEPSEEK_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL
    }
  });
});

app.post('/api/analysis', async (req, res) => {
  try {
    const { scores, typeId, variant } = req.body;
    
    // Validate keys early to provide better error messages
    if (!process.env.GEMINI_API_KEY && !process.env.DEEPSEEK_API_KEY) {
      return res.status(500).json({ 
        error: 'Backend Configuration Error: Missing API Keys. Please set GEMINI_API_KEY or DEEPSEEK_API_KEY in Vercel settings.' 
      });
    }

    const prompt = `作为一个具有同理心且专业的心理学家，请基于用户的MBTI测试得分以及最终判定的人格类型 (${typeId.toUpperCase()}-${variant})，生成一份深入的性格分析报告。
${variant === 'A' ? 'A (Assertive, 自信型) 代表此人更加沉稳、自信，抗压能力强。' : 'T (Turbulent, 动荡型) 代表此人更加完美主义、在意他人看法、容易产生自我怀疑且更有驱动力。'}
用户的各项倾向分数为：
外向(E): ${scores.E}, 内向(I): ${scores.I}
实感(S): ${scores.S}, 直觉(N): ${scores.N}
思考(T): ${scores.T}, 情感(F): ${scores.F}
判断(J): ${scores.J}, 感受(P): ${scores.P}
自信(A): ${scores.A}, 动荡(T): ${scores.Tu}
(分数越高代表在该维度上的倾向越明显，满分为9分)

请严格按照提供的格式输出JSON内容，注重语气亲切、积极向上，并且使用中文。

JSON 结构必须包含以下字段：
summary (性格概述), strengths (优势数组), weaknesses (劣势数组), motto (格言), 
celebrities (包含name和description的对象数组), compatibility (包含bestMatch, workPartner, conflict的对象)。`;

    // Priority 1: Domestic AI (DeepSeek/Qwen)
    if (openai && process.env.DEEPSEEK_API_KEY) {
      console.log('Generating analysis using Domestic AI Model...');
      try {
        const completion = await openai.chat.completions.create({
          model: domesticModel,
          messages: [
            { role: "system", content: "你是一个专业的MBTI心理分析专家，擅长提供温暖、深刻且精准的性格洞察。请仅回复纯JSON格式。" },
            { role: "user", content: prompt },
          ],
          response_format: { type: 'json_object' }
        });

        const textResp = completion.choices[0].message.content || "{}";
        return res.json(JSON.parse(textResp));
      } catch (e) {
        console.error('DeepSeek Error:', e);
        if (!process.env.GEMINI_API_KEY) throw e;
        console.log('Falling back to Gemini due to DeepSeek error...');
      }
    } 
    
    // Priority 2: Gemini Fallback
    if (genAI && process.env.GEMINI_API_KEY) {
      console.log('Running Gemini AI...');
      // @ts-ignore
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", // Use flash for speed, Vercel hits 10s timeout easily
        generationConfig: {
          responseMimeType: "application/json",
        }
      });
      
      const result = await model.generateContent(prompt);
      const textResp = result.response.text();
      
      if (!textResp) throw new Error("AI returned empty response");
      return res.json(JSON.parse(textResp));
    }

    throw new Error('No AI Service successfully responded.');

  } catch (error: any) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ 
      error: error.message || String(error),
      details: 'Check Vercel Logs for full stack trace.'
    });
  }
});

// Vite middleware logic
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

// Don't setup vite in Vercel functions (only for local dev/standalone server)
if (!process.env.VERCEL) {
  setupVite().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  });
}

export default app;
