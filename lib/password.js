import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

// scrypt-based password hashing — built into Node, no native/3rd-party deps.
// Format stored in DB:  "<salt-hex>:<derivedKey-hex>"

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password, stored) {
  const [salt, key] = String(stored).split(":");
  if (!salt || !key) return false;
  const derived = scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, "hex");
  if (keyBuf.length !== derived.length) return false;
  return timingSafeEqual(keyBuf, derived);
}
