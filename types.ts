
export type HouseName = 'Emerald (Hijau)' | 'Topaz (Kuning)' | 'Ruby (Merah)' | 'Sapphire (Biru)';

export interface Criterion {
  id: string;
  description: string;
  maxScore: number;
}

export interface EvaluationSection {
  id: string;
  title: string;
  icon: string;
  totalMax: number;
  criteria: Criterion[];
}

export interface FormData {
  rumahSukan: string;
  namaHakim: string;
  ulasan: string;
  scores: Record<string, number>;
}

export interface SummaryResult {
  rumahSukan: string;
  totalScore: number;
  count: number;
}
