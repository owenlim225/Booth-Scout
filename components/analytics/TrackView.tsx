"use client";

import { useEffect } from "react";
import { track, type AnalyticsEventName } from "@/lib/analytics";

type TrackViewProps = {
  name: AnalyticsEventName;
  metadata?: Record<string, string | number | boolean | null>;
};

export function TrackView({ name, metadata = {} }: TrackViewProps) {
  useEffect(() => {
    void track(name, metadata);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return null;
}
