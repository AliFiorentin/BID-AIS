"use client"

import React from "react"
import Link from "next/link"
import { ShieldCheck, Waves, Info, Building2, Users, School, HeartPulse } from "lucide-react"
import { Section, DataTable, Note, SubTitle } from "./ui"
import { fmtBRL, fmtN } from "./helpers"
import {
  formatarEvitado,
  type Comparativo,
  type Indicadores,
  type IntervencaoId,
  formatoBr,
} from "@/lib/comparativo"
import { useComparativo } from "@/hooks/useComparativo"

const COR_VARIANTE: Record<IntervencaoId, string> = {
  "sem-intervencao": "#055071",
  diques: "#0284c7",
  "diques-barragens": "#0369a1",
}

const COR_TOM = {
  evitado: "#15803d",
  piora: "#b91c1c",
  neutro: "#64748b",
} as const

const INTERVENCOES: { id: IntervencaoId; rotulo: string }[] = [
  { id: "sem-intervencao", rotulo: "Sem intervenção (Cota 2,62m)" },
  { id: "diques", rotulo: "Diques" },
  { id: "diques-barragens", rotulo: "Diques + barragens" },
]

export function IntervencoesFisicos() {
  const { dados, carregando, erro } = useComparativo()

  const eventoId = "2024-05-21"
  const ev = dados?.eventos[eventoId]

  return (
    <Section id="intervencoes-fisicos" num="3" title="Intervenções e Exposição Física Evitada (Rio Grande · Maio de 2024)">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-900">
          <Waves size={13} className="text-blue-600" />
          Evento de Maio de 2024 (21/05/2024) · Cota de Referência: 2,62 m
        </span>
      </div>

      <Note type="info">
        <strong>Como ler.</strong> Avalia o valor integral de reposição do patrimônio construído exposto (edificações, maquinários, equipamentos) sob a mancha de inundação para a simulação <strong>sem intervenção</strong> (pico histórico na cota 2,62 m) e para os cenários protegidos por <strong>diques</strong> e <strong>diques + barragens</strong>. O valor exposto é um teto de dano e não se soma às perdas operacionais (DaLA).
      </Note>

      {/* Card do Vínculo com a Cota */}
      <div className="my-4 rounded-2xl border border-blue-200/90 bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-white p-4 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-[#055071]">
          <Waves className="h-4 w-4 text-blue-600" />
          Vínculo com a Cota e Retração da Mancha Inundada:
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-700">
          O cenário de referência <strong>Sem intervenção</strong> reflete o pico máximo atingido na enchente de maio de 2024 em Rio Grande (<strong>Cota 2,62 m</strong>), inundando 654,9 ha de malha urbana. Com a implementação do sistema de <strong>diques</strong>, a mancha urbana se retrai para <strong>333,2 ha</strong>. Hidrologicamente, isso corresponde a confinar o evento ao equivalente de uma <strong>Cota ~1,90 m</strong> no tecido urbano (um abatimento efetivo de <strong>~72 cm de inundação</strong>).
        </p>
      </div>

      {erro ? (
        <Note type="warning">
          <strong>Dado ausente:</strong> não foi possível carregar o comparativo de intervenções.
        </Note>
      ) : carregando || !ev ? (
        <div className="my-4 h-32 animate-pulse rounded-xl bg-slate-200/60" />
      ) : (
        (() => {
          const base = ev.variantes["sem-intervencao"]
          const diques = ev.variantes["diques"]
          const evitadoDiques = ev.evitado["diques"]

          return (
            <div className="my-5">
              {/* 4 Cards de Destaque Evitado (Diques) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50/40 p-4 shadow-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-600" /> Exposição Evitada
                  </span>
                  <div className="mt-1 text-2xl font-black text-emerald-700">
                    R$ 1,38 bi
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-emerald-900">
                    −88,4% do patrimônio
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500">
                    de R$ 1,56 bi para R$ 180,4 mi
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50/40 p-4 shadow-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <Waves size={14} className="text-emerald-600" /> Área Salva
                  </span>
                  <div className="mt-1 text-2xl font-black text-emerald-700">
                    −321,7 ha
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-emerald-900">
                    −49,1% da mancha
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500">
                    de 654,9 ha para 333,2 ha
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50/40 p-4 shadow-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <Building2 size={14} className="text-emerald-600" /> Empresas Protegidas
                  </span>
                  <div className="mt-1 text-2xl font-black text-emerald-700">
                    −1.750
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-emerald-900">
                    −84,3% de empresas salvas
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500">
                    22.728 vínculos de trabalho protegidos
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50/40 p-4 shadow-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <Users size={14} className="text-emerald-600" /> População Protegida
                  </span>
                  <div className="mt-1 text-2xl font-black text-emerald-700">
                    −15.792
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-emerald-900">
                    −70,1% de moradores salvos
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500">
                    de 22.512 para 6.720 residentes
                  </div>
                </div>
              </div>

              {/* Tabela Comparativa de Exposição Física */}
              <SubTitle>Tabela Comparativa de Exposição e Ativos por Cenário</SubTitle>
              <DataTable
                rows={[
                  [
                    "Cenário",
                    "Área Inundada",
                    "População",
                    "Empresas (R$)",
                    "Educação (R$)",
                    "Saúde (R$)",
                    "Total Exposto",
                  ],
                  ...INTERVENCOES.map(({ id: vid, rotulo }) => {
                    const ind = ev.variantes[vid]
                    const e = vid === "sem-intervencao" ? null : ev.evitado[vid]
                    const fExp = e?.["exposicao_total"] ? formatarEvitado(e["exposicao_total"].valor, e["exposicao_total"].pct) : null
                    const fArea = e?.["area_ha"] ? formatarEvitado(e["area_ha"].valor, e["area_ha"].pct) : null
                    const fPop = e?.["populacao"] ? formatarEvitado(e["populacao"].valor, e["populacao"].pct) : null

                    return [
                      <span
                        key="v"
                        className="font-bold"
                        style={{ color: COR_VARIANTE[vid] }}
                      >
                        {rotulo}
                      </span>,
                      <span key="a" className="tabular-nums">
                        {formatoBr(ind.area_ha, 1)} ha
                        {fArea && (
                          <span className="block text-[10px] font-bold text-emerald-700">
                            −{formatoBr(e!["area_ha"].valor, 1)} ha ({fArea.texto})
                          </span>
                        )}
                      </span>,
                      <span key="p" className="tabular-nums">
                        {formatoBr(ind.populacao ?? 0, 0)}
                        {fPop && (
                          <span className="block text-[10px] font-bold text-emerald-700">
                            −{formatoBr(e!["populacao"].valor, 0)} ({fPop.texto})
                          </span>
                        )}
                      </span>,
                      fmtBRL(ind.exposicao_empresas ?? 0),
                      fmtBRL(ind.exposicao_educacao ?? 0),
                      fmtBRL(ind.exposicao_saude ?? 0),
                      <span key="tot" className="tabular-nums font-black text-slate-900">
                        {fmtBRL(ind.exposicao_total ?? 0)}
                        {fExp && (
                          <span className="block text-[10px] font-bold text-emerald-700">
                            −{fmtBRL(e!["exposicao_total"].valor)} ({fExp.texto})
                          </span>
                        )}
                      </span>,
                    ]
                  }),
                ]}
              />
            </div>
          )
        })()
      )}
    </Section>
  )
}
