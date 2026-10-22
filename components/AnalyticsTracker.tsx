"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Privacy-preserving, cookieless event and pageview telemetry dispatcher
    if (typeof window !== "undefined") {
      const payload = {
        path: pathname,
        timestamp: new Date().toISOString(),
        referrer: document.referrer || "direct",
      };
      
      // Dispatch custom browser event or send to telemetry endpoint
      window.dispatchEvent(new CustomEvent("ck_analytics_pageview", { detail: payload }));
    }
  }, [pathname]);

  return null;
}
