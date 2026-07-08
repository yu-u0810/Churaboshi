"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { BOOTHS, BoothId } from "@/lib/constants";
import { useDistribution } from "@/hooks/useDistribution";
import BarcodeScanner from "@/components/scanner/BarcodeScanner";
import ManualInput from "@/components/scanner/ManualInput";

type StatusType = {
  text: string;
  type: "success" | "error" | "processing" | "debug" | null;
};

export default function Home() {
  const [selectedBoothId, setSelectedBoothId] = useState<BoothId | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [remainingBooths, setRemainingBooths] = useState<string[]>([]);
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // isProcessing state自体をhandleProcessIdの依存に含めると、スキャンの度に
  // handleProcessIdの参照が変わりBarcodeScannerのカメラが再初期化されてしまうため、
  // ガード判定はrefで行い、handleProcessIdの参照を安定させる
  const isProcessingRef = useRef(false);
  const [showManual, setShowManual] = useState(false);
  const [status, setStatus] = useState<StatusType>({ text: "", type: null });

  const { checkAndDistribute } = useDistribution();

  // ハイドレーションエラー防止
  useEffect(() => {
    const saved = localStorage.getItem("selectedBoothId") as BoothId | null;
    if (saved && BOOTHS.some((b) => b.id === saved)) {
      setSelectedBoothId(saved);
    }
    setIsMounted(true);
  }, []);

  // スキャン処理本体
  const handleProcessId = useCallback(async (id: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsProcessing(true);
    let cleanId = id.trim();
    // NW-7特有のA-D開始/終了を削除
    if (/^[A-D].*[A-D]$/i.test(cleanId)) {
      cleanId = cleanId.slice(1, -1);
    }
    
    // バリデーション (タイポ cleanid -> cleanId を修正)
    if (!cleanId || !selectedBoothId) {
      isProcessingRef.current = false;
      setIsProcessing(false);
      return;
    }
    setLastScannedId(cleanId);
    
    // Firebase未接続時でも「読み取ったこと」がわかるように一時ステータスを表示
    setStatus({ text: `読み取り成功: ${cleanId}。照合しています...`, type: "processing" });

    try {
      // Firebase連携
      const result = await checkAndDistribute(cleanId, selectedBoothId);

      setStatus({
        text: result.message,
        type: result.success ? "success" : "error",
      });

      const data = result.currentData;
      if (data) {
        const remaining = BOOTHS
          .filter((booth) => !data[booth.id as keyof typeof data])
          .map((booth) => booth.name);
        setRemainingBooths(remaining);
      }

      if (result.success) setShowManual(false);

    } catch (error) {
      console.error("Distribution Error:", error);
      // Firebaseが未設定またはエラーの場合のデバッグ用表示
      setStatus({ 
        text: `通信エラー`, 
        type: "error" 
      });
    } finally {
      // 2秒間の連投ロック
      setTimeout(() => {
        isProcessingRef.current = false;
        setIsProcessing(false);
      }, 2000);
    }
  }, [selectedBoothId, checkAndDistribute]);

  if (!isMounted) return <div className="min-h-screen bg-gray-50" />;

  // 1. 屋台選択画面
  if (!selectedBoothId) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h1 className="text-2xl font-black text-center mb-8 text-gray-800">担当屋台を選択</h1>
          <div className="flex flex-col gap-4">
            {BOOTHS.map((booth) => (
              <button
                key={booth.id}
                onClick={() => {
                  localStorage.setItem("selectedBoothId", booth.id);
                  setSelectedBoothId(booth.id);
                }}
                className="py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-md active:scale-95 transition-all"
              >
                {booth.name}
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // 2. メイン操作画面
  const currentBooth = BOOTHS.find((b) => b.id === selectedBoothId);

  return (
    <main className="min-h-screen p-4 bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
        
        {/* ヘッダー */}
        <div className="bg-blue-600 p-6 text-white flex justify-between items-end">
          <div>
            <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em]">Current Booth</p>
            <h1 className="text-2xl font-black tracking-tight">{currentBooth?.name}</h1>
          </div>
          <button 
            onClick={() => {
              if (confirm("担当屋台を変更しますか？")) {
                localStorage.removeItem("selectedBoothId");
                setSelectedBoothId(null);
              }
            }}
            className="text-[10px] font-bold bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors border border-white/10"
          >
            屋台変更
          </button>
        </div>

        <div className="p-6">
          {/* スキャンエリア */}
          <div className="relative mb-6 rounded-2xl overflow-hidden bg-black aspect-square shadow-2xl border border-gray-200">
            {!showManual ? (
              <BarcodeScanner 
              onScan={handleProcessId}
              disabled={isProcessing} />
            ) : (
              <ManualInput 
                onCancel={() => setShowManual(false)} 
                onSubmit={handleProcessId}
                disabled={isProcessing}
              />
            )}
            
            {/* 処理中オーバーレイ：ICONIT風のグルグル */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-in fade-in duration-200">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
                <p className="text-white font-black text-xs tracking-widest animate-pulse">CHECKING DATA...</p>
              </div>
            )}
          </div>

          {/* ステータス表示：読み取り結果がここに出る */}
          <div className={`min-h-[120px] mb-6 p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-center ${
            status.type === "success" ? "bg-green-50 border-green-300 text-green-900" :
            status.type === "error" ? "bg-red-50 border-red-300 text-red-900" :
            status.type === "processing" ? "bg-blue-50 border-blue-300 text-blue-900" :
            "bg-gray-50 border-dashed border-gray-300 text-gray-400"
          }`}>
            {!status.type ? (
              <div className="text-center">
                <p className="text-sm font-bold">バーコードをかざしてください</p>
                <p className="text-[10px] mt-1 opacity-60 italic">Scan NW-7 Student ID</p>
              </div>
            ) : (
              <div className="animate-in zoom-in duration-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-black">
                    {status.type === "success" ? "✅ 配布許可" : status.type === "error" ? "⚠️ エラー" : "⏳ 照合中"}
                  </span>
                </div>
                <p className="text-sm font-black leading-tight">{status.text}</p>
                {lastScannedId && (
                  <div className="mt-2 py-1 px-3 bg-white/50 rounded-md inline-block">
                    <p className="text-[14px] font-mono font-bold text-gray-700">ID: {lastScannedId}</p>
                  </div>
                )}
              </div>
            )}

            {/* 次の屋台誘導 (成功時のみ表示) */}
            {status.type === "success" && remainingBooths.length > 0 && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-[10px] font-black text-green-700/60 mb-2 uppercase tracking-widest">Next Booths</p>
                <div className="flex flex-wrap gap-2">
                  {remainingBooths.map((name) => (
                    <span key={name} className="px-3 py-1 bg-green-500 text-white rounded-full text-[10px] font-black shadow-sm">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 手動入力切り替え */}
          {!showManual && (
            <button
              onClick={() => setShowManual(true)}
              disabled={isProcessing}
              className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm border border-gray-200 active:scale-95"
            >
              ⌨️ 入力できない場合はこちら
            </button>
          )}
        </div>
      </div>

      <footer className="mt-8 text-gray-400 text-[10px] font-medium tracking-widest uppercase">
        Digital Stamp Card System v1.1
      </footer>
    </main>
  );
}