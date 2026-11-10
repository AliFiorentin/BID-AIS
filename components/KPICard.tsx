import React from "react"
import { C, PANEL_CARD_BG } from "@/lib/constants"

interface KPICardMetric {
  titulo?: string
  valor: string | number
  sub: string
  delta?: string
}

interface KPICardProps {
  titulo: string
  cor?: string
  extra?: React.ReactNode
  principal: KPICardMetric
  secundarios?: KPICardMetric[]
  children?: React.ReactNode
}

/**
 * Card único por tipo de infra: um cabeçalho só, a métrica principal em destaque
 * e as demais como linhas compactas abaixo. `children` fica dentro da mesma caixa.
 */
export function KPICard({
  titulo,
  cor,
  extra,
  principal,
  secundarios,
  children,
}: KPICardProps) {
  return (
    <div
      className="hover-lift overflow-hidden rounded-lg print:break-inside-avoid"
      style={{ border: "1px solid rgba(5,80,113,0.15)" }}
    >
      <div
        className="flex items-center justify-between gap-1.5 px-3 py-1.5"
        style={{
          background: "linear-gradient(135deg, #055071 0%, #0a6e9a 100%)",
        }}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          {cor && (
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: cor }}
            />
          )}
          <span className="truncate text-[10px] leading-none font-black tracking-wider text-white uppercase">
            {titulo}
          </span>
        </div>
        {extra}
      </div>
      <div
        className="flex flex-col gap-2 px-3 py-2.5"
        style={{ backgroundColor: PANEL_CARD_BG }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <span
              className="text-[10px] leading-none"
              style={{ color: C.muted }}
            >
              {principal.sub}
            </span>
            {principal.delta && (
              <span
                className="mt-1.5 inline-block w-fit rounded px-1.5 py-0.5 text-[9px] font-semibold"
                style={{
                  backgroundColor: PANEL_CARD_BG,
                  border: `1px solid ${C.border}`,
                  color: C.primary,
                }}
              >
                {principal.delta}
              </span>
            )}
          </div>
          <span
            className="shrink-0 leading-none font-black"
            style={{ color: C.primary, fontSize: "clamp(16px, 2.4vh, 24px)" }}
          >
            {principal.valor}
          </span>
        </div>
        {secundarios?.map((s) => (
          <div
            key={s.titulo}
            className="flex items-center justify-between gap-3 rounded-md px-2.5 py-1.5"
            style={{
              backgroundColor: PANEL_CARD_BG,
              border: "1px solid rgba(5,80,113,0.12)",
            }}
          >
            <div className="flex min-w-0 flex-col">
              {s.titulo && (
                <span
                  className="text-[9px] leading-none font-bold tracking-wide uppercase"
                  style={{ color: C.primary }}
                >
                  {s.titulo}
                </span>
              )}
              <span
                className="mt-0.5 text-[9.5px] font-semibold"
                style={{ color: C.muted }}
              >
                {s.delta ?? s.sub}
              </span>
            </div>
            <span
              className="shrink-0 text-sm leading-none font-black"
              style={{ color: C.primary }}
            >
              {s.valor}
            </span>
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}
