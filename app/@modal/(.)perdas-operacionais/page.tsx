import { PerdasClient } from "@/app/perdas-operacionais/PerdasClient"
import { getDanosPageData } from "@/app/danos/get-data"
import { RouteModal } from "@/components/RouteModal"

export default function PerdasOperacionaisModal() {
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
      <PerdasClient
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
