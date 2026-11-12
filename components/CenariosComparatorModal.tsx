"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
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
  C,
  MUNICIPIOS,
  CENARIOS_CONFIG,
  cenarioLabel,
} from "@/lib/constants"
import { compactoBr, findCenarioData, slugify } from "@/lib/geo-utils"
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
  Table as TableIcon,
  Maximize2,
  Layers,
  BarChart3,
  Info,
  ArrowRight,
  Ruler,
} from "lucide-react"

const HEADER_GLASS = {
  backgroundImage:
    "linear-gradient(135deg, rgba(5,80,113,0.92) 0%, rgba(10,110,154,0.92) 100%)",
  backdropFilter: "blur(24px) saturate(190%)",
  WebkitBackdropFilter: "blur(24px) saturate(190%)",
  borderBottom: "1px solid rgba(255,255,255,0.18)",
  boxShadow:
    "0 4px 20px rgba(0,0,0,0.15), inset 0 0.5px 0 0 rgba(255,255,255,0.3)",
} as const

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

type CotaMapaJson = {
  cotas: number[]
  bounds: [number, number, number, number]
  coordinates: [[number, number], [number, number], [number, number], [number, number]]
  width: number
  height: number
  pop_por_cota?: number[]
  pop_grade?: number
  area_por_cota_km2?: number[]
}

type ClimadaCotaJson = {
  municipio?: string
  resultados_por_cota?: Record<string, {
    empresas?: { n_total?: number; n_atingidos?: number; dano_fisico_brl_poa?: number; dano_fisico_brl?: number; exposicao_total_brl?: number }
    educacao?: { n_total?: number; n_atingidos?: number; dano_fisico_brl_poa?: number; dano_fisico_brl?: number; exposicao_total_brl?: number }
    saude?: { n_total?: number; n_atingidos?: number; dano_fisico_brl_poa?: number; dano_fisico_brl?: number; exposicao_total_brl?: number }
  }>
}

type DetalheCotaJson = {
  por_cota?: Record<string, {
    empresas?: { n: number; empregados: number; massa_salarial_brl: number; valor_exposto_brl: number }
    educacao?: { n: number; matriculas: number; docentes: number; valor_exposto_brl: number }
    saude?: { n: number; leitos: number; profissionais: number; valor_exposto_brl: number }
    agricultura?: { area_ha: number }
  }>
}

function matchCotaKey<T>(obj: Record<string, T> | undefined | null, cotaNum: number): T | null {
  if (!obj) return null
  if (obj[String(cotaNum)]) return obj[String(cotaNum)]
  if (obj[cotaNum.toFixed(2)]) return obj[cotaNum.toFixed(2)]
  const keys = Object.keys(obj)
  const found = keys.find((k) => Math.abs(parseFloat(k) - cotaNum) < 0.001)
  return found ? obj[found] : null
}

function formatCotaDisplay(c?: number | null): string {
  if (c == null) return ""
  const formatted = c.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  return `Cota ${formatted} m`
}

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

// Cache em memória para os arquivos JSON estáticos (evita refetch ao reabrir modal ou alternar abas)
interface StaticDataCache {
  op: DanosOpJson
  fis: DanosFisJson
  pop: PopJson
  area: AreaJson
  perdasCotas: Record<string, Record<string, CenarioOpData & { empresas_n?: number; educacao_n?: number; saude_n?: number }>> | null
}
let globalStaticDataCache: StaticDataCache | null = null

const munCotasCache = new globalThis.Map<
  string,
  {
    mapa: CotaMapaJson | null
    clim: ClimadaCotaJson | null
    det: DetalheCotaJson | null
  }
