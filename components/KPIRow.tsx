import React from "react"
import { C, PANEL_CARD_BG } from "@/lib/constants"

interface KPIRowProps {
  titulo: string
  valor: string | number
  sub: string
  delta?: string
  cor?: string
  extra?: React.ReactNode
}

export function KPIRow({ titulo, valor, sub, delta, cor, extra }: KPIRowProps) {
  return (
    <div
      className="hover-lift overflow-hidden rounded-lg print:break-inside-avoid"
      style={{
        border: "1px solid rgba(5,80,113,0.15)",
      }}
    >
      <div
        className="flex items-center justify-between gap-1.5 px-3 py-1"
        style={{
          background: "linear-gradient(135deg, #055071 0%, #0a6e9a 100%)",
        }}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          {cor && (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: cor }}
            />
          )}
          <span className="truncate text-[9px] leading-none font-black tracking-wider text-white uppercase">
            {titulo}
          </span>
        </div>
        {extra}
      </div>
      <div
        className="flex items-center justify-between gap-3 px-3 py-2"
        style={{ backgroundColor: PANEL_CARD_BG }}
      >
        <div className="flex min-w-0 flex-col">
          <span className="text-[10px] leading-none" style={{ color: C.muted }}>
            {sub}
          </span>
          {delta && (
            <span
              className="mt-1.5 inline-block w-fit rounded px-1.5 py-0.5 text-[9px] font-semibold"
              style={{
                backgroundColor: PANEL_CARD_BG,
                border: `1px solid ${C.border}`,
                color: C.primary,
              }}
            >
              {delta}
            </span>
          )}
        </div>
        <span
          className="shrink-0 leading-none font-black"
          style={{ color: C.primary, fontSize: "clamp(16px, 2.4vh, 24px)" }}
        >
          {valor}
        </span>
      </div>
    </div>
  )
}
