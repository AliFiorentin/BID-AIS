// Avisos de interpretação dos resultados (população, cenários sintéticos e bases temporais).

import { formatoBr } from "./geo-utils"

export interface PopulacaoCenario {
  pop_atingida: number
  pct_atingida: number
  /** Presente e começando por "estimado" quando o valor é estimativa por proxy (hoje todos são calculados no raster). */
  _metodologia?: string
}

/**
 * Como rotular a população atingida. Uma estimativa por proxy (campo `_metodologia` começando por
 * "estimado") não pode aparecer como valor exato; sem dado para o cenário o texto diz "não calculada".
 */
export function rotuloPopulacao(popCen: PopulacaoCenario | null | undefined): {
  estimado: boolean
  texto: string
} {
  if (!popCen)
    return { estimado: false, texto: "não calculada para este cenário" }
  const metodo = popCen._metodologia
  if (metodo && /^estimad/i.test(metodo.trim())) {
    const faixa = metodo.match(/faixa\s+(\d+)\s+a\s+(\d+)/i)
    return {
      estimado: true,
      texto: faixa
        ? `estimada por proxy (faixa de ${formatoBr(Number(faixa[1]))} a ${formatoBr(Number(faixa[2]))} hab.)`
        : "estimada por proxy",
    }
  }
  return { estimado: false, texto: "calculada a partir do raster de população" }
}

/** "Cenário Maio 2024 + 50%" não é 50% a mais de área (a água fica 60 cm mais alta, mancha ~7× maior). */
export const AVISO_MAIO_2024_MAIS_50 =
  "Cenário Maio 2024 + 50%: a água fica 60 cm mais alta que em Maio 2024 (mancha ~7 vezes maior), não 50% a mais de área."

/** Aviso geral sobre manchas de inundação observadas/modeladas no painel. */
export const AVISO_MANCHA_PADRAO =
  "Extensão da área alagada segundo o cenário selecionado. Nos cenários estáticos (polígono), os indicadores refletem interseção espacial (atingido sim/não); no cenário Todas as cotas, acompanham o nível do rio cota a cota."

export const AVISO_COTAS_SIMULACAO =
  "O modo Por Cota é uma simulação de inundação gradual baseada em níveis de água estáticos/hidrodinâmicos do rio, sujeita a incertezas de modelagem e relevo."

export const AVISO_SIMULACAO =
  "Este cenário é uma simulação numérica sujeita a incertezas de modelagem e calibração hidrodinâmica. Para dados do evento real observado em campo, utilize o Cenário ADA."

/** Verifica se o cenário é uma simulação (modelagem numérica, cotas, RP ou sintético). O único cenário observado em campo é o ADA. */
export function isCenarioSimulacao(cenario: string | null | undefined): boolean {
  if (!cenario || cenario === "(nenhum)") return false
  if (cenario === "Cenário ADA" || cenario === "Cenario ADA" || cenario === "cenario_ada") return false
  return true
}

/** Defasagem das bases (RAIS 2023, Censo Escolar 2024, CNES abr/2024) frente ao ano do evento. */
export function AVISO_BASES(ano: number): string {
  const relacao =
    ano <= 2023
      ? "posteriores ao evento"
      : ano === 2024
        ? "do mesmo período do evento ou anteriores"
        : "anteriores ao evento"
  return `Bases: RAIS 2023, Censo Escolar 2024 e CNES de abril/2024, ${relacao} (evento de ${ano}). Ver Metodologia, Seção 12.`
}
