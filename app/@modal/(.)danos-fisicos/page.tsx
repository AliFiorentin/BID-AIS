import { FisicosClient } from "@/app/danos-fisicos/FisicosClient"
import { getDanosPageData } from "@/app/danos/get-data"
import { RouteModal } from "@/components/RouteModal"

export default function DanosFisicosModal() {
  const {
    dados,
    dadosClimada,
    dadosClimadaMun,
    dadosCotas,
    dadosMedidas,
    dadosExposicao,
  } = getDanosPageData()
  return (
    <RouteModal>
      <FisicosClient
        dados={dados}
        dadosClimada={dadosClimada}
        dadosClimadaMun={dadosClimadaMun}
        dadosCotas={dadosCotas}
        dadosMedidas={dadosMedidas}
        dadosExposicao={dadosExposicao}
      />
    </RouteModal>
  )
}
