import type { Metadata } from "next"
import { FisicosClient } from "./FisicosClient"
import { getDanosPageData } from "../danos/get-data"

export const metadata: Metadata = {
  title: "Danos Físicos — Avaliação de Impactos Socioeconômicos RS",
  description:
    "Exposição por cota do rio e modelagem de risco físico (CLIMADA) para os municípios avaliados no Rio Grande do Sul.",
}

export default function DanosFisicosPage() {
  const {
    dados,
    dadosClimada,
    dadosClimadaMun,
    dadosCotas,
    dadosMedidas,
    dadosExposicao,
  } = getDanosPageData()
  return (
    <FisicosClient
      dados={dados}
      dadosClimada={dadosClimada}
      dadosClimadaMun={dadosClimadaMun}
      dadosCotas={dadosCotas}
      dadosMedidas={dadosMedidas}
      dadosExposicao={dadosExposicao}
    />
  )
}
