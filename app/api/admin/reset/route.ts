// app/api/admin/reset/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ref, remove } from "firebase/database";
import { db_realtime } from "@/lib/firebase";
import { isValidSessionToken, COOKIE_NAME } from "@/lib/adminAuth";

// クライアント側の確認入力と同じ文字列。API直叩きでの誤削除・不正実行を防ぐ最終チェック
const CONFIRM_TEXT = "リセット";

export async function POST(request: NextRequest) {
  // 管理セッションが無ければ拒否（未ログインでの実行を防ぐ）
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!isValidSessionToken(token)) {
    return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 });
  }

  // 確認文字列が一致しない場合も拒否
  const body = await request.json().catch(() => null);
  if (body?.confirmText !== CONFIRM_TEXT) {
    return NextResponse.json({ success: false, message: "確認文字列が一致しません" }, { status: 400 });
  }

  // students配下を全削除する（破壊的操作・取り消し不可）
  await remove(ref(db_realtime, "students"));

  return NextResponse.json({ success: true });
}
