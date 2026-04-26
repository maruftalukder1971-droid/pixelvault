import crypto from "crypto";

const KEY_HEX = process.env.ENCRYPTION_KEY ?? "";
if (KEY_HEX.length < 64) console.warn("ENCRYPTION_KEY should be 64 hex chars (32 bytes)");
const KEY = Buffer.from(KEY_HEX.slice(0, 64), "hex");

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join(".");
}

export function decrypt(payload: string): string {
  const [iv, tag, data] = payload.split(".");
  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  const dec = Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]);
  return dec.toString("utf8");
}