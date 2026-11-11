"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MUNICIPIOS,
  CENARIOS_CONFIG,
  cenarioLabel,
} from "@/lib/constants"
import { compactoBr, findCenarioData } from "@/lib/geo-utils"
import { ScenarioCompareMap } from "@/components/map/ScenarioCompareMap"
import {
  GitCompare,
  TrendingDown,
  Waves,
  Users,
  MapPin,
  Building2,
  GraduationCap,
  HeartPulse,
  Sprout,
  Copy,
  Check,
  Table as TableIcon,
  Maximize2,
  Layers,
  BarChart3,
  Info,
  ArrowRight,
} from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  municipioAtual: string
  onOpenMapFullScreen?: () => void
}

type CenarioOpData = {
  dias_efetivos?: number
  empresas_vab: number
  educacao_perdas: number
  educacao_custo_adicional: number
  saude_producao: number
  agricultura_perdas: number
  total: number
}

type CenarioFisicoData = {
  empresas_atingidas: number
  educacao_atingidas: number
  saude_atingidas: number
  empresas_valor_brl: number
  educacao_valor_brl: number
  saude_valor_brl: number
  total: number
}

type DanosOpJson = Record<string, Record<string, CenarioOpData>>
type DanosFisJson = Record<string, Record<string, CenarioFisicoData>>
type PopJson = Record<string, { pop_total: number; cenarios: Record<string, { pop_atingida: number; pct_atingida: number }> }>
type AreaJson = Record<string, { area_km2: number; cenarios: Record<string, { area_atingida_km2: number; pct_atingida: number }> }>

function fmtBRL(n: number): string {
  if (n === 0) return "R$ 0"
  return `R$ ${compactoBr(n, 1)}`
}

function fmtDelta(diff: number, isPercent = false): string {
  const sign = diff > 0 ? "+" : ""
  if (isPercent) {
    return `${sign}${diff.toFixed(1)}%`
  }
  return `${sign}${fmtBRL(diff)}`
}

