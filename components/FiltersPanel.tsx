"use client"

import React from "react"
import { SlidersHorizontal, PanelRightClose } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  C,
  COLORS,
  CNAE_LABELS,
  DANO_FISICO_MUNICIPIO,
  DANO_FISICO_RPS,
} from "@/lib/constants"
import type { DashboardState } from "@/hooks/useDashboard"

interface FiltersPanelProps {
  dash: DashboardState
}

interface Chip {
  id: string
  label: string
  cor: string
  on: boolean
  toggle: () => void
}

const glassStyle = (opacity = 0.8) =>
  ({
    backgroundColor: `rgba(255,255,255,${opacity})`,
    backdropFilter: "blur(24px) saturate(190%)",
    WebkitBackdropFilter: "blur(24px) saturate(190%)",
    border: "0.5px solid rgba(255,255,255,0.75)",
    boxShadow:
      "0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04), inset 0 0.5px 0 0 rgba(255,255,255,0.9)",
  }) as const

export function FiltersPanel({ dash }: FiltersPanelProps) {
  const {
    municipio,
    cenario,
    camadas,
    filtroSetor,
    setFiltroSetor,
    filtroDep,
    setFiltroDep,
    filtroTipo,
    setFiltroTipo,
    showFiltros,
    setShowFiltros,
    showMancha,
    setShowMancha,
    showDanoFisico,
    setShowDanoFisico,
    rpDanoFisico,
    setRpDanoFisico,
    isVisaoGeral,
    isCenarioAtivo,
    temCamadaTabular,
    cotasAtivo,
    cotaRaster,
    showPainelAnalise,
    setoresUnicos,
    depsUnicas,
    tiposUnicos,
    headerBottom,
    resetSeq,
  } = dash

  const showPanel = (temCamadaTabular || isCenarioAtivo || cotasAtivo) && !isVisaoGeral
  const [abertoFiltros, setAbertoFiltros] = React.useState(false)

  const temTrilhoCota = cotasAtivo && !cotaRaster?.erro && cotaRaster?.cota !== null
  const temErroCota = cotasAtivo && Boolean(cotaRaster?.erro)

  // O painel principal (AnalysisPanel) tem w-[420px] e fica em left-3 (12px), totalizando 432px de borda direita.
  // Em cotas ativas com trilho vertical, o CotaControle fica em left-[432px] com w-[68px], totalizando 500px.
  // Em caso de erro de cota, o CotaControle tem max-w-[140px], totalizando 572px.
  // Quando o painel de análise está recolhido, o botão 'Painel' fica em left-4 (16px) e tem ~92px de largura.
  const leftPosition = showPainelAnalise
    ? temTrilhoCota
      ? 510
      : temErroCota
        ? 582
        : 442
    : temTrilhoCota
      ? 88
      : 116

  // Alinhado no topo com o painel principal (top: headerBottom)
  const topPosition = showPainelAnalise ? headerBottom : headerBottom + 12

  // O popover nasce aberto (descobribilidade) e se recolhe sozinho uma vez em 6 s,
  // a menos que a pessoa interaja com ele antes. Trocar de município, cenário ou reiniciar reabre.
  const interagiu = React.useRef(false)
  const jaRecolheu = React.useRef(false)
  const primeiraSelecao = React.useRef(true)

  React.useEffect(() => {
    if (primeiraSelecao.current) {
      primeiraSelecao.current = false
      return
    }
    interagiu.current = false
    jaRecolheu.current = false
    setShowFiltros(true)
  }, [municipio, cenario, resetSeq, setShowFiltros])

  const visivel = showFiltros && showPanel
  React.useEffect(() => {
    if (!visivel || jaRecolheu.current) return
    const t = setTimeout(() => {
      jaRecolheu.current = true
      if (!interagiu.current) setShowFiltros(false)
    }, 6000)
    return () => clearTimeout(t)
  }, [visivel, setShowFiltros])

  const nFiltrosAtivos = [
    filtroSetor !== "(todos)",
    filtroDep !== "(todas)",
    filtroTipo !== "(todas)",
  ].filter(Boolean).length

  const temFiltroDados =
    camadas.includes("Empresas") ||
    camadas.includes("Educação") ||
    camadas.includes("Saúde")

  const camadasMapa: (Chip & { mostrar: boolean })[] = [
    {
      id: "mancha",
      label: "Mancha",
      cor: COLORS.cenario,
      on: showMancha,
      toggle: () => setShowMancha((p) => !p),
      mostrar: (isCenarioAtivo && !isVisaoGeral) || cotasAtivo,
    },
    {
      id: "dano",
      label: "Dano físico",
      cor: "#d97706",
      on: showDanoFisico,
      toggle: () => setShowDanoFisico((p) => !p),
      mostrar: municipio === DANO_FISICO_MUNICIPIO,
    },
  ]
  const chipsMapa = camadasMapa.filter((c) => c.mostrar)

  const heatmaps: Chip[] = [
    {
      id: "emp",
      label: "Empresas",
      cor: "#1d4ed8",
      on: dash.showHeatmapEmpresas,
      toggle: () => dash.setShowHeatmapEmpresas((p) => !p),
    },
    {
      id: "sau",
      label: "Saúde",
      cor: "#b91c1c",
      on: dash.showHeatmapSaude,
      toggle: () => dash.setShowHeatmapSaude((p) => !p),
    },
    {
      id: "edu",
      label: "Educação",
      cor: "#15803d",
      on: dash.showHeatmapEducacao,
      toggle: () => dash.setShowHeatmapEducacao((p) => !p),
    },
  ]

  const chip = (c: Chip) => (
    <button
      key={c.id}
      onClick={c.toggle}
      aria-pressed={c.on}
      className="active-press hover-lift flex h-6 min-w-0 items-center gap-1 rounded-full border px-2 text-[11px] font-bold active:scale-[0.96] transition-all duration-150"
      style={{
        backgroundColor: c.on ? `${c.cor}20` : "transparent",
        borderColor: c.on ? c.cor : "#cbd5e1",
        color: c.on ? c.cor : "#64748b",
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: c.on ? c.cor : "#cbd5e1" }}
      />
      <span className="truncate">{c.label}</span>
    </button>
  )

  const titulo = (txt: string) => (
    <div className="text-[11px] font-black tracking-wider text-slate-500 uppercase">
      {txt}
    </div>
  )

  return (
    <>
      {showFiltros && showPanel && (
        <div
          onPointerDown={() => {
            interagiu.current = true
          }}
          onPointerEnter={() => {
            interagiu.current = true
          }}
          onFocus={() => {
            interagiu.current = true
          }}
          className="absolute z-20 flex w-48 flex-col gap-1.5 rounded-2xl p-2.5 shadow-2xl transition-[left,top] duration-300 ease-out print:hidden"
          style={{
            top: topPosition,
            left: leftPosition,
            ...glassStyle(0.8),
          }}
        >
          <div
            className="flex items-center justify-between border-b pb-1"
            style={{ borderColor: C.border }}
          >
            <span
              className="text-[11px] font-black tracking-wider uppercase"
              style={{ color: C.primary }}
            >
              Filtros de Mapa
            </span>
            <button
              onClick={() => setShowFiltros(false)}
              title="Recolher filtros"
              aria-label="Recolher filtros"
              className="flex items-center justify-center rounded p-0.5 transition-colors hover:bg-slate-100"
              style={{ color: C.muted }}
            >
              <PanelRightClose size={13} strokeWidth={2.5} />
            </button>
          </div>

          {chipsMapa.length > 0 && (
            <div className="flex flex-col gap-1">
              {titulo("Camadas")}
              <div className="grid grid-cols-2 gap-1">
                {chipsMapa.map(chip)}
              </div>
              {showDanoFisico && municipio === DANO_FISICO_MUNICIPIO && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {DANO_FISICO_RPS.map((rp) => (
                    <button
                      key={rp}
                      onClick={() => setRpDanoFisico(rp)}
                      className="rounded border px-1.5 py-0.5 text-[11px] font-bold transition-colors duration-150"
                      style={{
                        backgroundColor:
                          rpDanoFisico === rp ? "#d97706" : "transparent",
                        borderColor:
                          rpDanoFisico === rp ? "#d97706" : "#cbd5e1",
                        color: rpDanoFisico === rp ? "#fff" : "#64748b",
                      }}
                    >
                      {rp}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            {titulo("Heatmaps")}
            <div className="grid grid-cols-2 gap-1">{heatmaps.map(chip)}</div>
          </div>

          {temFiltroDados && (
            <div
              className="flex flex-col gap-1 border-t pt-1"
              style={{ borderColor: C.border }}
            >
              <button
                onClick={() => setAbertoFiltros((v) => !v)}
                aria-expanded={abertoFiltros}
                className="flex items-center justify-between text-[11px] font-black tracking-wider text-slate-500 uppercase"
              >
                <span>
                  Filtrar dados
                  {nFiltrosAtivos > 0 && (
                    <span
                      className="ml-1 rounded-full px-1.5 py-px text-white"
                      style={{ backgroundColor: C.primary }}
                    >
                      {nFiltrosAtivos}
                    </span>
                  )}
                </span>
                <span className="opacity-70">{abertoFiltros ? "▲" : "▼"}</span>
              </button>
              {abertoFiltros && (
                <>
                  {camadas.includes("Empresas") && (
                    <div className="flex w-full shrink-0 flex-col gap-0.5 overflow-hidden">
                      <label className="text-[11px] font-bold tracking-wider text-blue-700 uppercase">
                        Setor (Empresas)
                      </label>
                      <Select
                        value={filtroSetor}
                        onValueChange={setFiltroSetor}
                      >
                        <SelectTrigger className="h-6 w-full border-blue-200/60 bg-blue-50/50 text-[11px] [&>span]:truncate">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="(todos)">(todos)</SelectItem>
                          {setoresUnicos.map((s: string) => (
                            <SelectItem key={s} value={s}>
                              {CNAE_LABELS[s] ?? s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {camadas.includes("Educação") && (
                    <div className="flex w-full shrink-0 flex-col gap-0.5 overflow-hidden">
                      <label className="text-[11px] font-bold tracking-wider text-green-700 uppercase">
                        Dependência (Escolas)
                      </label>
                      <Select value={filtroDep} onValueChange={setFiltroDep}>
                        <SelectTrigger className="h-6 w-full border-green-200/60 bg-green-50/50 text-[11px] [&>span]:truncate">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="(todas)">(todas)</SelectItem>
                          {depsUnicas.map((s: string) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {camadas.includes("Saúde") && (
                    <div className="flex w-full shrink-0 flex-col gap-0.5 overflow-hidden">
                      <label className="text-[11px] font-bold tracking-wider text-red-700 uppercase">
                        Unidade (Saúde)
                      </label>
                      <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                        <SelectTrigger className="h-6 w-full border-red-200/60 bg-red-50/50 text-[11px] [&>span]:truncate">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="(todas)">(todas)</SelectItem>
                          {tiposUnicos.map((s: string) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {!showFiltros && showPanel && (
        <button
          onClick={() => setShowFiltros(true)}
          className="active-press hover-lift absolute z-20 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-2xl active:scale-[0.97] transition-[left,top] duration-300 ease-out focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none print:hidden"
          style={{
            top: topPosition,
            left: leftPosition,
            ...glassStyle(0.8),
            color: C.primary,
          }}
        >
          <SlidersHorizontal size={12} strokeWidth={2.5} />
          <span>Filtros</span>
          {nFiltrosAtivos > 0 && (
            <span
              className="ml-0.5 rounded-full px-1.5 py-px text-[11px] text-white font-black"
              style={{ backgroundColor: C.primary }}
            >
              {nFiltrosAtivos}
            </span>
          )}
        </button>
      )}
    </>
  )
}
