"use client";

import { useEffect, useRef } from "react";
// @ts-ignore
import Quagga from "@ericblade/quagga2";

export default function BarcodeScanner({ onScan, disabled }: { onScan: (id: string) => void; disabled: boolean; }) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const isDisabledRef = useRef(disabled);

  useEffect(() => {
    isDisabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    if (!scannerRef.current) return;

    Quagga.init({
      inputStream: {
        name: "LiveStream",
        type: "LiveStream",
        target: scannerRef.current,
        constraints: {
          facingMode: "environment",
          aspectRatio: { ideal: 1 }, // 正方形に近いエリアで解析
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      },
      // ICONITの心臓部：デコーダー設定
      decoder: {
        // 複数を指定せず「codabar（NW-7）」だけに絞るのが爆速のコツ
        readers: ["codabar_reader"],
        multiple: false
      },
      locate: true, // バーコードの位置を探す機能をON
      frequency: 10, // 1秒間にスキャンする回数
    }, (err: any) => {
      if (err) {
        console.error("Quagga init error:", err);
        return;
      }
      Quagga.start();
    });

    // 読み取り成功時の処理
    // スタート・ストップキャラクタ（A-D）の除去はhandleProcessId側（手動入力とも共通）で
    // 一括して行う。ここで先に除去すると二重除去になり、正当なIDの先頭/末尾文字を
    // 誤って欠落させる可能性がある
    const handleDetected = (data: any) => {
      if (isDisabledRef.current) {
        console.log("Scan blocked while processing");
        return;
      }

      const code = data.codeResult.code;
      if (code) {
        if (navigator.vibrate) navigator.vibrate(50);
        onScan(code);
      }
    };
    Quagga.onDetected(handleDetected);

    return () => {
      // onDetectedを解除しないとQuagga再初期化の度にリスナーが積み重なり、
      // 1回のスキャンでonScanが複数回呼ばれる(=DB重複書き込み)原因になる
      Quagga.offDetected(handleDetected);
      Quagga.stop();
    };
  }, [onScan]);

  return (
    <div className="relative w-full aspect-square bg-black overflow-hidden rounded-3xl border-4 border-gray-800 shadow-2xl">
      {/* カメラ映像本体 */}
      <div ref={scannerRef} className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover" />
      
      {/* ICONIT風UIガイド */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* 外側の暗がり */}
        <div className="absolute inset-0 bg-black/40 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]"></div>
        
        {/* 横長のスキャンターゲット */}
        <div className="relative w-[85%] h-[25%] border-2 border-yellow-400 rounded-lg shadow-[0_0_20px_rgba(250,204,21,0.4)]">
          {/* レーザー光線のような赤いライン */}
          <div className="w-full h-[2px] bg-red-500 absolute top-1/2 -translate-y-1/2 shadow-[0_0_15px_red] animate-pulse"></div>
          
          {/* 四隅の装飾 */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-yellow-400 rounded-tl-md"></div>
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-yellow-400 rounded-tr-md"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-yellow-400 rounded-bl-md"></div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-yellow-400 rounded-br-md"></div>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <span className="bg-yellow-400 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
          NW-7 Optimized Mode
        </span>
      </div>
    </div>
  );
}