export type IntervencaoId = "sem-intervencao" | "diques" | "diques-barragens"
export type IntervencaoAtiva = Exclude<IntervencaoId, "sem-intervencao">

export const formatoBr = (num: number, casas = 0) =>
  num.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })

export const compactoBr = (n: number, casas = 1) => {
  if (n === undefined || n === null || isNaN(n)) return "0"
  const abs = Math.abs(n)
  const sinal = n < 0 ? "-" : ""
  const arred = (d: number) => Number((abs / d).toFixed(casas))
  if (abs >= 1e9 || arred(1e6) >= 1000)
    return `${sinal}${formatoBr(abs / 1e9, casas)} Bi`
  if (abs >= 1e6 || arred(1e3) >= 1000)
    return `${sinal}${formatoBr(abs / 1e6, casas)} Mi`
  if (abs >= 1e3) return `${sinal}${formatoBr(abs / 1e3, casas)} Mil`
  return `${sinal}${formatoBr(abs, casas)}`
}

export function fmtBRL(v: number): string {
  if (v >= 1e9 || Number((v / 1e6).toFixed(1)) >= 1000)
    return `R$ ${(v / 1e9).toFixed(2).replace(".", ",")} bi`
  if (v >= 1e6 || Number((v / 1e3).toFixed(0)) >= 1000)
    return `R$ ${(v / 1e6).toFixed(1).replace(".", ",")} mi`
  if (v >= 1e3) return `R$ ${(v / 1e3).toFixed(0)} mil`
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`
}

export interface Indicadores {
  area_ha: number
  prof_max_cm: number
  area_por_faixa_ha: Record<string, number>
  empresas: number
  vinculos: number
  massa_salarial: number
  escolas: number
  matriculas: number
  unidades_saude: number
  patrimonio: number
  logradouros: number
  quadras: number
  terrenos: number
  agricultura_ha: number
  cobertura_ha: number
  perdas_total: number
  perdas_empresas: number
  perdas_educacao: number
  perdas_saude: number
  perdas_agricultura: number
  perdas_dias_efetivos: number
  populacao?: number
  exposicao_empresas?: number
  exposicao_educacao?: number
  exposicao_saude?: number
  exposicao_total?: number
}

export interface EvitadoValor {
  valor: number
  pct: number | null
}

export interface ComparativoEvento {
  rotulo: string
  variantes: Record<IntervencaoId, Indicadores>
  evitado: Record<IntervencaoAtiva, Record<string, EvitadoValor>>
}

export interface Comparativo {
  limiar_cm: number
  exposicao_disponivel: boolean
  populacao_disponivel: boolean
  eventos: Record<string, ComparativoEvento>
}

export type TomEvitado = "evitado" | "piora" | "neutro"

export function formatarEvitado(
  valor: number,
  pct: number | null
): { texto: string; tom: TomEvitado } {
  const tom: TomEvitado = valor > 0 ? "evitado" : valor < 0 ? "piora" : "neutro"
  if (pct === null || !Number.isFinite(pct)) return { texto: "—", tom }
  return {
    texto: `${formatoBr(Math.abs(pct) * 100, (Math.abs(pct) * 100) % 1 === 0 ? 0 : 1)}%`,
    tom,
  }
}

export interface PerdasPorComponente {
  empresas: number
  educacao: number
  saude: number
  agricultura: number
  total: number
}

export function perdasEmDias(
  ind: Indicadores,
  dias: number
): PerdasPorComponente {
  const s = dias / (ind.perdas_dias_efetivos || 60)
  const empresas = ind.perdas_empresas * s
  const educacao = ind.perdas_educacao * s
  const saude = ind.perdas_saude * s
  const agricultura = ind.perdas_agricultura
  return {
    empresas,
    educacao,
    saude,
    agricultura,
    total: empresas + educacao + saude + agricultura,
  }
}

export function perdasEvitadasEmDias(
  base: Indicadores,
  interv: Indicadores,
  dias: number
): EvitadoValor {
  const b = perdasEmDias(base, dias).total
  const i = perdasEmDias(interv, dias).total
  const valor = b - i
  return { valor, pct: b === 0 ? null : valor / b }
}
