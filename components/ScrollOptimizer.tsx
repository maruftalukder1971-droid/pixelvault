"use client";
import { useEffect } from "react";

/**
 * Adds 'is-scrolling' class to <body> while user is actively scrolling.
 * Used by .hover-when-idle in globals.css to disable hover effects mid-scroll.
 * Saves ~3-5ms per frame on dense grids.
 */
export default function ScrollOptimizer() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (!document.body.classList.contains("is-scrolling")) {
        document.body.classList.add("is-scrolling");
      }
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        document.body.classList.remove("is-scrolling");
      }, 120);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer) clearTimeout(timer);
      document.body.classList.remove("is-scrolling");
    };
  }, []);
  return null;
}