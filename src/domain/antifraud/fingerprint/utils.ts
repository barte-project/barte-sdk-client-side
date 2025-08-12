import { AccessTokenPayload } from "./types";

export function decodeJwtPayload(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Access Token inválido");
  }

  const payloadBase64 = parts[1];

  const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );

  const obj = JSON.parse(jsonPayload) as AccessTokenPayload;

  if (!obj.antifraudService || !obj.sellerId || isNaN(obj.sellerId))
    throw new Error("Access Token inválido");

  return obj;
}
