"use client";

import { useEffect, useState } from "react";

export function Toast({ message, kind = "success" }: { message?: string | null; kind?: "success" | "error" }) {
  const [shown, setShown] = useState<string | null>(null);
  useEffect(() => {
    if (!message) return;
    setShown(message);
    const t = setTimeout(() => setShown(null), 4000);
    return () => clearTimeout(t);
  }, [message]);
  if (!shown) return null;
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 px-4 py-2.5 text-sm text-white shadow-lg ${
        kind === "error" ? "bg-red-700" : "bg-ink"
      }`}
    >
      {shown}
    </div>
  );
}
