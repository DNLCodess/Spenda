// PIN is a per-device local lock only — it is hashed and never leaves the device,
// never synced. It gates access to the app on this device.

export async function hashPin(pin) {
  const data = new TextEncoder().encode("spenda:" + pin);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPin(pin, hash) {
  if (!hash) return false;
  return (await hashPin(pin)) === hash;
}
