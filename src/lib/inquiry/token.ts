import { createHash, randomBytes } from "node:crypto";

export function hashToken(t: string): string {
  return createHash("sha256").update(t).digest("hex");
}

export function createDetailToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
