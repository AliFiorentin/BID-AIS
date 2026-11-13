import React from "react"
import { C, PANEL_CARD_BG } from "@/lib/constants"
import { MetricInfoPopover } from "@/components/MetricInfoPopover"

interface KPIRowProps {
  titulo: string
  valor: string | number
  sub: string
  delta?: string
  cor?: string
  extra?: React.ReactNode
  infoKey?: string
}

function detectInfoKey(titulo: string): string | undefined {
  const t = titulo.toLowerCase()
  if (t.includes("vab")) return "empresas_vab"
  if (t.includes("massa")) return "massa_salarial"
  if (t.includes("empresa") || t.includes("empregado")) return "empresas_vab"
  if (t.includes("docente") || t.includes("escola") || t.includes("matrícula") || t.includes("profissiona")) return "educacao"
  if (t.includes("saúde") || t.includes("leito") || t.includes("hospital") || t.includes("ubs")) return "saude"
  if (t.includes("agrícola") || t.includes("cultura") || t.includes("safra")) return "agricultura"
  if (t.includes("área")) return "area_atingida"
  if (t.includes("quadra") || t.includes("edifica")) return "edificacoes"
  if (t.includes("popula")) return "populacao"
  return undefined
}

export function KPIRow({ titulo, valor, sub, delta, cor, extra, infoKey }: KPIRowProps) {
  const resolvedInfoKey = infoKey || detectInfoKey(titulo)
  return (
    <div
      className="hover-lift overflow-hidden rounded-xl border border-[rgba(5,80,113,0.14)] shadow-xs print:break-inside-avoid"
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
          <span className="truncate text-[11px] leading-none font-black tracking-wider text-white uppercase">
            {titulo}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {extra}
          {resolvedInfoKey && <MetricInfoPopover metricKey={resolvedInfoKey} title={titulo} />}
        </div>
      </div>
      <div
        className="flex items-center justify-between gap-3 px-3 py-2"
        style={{ backgroundColor: PANEL_CARD_BG }}
      >
        <div className="flex min-w-0 flex-col">
          <span className="text-[11px] leading-none" style={{ color: C.muted }}>
            {sub}
          </span>
          {delta && (
            <span
              className="mt-1.5 inline-block w-fit rounded px-1.5 py-0.5 text-[11px] font-semibold"
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