function DeltaBadge({ diff, pct }: { diff: number; pct: number }) {
  if (Math.abs(diff) < 1e-4) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 text-slate-600">
        Igual
      </span>
    )
  }
  const isIncrease = diff > 0
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9.5px] font-bold tabular-nums ${
        isIncrease
          ? "bg-red-50 text-red-700 border border-red-200/60"
          : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
      }`}
    >
      {isIncrease ? "▲" : "▼"} {fmtDelta(pct, true)} ({diff > 0 ? "+" : ""}{compactoBr(diff, 1)})
    </span>
  )
}

export function CenariosComparatorModal({
  isOpen,
  onClose,
  municipioAtual,
  onOpenMapFullScreen,
}: Props) {
  const mInicial = MUNICIPIOS.includes(municipioAtual) ? municipioAtual : "Porto Alegre"
  const [selectedMun, setSelectedMun] = useState<string>(mInicial)
  const [showPoints, setShowPoints] = useState(true)
  const [leftTab, setLeftTab] = useState<"graficos" | "tabela">("graficos")

  const cenariosList = useMemo(() => {
    return CENARIOS_CONFIG[selectedMun] || []
  }, [selectedMun])

  const [chosenA, setChosenA] = useState<string | null>(null)
  const [chosenB, setChosenB] = useState<string | null>(null)
  const cenarioA = chosenA && cenariosList.includes(chosenA) ? chosenA : cenariosList[0] || ""
  const cenarioB = chosenB && cenariosList.includes(chosenB) ? chosenB : cenariosList[1] || cenariosList[0] || ""

  // Carregamento de dados
  const [opData, setOpData] = useState<DanosOpJson | null>(null)
  const [fisData, setFisData] = useState<DanosFisJson | null>(null)
  const [popData, setPopData] = useState<PopJson | null>(null)
  const [areaData, setAreaData] = useState<AreaJson | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    Promise.all([
      fetch("/dados_convertidos/danos_operacionais.json").then((r) => r.json()),
      fetch("/dados_convertidos/danos_fisicos_cenarios.json").then((r) => r.json()),
      fetch("/dados_convertidos/populacao_atingida.json").then((r) => r.json()),
      fetch("/dados_convertidos/area_atingida.json").then((r) => r.json()),
    ]).then(([op, fis, pop, area]) => {
      setOpData(op)
      setFisData(fis)
      setPopData(pop)
      setAreaData(area)
    }).catch(console.error)
  }, [isOpen])

  // Extrai métricas dos cenários selecionados
  const metricsA = useMemo(() => {
    if (!selectedMun || !cenarioA) return null
    const munOp = opData?.[selectedMun]
    const munFis = fisData?.[selectedMun]
    const munPop = popData?.[selectedMun]
    const munArea = areaData?.[selectedMun]

    const op = findCenarioData(munOp, cenarioA)
    const fis = findCenarioData(munFis, cenarioA)
    const pop = findCenarioData(munPop?.cenarios, cenarioA)
    const area = findCenarioData(munArea?.cenarios, cenarioA)

    return {
      pop: pop?.pop_atingida ?? 0,
      popPct: pop?.pct_atingida ?? 0,
      area: area?.area_atingida_km2 ?? 0,
      areaPct: area?.pct_atingida ?? 0,
      empAtg: fis?.empresas_atingidas ?? 0,
      eduAtg: fis?.educacao_atingidas ?? 0,
      sauAtg: fis?.saude_atingidas ?? 0,
      vabEmp: op?.empresas_vab ?? 0,
      eduPerdas: (op?.educacao_perdas ?? 0) + (op?.educacao_custo_adicional ?? 0),
      sauProd: op?.saude_producao ?? 0,
      agrPerdas: op?.agricultura_perdas ?? 0,
      totalOp: op?.total ?? 0,
      totalFis: fis?.total ?? 0,
    }
  }, [selectedMun, cenarioA, opData, fisData, popData, areaData])

  const metricsB = useMemo(() => {
    if (!selectedMun || !cenarioB) return null
    const munOp = opData?.[selectedMun]
    const munFis = fisData?.[selectedMun]
    const munPop = popData?.[selectedMun]
    const munArea = areaData?.[selectedMun]

    const op = findCenarioData(munOp, cenarioB)
    const fis = findCenarioData(munFis, cenarioB)
    const pop = findCenarioData(munPop?.cenarios, cenarioB)
    const area = findCenarioData(munArea?.cenarios, cenarioB)

    return {
      pop: pop?.pop_atingida ?? 0,
      popPct: pop?.pct_atingida ?? 0,
      area: area?.area_atingida_km2 ?? 0,
      areaPct: area?.pct_atingida ?? 0,
      empAtg: fis?.empresas_atingidas ?? 0,
      eduAtg: fis?.educacao_atingidas ?? 0,
      sauAtg: fis?.saude_atingidas ?? 0,
      vabEmp: op?.empresas_vab ?? 0,
      eduPerdas: (op?.educacao_perdas ?? 0) + (op?.educacao_custo_adicional ?? 0),
      sauProd: op?.saude_producao ?? 0,
      agrPerdas: op?.agricultura_perdas ?? 0,
      totalOp: op?.total ?? 0,
      totalFis: fis?.total ?? 0,
    }
  }, [selectedMun, cenarioB, opData, fisData, popData, areaData])

  const copySummary = () => {
    if (!metricsA || !metricsB) return
    const text = `COMPARAÇÃO DE CENÁRIOS — ${selectedMun.toUpperCase()}
==================================================
Cenário A: ${cenarioLabel(cenarioA)}
Cenário B: ${cenarioLabel(cenarioB)}

1. POPULAÇÃO ATINGIDA:
  - Cenário A: ${metricsA.pop.toLocaleString("pt-BR")} hab (${metricsA.popPct.toFixed(1)}%)
  - Cenário B: ${metricsB.pop.toLocaleString("pt-BR")} hab (${metricsB.popPct.toFixed(1)}%)
  - Diferença: ${(metricsB.pop - metricsA.pop).toLocaleString("pt-BR")} hab

2. ÁREA ALAGADA:
  - Cenário A: ${metricsA.area.toFixed(2)} km²
  - Cenário B: ${metricsB.area.toFixed(2)} km²
  - Diferença: ${(metricsB.area - metricsA.area).toFixed(2)} km²

3. PERDAS OPERACIONAIS (DaLA):
  - Cenário A: ${fmtBRL(metricsA.totalOp)}
  - Cenário B: ${fmtBRL(metricsB.totalOp)}
  - Diferença: ${fmtBRL(metricsB.totalOp - metricsA.totalOp)}

