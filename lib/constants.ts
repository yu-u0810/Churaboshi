// lib/constants.ts

// 1. 屋台のIDをリテラル型で定義
export type BoothId = "booth_sweets" | "booth_snacks";

export interface Booth {
  id: BoothId;
  name: string;
  description: string;
}

// 2. 屋台のマスターデータを修正
export const BOOTHS: Booth[] = [
  {
    id: "booth_sweets",
    name: "わたあめ・かきごおり",
    description: "どちらか1つを選択して配布",
  },
  {
    id: "booth_snacks",
    name: "タコせん・チョコバナナ・ドリンク",
    description: "どれか1つを選択して配布",
  },
];