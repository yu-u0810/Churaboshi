// hooks/useDistribution.ts
import { useCallback } from "react";
import { db_realtime } from "@/lib/firebase";
import { ref, get, set, update, serverTimestamp } from "firebase/database";
import { BoothId } from "@/lib/constants";

export const useDistribution = () => {
  // useCallbackで参照を固定し、カメラの再初期化を防ぐ
  const checkAndDistribute = useCallback(async (studentId: string, currentBoothId: BoothId) => {
    try {
      // データの参照先を指定 (students/学籍番号)
      const studentRef = ref(db_realtime, `students/${studentId}`);
      const snapshot = await get(studentRef);

      // 1. 新規登録
      if (!snapshot.exists()) {
        const newData = {
          booth_sweets: false, // わたあめ・かきごおりの初期値
          booth_snacks: false, // タコせん・チョコバナナ・ドリンクの初期値
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        // 今回スキャンした屋台のみ true に書き換え
        newData[currentBoothId] = true;

        await set(studentRef, newData);
        return { success: true, message: "【本番】新規登録＆配布完了！", currentData: newData };
      }

      const data = snapshot.val();

      // 2. 二重配布防止
      if (data[currentBoothId]) {
        return { success: false, message: "【警告】既に配布済みです！", currentData: data };
      }

      // 3. 既存データ更新
      const updates: any = {};
      updates[currentBoothId] = true;
      updates["updatedAt"] = serverTimestamp();
      
      await update(studentRef, updates);
      
      const updatedData = { ...data, ...updates };
      return { success: true, message: "【本番】配布を記録しました！", currentData: updatedData };

    } catch (error) {
      console.error("Database Error:", error);
      throw new Error("通信に失敗しました。");
    }
  }, []);

  return { checkAndDistribute };
};