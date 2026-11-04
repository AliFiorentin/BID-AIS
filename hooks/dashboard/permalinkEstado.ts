import { useEffect } from "react"
import type { MutableRefObject } from "react"
import { DANO_FISICO_MUNICIPIO, DANO_FISICO_RPS } from "@/lib/constants"

/**
 * Permalink das seleções do Dash além de município/cenário/câmera/cota (que ficam em usePermalink e
 * useCotas): aba, camadas, infra, filtros, mancha, mapas de calor e dano físico.
 *
 * Parâmetros (omitidos quando iguais ao padrão, para o link ficar curto):
 *   t=aba  l=camadas (rótulos separados por vírgula; vazio = nenhuma)  inf=infra ativa (vírgula)
 *   fs/fd/ft=filtro de setor/dependência/tipo  mancha=0  hm=e,s,d (mapas de calor)  df=1&rp=RP200
 */

export const CAMADAS_PADRAO = ["Empresas", "Educação", "Saúde", "Agricultura"]
const CAMADAS_VALIDAS = [
  "Empresas",
  "Educação",
  "Saúde",
  "Agricultura",
  "Infraestrutura",
  "População",
]
const ABAS_VALIDAS = [
  "resumo",
  "empresas",
  "educacao",
  "saude",
  "agricultura",
  "infra",
  "cotas",
]

export interface EstadoPermalink {
  tab?: string
  camadas?: string[]
  infra?: string[]
  filtroSetor?: string
  filtroDep?: string
  filtroTipo?: string
  mancha?: boolean
  heatEmpresas?: boolean
  heatSaude?: boolean
  heatEducacao?: boolean
  dano?: boolean
  rp?: string
}

/** Lê as seleções do link. Valores desconhecidos são ignorados (link antigo ou adulterado não quebra o painel). */
export function lerEstadoDaURL(): EstadoPermalink {
  if (typeof window === "undefined") return {}
  const p = new URLSearchParams(window.location.search)
  const e: EstadoPermalink = {}
  const t = p.get("t")
  if (t && ABAS_VALIDAS.includes(t)) e.tab = t
  if (p.has("l"))
    e.camadas = (p.get("l") ?? "")
      .split(",")
      .filter((c) => CAMADAS_VALIDAS.includes(c))
  if (p.has("inf")) e.infra = (p.get("inf") ?? "").split(",").filter(Boolean)
  if (p.get("fs")) e.filtroSetor = p.get("fs")!
  if (p.get("fd")) e.filtroDep = p.get("fd")!
  if (p.get("ft")) e.filtroTipo = p.get("ft")!
  if (p.get("mancha") === "0") e.mancha = false
  const hm = (p.get("hm") ?? "").split(",")
  if (hm.includes("e")) e.heatEmpresas = true
  if (hm.includes("s")) e.heatSaude = true
  if (hm.includes("d")) e.heatEducacao = true
  if (p.get("df") === "1") e.dano = true
  const rp = p.get("rp")
  if (rp && (DANO_FISICO_RPS as readonly string[]).includes(rp)) e.rp = rp
  return e
}

interface Args {
  municipio: string
  tabAtiva: string
  camadas: string[]
  infraAtivas: string[]
  filtroSetor: string
  filtroDep: string
  filtroTipo: string
  showMancha: boolean
  showHeatmapEmpresas: boolean
  showHeatmapSaude: boolean
  showHeatmapEducacao: boolean
  showDanoFisico: boolean
  rpDanoFisico: string
  setShowDanoFisico: (v: boolean) => void
  setRpDanoFisico: (v: string) => void
  /** Dano físico/RP vindos do link: só dá para aplicar quando o município (Porto Alegre) já foi selecionado. */
  danoLinkRef: MutableRefObject<{ dano?: boolean; rp?: string } | null>
}

/** Grava as seleções na URL (debounce curto) e aplica o dano físico do link ao chegar em Porto Alegre. */
export function usePermalinkEstado(a: Args) {
  const { municipio, danoLinkRef, setShowDanoFisico, setRpDanoFisico } = a

  // useDanoFisico desliga a camada em todo município que não é Porto Alegre (inclusive na montagem,
  // com a Visão Geral), então o valor do link só pode ser aplicado depois que PA for selecionado.
  useEffect(() => {
    if (municipio !== DANO_FISICO_MUNICIPIO) return
    const l = danoLinkRef.current
    if (!l) return
    // Uma vez só: depois disso a URL passa a refletir as escolhas do usuário.
    danoLinkRef.current = null
    if (l.rp) setRpDanoFisico(l.rp)
    if (l.dano) setShowDanoFisico(true)
  }, [municipio, danoLinkRef, setShowDanoFisico, setRpDanoFisico])

  const {
    tabAtiva,
    camadas,
    infraAtivas,
    filtroSetor,
    filtroDep,
    filtroTipo,
    showMancha,
    showHeatmapEmpresas,
    showHeatmapSaude,
    showHeatmapEducacao,
    showDanoFisico,
    rpDanoFisico,
  } = a
  useEffect(() => {
    const t = setTimeout(() => {
      const p = new URLSearchParams(window.location.search)
      const def = (k: string, set: boolean, v: string) => {
        if (set) p.set(k, v)
        else p.delete(k)
      }
      def("t", tabAtiva !== "resumo", tabAtiva)
      const igualPadrao =
        camadas.length === CAMADAS_PADRAO.length &&
        CAMADAS_PADRAO.every((c) => camadas.includes(c))
      def("l", !igualPadrao, camadas.join(","))
      def("inf", infraAtivas.length > 0, infraAtivas.join(","))
      def("fs", filtroSetor !== "(todos)", filtroSetor)
      def("fd", filtroDep !== "(todas)", filtroDep)
      def("ft", filtroTipo !== "(todas)", filtroTipo)
      def("mancha", !showMancha, "0")
      const hm = [
        showHeatmapEmpresas && "e",
        showHeatmapSaude && "s",
        showHeatmapEducacao && "d",
      ]
        .filter(Boolean)
        .join(",")
      def("hm", hm !== "", hm)
      const dano = showDanoFisico && municipio === DANO_FISICO_MUNICIPIO
      def("df", dano, "1")
      def("rp", dano && rpDanoFisico !== "RP200", rpDanoFisico)
      const qs = p.toString()
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${qs ? `?${qs}` : ""}`
      )
    }, 250)
    return () => clearTimeout(t)
  }, [
    municipio,
    tabAtiva,
    camadas,
    infraAtivas,
    filtroSetor,
    filtroDep,
    filtroTipo,
    showMancha,
    showHeatmapEmpresas,
    showHeatmapSaude,
    showHeatmapEducacao,
    showDanoFisico,
    rpDanoFisico,
  ])
}
