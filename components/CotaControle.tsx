"use client"
import React from "react"
import type { CotaRaster } from "@/hooks/useCotaRaster"
import { fonteCotas } from "@/lib/constants"

const fmt = (v: number) => v.toFixed(2).replace(".", ",")

/** Cota atual + play/pause + slider + opacidade. Usado na página de Danos e no cenário "Todas as cotas". */
export function CotaControle({
  raster,
  municipio,
  className = "",
  vertical = false,
  opacidade = 0.55,
  onOpacidadeChange,
}: {
  raster: CotaRaster
  municipio?: string
  className?: string
  vertical?: boolean
  opacidade?: number
  onOpacidadeChange?: (op: number) => void
}) {
  const { cota, minimo, maximo, passo, tocando, setTocando, setCota, pronta } =
    raster
  if (cota === null) return null
  // Passo fino (passo/20), ajustado para que `maximo` (ex.: 2,6215 m, pico) seja
  // um valor selecionável: sem isso a grade min + k·passo/20 para em 2,60.
  const faixa = maximo - minimo
  const nPassos = Math.max(1, Math.round(faixa / (passo / 20)))
  const passoSlider = faixa / nPassos
  if (vertical) {
    // Slider vertical (cota alta em cima), usado ao lado do Painel do dashboard.
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div className="text-center">
          <div className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
            Cota
          </div>
          <div className="text-base leading-tight font-black text-[#055071] tabular-nums">
            {fmt(cota)}
          </div>
          <div className="text-[11px] font-bold text-slate-500">
            {pronta ? "metros" : "carregando…"}
          </div>
          {municipio && (
            <div
              className="mt-0.5 rounded px-1 py-0.2 text-[11px] font-black uppercase tracking-wider text-white"
              style={{
                backgroundColor:
                  fonteCotas(municipio) === "CIEX" ? "#0a6e9a" : "#055071",
              }}
              title={`Fonte das cotas: ${fonteCotas(municipio)}`}
            >
              {fonteCotas(municipio)}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setTocando((t) => !t)}
          disabled={!pronta}
          className="active-press hover-lift flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#055071] text-sm text-white shadow-sm active:scale-[0.95] transition-all duration-150 disabled:opacity-50"
          aria-label={tocando ? "Pausar" : "Reproduzir"}
          aria-pressed={tocando}
          aria-busy={!pronta}
        >
          {!pronta ? (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden="true"
            />
          ) : tocando ? (
            "❚❚"
          ) : (
            "▶"
          )}
        </button>
        <input
          type="range"
          min={minimo}
          max={maximo}
          step={passoSlider}
          value={cota}
          onChange={(ev) => setCota(parseFloat(ev.target.value))}
          className="min-h-0 flex-1 accent-[#055071]"
          aria-label="Cota do rio"
          aria-valuetext={`cota ${fmt(cota)} metros`}
          style={{ writingMode: "vertical-lr", direction: "rtl", width: 20 }}
        />
        <div className="text-[11px] font-bold text-slate-500 tabular-nums">
          {fmt(minimo)}
        </div>
        {onOpacidadeChange && (
          <button
            type="button"
            onClick={() => {
              const niveis = [0.35, 0.55, 0.75, 0.90]
              const atual = opacidade ?? 0.55
              const idx = niveis.findIndex((n) => Math.abs(n - atual) < 0.05)
              const proximo = niveis[(idx + 1) % niveis.length]
              onOpacidadeChange(proximo)
            }}
            className="mt-1 flex flex-col items-center gap-0.5 rounded px-1.5 py-1 text-[11px] font-bold text-slate-600 hover:text-[#055071] bg-slate-100 hover:bg-slate-200/80 transition-colors border border-slate-200/70 shadow-xs"
            title={`Opacidade da mancha: ${Math.round((opacidade ?? 0.55) * 100)}% (clique para alternar 35%, 55%, 75%, 90%)`}
          >
            <span className="text-[11px] leading-none">💧</span>
            <span className="tabular-nums">{Math.round((opacidade ?? 0.55) * 100)}%</span>
          </button>
        )}
      </div>
    )
  }
  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
      <div className="w-24 shrink-0 text-center">
        <div className="text-[11px] font-bold tracking-wide text-slate-500 uppercase flex items-center justify-center gap-1">
          <span>Cota</span>
          {municipio && (
            <span
              className="rounded px-1 py-0.2 text-[11px] font-black text-white"
              style={{
                backgroundColor:
                  fonteCotas(municipio) === "CIEX" ? "#0a6e9a" : "#055071",
              }}
            >
              {fonteCotas(municipio)}
            </span>
          )}
        </div>
        <div className="text-xl font-black text-[#055071] tabular-nums">
          {fmt(cota)} m
        </div>
      </div>
      <button
        type="button"
        onClick={() => setTocando((t) => !t)}
        disabled={!pronta}
        className="active-press hover-lift flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#055071] text-sm text-white shadow-sm active:scale-[0.95] transition-all duration-150 disabled:opacity-50"
        aria-label={tocando ? "Pausar" : "Reproduzir"}
        aria-pressed={tocando}
        aria-busy={!pronta}
      >
        {!pronta ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            aria-hidden="true"
          />
        ) : tocando ? (
          "❚❚"
        ) : (
          "▶"
        )}
      </button>
      <input
        type="range"
        min={minimo}
        max={maximo}
        step={passoSlider}
        value={cota}
        onChange={(ev) => setCota(parseFloat(ev.target.value))}
        className="min-w-0 flex-1 accent-[#055071]"
        aria-label="Cota do rio"
        aria-valuetext={`cota ${fmt(cota)} metros`}
      />
      {onOpacidadeChange && (
        <button
          type="button"
          onClick={() => {
            const niveis = [0.35, 0.55, 0.75, 0.90]
            const atual = opacidade ?? 0.55
            const idx = niveis.findIndex((n) => Math.abs(n - atual) < 0.05)
            const proximo = niveis[(idx + 1) % niveis.length]
            onOpacidadeChange(proximo)
          }}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-slate-600 hover:text-[#055071] bg-slate-100 hover:bg-slate-200/80 transition-colors border border-slate-200/70 shrink-0"
          title={`Opacidade da mancha: ${Math.round((opacidade ?? 0.55) * 100)}% (clique para alternar 35%, 55%, 75%, 90%)`}
        >
          <span>💧</span>
          <span className="tabular-nums">{Math.round((opacidade ?? 0.55) * 100)}%</span>
        </button>
      )}
    </div>
  )
}
