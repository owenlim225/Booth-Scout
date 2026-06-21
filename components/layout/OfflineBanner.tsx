"use client";

import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) {
    return null;
  }

  return (
    <p className="rounded-xl border border-amber-500/30 bg-amber-100 px-3 py-2 text-sm font-medium text-amber-900">
      You are offline. Checklist data is served from local storage.
    </p>
  );
}
