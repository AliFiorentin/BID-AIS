import { useEffect, useState } from "react"
import type {
  CenarioDanos,
  DanosData,
  ClimadaData,
  CotaSetor,
  CotasData,
  MedidasMun,
  ExposicaoMun,
  DanosFisicosCenariosData,
  PerdasOperacionaisCotasData,
  PerdasOperacionaisCota,
} from "./types"
import { RP_ORDER, DIAS_OPCOES, scaleTo } from "./helpers"
import type { DiasOpcao } from "./helpers"

export interface DanosProps {
  dados: DanosData
  dadosClimada: ClimadaData | null
  dadosClimadaMun: Record<string, ClimadaData>
  dadosCotas: Record<string, CotasData>
  dadosMedidas: Record<string, MedidasMun>
  dadosExposicao: Record<string, ExposicaoMun>
  dadosFisicosCenarios?: DanosFisicosCenariosData
  dadosPerdasCotas?: PerdasOperacionaisCotasData
  abaInicial?: "dala" | "climada"
}

export const MUNS_CLIMADA = [
  "Porto Alegre",
  "Lajeado",
  "Eldorado do Sul",
  "Rio Grande",
]

export const DEFAULT_CENARIOS_FISICOS: Record<string, string> = {
  "Porto Alegre": "cenario_ada",
  "Eldorado do Sul": "cenario_ada",
  "Lajeado": "cenario_ada",
  "Rio Grande": "cenario_ada",
}

export const CENARIO_FISICO_LABELS: Record<string, string> = {
  cenario_ada: "Cenário ADA (Maio 2024)",
  climada_evento_2024: "Simulação Climada Evento 2024",
  simulacao_climada_evento_2024: "Simulação Climada Evento 2024",
  cenario_27m: "Simulação 27m",
  simulacao_27m: "Simulação 27m",
  cenario_30m: "Simulação 30m",
  simulacao_30m: "Simulação 30m",
  cenario_maio_2024: "Simulação Maio 2024",
  simulacao_maio_2024: "Simulação Maio 2024",
  cenario_maio_2024_50: "Simulação Maio 2024 + 50%",
  simulacao_maio_2024_50: "Simulação Maio 2024 + 50%",
  cenario_setembro_2023: "Simulação Setembro 2023",
  simulacao_setembro_2023: "Simulação Setembro 2023",
}

export function scaleCotaTo(
  v: PerdasOperacionaisCota,
  dias: number
): PerdasOperacionaisCota {
  const s = dias / (v.dias_efetivos || 60)
  const emp = v.empresas_vab * s
  const edu = v.educacao_perdas * s
  const eduAdic = v.educacao_custo_adicional * s
  const sau = v.saude_producao * s
  const agr = v.agricultura_perdas
  return {
    ...v,
    dias_agudo: Math.round(dias / 2),
    dias_efetivos: dias,
    f_interrup: dias / 365,
    empresas_vab: emp,
    educacao_perdas: edu,
    educacao_custo_adicional: eduAdic,
    saude_producao: sau,
    agricultura_perdas: agr,
    total: emp + edu + eduAdic + sau + agr,
  }
}

