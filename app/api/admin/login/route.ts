// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, deriveSessionToken, COOKIE_NAME } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  // リクエストボディからパスワードを取得
  const body = await request.json().catch(() => null);
  const password = body?.password;

  // パスワードが一致しなければ401（詳細な失敗理由は返さない）
  if (typeof password !== "string" || !verifyPassword(password)) {
    return NextResponse.json({ success: false, message: "パスワードが違います" }, { status: 401 });
  }

  // 一致したらセッショントークンをhttpOnly Cookieとして発行（12時間有効＝イベント1日分を想定）
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, deriveSessionToken(), {
    httpOnly: true, // JS(document.cookie)から読めないようにする
    secure: process.env.NODE_ENV === "production", // 本番はHTTPS前提で送信を制限
    sameSite: "strict",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  return response;
}
