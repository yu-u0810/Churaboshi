// hooks/useAdminStats.ts
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db_realtime } from "@/lib/firebase";
import { BOOTHS, BoothId } from "@/lib/constants";
import { StudentData } from "@/types";

// 管理画面が表示する集計結果の型
export interface AdminStats {
  boothCounts: Record<BoothId, number>; // 屋台IDごとの配布済み人数
  totalDistributed: number; // いずれかの屋台で配布済みの人数（重複なし）
  totalStudents: number; // students に登録されている学生の総数
}

export const useAdminStats = () => {
  // 集計結果。初回読み込み完了までは null
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // students 全体を購読し、スキャンのたびに集計し直してリアルタイム反映する
    const studentsRef = ref(db_realtime, "students");

    const unsubscribe = onValue(studentsRef, (snapshot) => {
      // 屋台ごとの人数を0で初期化（未登録の屋台をundefinedにしないため）
      const boothCounts = BOOTHS.reduce((acc, booth) => {
        acc[booth.id] = 0;
        return acc;
      }, {} as Record<BoothId, number>);

      let totalDistributed = 0;
      const data = snapshot.val() as Record<string, StudentData> | null;
      const totalStudents = data ? Object.keys(data).length : 0;

      if (data) {
        Object.values(data).forEach((student) => {
          // この学生が1つでも屋台で配布済みかを判定するフラグ
          let distributedAny = false;
          BOOTHS.forEach((booth) => {
            if (student[booth.id as keyof StudentData]) {
              boothCounts[booth.id] += 1;
              distributedAny = true;
            }
          });
          if (distributedAny) totalDistributed += 1;
        });
      }

      setStats({ boothCounts, totalDistributed, totalStudents });
      setLoading(false);
    });

    // アンマウント時に購読解除する
    return () => unsubscribe();
  }, []);

  return { stats, loading };
};