4. DANOS FÍSICOS (CLIMADA / EXPOSIÇÃO):
  - Cenário A: ${fmtBRL(metricsA.totalFis)}
  - Cenário B: ${fmtBRL(metricsB.totalFis)}
  - Diferença: ${fmtBRL(metricsB.totalFis - metricsA.totalFis)}

5. IMPACTO TOTAL (Perdas + Danos Físicos):
  - Cenário A: ${fmtBRL(metricsA.totalOp + metricsA.totalFis)}
  - Cenário B: ${fmtBRL(metricsB.totalOp + metricsB.totalFis)}
  - Diferença: ${fmtBRL((metricsB.totalOp + metricsB.totalFis) - (metricsA.totalOp + metricsA.totalFis))}
==================================================
Fonte: Painel BID RS / DaLA / CLIMADA`

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const renderRow = (
    titulo: string,
    icone: React.ReactNode,
    valA: number,
    valB: number,
    isCurrency = false,
    sufixo = ""
  ) => {
    const diff = valB - valA
    const pctDiff = valA > 0 ? (diff / valA) * 100 : valB > 0 ? 100 : 0
    const formatValue = (v: number) => {
      if (isCurrency) return fmtBRL(v)
      if (sufixo) return `${compactoBr(v, 1)}${sufixo}`
      return v.toLocaleString("pt-BR")
    }

    return (
      <div className="grid grid-cols-12 items-center gap-2 py-2 px-3 border-b border-slate-100 hover:bg-slate-50/70 transition-colors text-xs">
        <div className="col-span-4 flex items-center gap-1.5 min-w-0">
          <span className="text-slate-500 shrink-0">{icone}</span>
          <span className="font-semibold text-slate-700 truncate">{titulo}</span>
        </div>
        <div className="col-span-3 text-right font-medium text-slate-800 tabular-nums">
          {formatValue(valA)}
        </div>
        <div className="col-span-3 text-right font-bold text-slate-900 tabular-nums">
          {formatValue(valB)}
        </div>
        <div className="col-span-2 flex justify-end">
          <DeltaBadge diff={diff} pct={pctDiff} />
        </div>
      </div>
    )
  }

  const renderVisualBar = (
    titulo: string,
    icone: React.ReactNode,
    valA: number,
    valB: number,
    isCurrency = false,
    sufixo = ""
  ) => {
    const diff = valB - valA
    const pctDiff = valA > 0 ? (diff / valA) * 100 : valB > 0 ? 100 : 0
    const maxVal = Math.max(valA, valB, 1)
    const pctBarA = Math.max(Math.round((valA / maxVal) * 100), 3)
    const pctBarB = Math.max(Math.round((valB / maxVal) * 100), 3)

    const formatValue = (v: number) => {
      if (isCurrency) return fmtBRL(v)
      if (sufixo) return `${compactoBr(v, 1)}${sufixo}`
      return v.toLocaleString("pt-BR")
    }

    return (
      <div className="rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="p-1 rounded-md bg-slate-100 text-[#055071] shrink-0">
              {icone}
            </span>
            <span className="text-xs font-bold text-slate-800 truncate">
              {titulo}
            </span>
          </div>
          <DeltaBadge diff={diff} pct={pctDiff} />
        </div>

        <div className="space-y-1.5">
          {/* Barra Lado A */}
          <div className="flex items-center gap-2">
            <span className="w-12 text-[10px] font-bold text-sky-800 truncate text-right shrink-0">
              Lado A
            </span>
            <div className="flex-1 h-3.5 bg-slate-100 rounded-md overflow-hidden">
              <div
                className="h-full bg-[#055071] rounded-md transition-all duration-300"
                style={{ width: `${pctBarA}%` }}
              />
            </div>
            <span className="w-24 text-right text-[10.5px] font-black text-slate-800 tabular-nums shrink-0">
              {formatValue(valA)}
            </span>
          </div>

          {/* Barra Lado B */}
          <div className="flex items-center gap-2">
            <span className="w-12 text-[10px] font-bold text-rose-800 truncate text-right shrink-0">
              Lado B
            </span>
            <div className="flex-1 h-3.5 bg-slate-100 rounded-md overflow-hidden">
              <div
                className="h-full bg-[#c9402e] rounded-md transition-all duration-300"
                style={{ width: `${pctBarB}%` }}
              />
            </div>
            <span className="w-24 text-right text-[10.5px] font-black text-slate-800 tabular-nums shrink-0">
              {formatValue(valB)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[98vw] sm:max-w-none max-w-[1720px] h-[90vh] max-h-[920px] overflow-hidden flex flex-col p-0 gap-0 sm:rounded-2xl shadow-2xl [&>button]:text-white/80 [&>button:hover]:text-white">
        {/* Header com Design Executivo e Seletores Centralizados */}
        <DialogHeader className="shrink-0 px-5 py-3 bg-[#055071] text-white border-b border-[#04405a]">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Bloco Esquerda: Título e Identificação */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 shadow-inner">
                <GitCompare size={18} className="text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base text-white font-black tracking-tight leading-none">
                    Comparador de Cenários
                  </DialogTitle>
                  <span className="text-[9.5px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
                    Lado a Lado
                  </span>
                </div>
                <DialogDescription className="text-xs text-white/75 mt-0.5">
                  Análise socioeconômica DaLA e espacial comparativa entre simulações
                </DialogDescription>
              </div>
            </div>

            {/* Bloco Central: Cockpit de Seleção (Município + Lado A vs Lado B) */}
            <div className="flex items-center gap-2 bg-black/25 px-3 py-1.5 rounded-xl border border-white/15 shadow-inner flex-wrap">
              {/* Município */}
              <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/20">
                <MapPin size={12} className="text-cyan-300 shrink-0" />
                <span className="text-[10px] font-bold text-white/70 uppercase">Município:</span>
                <Select value={selectedMun} onValueChange={setSelectedMun}>
                  <SelectTrigger className="h-7 min-w-[130px] w-auto bg-white/15 hover:bg-white/25 border-white/25 text-white text-xs font-semibold focus:ring-1 focus:ring-cyan-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MUNICIPIOS.map((m) => (
                      <SelectItem key={m} value={m} className="text-xs font-semibold">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lado A (Azul) */}
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8] border border-white/80 shrink-0 shadow-xs" />
                <span className="text-[10px] font-bold text-sky-200 uppercase">Lado A:</span>
                <Select value={cenarioA} onValueChange={setChosenA}>
                  <SelectTrigger className="h-7 min-w-[145px] max-w-[210px] bg-white/15 hover:bg-white/25 border-sky-400/40 text-white text-xs font-semibold truncate focus:ring-1 focus:ring-sky-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cenariosList.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs font-semibold">
                        {cenarioLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Badge VS */}
              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-black tracking-widest bg-white/20 text-white/90 border border-white/25 uppercase">
                VS
              </span>

              {/* Lado B (Vermelho) */}
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f87171] border border-white/80 shrink-0 shadow-xs" />
                <span className="text-[10px] font-bold text-rose-200 uppercase">Lado B:</span>
                <Select value={cenarioB} onValueChange={setChosenB}>
                  <SelectTrigger className="h-7 min-w-[145px] max-w-[210px] bg-white/15 hover:bg-white/25 border-rose-400/40 text-white text-xs font-semibold truncate focus:ring-1 focus:ring-rose-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cenariosList.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs font-semibold">
                        {cenarioLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bloco Direita: Ações Rápidas */}
            <div className="flex items-center gap-2 pr-6">
              <button
                type="button"
                onClick={() => setShowPoints((prev) => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  showPoints
                    ? "bg-white/20 text-white border-white/35 shadow-sm hover:bg-white/25"
                    : "bg-white/5 text-white/70 border-white/15 hover:bg-white/15"
                }`}
                title={showPoints ? "Ocultar pontos no mapa" : "Exibir pontos de escolas, saúde e empresas"}
              >
                <Layers size={13} className={showPoints ? "text-cyan-300" : "text-white/60"} />
                <span>{showPoints ? "Pontos Ativos" : "Pontos Ocultos"}</span>
              </button>

              <button
                type="button"
                onClick={copySummary}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20 shadow-sm"
                title="Copiar resumo comparativo para a área de transferência"
              >
                {copied ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
                <span>{copied ? "Copiado!" : "Copiar"}</span>
              </button>

              {onOpenMapFullScreen && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenMapFullScreen()
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-lg transition-colors border border-white/20 shadow-sm"
                  title="Abrir mapa de comparação em tela cheia"
                >
                  <Maximize2 size={13} />
                  <span>Tela Cheia</span>
                </button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content - 2 Colunas Lado a Lado: Métricas & Danos (Esquerda) e Mapa com Swipe (Direita) */}
        <div className="min-h-0 flex-1 p-3 flex flex-col lg:flex-row gap-3 overflow-hidden bg-slate-100/70">
          {cenariosList.length <= 1 ? (
            <div className="p-8 text-center text-slate-500 rounded-xl border border-slate-200 bg-white w-full h-full flex flex-col items-center justify-center">
              <p className="font-bold text-base text-slate-700">Apenas um cenário cadastrado para {selectedMun}.</p>
              <p className="text-xs text-slate-500 mt-1.5 max-w-md">
                Selecione Porto Alegre, Lajeado ou Rio Grande no seletor acima para comparar diferentes simulações hidrodinâmicas.
              </p>
            </div>
          ) : (
            <>
              {/* Coluna Esquerda: Métricas & Danos */}
              <div className="w-full lg:w-[48%] xl:w-[46%] 2xl:w-[44%] flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Topo da Coluna: Título e Alternador de Modo (Gráficos vs Tabela) */}
                <div className="shrink-0 px-3.5 py-2.5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-[#055071]/10 text-[#055071]">
                      {leftTab === "graficos" ? <BarChart3 size={15} /> : <TableIcon size={15} />}
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wide block">
                        Métricas & Danos
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {cenarioLabel(cenarioA)} vs {cenarioLabel(cenarioB)}
                      </span>
                    </div>
                  </div>

                  {/* Alternador de visualização: Gráficos & KPIs vs Tabela */}
                  <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 border border-slate-300/60 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setLeftTab("graficos")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        leftTab === "graficos"
                          ? "bg-white text-[#055071] shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <BarChart3 size={12} />
                      <span>Gráficos & KPIs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeftTab("tabela")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        leftTab === "tabela"
                          ? "bg-white text-[#055071] shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <TableIcon size={12} />
                      <span>Tabela Detalhada</span>
                    </button>
                  </div>
                </div>

                {/* Conteúdo com rolagem independente */}
                <div className="min-h-0 flex-1 overflow-y-auto p-3.5 space-y-3.5">
                  {leftTab === "graficos" ? (
                    <>
                      {/* 1. Card Destaque: Impacto Consolidado Geral */}
                      {metricsA && metricsB && (
                        <div className="rounded-xl border border-cyan-200/90 bg-gradient-to-br from-cyan-50/70 via-white to-sky-50/50 p-3 shadow-xs">
                          <div className="flex items-center justify-between border-b border-cyan-100/80 pb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded-md bg-[#055071] text-white">
                                <GitCompare size={14} />
                              </div>
                              <div>
                                <span className="text-xs font-black text-slate-900 tracking-wide uppercase block">
                                  Impacto Total Combinado
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Perdas DaLA (30d) + Danos Físicos de Reposição
                                </span>
                              </div>
                            </div>
                            <DeltaBadge
                              diff={(metricsB.totalOp + metricsB.totalFis) - (metricsA.totalOp + metricsA.totalFis)}
                              pct={
                                (metricsA.totalOp + metricsA.totalFis) > 0
                                  ? (((metricsB.totalOp + metricsB.totalFis) - (metricsA.totalOp + metricsA.totalFis)) /
                                      (metricsA.totalOp + metricsA.totalFis)) *
                                    100
                                  : 0
                              }
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2.5 pt-2.5">
                            <div className="rounded-lg bg-white/90 p-2.5 border border-sky-100 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-sky-950 uppercase">
                                  Lado A · {cenarioLabel(cenarioA)}
                                </span>
                                <span className="h-2 w-2 rounded-full bg-[#055071]" />
                              </div>
                              <span className="text-lg font-black text-slate-900 block mt-0.5">
                                {fmtBRL(metricsA.totalOp + metricsA.totalFis)}
                              </span>
                              <div className="flex items-center justify-between text-[9.5px] text-slate-500 pt-1 border-t border-slate-100 mt-1">
                                <span>DaLA: {fmtBRL(metricsA.totalOp)}</span>
                                <span>Físico: {fmtBRL(metricsA.totalFis)}</span>
                              </div>
                            </div>

                            <div className="rounded-lg bg-white/90 p-2.5 border border-rose-100 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-rose-950 uppercase">
                                  Lado B · {cenarioLabel(cenarioB)}
                                </span>
                                <span className="h-2 w-2 rounded-full bg-[#c9402e]" />
                              </div>
                              <span className="text-lg font-black text-cyan-900 block mt-0.5">
                                {fmtBRL(metricsB.totalOp + metricsB.totalFis)}
                              </span>
                              <div className="flex items-center justify-between text-[9.5px] text-slate-500 pt-1 border-t border-slate-100 mt-1">
                                <span>DaLA: {fmtBRL(metricsB.totalOp)}</span>
                                <span>Físico: {fmtBRL(metricsB.totalFis)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. Grid de 4 KPIs Estratégicos */}
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Perdas Operacionais DaLA */}
                        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <TrendingDown size={13} className="text-cyan-700" />
                              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                                Perdas DaLA (30d)
                              </span>
                            </div>
                            {metricsA && metricsB && (
                              <DeltaBadge
                                diff={metricsB.totalOp - metricsA.totalOp}
                                pct={metricsA.totalOp > 0 ? ((metricsB.totalOp - metricsA.totalOp) / metricsA.totalOp) * 100 : 0}
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1.5 text-center">
                            <div>
                              <span className="text-[9px] text-slate-400 block truncate font-medium">Lado A</span>
                              <span className="text-sm font-black text-slate-800">{metricsA ? fmtBRL(metricsA.totalOp) : "—"}</span>
                            </div>
                            <div className="border-l border-slate-100 pl-2">
                              <span className="text-[9px] text-slate-400 block truncate font-medium">Lado B</span>
                              <span className="text-sm font-black text-cyan-800">{metricsB ? fmtBRL(metricsB.totalOp) : "—"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Danos Físicos */}
                        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <Waves size={13} className="text-blue-700" />
                              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                                Danos Físicos (CUB)
                              </span>
                            </div>
                            {metricsA && metricsB && (
                              <DeltaBadge
                                diff={metricsB.totalFis - metricsA.totalFis}
                                pct={metricsA.totalFis > 0 ? ((metricsB.totalFis - metricsA.totalFis) / metricsA.totalFis) * 100 : 0}
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1.5 text-center">
                            <div>
                              <span className="text-[9px] text-slate-400 block truncate font-medium">Lado A</span>
                              <span className="text-sm font-black text-slate-800">{metricsA ? fmtBRL(metricsA.totalFis) : "—"}</span>
                            </div>
                            <div className="border-l border-slate-100 pl-2">
                              <span className="text-[9px] text-slate-400 block truncate font-medium">Lado B</span>
                              <span className="text-sm font-black text-blue-800">{metricsB ? fmtBRL(metricsB.totalFis) : "—"}</span>
                            </div>
                          </div>
                        </div>

                        {/* População Atingida */}
                        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <Users size={13} className="text-indigo-700" />
                              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                                População Atingida
                              </span>
                            </div>
                            {metricsA && metricsB && (
                              <DeltaBadge
                                diff={metricsB.pop - metricsA.pop}
                                pct={metricsA.pop > 0 ? ((metricsB.pop - metricsA.pop) / metricsA.pop) * 100 : 0}
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1.5 text-center">
                            <div>
                              <span className="text-[9px] text-slate-400 block truncate font-medium">Lado A</span>
                              <span className="text-sm font-black text-slate-800">{metricsA ? `${compactoBr(metricsA.pop, 1)} hab` : "—"}</span>
                            </div>
                            <div className="border-l border-slate-100 pl-2">
                              <span className="text-[9px] text-slate-400 block truncate font-medium">Lado B</span>
                              <span className="text-sm font-black text-indigo-800">{metricsB ? `${compactoBr(metricsB.pop, 1)} hab` : "—"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Área Inundada */}
                        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-emerald-700" />
                              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                                Área Inundada
                              </span>
                            </div>
                            {metricsA && metricsB && (
                              <DeltaBadge
                                diff={metricsB.area - metricsA.area}
                                pct={metricsA.area > 0 ? ((metricsB.area - metricsA.area) / metricsA.area) * 100 : 0}
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1.5 text-center">
                            <div>
                              <span className="text-[9px] text-slate-400 block truncate font-medium">Lado A</span>
                              <span className="text-sm font-black text-slate-800">{metricsA ? `${metricsA.area.toFixed(1)} km²` : "—"}</span>
                            </div>
                            <div className="border-l border-slate-100 pl-2">
                              <span className="text-[9px] text-slate-400 block truncate font-medium">Lado B</span>
                              <span className="text-sm font-black text-emerald-800">{metricsB ? `${metricsB.area.toFixed(1)} km²` : "—"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 3. Gráficos de Barras: Comparativo Financeiro */}
                      {metricsA && metricsB && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <TrendingDown size={13} className="text-[#055071]" />
                              Comparativo Financeiro por Dimensão
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              Valores em R$
                            </span>
                          </div>

                          <div className="space-y-2">
                            {renderVisualBar("Perda de VAB (Empresas)", <Building2 size={13} />, metricsA.vabEmp, metricsB.vabEmp, true)}
                            {renderVisualBar("Danos Físicos (Reposição CUB)", <Waves size={13} />, metricsA.totalFis, metricsB.totalFis, true)}
                            {renderVisualBar("Perdas Operacionais Educação", <GraduationCap size={13} />, metricsA.eduPerdas, metricsB.eduPerdas, true)}
                            {renderVisualBar("Perda de Produção SUS (Saúde)", <HeartPulse size={13} />, metricsA.sauProd, metricsB.sauProd, true)}
                            {(metricsA.agrPerdas > 0 || metricsB.agrPerdas > 0) &&
                              renderVisualBar("Prejuízo Agrícola", <Sprout size={13} />, metricsA.agrPerdas, metricsB.agrPerdas, true)}
                          </div>
                        </div>
                      )}

                      {/* 4. Gráficos de Barras: Ativos e Território */}
                      {metricsA && metricsB && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <Building2 size={13} className="text-[#055071]" />
                              Ativos e Infraestrutura Atingida
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              Quantitativo Físico
                            </span>
                          </div>

                          <div className="space-y-2">
                            {renderVisualBar("Empresas Atingidas", <Building2 size={13} />, metricsA.empAtg, metricsB.empAtg, false, " un")}
                            {renderVisualBar("Escolas Atingidas", <GraduationCap size={13} />, metricsA.eduAtg, metricsB.eduAtg, false, " un")}
                            {renderVisualBar("Unidades de Saúde Atingidas", <HeartPulse size={13} />, metricsA.sauAtg, metricsB.sauAtg, false, " un")}
                            {renderVisualBar("Área Inundada", <MapPin size={13} />, metricsA.area, metricsB.area, false, " km²")}
                          </div>
                        </div>
                      )}

                      {/* 5. Insight Executivo Dinâmico */}
                      {metricsA && metricsB && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-start gap-2.5 text-xs text-slate-600 shadow-2xs">
                          <Info size={16} className="text-[#055071] shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="font-bold text-slate-800 block text-xs">
                              Síntese Comparativa
                            </span>
                            <p className="text-[11px] leading-relaxed text-slate-600">
                              {(metricsB.totalOp + metricsB.totalFis) < (metricsA.totalOp + metricsA.totalFis) ? (
                                <>
                                  O <strong>{cenarioLabel(cenarioB)}</strong> projeta uma redução de{" "}
                                  <strong className="text-emerald-700">
                                    {Math.abs((((metricsB.totalOp + metricsB.totalFis) - (metricsA.totalOp + metricsA.totalFis)) / (metricsA.totalOp + metricsA.totalFis)) * 100).toFixed(1)}%
                                  </strong>{" "}
                                  (-{fmtBRL(Math.abs((metricsB.totalOp + metricsB.totalFis) - (metricsA.totalOp + metricsA.totalFis)))}) no impacto econômico total comparado ao {cenarioLabel(cenarioA)}.
                                </>
                              ) : (metricsB.totalOp + metricsB.totalFis) > (metricsA.totalOp + metricsA.totalFis) ? (
                                <>
                                  O <strong>{cenarioLabel(cenarioB)}</strong> projeta um aumento de{" "}
                                  <strong className="text-rose-700">
                                    {Math.abs((((metricsB.totalOp + metricsB.totalFis) - (metricsA.totalOp + metricsA.totalFis)) / (metricsA.totalOp + metricsA.totalFis)) * 100).toFixed(1)}%
                                  </strong>{" "}
                                  (+{fmtBRL((metricsB.totalOp + metricsB.totalFis) - (metricsA.totalOp + metricsA.totalFis))}) no impacto econômico total em relação ao {cenarioLabel(cenarioA)}.
                                </>
                              ) : (
                                <>Os dois cenários apresentam impacto econômico equivalente.</>
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Botão de Atalho para a Tabela */}
                      <button
                        type="button"
                        onClick={() => setLeftTab("tabela")}
                        className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <TableIcon size={13} />
                        <span>Ver Tabela Completa de Indicadores (12 Dimensões)</span>
                        <ArrowRight size={13} />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Tabela Detalhada Completa */}
                      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden mb-2">
                        <div className="overflow-x-auto">
                          <div className="min-w-[480px]">
                            <div className="grid grid-cols-12 gap-2 py-2 px-3 bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                              <div className="col-span-4">Dimensão / Métrica</div>
                              <div className="col-span-3 text-right">Lado A ({cenarioLabel(cenarioA)})</div>
                              <div className="col-span-3 text-right">Lado B ({cenarioLabel(cenarioB)})</div>
                              <div className="col-span-2 text-right">Diferença</div>
                            </div>

                            {metricsA && metricsB && (
                              <div className="divide-y divide-slate-100">
                                {/* Território & População */}
                                <div className="px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  Território e População
                                </div>
                                {renderRow("População Atingida", <Users size={12} />, metricsA.pop, metricsB.pop, false, " hab")}
                                {renderRow("Área Inundada", <MapPin size={12} />, metricsA.area, metricsB.area, false, " km²")}

                                {/* Empresas */}
                                <div className="px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  Empresas e Atividade Econômica
                                </div>
                                {renderRow("Empresas Atingidas", <Building2 size={12} />, metricsA.empAtg, metricsB.empAtg)}
                                {renderRow("Perda de VAB (DaLA)", <TrendingDown size={12} />, metricsA.vabEmp, metricsB.vabEmp, true)}

                                {/* Educação */}
                                <div className="px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  Educação
                                </div>
                                {renderRow("Escolas Atingidas", <GraduationCap size={12} />, metricsA.eduAtg, metricsB.eduAtg)}
                                {renderRow("Perdas Operacionais", <TrendingDown size={12} />, metricsA.eduPerdas, metricsB.eduPerdas, true)}

                                {/* Saúde */}
                                <div className="px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  Saúde
                                </div>
                                {renderRow("Unidades de Saúde", <HeartPulse size={12} />, metricsA.sauAtg, metricsB.sauAtg)}
                                {renderRow("Perda Produção SUS", <TrendingDown size={12} />, metricsA.sauProd, metricsB.sauProd, true)}

                                {/* Agricultura */}
                                {(metricsA.agrPerdas > 0 || metricsB.agrPerdas > 0) && (
                                  <>
                                    <div className="px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                      Agricultura
                                    </div>
                                    {renderRow("Prejuízo Agrícola", <Sprout size={12} />, metricsA.agrPerdas, metricsB.agrPerdas, true)}
                                  </>
                                )}

                                {/* Totais Finais */}
                                <div className="px-3 py-1 bg-cyan-50/70 text-[10px] font-bold text-cyan-900 uppercase tracking-wider">
                                  Impacto Consolidado
                                </div>
                                {renderRow("Total Perdas Operacionais", <TrendingDown size={12} />, metricsA.totalOp, metricsB.totalOp, true)}
                                {renderRow("Total Danos Físicos", <Waves size={12} />, metricsA.totalFis, metricsB.totalFis, true)}
                                {renderRow(
                                  "Impacto Geral Combinado",
                                  <GitCompare size={12} />,
                                  metricsA.totalOp + metricsA.totalFis,
                                  metricsB.totalOp + metricsB.totalFis,
                                  true
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setLeftTab("graficos")}
                        className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <BarChart3 size={13} />
                        <span>Voltar para Gráficos & KPIs</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Coluna Direita: Mapa com Swipe (CompareReveal) */}
              <div className="w-full lg:w-[52%] xl:w-[54%] 2xl:w-[56%] flex flex-col min-h-0 rounded-xl border border-slate-200 shadow-xs overflow-hidden relative bg-slate-900">
                <ScenarioCompareMap
                  municipio={selectedMun}
                  cenarioA={cenarioA}
                  cenarioB={cenarioB}
                  onCenarioAChange={setChosenA}
                  onCenarioBChange={setChosenB}
                  isFullScreen={false}
                  showPoints={showPoints}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span className="text-[11px] leading-tight">
            * As perdas operacionais seguem metodologia DaLA (30 dias base); danos físicos representam custo de reposição CLIMADA/CUB-RS.
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors shrink-0"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
