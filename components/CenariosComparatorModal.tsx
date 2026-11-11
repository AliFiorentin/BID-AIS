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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[98vw] sm:max-w-none max-w-[1720px] h-[90vh] max-h-[920px] overflow-hidden flex flex-col p-0 gap-0 sm:rounded-2xl shadow-2xl [&>button]:text-white/80 [&>button:hover]:text-white">
        {/* Header com Seletores Únicos e Ações */}
        <DialogHeader className="shrink-0 p-4 bg-[#055071] text-white">
          <div className="flex items-center justify-between pr-8 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                <GitCompare size={18} className="text-white" />
              </div>
              <div>
                <DialogTitle className="text-base text-white font-bold leading-tight">
                  Comparador Lado a Lado de Cenários
                </DialogTitle>
                <DialogDescription className="text-xs text-white/80">
                  Analise métricas socioeconômicas e compare a mancha de inundação lado a lado com swipe interativo
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Alternar Pontos de Infraestrutura */}
              <button
                type="button"
                onClick={() => setShowPoints((prev) => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                  showPoints
                    ? "bg-white/20 text-white border-white/35 hover:bg-white/30"
                    : "bg-white/5 text-white/70 border-white/15 hover:bg-white/15"
                }`}
                title={showPoints ? "Ocultar pontos no mapa" : "Exibir pontos de escolas, saúde e empresas"}
              >
                <Layers size={13} />
                <span>{showPoints ? "Pontos Ativos" : "Pontos Ocultos"}</span>
              </button>

              {/* Copiar Resumo */}
              <button
                type="button"
                onClick={copySummary}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/15"
                title="Copiar resumo comparativo para a área de transferência"
              >
                {copied ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
                <span>{copied ? "Copiado!" : "Copiar"}</span>
              </button>

              {/* Mapa em Tela Cheia */}
              {onOpenMapFullScreen && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenMapFullScreen()
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-md transition-colors border border-white/20"
                  title="Abrir mapa de comparação em tela cheia"
                >
                  <Maximize2 size={13} />
                  <span>Tela Cheia</span>
                </button>
              )}
            </div>
          </div>

          {/* Seletores Únicos no Cabeçalho */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-white/20">
            <div>
              <label className="text-[10px] font-bold tracking-wide uppercase text-white/80">
                Município
              </label>
              <Select value={selectedMun} onValueChange={setSelectedMun}>
                <SelectTrigger className="h-8 bg-white/15 border-white/25 text-white text-xs font-semibold">
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

            <div>
              <label className="text-[10px] font-bold tracking-wide uppercase text-white/80 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#055071] border border-white shrink-0" />
                Cenário Base (Lado A)
              </label>
              <Select value={cenarioA} onValueChange={setChosenA}>
                <SelectTrigger className="h-8 bg-white/15 border-white/25 text-white text-xs font-semibold">
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

            <div>
              <label className="text-[10px] font-bold tracking-wide uppercase text-white/80 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#c9402e] border border-white shrink-0" />
                Cenário Comparado (Lado B)
              </label>
              <Select value={cenarioB} onValueChange={setChosenB}>
                <SelectTrigger className="h-8 bg-white/15 border-white/25 text-white text-xs font-semibold">
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
                <div className="shrink-0 px-3.5 py-2 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <TableIcon size={14} className="text-[#055071]" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Métricas & Danos
                    </span>
                  </div>
                  <span className="text-[10.5px] font-semibold text-slate-500 truncate max-w-[260px]">
                    {cenarioLabel(cenarioA)} <span className="text-slate-400">vs</span> {cenarioLabel(cenarioB)}
                  </span>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-3">
                  {/* Cards de Destaque Superior */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Perdas Operacionais Total */}
                    <div className="rounded-xl border border-slate-200 p-2.5 bg-slate-50/50 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendingDown size={13} className="text-cyan-700" />
                          <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                            Perdas DaLA
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
                          <span className="text-[9.5px] text-slate-500 block truncate font-medium">
                            A: {cenarioLabel(cenarioA)}
                          </span>
                          <span className="text-sm font-black text-slate-800">
                            {metricsA ? fmtBRL(metricsA.totalOp) : "—"}
                          </span>
                        </div>
                        <div className="border-l border-slate-200 pl-2">
                          <span className="text-[9.5px] text-slate-500 block truncate font-medium">
                            B: {cenarioLabel(cenarioB)}
                          </span>
                          <span className="text-sm font-black text-cyan-800">
                            {metricsB ? fmtBRL(metricsB.totalOp) : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Danos Físicos Total */}
                    <div className="rounded-xl border border-slate-200 p-2.5 bg-slate-50/50 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Waves size={13} className="text-blue-700" />
                          <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                            Danos Físicos
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
                          <span className="text-[9.5px] text-slate-500 block truncate font-medium">
                            A: {cenarioLabel(cenarioA)}
                          </span>
                          <span className="text-sm font-black text-slate-800">
                            {metricsA ? fmtBRL(metricsA.totalFis) : "—"}
                          </span>
                        </div>
                        <div className="border-l border-slate-200 pl-2">
                          <span className="text-[9.5px] text-slate-500 block truncate font-medium">
                            B: {cenarioLabel(cenarioB)}
                          </span>
                          <span className="text-sm font-black text-blue-800">
                            {metricsB ? fmtBRL(metricsB.totalFis) : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabela Detalhada com cabeçalho sticky */}
                  <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
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
