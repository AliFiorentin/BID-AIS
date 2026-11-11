"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingDown, Waves } from "lucide-react"
import { MUNICIPIOS, PIORES_CENARIOS, COTAS_CENARIO, PANEL_CARD_BG, C } from "@/lib/constants"
import { compactoBr, findCenarioData, slugify } from "@/lib/geo-utils"
import { scaleTo } from "@/app/danos/helpers"
import { MetricInfoPopover } from "@/components/MetricInfoPopover"
import type { DanosData, ExposicaoMun, CenarioDanos } from "@/app/danos/types"
import type { DetalheCotaValores } from "@/lib/cotas-types"

const DIAS_PADRAO = 30
const PRIMARY = C.primary
const BRAND_GRADIENT = "linear-gradient(135deg, #055071 0%, #0a6e9a 100%)"

type CenarioFisico = {
  empresas_atingidas: number
  educacao_atingidas: number
  saude_atingidas: number
  empresas_valor_brl: number
  educacao_valor_brl: number
  saude_valor_brl: number
  total: number
}
type DanosFisicosCenarios = Record<string, Record<string, CenarioFisico>>

let cacheOperacionais: DanosData | null = null
let cacheFisicosCenarios: DanosFisicosCenarios | null = null
const cacheExposicao: Record<string, ExposicaoMun | null> = {}

function fmtBRL(n: number): string {
  return `R$ ${compactoBr(n, 1)}`
}

