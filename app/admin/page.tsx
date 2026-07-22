// app/admin/page.tsx
"use client";

import { BOOTHS } from "@/lib/constants";
import { useAdminStats } from "@/hooks/useAdminStats";

export default function AdminPage() {
  // Firebaseの配布状況をリアルタイムで集計するフック（ロジックは hooks 側に分離）
  const { stats, loading } = useAdminStats();

  return (
    <main className="min-h-screen p-4 bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
        {/* ヘッダー */}
        <div className="bg-gray-900 p-6 text-white">
          <p className="text-gray-300 text-[10px] font-black uppercase tracking-[0.2em]">Admin Dashboard</p>
          <h1 className="text-2xl font-black tracking-tight">配布状況</h1>
        </div>

        <div className="p-6">
          {loading || !stats ? (
            // 初回読み込み中はスピナーのみ表示
            <div className="flex justify-center py-12">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* 全体の配布済み人数（いずれかの屋台で受け取った人数 / 登録人数） */}
              <div className="p-5 bg-blue-50 border-2 border-blue-300 rounded-2xl">
                <p className="text-[10px] font-black text-blue-700/60 uppercase tracking-widest mb-1">全体 配布済み</p>
                <p className="text-3xl font-black text-blue-900">
                  {stats.totalDistributed}
                  <span className="text-sm font-bold ml-1">/ {stats.totalStudents}人</span>
                </p>
              </div>

              {/* 屋台ごとの配布済み人数（BOOTHSの定義順にそのまま表示） */}
              {BOOTHS.map((booth) => (
                <div key={booth.id} className="p-5 bg-gray-50 border-2 border-gray-200 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{booth.name}</p>
                  <p className="text-2xl font-black text-gray-800">{stats.boothCounts[booth.id]}人</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="mt-8 text-gray-400 text-[10px] font-medium tracking-widest uppercase">
        Admin View v1.0
      </footer>
    </main>
  );
}
