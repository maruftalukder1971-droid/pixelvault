"use client";
import { useEffect, useRef } from "react";

type Props = { slot: string; format?: "auto" | "rectangle" | "horizontal" | "vertical"; className?: string; placeholder?: boolean };

export default function AdSlot({ slot, format = "auto", className = "", placeholder = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const client = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!client || !ref.current) return;
    try { (window as any).adsbygoogle = (window as any).adsbygoogle || []; (window as any).adsbygoogle.push({}); } catch {}
  }, [client]);

  if (!client) {
    return placeholder ? (
      <div className={`flex items-center justify-center text-[11px] text-zinc-700 bg-zinc-950 border border-dashed border-zinc-900 rounded-xl ${className}`}>
        Ad slot Â· {slot}
      </div>
    ) : null;
  }

  return (
    <div ref={ref} className={className}>
      <ins className="adsbygoogle block" style={{ display: "block" }}
        data-ad-client={client} data-ad-slot={slot} data-ad-format={format} data-full-width-responsive="true" />
    </div>
  );
}