import type { Metadata } from "next"
import { PerdasClient } from "./PerdasClient"
import { getDanosPageData } from "../danos/get-data"

export const metadata: Metadata = {
  title: "Perdas Operacionais — Avaliação de Impactos Socioeconômicos RS",
  description:
    "Estimativa de perdas econômicas operacionais (metodologia DaLA/CEPAL) causadas pelas enchentes no Rio Grande do Sul.",
}

export default function PerdasOperacionaisPage() {
  const data = getDanosPageData()
  return <PerdasClient {...data} />
}
