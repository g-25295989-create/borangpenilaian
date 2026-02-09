
import { EvaluationSection } from './types';

export const ADMIN_PASSWORD = "smkluak321";

// URL Apps Script untuk menghantar data ke Page 1
export const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyk6sTLE4gwoMknBLYhqFyqR6W5yF1pvMmUr_tlUOE-iQnvBlNq-Z97srgLZwSnh8bD/exec";

// URL Export CSV untuk Page 2 (Summary Data)
// Menyasarkan range B1:D5 secara khusus supaya data purata yang siap dikira dipaparkan
export const SHEET_EXPORT_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTY3kimy7B8BHGI8damnGF4bq9CSLJzPlhKx1ogExODEYjd86HdhkWNR9rWsdD7DYpFT5s04gGh1-jI/pub?gid=1133091578&single=true&output=csv&range=B1:D5";

export const RUMAH_SUKAN_OPTIONS = ["Emerald (Hijau)", "Topaz (Kuning)", "Ruby (Merah)", "Sapphire (Biru)"];

export const EVALUATION_SECTIONS: EvaluationSection[] = [
  {
    id: 'A', title: 'A. Kekemasan & Penampilan', icon: 'fa-shirt', totalMax: 20,
    criteria: [
      { id: 'a1', description: 'Kekemasan pakaian seragam (lengkap & bersih)', maxScore: 10 },
      { id: 'a2', description: 'Aksesori (tudung/songkok/beret)', maxScore: 5 },
      { id: 'a3', description: 'Kekemasan diri keseluruhan', maxScore: 5 },
    ]
  },
  {
    id: 'B', title: 'B. Kawalan Barisan & Pergerakan', icon: 'fa-shoe-prints', totalMax: 25,
    criteria: [
      { id: 'b1', description: 'Keseragaman langkah & rentak', maxScore: 10 },
      { id: 'b2', description: 'Kelurusan barisan & jarak ahli', maxScore: 10 },
      { id: 'b3', description: 'Ketepatan pergerakan (pusing/henti)', maxScore: 5 },
    ]
  },
  {
    id: 'C', title: 'C. Arahan & Kepimpinan Ketua', icon: 'fa-bullhorn', totalMax: 20,
    criteria: [
      { id: 'c1', description: 'Kelantangan & kejelasan suara', maxScore: 10 },
      { id: 'c2', description: 'Ketepatan arahan (intonasi/masa)', maxScore: 5 },
      { id: 'c3', description: 'Kawalan diri & daya kepimpinan', maxScore: 5 },
    ]
  },
  {
    id: 'D', title: 'D. Kerjasama & Disiplin Ahli', icon: 'fa-users-gear', totalMax: 20,
    criteria: [
      { id: 'd1', description: 'Semangat & Vitality', maxScore: 10 },
      { id: 'd2', description: 'Disiplin barisan sepanjang kawad', maxScore: 5 },
      { id: 'd3', description: 'Keserasian antara ahli', maxScore: 5 },
    ]
  },
  {
    id: 'E', title: 'E. Keseluruhan & Impak Persembahan', icon: 'fa-wand-magic-sparkles', totalMax: 15,
    criteria: [
      { id: 'e1', description: 'Kreativiti gaya persembahan', maxScore: 10 },
      { id: 'e2', description: 'Impak visual & aura pasukan', maxScore: 5 },
    ]
  }
];
