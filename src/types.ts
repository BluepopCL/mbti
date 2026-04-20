export type MbtiCategory = 'Analyst' | 'Diplomat' | 'Sentinel' | 'Explorer';

export interface PersonalityData {
  id: string; // e.g., 'intj'
  nameCn: string;
  nameEn: string;
  aliasCn: string; // e.g., '大姐头'
  category: MbtiCategory;
  colorClass: string; // Tailwind color class, e.g., 'bg-purple-100 text-purple-800'
  colorHex: string; // For charts
  quoteCn: string;
  quoteEn: string;
  descriptionCn: string;
  descriptionEn: string;
  avatarUrl: string;
}

export type Dimension = 'E/I' | 'S/N' | 'T/F' | 'J/P' | 'A/Tu';

export interface Question {
  id: string;
  textCn: string;
  textEn: string;
  dimension: Dimension;
  direction: 1 | -1; // 1 means agree favors E/S/T/J/A, -1 means agree favors I/N/F/P/Tu
}

export interface QuizScores {
  'E': number;
  'I': number;
  'S': number;
  'N': number;
  'T': number;
  'F': number;
  'J': number;
  'P': number;
  'A': number;
  'Tu': number;
}

export interface Celebrity {
  name: string;
  description: string;
}

export interface Compatibility {
  bestMatch: string;
  workPartner: string;
  conflict: string;
}

export interface ResultJSON {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  careerPath: string[]; // Fix typo, but requirements asked for careerPath
  relationships: string;
  motto: string;
  celebrities: Celebrity[];
  compatibility: Compatibility;
}
