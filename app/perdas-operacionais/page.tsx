import type { Metadata } from "next"
import { PerdasClient } from "./PerdasClient"
import { getDanosPageData } from "../danos/get-data"

export const metadata: Metadata = {
  title: "Perdas Operacionais — Avaliação de Impactos Socioeconômicos RS",
  description:
    "Estimativa de perdas econômicas operacionais (metodologia DaLA/CEPAL) causadas pelas enchentes no Rio Grande do Sul.",
}

export default function PerdasOperacionaisPage() {
  const {
    dados,
    dadosClimada,
    dadosClimadaMun,
    dadosCotas,
    dadosMedidas,
    dadosExposicao,
  } = getDanosPageData()
  return (
    <PerdasClient
      dados={dados}
      dadosClimada={dadosClimada}
      dadosClimadaMun={dadosClimadaMun}
      dadosCotas={dadosCotas}
      dadosMedidas={dadosMedidas}
      dadosExposicao={dadosExposicao}
    />
  )
}
