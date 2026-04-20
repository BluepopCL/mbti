import { ResultJSON, QuizScores } from '../types';

export async function generatePersonalityAnalysis(scores: QuizScores, typeId: string, variant: string): Promise<ResultJSON> {
  const response = await fetch('/api/analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ scores, typeId, variant })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error \${response.status}: \${errorText}`);
  }

  return await response.json() as ResultJSON;
}
