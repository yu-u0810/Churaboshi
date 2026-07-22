// app/api/admin/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken, COOKIE_NAME } from "@/lib/adminAuth";

// 既存のCookieが有効な管理セッションかどうかを確認する（ページ再読み込み時に再ログインさせないため）
export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return NextResponse.json({ authenticated: isValidSessionToken(token) });
}
