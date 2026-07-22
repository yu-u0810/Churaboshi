// components/admin/ResetPanel.tsx
"use client";

import { useState } from "react";

// ここに一致した時だけ実行ボタンが有効になる（サーバー側の確認文字列と一致させる）
const CONFIRM_TEXT = "リセット";

export default function ResetPanel() {
  const [showConfirm, setShowConfirm] = useState(false); // 確認入力欄を開いているか
  const [confirmInput, setConfirmInput] = useState(""); // ユーザーが入力した確認文字列
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleStart = () => {
    // 1段階目: ネイティブconfirmで即座のタップミスを防ぐ
    if (!confirm("本当に全学生の配布記録を削除しますか？この操作は取り消せません。")) return;
    setShowConfirm(true);
    setResult(null);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setConfirmInput("");
  };

  const handleExecute = async () => {
    setSubmitting(true);
    try {
      // 2段階目: 確認文字列も添えてサーバーに実行を依頼する
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmText: confirmInput }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResult({ type: "success", text: "全データを削除しました" });
        setShowConfirm(false);
        setConfirmInput("");
      } else {
        setResult({ type: "error", text: data.message ?? "削除に失敗しました" });
      }
    } catch {
      setResult({ type: "error", text: "通信に失敗しました" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200">
      <p className="text-[10px] font-black text-red-500/70 uppercase tracking-widest mb-2">Danger Zone</p>

      {!showConfirm ? (
        <button
          onClick={handleStart}
          className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-2xl font-bold border-2 border-red-200 transition-all active:scale-95"
        >
          全データリセット
        </button>
      ) : (
        <div className="flex flex-col gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-2xl">
          <p className="text-xs font-bold text-red-800">
            確認のため「{CONFIRM_TEXT}」と入力してください
          </p>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            className="w-full p-3 border-2 border-red-300 rounded-xl text-center font-bold focus:outline-none"
            placeholder={CONFIRM_TEXT}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 bg-white text-gray-500 rounded-xl font-bold border border-gray-200 active:scale-95"
            >
              キャンセル
            </button>
            <button
              onClick={handleExecute}
              disabled={confirmInput !== CONFIRM_TEXT || submitting}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold disabled:opacity-40 transition-all active:scale-95"
            >
              実行
            </button>
          </div>
        </div>
      )}

      {result && (
        <p className={`mt-3 text-sm font-bold text-center ${result.type === "success" ? "text-green-700" : "text-red-700"}`}>
          {result.text}
        </p>
      )}
    </div>
  );
}
