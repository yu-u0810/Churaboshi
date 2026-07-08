"use client";

import { useState } from "react";

interface ManualInputProps {
  onCancel: () => void;
  onSubmit: (id: string) => void;
  disabled?: boolean;
}

export default function ManualInput({ onCancel, onSubmit, disabled }: ManualInputProps) {
  const [value, setValue] = useState("");

  const handleConfirm = () => {
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
      // 入力値をリセット（再入力に備える）
      setValue("");
    }
  };

  return (
    <div className="absolute inset-0 bg-white p-6 flex flex-col justify-center z-20">
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <h3 className="font-bold text-gray-700">手動入力モード</h3>
          <p className="text-xs text-gray-400">バーコードが読み取れない場合に使用</p>
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          className="border-2 border-blue-100 focus:border-blue-500 rounded-xl p-4 text-xl text-center outline-none transition-all text-black"
          placeholder="学生証番号を入力"
          autoFocus
          disabled={disabled}
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            disabled={disabled}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-4 rounded-xl font-bold transition-colors"
          >
            戻る
          </button>
          <button
            onClick={handleConfirm}
            disabled={disabled || !value.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white p-4 rounded-xl font-bold shadow-lg transition-all active:scale-95"
          >
            {disabled ? "処理中..." : "確定"}
          </button>
        </div>
      </div>
    </div>
  );
}