function Cartao({
  titulo,
  icone,
  rotuloValor,
  valor,
  linhas,
  ajuda,
  href,
  extraHeader,
  seletor,
  faixaSensibilidade,
}: {
  titulo: string
  icone: React.ReactNode
  rotuloValor: string
  valor: string
  linhas: { rotulo: string; valor: string }[]
  ajuda: string
  href: string
  extraHeader?: React.ReactNode
  seletor?: React.ReactNode
  faixaSensibilidade?: string
}) {
  return (
    <Link
      href={href}
      className="hover-lift flex h-full flex-col overflow-hidden rounded-lg shadow-sm transition-shadow"
      style={{ border: "1px solid rgba(5,80,113,0.15)" }}
      title={ajuda}
      aria-label={`${titulo}: ${rotuloValor} ${valor}`}
    >
      <div
        className="flex items-center justify-between gap-1 px-2.5 py-[5px]"
        style={{ background: BRAND_GRADIENT }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-white">{icone}</span>
          <span className="truncate text-[9px] font-black tracking-wide text-white uppercase">
            {titulo}
          </span>
        </div>
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {extraHeader}
        </div>
      </div>
      <div
        className="flex-1 px-2.5 py-2 flex flex-col justify-between"
        style={{ backgroundColor: PANEL_CARD_BG }}
      >
        <div>
          <div className="flex items-center justify-between gap-1">
            <div className="text-[9px] font-bold tracking-wide text-slate-500 uppercase">
              {rotuloValor}
            </div>
            {seletor}
          </div>
          <div
            className="text-[17px] leading-tight font-black whitespace-nowrap tabular-nums mt-0.5"
            style={{ color: PRIMARY }}
          >
            {valor}
          </div>
          <dl className="mt-1 flex flex-col gap-0.5 border-t border-slate-200/80 pt-1">
            {linhas.map((l) => (
              <div
                key={l.rotulo}
                className="flex items-baseline justify-between gap-1.5 text-[9px] whitespace-nowrap tabular-nums"
              >
                <dt className="text-slate-500">{l.rotulo}</dt>
                <dd className="font-bold text-slate-700">{l.valor}</dd>
              </div>
            ))}
          </dl>
        </div>
        {faixaSensibilidade && (
          <div className="mt-1.5 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[8px] font-medium text-slate-500">
            <span className="truncate">{faixaSensibilidade}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export function ResumoPerdasDanos({
  municipio,
  cenario,
  isVisaoGeral,
  mostraImpacto,
  cotaValores,
  cotaAtual,
}: {
  municipio: string
  cenario: string
  isVisaoGeral: boolean
  mostraImpacto: boolean
  cotaValores?: DetalheCotaValores | null
  cotaAtual?: number | null
}) {
  const [diasOp, setDiasOp] = useState<number>(DIAS_PADRAO)
  const [danosOp, setDanosOp] = useState<DanosData | null>(cacheOperacionais)
  const [fisicosCenarios, setFisicosCenarios] = useState<DanosFisicosCenarios | null>(cacheFisicosCenarios)
  const [exposicaoMap, setExposicaoMap] = useState<
    Record<string, ExposicaoMun | null>
  >({ ...cacheExposicao })
  const munsRequeridos = isVisaoGeral ? MUNICIPIOS : [municipio]
  const faltamExp = munsRequeridos.filter((m) => !(m in exposicaoMap))
  const carregando = !danosOp || !fisicosCenarios || faltamExp.length > 0

  useEffect(() => {
    let ativo = true
    const munsAlvo = isVisaoGeral ? MUNICIPIOS : [municipio]
    const faltam = munsAlvo.filter((m) => !(m in cacheExposicao))

    if (cacheOperacionais && cacheFisicosCenarios && faltam.length === 0) {
      return
    }

    Promise.all([
      cacheOperacionais
        ? Promise.resolve(cacheOperacionais)
        : fetch("/dados_convertidos/danos_operacionais.json")
            .then((r) => (r.ok ? r.json() : {}))
            .catch(() => ({})),
      cacheFisicosCenarios
        ? Promise.resolve(cacheFisicosCenarios)
        : fetch("/dados_convertidos/danos_fisicos_cenarios.json")
            .then((r) => (r.ok ? r.json() : {}))
            .catch(() => ({})),
      ...faltam.map((m) =>
        fetch(`/dados_convertidos/climada_exposicao_${slugify(m)}.json`)
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => ({ m, d }))
          .catch(() => ({ m, d: null }))
      ),
    ]).then(([op, fis, ...exps]) => {
      cacheOperacionais = op as DanosData
      cacheFisicosCenarios = fis as DanosFisicosCenarios
      exps.forEach(({ m, d }: { m: string; d: ExposicaoMun | null }) => {
        cacheExposicao[m] = d
      })
      if (!ativo) return
      setDanosOp(cacheOperacionais)
      setFisicosCenarios(cacheFisicosCenarios)
      setExposicaoMap({ ...cacheExposicao })
    })

    return () => {
      ativo = false
    }
  }, [municipio, isVisaoGeral])

  if (carregando) {
    return (
      <div className="grid grid-cols-2 gap-2" aria-busy="true">
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
      </div>
    )
  }

  // Perdas operacionais para o cenário atual (ou soma dos piores cenários na Visão Geral), escaladas para diasOp
  let opEntry: CenarioDanos | null = null
  let opMinTotal = 0
  let opMaxTotal = 0
  if (danosOp) {
    if (isVisaoGeral) {
      const buildAcc = (targetDias: number) => {
        const acc: CenarioDanos = {
          dias_agudo: targetDias,
          dias_efetivos: targetDias,
          f_interrup: targetDias / 365,
          empresas_vab: 0,
          educacao_perdas: 0,
          educacao_custo_adicional: 0,
          saude_producao: 0,
          agricultura_perdas: 0,
          total: 0,
        }
        MUNICIPIOS.forEach((m) => {
          const cen = PIORES_CENARIOS[m]
          const raw = cen && danosOp[m] ? findCenarioData(danosOp[m], cen) : null
          const d = raw ? scaleTo(raw, targetDias) : null
          if (d) {
            acc.empresas_vab += d.empresas_vab
            acc.educacao_perdas += d.educacao_perdas
            acc.educacao_custo_adicional += d.educacao_custo_adicional
            acc.saude_producao += d.saude_producao
            acc.agricultura_perdas += d.agricultura_perdas
            acc.total += d.total
          }
        })
        return acc
      }
      const acc = buildAcc(diasOp)
      if (acc.total > 0) {
        opEntry = acc
        opMinTotal = buildAcc(30).total
        opMaxTotal = buildAcc(60).total
      }
    } else {
      const mMap = danosOp[municipio]
      if (mMap) {
        const cenBusca =
          mostraImpacto && cenario !== "(nenhum)"
            ? cenario
            : PIORES_CENARIOS[municipio]
        const raw =
          (cenBusca ? findCenarioData(mMap, cenBusca) : null) ??
          findCenarioData(mMap, PIORES_CENARIOS[municipio])
        if (raw) {
          opEntry = scaleTo(raw, diasOp)
          opMinTotal = scaleTo(raw, 30).total
          opMaxTotal = scaleTo(raw, 60).total
        }
      }
    }
  }

  // Exposição física (pico das cotas ou total exposto do município)
  let expEmp = 0
  let expEdu = 0
  let expSau = 0
  let rotuloExp = "Exposição (cenário)"

  const isCotas = cenario === COTAS_CENARIO

  if (cotaValores !== undefined) {
    rotuloExp =
      cotaAtual != null
        ? `Exposição (${cotaAtual.toFixed(2).replace(".", ",")}m)`
        : "Exposição (cota)"
    if (cotaValores) {
      expEmp = cotaValores.empresas.valor_exposto_brl
      expEdu = cotaValores.educacao.valor_exposto_brl
      expSau = cotaValores.saude.valor_exposto_brl
    }
  } else if (!mostraImpacto) {
    rotuloExp = "Exposição (total)"
    const muns = isVisaoGeral ? MUNICIPIOS : [municipio]
    muns.forEach((m) => {
      const exp = exposicaoMap[m]
      if (!exp?.por_cota) return
      const cotasKeys = Object.keys(exp.por_cota).sort(
        (a, b) => parseFloat(a) - parseFloat(b)
      )
      const ultima = cotasKeys[cotasKeys.length - 1]
      const c = ultima ? exp.por_cota[ultima] : undefined
      if (c) {
        expEmp += c.empresas?.exposicao_total_brl ?? 0
        expEdu += c.educacao?.exposicao_total_brl ?? 0
        expSau += c.saude?.exposicao_total_brl ?? 0
      }
    })
  } else if (isCotas) {
    rotuloExp = isVisaoGeral ? "Exposição (picos)" : "Exposição (pico)"
    const muns = isVisaoGeral ? MUNICIPIOS : [municipio]
    muns.forEach((m) => {
      const exp = exposicaoMap[m]
      if (!exp?.por_cota) return
      const cotasKeys = Object.keys(exp.por_cota).sort(
        (a, b) => parseFloat(a) - parseFloat(b)
      )
      const ultima = cotasKeys[cotasKeys.length - 1]
      const c = ultima ? exp.por_cota[ultima] : undefined
      if (c) {
        expEmp += c.empresas?.valor_exposto_atingido_brl ?? 0
        expEdu += c.educacao?.valor_exposto_atingido_brl ?? 0
        expSau += c.saude?.valor_exposto_atingido_brl ?? 0
      }
    })
  } else if (fisicosCenarios) {
    rotuloExp = isVisaoGeral ? "Exposição (cenários)" : "Exposição (cenário)"
    if (isVisaoGeral) {
      MUNICIPIOS.forEach((m) => {
        const cen = PIORES_CENARIOS[m]
        const d = cen && fisicosCenarios[m] ? findCenarioData(fisicosCenarios[m], cen) : null
        if (d) {
          expEmp += d.empresas_valor_brl
          expEdu += d.educacao_valor_brl
          expSau += d.saude_valor_brl
        }
      })
    } else {
      const mMap = fisicosCenarios[municipio]
      if (mMap) {
        const cenBusca = cenario !== "(nenhum)" ? cenario : PIORES_CENARIOS[municipio]
        const d =
          (cenBusca ? findCenarioData(mMap, cenBusca) : null) ??
          findCenarioData(mMap, PIORES_CENARIOS[municipio])
        if (d) {
          expEmp = d.empresas_valor_brl
          expEdu = d.educacao_valor_brl
          expSau = d.saude_valor_brl
        }
      }
    }
  }
  const expTotal = expEmp + expEdu + expSau
  if (cotaValores === undefined && isVisaoGeral && isCotas) rotuloExp = "Exposição (picos)"

  const seletorDias = (
    <div
      className="inline-flex rounded-md p-0.5 bg-slate-200/80 text-[8.5px] font-bold"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      {[30, 45, 60].map((d) => (
        <button
          key={d}
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDiasOp(d)
          }}
          className={`px-1.5 py-0.5 rounded transition-all ${
            diasOp === d
              ? "bg-white text-[#055071] shadow-xs font-black"
              : "text-slate-600 hover:text-slate-900"
          }`}
          title={`Escalar perdas para ${d} dias efetivos`}
        >
          {d}d
        </button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-2 gap-2">
        {opEntry && (
          <Cartao
            titulo="Perdas Operacionais"
            icone={<TrendingDown size={11} strokeWidth={2.5} />}
            rotuloValor={`Total (${diasOp}d ef.)`}
            valor={fmtBRL(opEntry.total)}
            linhas={[
              { rotulo: "Empresas", valor: fmtBRL(opEntry.empresas_vab) },
              {
                rotulo: "Educação",
                valor: fmtBRL(
                  opEntry.educacao_perdas + opEntry.educacao_custo_adicional
                ),
              },
              { rotulo: "Saúde", valor: fmtBRL(opEntry.saude_producao) },
              {
                rotulo: "Agricultura",
                valor: fmtBRL(opEntry.agricultura_perdas),
              },
            ]}
            ajuda="DaLA: produção e serviços interrompidos. Clique para abrir Perdas Operacionais."
            href="/perdas-operacionais"
            extraHeader={<MetricInfoPopover metricKey="perdas_operacionais" title="Perdas Operacionais (DaLA)" />}
            seletor={seletorDias}
            faixaSensibilidade={`Faixa (30–60d): ${fmtBRL(opMinTotal)} – ${fmtBRL(opMaxTotal)}`}
          />
        )}
        <Cartao
          titulo="Danos Físicos"
          icone={<Waves size={11} strokeWidth={2.5} />}
          rotuloValor={rotuloExp}
          valor={expTotal > 0 ? fmtBRL(expTotal) : "—"}
          linhas={[
            { rotulo: "Empresas", valor: expTotal > 0 ? fmtBRL(expEmp) : "—" },
            { rotulo: "Educação", valor: expTotal > 0 ? fmtBRL(expEdu) : "—" },
            { rotulo: "Saúde", valor: expTotal > 0 ? fmtBRL(expSau) : "—" },
          ]}
          ajuda="Valor de reposição exposto (CLIMADA / por cota). Clique para abrir Danos Físicos."
          href="/danos-fisicos"
          extraHeader={<MetricInfoPopover metricKey="danos_fisicos" title="Danos Físicos e Exposição" />}
          faixaSensibilidade={
            expTotal > 0
              ? `Faixa CUB (±10%): ${fmtBRL(expTotal * 0.9)} – ${fmtBRL(expTotal * 1.1)}`
              : undefined
          }
        />
      </div>
    </div>
  )
}
