import { FisicosClient } from "@/app/danos-fisicos/FisicosClient"
import { getDanosPageData } from "@/app/danos/get-data"
import { RouteModal } from "@/components/RouteModal"

export default function DanosFisicosModal() {
  const data = getDanosPageData()
  return (
    <RouteModal>
      <FisicosClient {...data} />
    </RouteModal>
  )
}
