"use client"

import React from "react"
import { Info } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { METRIC_METADATA, type MetricMetadata } from "@/lib/metric-metadata"
import { C } from "@/lib/constants"

interface MetricInfoPopoverProps {
  metricKey?: keyof typeof METRIC_METADATA | string
  customMeta?: Partial<MetricMetadata>
  title?: string
  className?: string
  iconSize?: number
  corIcone?: string
}

export function MetricInfoPopover({
  metricKey,
  customMeta,
  title,
  className = "",
  iconSize = 11,
  corIcone,
}: MetricInfoPopoverProps) {
  const meta: MetricMetadata | undefined = metricKey
    ? METRIC_METADATA[metricKey]
    : undefined

  const finalTitle = customMeta?.titulo || meta?.titulo || title || "Metodologia & Fonte"
  const finalMetodologia = customMeta?.metodologia || meta?.metodologia
  const finalFormula = customMeta?.formula || meta?.formula
  const finalParametros = customMeta?.parametros || meta?.parametros
  const finalFonte = customMeta?.fonte || meta?.fonte
  const finalObs = customMeta?.observacao || meta?.observacao

  if (!finalMetodologia && !finalFormula && !finalFonte) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Informações metodológicas sobre ${finalTitle}`}
          className={`group/info active-press inline-flex shrink-0 items-center justify-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/60 ${className}`}
          style={{
            color: corIcone || "rgba(255,255,255,0.75)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Info
            size={iconSize}
            strokeWidth={2.4}
            className="transition-transform group-hover/info:scale-110"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="z-50 w-80 max-w-[90vw] rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          {/* Cabeçalho */}
          <div className="border-b border-slate-100 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: C.primary }}
              />
              <span
                className="text-xs font-black tracking-tight"
                style={{ color: C.primary }}
              >
                {finalTitle}
              </span>
            </div>
            {finalMetodologia && (
              <span className="text-[10px] font-semibold text-slate-500">
                {finalMetodologia}
              </span>
            )}
          </div>

          {/* Fórmula */}
          {finalFormula && (
            <div className="flex flex-col gap-1 rounded-md bg-slate-50 p-2 border border-slate-100">
              <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase">
                Fórmula de Cálculo
              </span>
              <code className="text-[10px] leading-relaxed font-mono font-semibold text-slate-900 break-words">
                {finalFormula}
              </code>
            </div>
          )}

          {/* Parâmetros */}
          {finalParametros && finalParametros.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase">
                Parâmetros Oficiais
              </span>
              <div className="flex flex-col gap-1 text-[9.5px]">
                {finalParametros.map((p) => (
                  <div
                    key={p.nome}
                    className="flex justify-between items-baseline gap-1.5 border-b border-slate-100/60 pb-0.5"
                  >
                    <span className="font-semibold text-slate-600">{p.nome}:</span>
                    <span className="font-mono text-slate-900 text-right font-medium">
                      {p.valor}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fonte Oficial */}
          {finalFonte && (
            <div className="flex flex-col gap-0.5 pt-0.5">
              <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase">
                Base de Dados & Fonte Oficial
              </span>
              <p className="text-[10px] leading-snug font-medium text-slate-700">
                {finalFonte}
              </p>
            </div>
          )}

          {/* Observação */}
          {finalObs && (
            <p className="text-[9.5px] italic text-slate-500 border-t border-slate-100 pt-1 leading-tight">
              {finalObs}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
