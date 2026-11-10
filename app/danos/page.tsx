import { redirect } from "next/navigation"

export default async function DanosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  if (params.aba === "climada") {
    redirect("/danos-fisicos")
  }
  redirect("/perdas-operacionais")
}
