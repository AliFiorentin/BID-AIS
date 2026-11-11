import { PerdasClient } from "@/app/perdas-operacionais/PerdasClient"
import { getDanosPageData } from "@/app/danos/get-data"
import { RouteModal } from "@/components/RouteModal"

export default function PerdasOperacionaisModal() {
  const data = getDanosPageData()
  return (
    <RouteModal>
      <PerdasClient {...data} />
    </RouteModal>
  )
}
