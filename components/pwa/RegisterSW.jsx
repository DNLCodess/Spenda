"use client";

import { useEffect } from "react";

// Registers the service worker in production only (it would fight Next's HMR
// in dev). Safe no-op where service workers aren't supported.
export default function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
