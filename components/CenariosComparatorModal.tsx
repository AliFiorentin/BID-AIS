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
  Map as MapIcon,
  Table as TableIcon,
  Maximize2,
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
  const [viewMode, setViewMode] = useState<"tabela" | "mapa">("tabela")

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
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-4 bg-gradient-to-r from-[#055071] to-[#0a6e9a] text-white">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                <GitCompare size={18} className="text-white" />
              </div>
              <div>
                <DialogTitle className="text-base text-white font-bold">
                  Comparador Lado a Lado de Cenários
                </DialogTitle>
                <DialogDescription className="text-xs text-white/80">
                  Analise as diferenças de impacto socioeconômico e infraestrutura entre dois cenários
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={copySummary}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/15 hover:bg-white/25 text-white transition-colors"
              title="Copiar resumo comparativo para a área de transferência"
            >
              {copied ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
              <span>{copied ? "Copiado!" : "Copiar"}</span>
            </button>
          </div>

          {/* Seletores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/20">
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
              <label className="text-[10px] font-bold tracking-wide uppercase text-white/80">
                Cenário Base (A)
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
              <label className="text-[10px] font-bold tracking-wide uppercase text-white/80">
                Cenário Comparado (B)
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

          {/* Alternador de Modo de Visualização: Tabela vs Mapa Swipe */}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/15">
            <div className="inline-flex rounded-lg bg-white/15 p-0.5 border border-white/20">
              <button
                type="button"
                onClick={() => setViewMode("tabela")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  viewMode === "tabela"
                    ? "bg-white text-[#055071] shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <TableIcon size={13} />
                <span>Métricas & Danos</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("mapa")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  viewMode === "mapa"
                    ? "bg-white text-[#055071] shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <MapIcon size={13} />
                <span>Swipe no Mapa (CompareReveal)</span>
              </button>
            </div>

            {onOpenMapFullScreen && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenMapFullScreen()
                }}
                className="flex items-center gap-1 text-[11px] font-semibold text-white/85 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md transition-colors border border-white/15"
                title="Abrir mapa de comparação em tela cheia"
              >
                <Maximize2 size={12} />
                <span>Mapa em Tela Cheia</span>
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {cenariosList.length <= 1 ? (
            <div className="p-6 text-center text-slate-500 rounded-lg border border-slate-200 bg-slate-50">
              <p className="font-bold text-sm text-slate-700">Apenas um cenário cadastrado para {selectedMun}.</p>
              <p className="text-xs mt-1">Selecione Porto Alegre, Lajeado ou Rio Grande para comparar diferentes simulações hidrodinâmicas.</p>
            </div>
          ) : viewMode === "mapa" ? (
            <div className="h-[520px] w-full rounded-xl overflow-hidden relative shadow-inner border border-slate-200">
              <ScenarioCompareMap
                municipio={selectedMun}
                cenarioAInicial={cenarioA}
                cenarioBInicial={cenarioB}
                isFullScreen={false}
              />
            </div>
          ) : (
            <>
              {/* Cards de Destaque Superior */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Perdas Operacionais Total */}
                <div className="rounded-xl border border-slate-200 p-3 bg-white shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <TrendingDown size={14} className="text-cyan-700" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        Perdas Operacionais (DaLA)
                      </span>
                    </div>
                    {metricsA && metricsB && (
                      <DeltaBadge
                        diff={metricsB.totalOp - metricsA.totalOp}
                        pct={metricsA.totalOp > 0 ? ((metricsB.totalOp - metricsA.totalOp) / metricsA.totalOp) * 100 : 0}
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block truncate font-medium">
                        Cenário A: {cenarioLabel(cenarioA)}
                      </span>
                      <span className="text-base font-black text-slate-800">
                        {metricsA ? fmtBRL(metricsA.totalOp) : "—"}
                      </span>
                    </div>
                    <div className="border-l border-slate-100 pl-3">
                      <span className="text-[10px] text-slate-500 block truncate font-medium">
                        Cenário B: {cenarioLabel(cenarioB)}
                      </span>
                      <span className="text-base font-black text-cyan-800">
                        {metricsB ? fmtBRL(metricsB.totalOp) : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Danos Físicos Total */}
                <div className="rounded-xl border border-slate-200 p-3 bg-white shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Waves size={14} className="text-blue-700" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        Danos Físicos (Exposição)
                      </span>
                    </div>
                    {metricsA && metricsB && (
                      <DeltaBadge
                        diff={metricsB.totalFis - metricsA.totalFis}
                        pct={metricsA.totalFis > 0 ? ((metricsB.totalFis - metricsA.totalFis) / metricsA.totalFis) * 100 : 0}
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block truncate font-medium">
                        Cenário A: {cenarioLabel(cenarioA)}
                      </span>
                      <span className="text-base font-black text-slate-800">
                        {metricsA ? fmtBRL(metricsA.totalFis) : "—"}
                      </span>
                    </div>
                    <div className="border-l border-slate-100 pl-3">
                      <span className="text-[10px] text-slate-500 block truncate font-medium">
                        Cenário B: {cenarioLabel(cenarioB)}
                      </span>
                      <span className="text-base font-black text-blue-800">
                        {metricsB ? fmtBRL(metricsB.totalFis) : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabela Detalhada */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 gap-2 py-2 px-3 bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <div className="col-span-4">Dimensão / Métrica</div>
                  <div className="col-span-3 text-right">Cenário A ({cenarioLabel(cenarioA)})</div>
                  <div className="col-span-3 text-right">Cenário B ({cenarioLabel(cenarioB)})</div>
                  <div className="col-span-2 text-right">Diferença (B - A)</div>
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
                    {renderRow("Perdas Operacionais Educação", <TrendingDown size={12} />, metricsA.eduPerdas, metricsB.eduPerdas, true)}

                    {/* Saúde */}
                    <div className="px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Saúde
                    </div>
                    {renderRow("Unidades de Saúde", <HeartPulse size={12} />, metricsA.sauAtg, metricsB.sauAtg)}
                    {renderRow("Perda de Produção SUS", <TrendingDown size={12} />, metricsA.sauProd, metricsB.sauProd, true)}

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
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>* As perdas operacionais seguem metodologia DaLA (30 dias base); danos físicos representam custo de reposição CLIMADA/CUB-RS.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
