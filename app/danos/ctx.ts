import { useEffect, useState } from "react"
import type {
  CenarioDanos,
  DanosData,
  ClimadaData,
  CotaSetor,
  CotasData,
  MedidasMun,
  ExposicaoMun,
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
  abaInicial?: "dala" | "climada"
}

const MUNS_CLIMADA = [
  "Porto Alegre",
  "Lajeado",
  "Eldorado do Sul",
  "Rio Grande",
]

/** Estado e valores derivados das páginas Perdas Operacionais e Danos Físicos. */
export function useDanosContext({
  dados,
  dadosClimada: climadaPA,
  dadosClimadaMun,
  dadosCotas: cotasPorMun,
  dadosMedidas,
  dadosExposicao,
  abaInicial = "dala",
}: DanosProps) {
  const [aba, setAba] = useState<"dala" | "climada">(abaInicial)
  const [dias, setDias] = useState<DiasOpcao>(30)
  const [rp, setRp] = useState("RP200")
  // Município e visão da aba CLIMADA: por período de retorno (RP) ou por cota do rio.
  const [munClimada, setMunClimada] = useState("Porto Alegre")
  const [visao, setVisao] = useState<"rp" | "cota">("rp")
  const [cota, setCota] = useState("29.45")

  // Permalink: ?dias=45&mun=Lajeado&visao=rp&rp=RP100&cota=27.45. Só o que difere do padrão vai
  // para a URL. A leitura roda uma vez, após a hidratação.
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
    if (m && MUNS_CLIMADA.includes(m)) setMunClimada(m)
    const v = p.get("visao")
    if (v === "rp" || v === "cota") setVisao(v)
    const r = p.get("rp")
    if (r && RP_ORDER.includes(r)) setRp(r)
    const c = p.get("cota")
    if (c && Number.isFinite(parseFloat(c))) setCota(c)
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
    def(
      "visao",
      clim && munClimada === "Porto Alegre" && visao !== "rp",
      visao
    )
    def(
      "rp",
      clim && munClimada === "Porto Alegre" && visao === "rp" && rp !== "RP200",
      rp
    )
    def("cota", clim && visao === "cota" && cota !== "29.45", cota)
    const qs = p.toString()
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`
    )
  }, [urlLida, aba, dias, munClimada, visao, rp, cota])

  // ── Dados escalados (Danos Operacionais) para a duração selecionada ──
  const dadosEscalados: DanosData = Object.fromEntries(
    Object.entries(dados).map(([mun, cens]) => [
      mun,
      Object.fromEntries(
        Object.entries(cens).map(([cen, v]) => [cen, scaleTo(v, dias)])
      ),
    ])
  )

  const CENARIOS_VISAO_GERAL: Record<string, string> = {
    "Eldorado do Sul": "Cenario ADA",
    Lajeado: "Cenario 27m",
    "Porto Alegre": "Climada Evento 2024",
    "Rio Grande": "Cenario Maio 2024",
  }

  const pioresCenarios = Object.entries(dadosEscalados).map(([mun, cens]) => {
    const cenarioFixo = CENARIOS_VISAO_GERAL[mun]
    const entry =
      cenarioFixo && cens[cenarioFixo]
        ? ([cenarioFixo, cens[cenarioFixo]] as [string, CenarioDanos])
        : Object.entries(cens).reduce((acc, cur) =>
            cur[1].total > acc[1].total ? cur : acc
          )
    return { mun, cenNome: entry[0], cenVal: entry[1] }
  })

  const todosCenarios = Object.entries(dadosEscalados).flatMap(([mun, cens]) =>
    Object.entries(cens).map(([cen, v]) => ({ mun, cen, v }))
  )
  const maxTotalDala = Math.max(...todosCenarios.map((c) => c.v.total), 1)

  // ── Município ativo da aba CLIMADA ──
  const climadaPorMun: Record<string, ClimadaData | null | undefined> = {
    ...dadosClimadaMun,
    "Porto Alegre": climadaPA,
  }
  const munsClimada = [
    "Porto Alegre",
    "Lajeado",
    "Eldorado do Sul",
    "Rio Grande",
  ].filter((m) => !!(climadaPorMun[m] || cotasPorMun[m]))
  const munClimadaAtivo = munsClimada.includes(munClimada)
    ? munClimada
    : munsClimada[0]
  // Eldorado do Sul: só a visão por cota (a frequência do Guaíba é de tabela defasada, sem 2024).
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
    ? climadaSetores.reduce((s, k) => s + atualClimada[k].dano_fisico_total_brl, 0)
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

  // ── Dados CLIMADA por cota (Lajeado, Eldorado do Sul, Porto Alegre, Rio Grande) ──
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
  // Visão por cota: quando escolhida, ou quando o município não tem a visão por RP.
  // Municípios sem curva de dano: valor exposto atingido no lugar do dano.
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
    dadosMedidas,
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
  }
}

export type DanosCtx = ReturnType<typeof useDanosContext>
