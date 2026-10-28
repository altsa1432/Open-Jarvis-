"use client";

import { useEffect } from "react";

function apply() {
  try {
    const raw = localStorage.getItem("frooty_app_data:device");
    const profile = raw ? (JSON.parse(raw).profile || {}) : {};
    document.documentElement.classList.toggle("frooty-reduce-motion", Boolean(profile.reducedMotion));
    document.documentElement.classList.toggle("frooty-high-contrast", Boolean(profile.highContrast));
  } catch {
    // ignore storage errors
  }
}

export default function AccessibilityApplier() {
  useEffect(() => {
    apply();
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === "frooty_app_data:device") apply();
    };
    window.addEventListener("storage", onStorage);
    const timer = window.setInterval(apply, 1500);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(timer);
    };
  }, []);
  return null;
}