>()

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
  const [tipoComparador, setTipoComparador] = useState<"cenarios" | "cotas">("cenarios")

  // Lista de cenários (apenas simulações hidrodinâmicas puras)
  const cenariosList = useMemo(() => {
    const list = CENARIOS_CONFIG[selectedMun] || []
    return list.filter((c) => c !== "Todas as cotas")
  }, [selectedMun])

  const [chosenA, setChosenA] = useState<string | null>(null)
  const [chosenB, setChosenB] = useState<string | null>(null)
  const cenarioA = chosenA && cenariosList.includes(chosenA) ? chosenA : cenariosList[0] || ""
  const cenarioB = chosenB && cenariosList.includes(chosenB) ? chosenB : cenariosList[1] || cenariosList[0] || ""

  // Cotas disponíveis
  const [chosenCotaA, setChosenCotaA] = useState<number | null>(null)
  const [chosenCotaB, setChosenCotaB] = useState<number | null>(null)

  // Sincroniza município quando o modal é aberto pelo usuário a partir de outro município
  const [prevSync, setPrevSync] = useState({ isOpen: false, mun: municipioAtual })
  if (prevSync.isOpen !== isOpen || prevSync.mun !== municipioAtual) {
    setPrevSync({ isOpen, mun: municipioAtual })
    if (isOpen && municipioAtual && MUNICIPIOS.includes(municipioAtual) && selectedMun !== municipioAtual) {
      setSelectedMun(municipioAtual)
      setChosenA(null)
      setChosenB(null)
      setChosenCotaA(null)
      setChosenCotaB(null)
    }
  }

  const handleSelectMun = (mun: string) => {
    setSelectedMun(mun)
    setChosenA(null)
    setChosenB(null)
    setChosenCotaA(null)
    setChosenCotaB(null)
  }

  // Carregamento de dados de cenários
  const [opData, setOpData] = useState<DanosOpJson | null>(() => globalStaticDataCache?.op ?? null)
  const [fisData, setFisData] = useState<DanosFisJson | null>(() => globalStaticDataCache?.fis ?? null)
  const [popData, setPopData] = useState<PopJson | null>(() => globalStaticDataCache?.pop ?? null)
  const [areaData, setAreaData] = useState<AreaJson | null>(() => globalStaticDataCache?.area ?? null)

  // Carregamento de dados de cotas
  const [perdasCotasData, setPerdasCotasData] = useState<Record<string, Record<string, CenarioOpData & { empresas_n?: number; educacao_n?: number; saude_n?: number }>> | null>(() => globalStaticDataCache?.perdasCotas ?? null)
  const [cotaMapaData, setCotaMapaData] = useState<CotaMapaJson | null>(null)
  const [climadaCotaData, setClimadaCotaData] = useState<ClimadaCotaJson | null>(null)
  const [detalheCotaData, setDetalheCotaData] = useState<DetalheCotaJson | null>(null)

  useEffect(() => {
    if (!isOpen || globalStaticDataCache) return
    Promise.all([
      fetch("/dados_convertidos/danos_operacionais.json").then((r) => r.json()),
      fetch("/dados_convertidos/danos_fisicos_cenarios.json").then((r) => r.json()),
      fetch("/dados_convertidos/populacao_atingida.json").then((r) => r.json()),
      fetch("/dados_convertidos/area_atingida.json").then((r) => r.json()),
      fetch("/dados_convertidos/perdas_operacionais_cotas.json").then((r) => r.ok ? r.json() : null),
    ]).then(([op, fis, pop, area, perdasCotas]) => {
      globalStaticDataCache = { op, fis, pop, area, perdasCotas }
      setOpData(op)
      setFisData(fis)
      setPopData(pop)
      setAreaData(area)
      setPerdasCotasData(perdasCotas)
    }).catch(console.error)
  }, [isOpen])

  // Busca dados de cota ao trocar município
  useEffect(() => {
    if (!isOpen || !selectedMun) return
    const slug = slugify(selectedMun)
    let cancelled = false
    const cached = munCotasCache.get(slug)
    if (cached) {
      Promise.resolve(cached).then((c) => {
        if (cancelled) return
        setCotaMapaData(c.mapa)
        setClimadaCotaData(c.clim)
        setDetalheCotaData(c.det)
      })
      return () => {
        cancelled = true
      }
    }
    Promise.all([
      fetch(`/dados_convertidos/${slug}/cota_mapa.json`).then((r) => r.ok ? r.json() : null),
      fetch(`/dados_convertidos/climada_cota_${slug}.json`).then((r) => r.ok ? r.json() : null),
      fetch(`/dados_convertidos/climada_cota_detalhe_${slug}.json`).then((r) => r.ok ? r.json() : null),
    ]).then(([mapa, clim, det]) => {
      if (cancelled) return
      munCotasCache.set(slug, { mapa, clim, det })
      setCotaMapaData(mapa)
      setClimadaCotaData(clim)
      setDetalheCotaData(det)
    }).catch(console.error)
    return () => {
      cancelled = true
    }
  }, [isOpen, selectedMun])

  const cotasList = useMemo(() => {
    return cotaMapaData?.cotas ?? []
  }, [cotaMapaData])

  // Cotas selecionadas com defaults ergonômicos
  const cotaA = useMemo(() => {
    if (chosenCotaA != null && cotasList.includes(chosenCotaA)) return chosenCotaA
    if (cotasList.length === 0) return null
    const idx = Math.min(Math.floor(cotasList.length * 0.3), cotasList.length - 1)
    return cotasList[idx]
  }, [chosenCotaA, cotasList])

  const cotaB = useMemo(() => {
    if (chosenCotaB != null && cotasList.includes(chosenCotaB)) return chosenCotaB
    if (cotasList.length === 0) return null
    const idx = Math.min(Math.floor(cotasList.length * 0.8), cotasList.length - 1)
    return cotasList[idx]
  }, [chosenCotaB, cotasList])

  // Rótulos dinâmicos para exibição
  const currentLabelA = tipoComparador === "cotas" ? formatCotaDisplay(cotaA) : cenarioLabel(cenarioA)
  const currentLabelB = tipoComparador === "cotas" ? formatCotaDisplay(cotaB) : cenarioLabel(cenarioB)

  // Extração das métricas (suporta tanto cenários quanto cotas)
  const computeSide = useCallback(
    (cenario: string, cotaNum: number | null) => {
      if (!selectedMun) return null

      // Modo 1: Comparação por Cotas
      if (tipoComparador === "cotas") {
        if (cotaNum == null || cotasList.length === 0) return null

        const idx = cotasList.findIndex((c) => Math.abs(c - cotaNum) < 0.001)
        const pop = idx >= 0 && cotaMapaData?.pop_por_cota ? cotaMapaData.pop_por_cota[idx] ?? 0 : 0
        const popTotal = cotaMapaData?.pop_grade ?? 1
        const popPct = popTotal > 0 ? (pop / popTotal) * 100 : 0
        const area = idx >= 0 && cotaMapaData?.area_por_cota_km2 ? cotaMapaData.area_por_cota_km2[idx] ?? 0 : 0
        const areaPct = 0

        const op = matchCotaKey(perdasCotasData?.[selectedMun], cotaNum)
        const clim = matchCotaKey(climadaCotaData?.resultados_por_cota, cotaNum)
        const det = matchCotaKey(detalheCotaData?.por_cota, cotaNum)

        const empAtg = det?.empresas?.n ?? clim?.empresas?.n_atingidos ?? op?.empresas_n ?? 0
        const eduAtg = det?.educacao?.n ?? clim?.educacao?.n_atingidos ?? op?.educacao_n ?? 0
        const sauAtg = det?.saude?.n ?? clim?.saude?.n_atingidos ?? op?.saude_n ?? 0

        const vabEmp = op?.empresas_vab ?? 0
        const eduPerdas = (op?.educacao_perdas ?? 0) + (op?.educacao_custo_adicional ?? 0)
        const sauProd = op?.saude_producao ?? 0
        const agrPerdas = op?.agricultura_perdas ?? 0
        const totalOp = op?.total ?? (vabEmp + eduPerdas + sauProd + agrPerdas)

        const totalFis =
          (clim?.empresas?.dano_fisico_brl_poa ?? clim?.empresas?.dano_fisico_brl ?? clim?.empresas?.exposicao_total_brl ?? 0) +
          (clim?.educacao?.dano_fisico_brl_poa ?? clim?.educacao?.dano_fisico_brl ?? clim?.educacao?.exposicao_total_brl ?? 0) +
          (clim?.saude?.dano_fisico_brl_poa ?? clim?.saude?.dano_fisico_brl ?? clim?.saude?.exposicao_total_brl ?? 0)

        return {
          pop,
          popPct,
          area,
          areaPct,
          empAtg,
          eduAtg,
          sauAtg,
          vabEmp,
          eduPerdas,
          sauProd,
          agrPerdas,
          totalOp,
          totalFis,
        }
      }

      // Modo 2: Comparação por Cenários
      if (!cenario) return null
      const munOp = opData?.[selectedMun]
      const munFis = fisData?.[selectedMun]
      const munPop = popData?.[selectedMun]
      const munArea = areaData?.[selectedMun]

      const op = findCenarioData(munOp, cenario)
      const fis = findCenarioData(munFis, cenario)
      const pop = findCenarioData(munPop?.cenarios, cenario)
      const area = findCenarioData(munArea?.cenarios, cenario)

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
    },
    [
      selectedMun,
      tipoComparador,
      cotasList,
      cotaMapaData,
      perdasCotasData,
      climadaCotaData,
      detalheCotaData,
      opData,
      fisData,
      popData,
      areaData,
    ]
  )

  const metricsA = useMemo(() => computeSide(cenarioA, cotaA), [computeSide, cenarioA, cotaA])
  const metricsB = useMemo(() => computeSide(cenarioB, cotaB), [computeSide, cenarioB, cotaB])

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
      <DialogContent className="w-[98vw] sm:max-w-none max-w-[1720px] h-[92vh] max-h-[960px] overflow-hidden flex flex-col p-0 gap-0 sm:rounded-3xl shadow-2xl [&>button]:text-white/90 [&>button:hover]:text-white [&>button]:bg-white/10 [&>button:hover]:bg-white/20 [&>button]:border [&>button]:border-white/20 [&>button]:shadow-xs [&>button]:top-2.5 [&>button]:right-3.5 [&>button]:h-7 [&>button]:w-7 [&>button]:backdrop-blur-md">
        {/* Header no Padrão e Tema do Dashboard RS - Linha Única Sem Logo */}
        <DialogHeader
          className="shrink-0 px-3.5 py-2 text-white"
          style={HEADER_GLASS}
        >
          <div className="flex items-center gap-2.5 w-full min-w-0">
            {/* Título Compacto */}
            <div className="flex items-center gap-1.5 shrink-0">
              <GitCompare size={15} className="text-white/80 shrink-0" />
              <DialogTitle className="leading-none font-black whitespace-nowrap text-white text-xs sm:text-sm">
                Comparador
              </DialogTitle>
              <DialogDescription className="sr-only">
                Comparador lado a lado de cenários e cotas
              </DialogDescription>
            </div>

            <div className="h-5 w-px bg-white/20 shrink-0" />

            {/* Alternador de Modo: Cenários vs Cotas */}
            <div className="inline-flex rounded-full bg-black/20 p-0.5 border border-white/20 h-7 items-center shrink-0">
              <button
                type="button"
                onClick={() => setTipoComparador("cenarios")}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold active:scale-[0.97] transition-all duration-150 ${
                  tipoComparador === "cenarios"
                    ? "bg-white text-[#055071] shadow-xs"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Waves size={11} strokeWidth={2.5} />
                <span>Cenários</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoComparador("cotas")}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold active:scale-[0.97] transition-all duration-150 ${
                  tipoComparador === "cotas"
                    ? "bg-white text-[#055071] shadow-xs"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Ruler size={11} strokeWidth={2.5} />
                <span>Cotas ({cotasList.length})</span>
              </button>
            </div>

            {/* Seletor Município */}
            <Select value={selectedMun} onValueChange={handleSelectMun}>
              <SelectTrigger
                aria-label="Município"
                className="h-7 w-[125px] shrink-0 border-white/20 text-white text-xs font-semibold rounded-xl focus:ring-2 focus:ring-white/40 transition-all"
                style={{ backgroundColor: `${C.field}cc` }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl">
                {MUNICIPIOS.map((m) => (
                  <SelectItem key={m} value={m} className="text-xs font-semibold">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Seletor Lado A */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="h-2 w-2 rounded-full bg-[#38bdf8] shrink-0 shadow-2xs" />
              <span className="text-[10px] font-bold text-sky-200 uppercase tracking-wide shrink-0">Lado A:</span>
              {tipoComparador === "cotas" ? (
                <Select
                  value={cotaA != null ? String(cotaA) : ""}
                  onValueChange={(v) => setChosenCotaA(parseFloat(v))}
                >
                  <SelectTrigger
                    aria-label="Cota Lado A"
                    className="h-7 w-[130px] sm:w-[150px] border-sky-400/50 text-white text-xs font-semibold rounded-xl focus:ring-2 focus:ring-sky-300/50 transition-all"
                    style={{ backgroundColor: `${C.field}cc` }}
                  >
                    <SelectValue placeholder="Selecione cota..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl max-h-[300px]">
                    {cotasList.map((c) => (
                      <SelectItem key={c} value={String(c)} className="text-xs font-semibold">
                        {formatCotaDisplay(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={cenarioA} onValueChange={setChosenA}>
                  <SelectTrigger
                    aria-label="Cenário Lado A"
                    className="h-7 w-[140px] sm:w-[170px] border-sky-400/50 text-white text-xs font-semibold rounded-xl focus:ring-2 focus:ring-sky-300/50 transition-all"
                    style={{ backgroundColor: `${C.field}cc` }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl">
                    {cenariosList.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs font-semibold">
                        {cenarioLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Badge Central VS */}
            <span className="text-[9px] font-black tracking-wider text-white/60 uppercase shrink-0">
              vs
            </span>

            {/* Seletor Lado B */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="h-2 w-2 rounded-full bg-[#f87171] shrink-0 shadow-2xs" />
              <span className="text-[10px] font-bold text-rose-200 uppercase tracking-wide shrink-0">Lado B:</span>
              {tipoComparador === "cotas" ? (
                <Select
                  value={cotaB != null ? String(cotaB) : ""}
                  onValueChange={(v) => setChosenCotaB(parseFloat(v))}
                >
                  <SelectTrigger
                    aria-label="Cota Lado B"
                    className="h-7 w-[130px] sm:w-[150px] border-rose-400/50 text-white text-xs font-semibold rounded-xl focus:ring-2 focus:ring-rose-300/50 transition-all"
                    style={{ backgroundColor: `${C.field}cc` }}
                  >
                    <SelectValue placeholder="Selecione cota..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl max-h-[300px]">
                    {cotasList.map((c) => (
                      <SelectItem key={c} value={String(c)} className="text-xs font-semibold">
                        {formatCotaDisplay(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={cenarioB} onValueChange={setChosenB}>
                  <SelectTrigger
                    aria-label="Cenário Lado B"
                    className="h-7 w-[140px] sm:w-[170px] border-rose-400/50 text-white text-xs font-semibold rounded-xl focus:ring-2 focus:ring-rose-300/50 transition-all"
                    style={{ backgroundColor: `${C.field}cc` }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl">
                    {cenariosList.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs font-semibold">
                        {cenarioLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Ações à Direita */}
            <div className="flex items-center gap-1.5 pr-11 shrink-0 ml-auto">
              <button
                type="button"
                onClick={() => setShowPoints((prev) => !prev)}
                className={`active-press hover-lift flex items-center gap-1.5 h-7 px-2.5 rounded-full text-xs font-semibold border active:scale-[0.97] transition-all duration-150 ${
                  showPoints
                    ? "border-white bg-white text-[#055071] shadow-xs"
                    : "border-white/20 bg-white/10 text-white/90 hover:bg-white/20 hover:border-white/35"
                }`}
                title={showPoints ? "Ocultar pontos no mapa" : "Exibir pontos de escolas, saúde e empresas"}
              >
                <Layers size={12} strokeWidth={2.5} />
                <span className="hidden md:inline">{showPoints ? "Pontos" : "Ocultos"}</span>
              </button>

              {onOpenMapFullScreen && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenMapFullScreen()
                  }}
                  className="active-press hover-lift flex items-center gap-1.5 h-7 px-2.5 rounded-full text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 hover:border-white/35 active:scale-[0.97] transition-all duration-150 border border-white/20 shadow-xs"
                  title="Abrir mapa de comparação em tela cheia"
                >
                  <Maximize2 size={12} strokeWidth={2.5} />
                  <span className="hidden md:inline">Tela Cheia</span>
                </button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content - 2 Colunas Lado a Lado: Métricas & Danos (Esquerda) e Mapa com Swipe (Direita) */}
        <div className="min-h-0 flex-1 p-3 flex flex-col lg:flex-row gap-3 overflow-hidden bg-slate-100/70">
          {tipoComparador === "cenarios" && cenariosList.length <= 1 ? (
            <div className="p-8 text-center text-slate-500 rounded-xl border border-slate-200 bg-white w-full h-full flex flex-col items-center justify-center">
              <p className="font-bold text-base text-slate-700">Apenas um cenário hidrodinâmico cadastrado para {selectedMun}.</p>
              <p className="text-xs text-slate-500 mt-1.5 max-w-md">
                {cotasList.length > 1
                  ? "Você pode comparar as cotas hidrométricas do rio para este município no comparador de cotas:"
                  : "Selecione Porto Alegre, Lajeado ou Rio Grande no seletor acima para comparar diferentes simulações hidrodinâmicas."}
              </p>
              {cotasList.length > 1 && (
                <button
                  type="button"
                  onClick={() => setTipoComparador("cotas")}
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#055071] hover:bg-[#044460] text-white shadow-xs active:scale-[0.97] transition-all"
                >
                  <Ruler size={13} />
                  <span>Comparar por Cotas ({cotasList.length} cotas disponíveis)</span>
                </button>
              )}
            </div>
          ) : tipoComparador === "cotas" && cotasList.length <= 1 ? (
            <div className="p-8 text-center text-slate-500 rounded-xl border border-slate-200 bg-white w-full h-full flex flex-col items-center justify-center">
              <p className="font-bold text-base text-slate-700">Dados de cotas insuficientes para {selectedMun}.</p>
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
                        {currentLabelA} vs {currentLabelB}
                      </span>
                    </div>
                  </div>

                  {/* Alternador de visualização: Gráficos & KPIs vs Tabela (Apple Segmented Control) */}
                  <div className="inline-flex rounded-full bg-slate-200/80 p-1 border border-slate-300/60 shadow-2xs backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={() => setLeftTab("graficos")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold active:scale-[0.97] transition-all duration-150 ${
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
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold active:scale-[0.97] transition-all duration-150 ${
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
                                  Lado A · {currentLabelA}
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
                                  Lado B · {currentLabelB}
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
                                  O <strong>{currentLabelB}</strong> projeta uma redução de{" "}
                                  <strong className="text-emerald-700">
                                    {Math.abs((((metricsB.totalOp + metricsB.totalFis) - (metricsA.totalOp + metricsA.totalFis)) / (metricsA.totalOp + metricsA.totalFis)) * 100).toFixed(1)}%
                                  </strong>{" "}
                                  (-{fmtBRL(Math.abs((metricsB.totalOp + metricsB.totalFis) - (metricsA.totalOp + metricsA.totalFis)))}) no impacto econômico total comparado a {currentLabelA}.
                                </>
                              ) : (metricsB.totalOp + metricsB.totalFis) > (metricsA.totalOp + metricsA.totalFis) ? (
                                <>
                                  O <strong>{currentLabelB}</strong> projeta um aumento de{" "}
                                  <strong className="text-rose-700">
                                    {Math.abs((((metricsB.totalOp + metricsB.totalFis) - (metricsA.totalOp + metricsA.totalFis)) / (metricsA.totalOp + metricsA.totalFis)) * 100).toFixed(1)}%
                                  </strong>{" "}
                                  (+{fmtBRL((metricsB.totalOp + metricsB.totalFis) - (metricsA.totalOp + metricsA.totalFis))}) no impacto econômico total em relação a {currentLabelA}.
                                </>
                              ) : (
                                <>{tipoComparador === "cotas" ? "Ambas as cotas apresentam impacto econômico equivalente." : "Os dois cenários apresentam impacto econômico equivalente."}</>
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
                              <div className="col-span-3 text-right">Lado A ({currentLabelA})</div>
                              <div className="col-span-3 text-right">Lado B ({currentLabelB})</div>
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
                  cotaA={cotaA}
                  cotaB={cotaB}
                  modo={tipoComparador}
                  cotasList={cotasList}
                  onCotaAChange={setChosenCotaA}
                  onCotaBChange={setChosenCotaB}
                  isFullScreen={false}
                  showPoints={showPoints}
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
