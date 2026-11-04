"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

export function AttributionCapture() {
  useEffect(() => {
    try {
      captureAttribution(window.location, document.referrer, window.sessionStorage);
    } catch {
      // 저장소 접근 불가 환경
    }
  }, []);
  return null;
}