/** Estado e valores derivados das páginas Perdas Operacionais e Danos Físicos. */
export function useDanosContext({
  dados,
  dadosClimada: climadaPA,
  dadosClimadaMun,
  dadosCotas: cotasPorMun,
  dadosMedidas,
  dadosExposicao,
  dadosFisicosCenarios = {},
  dadosPerdasCotas = {},
  abaInicial = "dala",
}: DanosProps) {
  const [aba, setAba] = useState<"dala" | "climada">(abaInicial)
  const [dias, setDias] = useState<DiasOpcao>(30)
  const [rp, setRp] = useState("RP200")

  // Visão em Danos Físicos: "cenario" (novo!), "cota" ou "rp"
  const [munClimada, setMunClimada] = useState("Porto Alegre")
  const [visao, setVisao] = useState<"cenario" | "cota" | "rp">("cenario")
  const [cota, setCota] = useState("29.45")
  const [cenarioFisico, setCenarioFisico] = useState<string>("cenario_ada")

  // Visão em Perdas Operacionais: "cenario" ou "cota" (novo!)
  const [visaoPerdas, setVisaoPerdas] = useState<"cenario" | "cota">("cenario")
  const [munPerdas, setMunPerdas] = useState<string>("Porto Alegre")
  const [cotaPerdas, setCotaPerdas] = useState<string>("")

  // Permalink: só o que difere do padrão vai para a URL
  const [urlLida, setUrlLida] = useState(false)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    /* eslint-disable react-hooks/set-state-in-effect */
    if (
      p.get("aba") === "climada" &&
      (climadaPA || Object.keys(cotasPorMun).length)
    )
      setAba("climada")
    const d = Number(p.get("dias"))
    if ((DIAS_OPCOES as readonly number[]).includes(d)) setDias(d as DiasOpcao)
    const m = p.get("mun")
    if (m && MUNS_CLIMADA.includes(m)) {
      setMunClimada(m)
      setMunPerdas(m)
    }
    const v = p.get("visao")
    if (v === "cenario" || v === "rp" || v === "cota") setVisao(v as "cenario" | "cota" | "rp")
    const vp = p.get("visaoPerdas")
    if (vp === "cenario" || vp === "cota") setVisaoPerdas(vp)
    const r = p.get("rp")
    if (r && RP_ORDER.includes(r)) setRp(r)
    const c = p.get("cota")
    if (c && Number.isFinite(parseFloat(c))) {
      setCota(c)
      setCotaPerdas(c)
    }
    const cf = p.get("cenarioFisico")
    if (cf) setCenarioFisico(cf)
    setUrlLida(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [climadaPA, cotasPorMun])

  useEffect(() => {
    if (!urlLida) return
    const p = new URLSearchParams(window.location.search)
    const def = (k: string, set: boolean, v: string) => {
      if (set) p.set(k, v)
      else p.delete(k)
    }
    const clim = aba === "climada"
    def("dias", !clim && dias !== 30, String(dias))
    def("mun", clim && munClimada !== "Porto Alegre", munClimada)
    def("visao", clim && visao !== "cenario", visao)
    def("visaoPerdas", !clim && visaoPerdas !== "cenario", visaoPerdas)
    def("cota", cota !== "29.45", cota)
    def("cenarioFisico", clim && cenarioFisico !== "cenario_ada", cenarioFisico)
    const qs = p.toString()
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`
    )
  }, [urlLida, aba, dias, munClimada, visao, visaoPerdas, rp, cota, cenarioFisico])

  // ── Dados escalados (Danos Operacionais por Cenário) para a duração selecionada ──
  const dadosEscalados: DanosData = Object.fromEntries(
    Object.entries(dados).map(([mun, cens]) => [
      mun,
      Object.fromEntries(
        Object.entries(cens).map(([cen, v]) => [cen, scaleTo(v, dias)])
      ),
    ])
  )

  const CENARIOS_VISAO_GERAL: Record<string, string> = {
    "Eldorado do Sul": "Cenário ADA",
    Lajeado: "Cenário ADA",
    "Porto Alegre": "Cenário ADA",
    "Rio Grande": "Cenário ADA",
  }

  const pioresCenarios = Object.entries(dadosEscalados).map(([mun, cens]) => {
    const cenarioFixo = CENARIOS_VISAO_GERAL[mun]
    const entry =
      (cenarioFixo && (cens[cenarioFixo] ?? cens["Cenario ADA"]))
        ? ([cenarioFixo, (cens[cenarioFixo] ?? cens["Cenario ADA"])] as [string, CenarioDanos])
        : Object.entries(cens).reduce((acc, cur) =>
            cur[1].total > acc[1].total ? cur : acc
          )
    return { mun, cenNome: entry[0], cenVal: entry[1] }
  })

  // Deduplica cenários preservando Cenário ADA e preferindo Simulação XXX
  const todosCenarios = Object.entries(dadosEscalados).flatMap(([mun, cens]) => {
    const keys = Object.keys(cens)
    const deduped: { mun: string; cen: string; v: CenarioDanos }[] = []
    const seen = new Set<string>()

    // ADA primeiro
    if (cens["Cenário ADA"] || cens["Cenario ADA"]) {
      deduped.push({ mun, cen: "Cenário ADA", v: cens["Cenário ADA"] ?? cens["Cenario ADA"]! })
      seen.add("ada")
    }

    for (const [cen, v] of Object.entries(cens)) {
      if (cen.toLowerCase().includes("ada")) continue
      const isSim = cen.startsWith("Simulação ")
      const norm = cen.replace(/^(Cen[aá]rio|Simula[cç][aã]o)\s+/, "").toLowerCase()
      if (seen.has(norm)) continue
      // Se não for Simulação, mas existe versão Simulação na lista, pula esta
      if (!isSim && keys.some(k => k.startsWith("Simulação ") && k.toLowerCase().includes(norm))) {
        continue
      }
      seen.add(norm)
      deduped.push({ mun, cen, v })
    }
    return deduped
  })
  const maxTotalDala = Math.max(...todosCenarios.map((c) => c.v.total), 1)

  // ── Município ativo da aba Danos Físicos ──
  const climadaPorMun: Record<string, ClimadaData | null | undefined> = {
    ...dadosClimadaMun,
    "Porto Alegre": climadaPA,
  }
  const munsClimada = [
    "Porto Alegre",
    "Lajeado",
    "Eldorado do Sul",
    "Rio Grande",
  ].filter(
    (m) => !!(climadaPorMun[m] || cotasPorMun[m] || dadosFisicosCenarios[m])
  )
  const munClimadaAtivo = munsClimada.includes(munClimada)
    ? munClimada
    : munsClimada[0] ?? "Porto Alegre"

  // Cenários Físicos disponíveis para o município ativo (Cenário ADA primeiro, e preferindo Simulação)
  const rawCenarios = Object.keys(dadosFisicosCenarios[munClimadaAtivo] ?? {})
  const filteredCenarios = rawCenarios.filter((k) => {
    if (k === "cenario_ada") return true
    if (k.startsWith("cenario_") && rawCenarios.includes(k.replace("cenario_", "simulacao_"))) return false
    if (k === "climada_evento_2024" && rawCenarios.includes("simulacao_climada_evento_2024")) return false
    return true
  })
  const cenariosFisicosDisponiveis = filteredCenarios.sort((a, b) =>
    a === "cenario_ada" ? -1 : b === "cenario_ada" ? 1 : a.localeCompare(b)
  )
  const cenarioFisicoAtivo = cenariosFisicosDisponiveis.includes(cenarioFisico)
    ? cenarioFisico
    : (DEFAULT_CENARIOS_FISICOS[munClimadaAtivo] ??
      cenariosFisicosDisponiveis[0] ??
      "")
  const dadosCenarioFisico =
    dadosFisicosCenarios[munClimadaAtivo]?.[cenarioFisicoAtivo]

  // Eldorado do Sul: só cota ou cenário (sem RP).
  const dadosClimada: ClimadaData | null =
    munClimadaAtivo === "Eldorado do Sul"
      ? null
      : (climadaPorMun[munClimadaAtivo] ?? null)
  const medidasMun: MedidasMun | null = dadosMedidas[munClimadaAtivo] ?? null

  // ── Dados CLIMADA para o RP selecionado ──
  const climadaSetores = ["empresas", "educacao", "saude"]
  const rpsDisponiveis = dadosClimada
    ? RP_ORDER.filter((r) => dadosClimada.resultados_por_rp[r])
    : []
  const rpAtivo =
    dadosClimada && dadosClimada.resultados_por_rp[rp]
      ? rp
      : rpsDisponiveis[rpsDisponiveis.length - 1]
  const atualClimada = rpAtivo
    ? dadosClimada?.resultados_por_rp[rpAtivo]
    : undefined
  const totalAtualClimada = atualClimada
    ? climadaSetores.reduce(
        (s, k) => s + atualClimada[k].dano_fisico_total_brl,
        0
      )
    : 0
  const exposicaoAtualClimada = atualClimada
    ? climadaSetores.reduce((s, k) => s + atualClimada[k].exposicao_total_brl, 0)
    : 0
  const maxTotalClimada =
    dadosClimada && rpsDisponiveis.length
      ? Math.max(
          ...rpsDisponiveis.map((r) =>
            climadaSetores.reduce(
              (s, k) =>
                s + dadosClimada.resultados_por_rp[r][k].dano_fisico_total_brl,
              0
            )
          )
        )
      : 0
  const eai = dadosClimada?.eai_anual_esperado ?? null

  // ── Dados CLIMADA por cota ──
  const dadosCotas: CotasData | null = cotasPorMun[munClimadaAtivo] ?? null
  const cotasDisponiveis = dadosCotas
    ? Object.keys(dadosCotas.resultados_por_cota).sort(
        (a, b) => parseFloat(a) - parseFloat(b)
      )
    : []
  const cotaAtiva = cotasDisponiveis.includes(cota)
    ? cota
    : cotasDisponiveis[Math.floor(cotasDisponiveis.length / 2)]
  const atualCota =
    dadosCotas && cotaAtiva
      ? dadosCotas.resultados_por_cota[cotaAtiva]
      : undefined
  const totalCota = (
    c: Record<string, CotaSetor>,
    k: "dano_fisico_brl_poa" | "dano_fisico_brl_jrc_crua"
  ) => climadaSetores.reduce((s, st) => s + c[st][k], 0)
  const maxTotalCota =
    dadosCotas && cotasDisponiveis.length
      ? Math.max(
          ...cotasDisponiveis.map((c) =>
            totalCota(
              dadosCotas.resultados_por_cota[c],
              "dano_fisico_brl_jrc_crua"
            )
          )
        )
      : 0
  const expo: ExposicaoMun | null = dadosExposicao[munClimadaAtivo] ?? null
  const cotaAtivo =
    !!dadosCotas && !!atualCota && (visao === "cota" || !dadosClimada)
  const semCurva = !!expo && cotaAtivo
  const totalRp10 = dadosClimada?.resultados_por_rp?.RP10
    ? climadaSetores.reduce(
        (sum, k) =>
          sum + dadosClimada.resultados_por_rp.RP10[k].dano_fisico_total_brl,
        0
      )
    : 0
  const foraRasterTotal = dadosCotas
    ? Object.values(dadosCotas.diagnostico.pontos_fora_do_raster).reduce(
        (a, b) => a + b,
        0
      )
    : 0

  // ── Cotas em Perdas Operacionais ──
  const munsPerdas = [
    "Porto Alegre",
    "Lajeado",
    "Eldorado do Sul",
    "Rio Grande",
  ].filter((m) => !!dadosPerdasCotas[m])
  const munPerdasAtivo = munsPerdas.includes(munPerdas)
    ? munPerdas
    : munsPerdas[0] ?? "Porto Alegre"

  const cotasPerdasDisponiveis = dadosPerdasCotas[munPerdasAtivo]
    ? Object.keys(dadosPerdasCotas[munPerdasAtivo]).sort(
        (a, b) => parseFloat(a) - parseFloat(b)
      )
    : []
  const cotaPerdasAtiva = cotasPerdasDisponiveis.includes(cotaPerdas)
    ? cotaPerdas
    : cotasPerdasDisponiveis[cotasPerdasDisponiveis.length - 1] ?? ""

  // Cotas de perdas escaladas pelo tempo de paralisação (dias)
  const cotasPerdasMunEscaladas: Record<string, PerdasOperacionaisCota> =
    Object.fromEntries(
      Object.entries(dadosPerdasCotas[munPerdasAtivo] ?? {}).map(([c, val]) => [
        c,
        scaleCotaTo(val, dias),
      ])
    )
  const cotaPerdasAtualEscalada = cotasPerdasMunEscaladas[cotaPerdasAtiva]

  return {
    CENARIOS_VISAO_GERAL,
    aba,
    atualClimada,
    atualCota,
    climadaPA,
    climadaPorMun,
    climadaSetores,
    cota,
    cotaAtiva,
    cotaAtivo,
    cotasDisponiveis,
    cotasPorMun,
    dados,
    dadosClimada,
    dadosClimadaMun,
    dadosCotas,
    dadosEscalados,
    dadosExposicao,
    dadosFisicosCenarios,
    dadosMedidas,
    dadosPerdasCotas,
    dias,
    eai,
    expo,
    exposicaoAtualClimada,
    foraRasterTotal,
    maxTotalClimada,
    maxTotalCota,
    maxTotalDala,
    medidasMun,
    munClimada,
    munClimadaAtivo,
    munsClimada,
    pioresCenarios,
    rp,
    rpAtivo,
    rpsDisponiveis,
    semCurva,
    setAba,
    setCota,
    setDias,
    setMunClimada,
    setRp,
    setVisao,
    todosCenarios,
    totalAtualClimada,
    totalCota,
    totalRp10,
    visao,
    // Novos campos para Cenários em Danos Físicos:
    cenarioFisico,
    cenarioFisicoAtivo,
    cenariosFisicosDisponiveis,
    dadosCenarioFisico,
    setCenarioFisico,
    // Novos campos para Cotas em Perdas Operacionais:
    visaoPerdas,
    setVisaoPerdas,
    munPerdas,
    setMunPerdas,
    munsPerdas,
    munPerdasAtivo,
    cotaPerdas,
    cotaPerdasAtiva,
    cotasPerdasDisponiveis,
    cotasPerdasMunEscaladas,
    cotaPerdasAtualEscalada,
    setCotaPerdas,
  }
}

export type DanosCtx = ReturnType<typeof useDanosContext>
