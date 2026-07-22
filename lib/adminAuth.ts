// lib/adminAuth.ts
import { createHmac, timingSafeEqual } from "crypto";

// admin_session Cookieの名前
export const COOKIE_NAME = "admin_session";

// セッショントークン導出時に混ぜる固定文字列（ADMIN_PASSWORDと組み合わせてHMACを作る）
const SIGNING_PAYLOAD = "churaboshi-admin-session";

// ADMIN_PASSWORDからセッショントークンを導出する（生パスワードをCookieに乗せないため）
function deriveSessionToken(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    // 未設定のまま使われた場合は明示的に落とす（無認証で通ってしまうのを防ぐ）
    throw new Error("ADMIN_PASSWORD が設定されていません");
  }
  return createHmac("sha256", secret).update(SIGNING_PAYLOAD).digest("hex");
}

export { deriveSessionToken };

// タイミング攻撃を避けるための定数時間比較
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// ログインフォームで入力されたパスワードが正しいか検証する
export function verifyPassword(input: string): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || !input) return false;
  return safeEqual(input, secret);
}

// リクエストのCookie値が有効な管理セッションかどうかを検証する
export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    return safeEqual(token, deriveSessionToken());
  } catch {
    return false;
  }
}
