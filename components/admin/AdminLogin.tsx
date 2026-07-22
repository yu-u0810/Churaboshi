// components/admin/AdminLogin.tsx
"use client";

import { useState } from "react";

interface AdminLoginProps {
  onSuccess: () => void; // ログイン成功時に親(ページ)へ通知
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState(""); // 入力中のパスワード
  const [error, setError] = useState(""); // エラーメッセージ
  const [submitting, setSubmitting] = useState(false); // 二重送信防止

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // サーバー側でADMIN_PASSWORDと照合してもらう（クライアントにパスワードを持たせない）
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        setError("パスワードが違います");
      }
    } catch {
      setError("通信に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
      <p className="text-sm font-bold text-gray-600 text-center">管理者パスワードを入力してください</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-4 border-2 border-gray-200 rounded-2xl text-center font-bold focus:outline-none focus:border-gray-400"
        placeholder="パスワード"
        autoFocus
      />
      {error && <p className="text-sm text-red-600 font-bold text-center">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !password}
        className="py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold disabled:opacity-40 transition-all active:scale-95"
      >
        ログイン
      </button>
    </form>
  );
}
