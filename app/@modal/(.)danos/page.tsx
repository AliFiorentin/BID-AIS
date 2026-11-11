import { DanosClient } from "@/app/danos/DanosClient"
import { getDanosPageData } from "@/app/danos/get-data"
import { RouteModal } from "@/components/RouteModal"

export default function DanosModal() {
  const data = getDanosPageData()
  return (
    <RouteModal>
      <DanosClient {...data} />
    </RouteModal>
  )
}
