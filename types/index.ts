// types/index.ts

export interface StudentData {
  createdAt: any; // FirebaseのTimestamp
  updatedAt: any;
  // 動的にBoothIdをキーにすることで、屋台の増減に強い構造にします
  booth_sweets: boolean; // わたあめ・かきごおり配布済みフラグ
  booth_snacks: boolean; // タコせん・チョコバナナ・ドリンク配布済みフラグ
}