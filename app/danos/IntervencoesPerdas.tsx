"use client"

import React from "react"
import Link from "next/link"
import { ShieldCheck, Waves, Info } from "lucide-react"
import { Section, DataTable, Note, SubTitle } from "./ui"
import { fmtBRL, COMP_COLORS } from "./helpers"
import {
  formatarEvitado,
  perdasEmDias,
  perdasEvitadasEmDias,
  type Comparativo,
  type Indicadores,
  type IntervencaoId,
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

export function IntervencoesPerdas({ dias }: { dias: number }) {
  const { dados, carregando, erro } = useComparativo()

  const eventoId = "2024-05-21"
  const ev = dados?.eventos[eventoId]

  return (
    <Section id="intervencoes" num="4" title="Intervenções e Dano Evitado em Rio Grande (Maio de 2024)">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-900">
          <Waves size={13} className="text-blue-600" />
          Evento de Maio de 2024 (21/05/2024) · Cota de Referência: 2,62 m
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600">
          {dias} dias de interrupção
        </span>
      </div>

      <Note type="info">
        <strong>Como ler.</strong> Compara a simulação <strong>sem intervenção</strong> (pico histórico na cota 2,62 m) com as intervenções de <strong>diques</strong> e <strong>diques + barragens</strong> para Rio Grande, na duração de {dias} dias efetivos. <em>Evitado = perdas sem intervenção − perdas com a intervenção</em>. Perdas operacionais (DaLA) medem fluxos econômicos e serviços interrompidos e <strong>não se somam</strong> à exposição do patrimônio físico.
      </Note>

      {/* Box de Vínculo com a Cota */}
      <div className="my-4 rounded-2xl border border-blue-200/90 bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-white p-4 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-[#055071]">
          <Waves className="h-4 w-4 text-blue-600" />
          Vínculo Hidrológico com a Cota do Canal do Rio Grande:
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-700">
          O cenário <strong>Sem intervenção</strong> corresponde exatamente ao nível máximo registrado de <strong>Cota 2,62 m</strong> (2,6215 m) em 21/05/2024, que gerou 654,9 ha de mancha urbana. Com a construção do sistema de <strong>diques de proteção</strong>, a área inundada no tecido urbano é reduzida para 333,2 ha, o que equivale hidrologicamente a conter a enchente para uma lâmina de <strong>Cota ~1,90 m</strong> (um abatimento efetivo de <strong>~72 cm</strong> de inundação).
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
          const maximo = Math.max(
            1,
            ...INTERVENCOES.map((i) => perdasEmDias(ev.variantes[i.id], dias).total)
          )

          return (
            <div className="my-5">
              {/* Barras de comparação do total */}
              <div className="mb-6 rounded-2xl border border-[#b3cdd8]/70 bg-white p-5 shadow-xs">
                <SubTitle>Perdas Operacionais por Variante ({dias} dias ef.)</SubTitle>
                <div className="mt-4 flex flex-col gap-3">
                  {INTERVENCOES.map(({ id: vid, rotulo }) => {
                    const ind = ev.variantes[vid]
                    const p = perdasEmDias(ind, dias)
                    const total = p.total
                    const e =
                      vid === "sem-intervencao"
                        ? null
                        : perdasEvitadasEmDias(base, ind, dias)
                    const f = e ? formatarEvitado(e.valor, e.pct) : null

                    return (
                      <div key={vid}>
                        <div className="flex items-baseline justify-between text-xs">
                          <span
                            className="font-bold"
                            style={{ color: COR_VARIANTE[vid] }}
                          >
                            {rotulo}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-black tabular-nums text-slate-900">
                              {fmtBRL(total)}
                            </span>
                            {e && f && (
                              <span
                                className="font-bold text-xs"
                                style={{ color: COR_TOM[f.tom] }}
                              >
                                (evita {fmtBRL(Math.abs(e.valor))} · {f.texto})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-1 h-3 rounded-full bg-slate-100 overflow-hidden flex">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max((total / maximo) * 100, 1)}%`,
                              backgroundColor: COR_VARIANTE[vid],
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Tabela Comparativa Detalhada */}
              <SubTitle>Detalhamento por Setor Econômico</SubTitle>
              <DataTable
                rows={[
                  [
                    "Cenário de Intervenção",
                    `Perdas Totais (${dias}d)`,
                    "Dano Evitado (R$)",
                    "Dano Evitado (%)",
                    "Empresas (VAB)",
                    "Educação",
                    "Saúde",
                  ],
                  ...INTERVENCOES.map(({ id: vid, rotulo }) => {
                    const ind = ev.variantes[vid]
                    const p = perdasEmDias(ind, dias)
                    const e =
                      vid === "sem-intervencao"
                        ? null
                        : perdasEvitadasEmDias(base, ind, dias)
                    const f = e ? formatarEvitado(e.valor, e.pct) : null

                    return [
                      <span
                        key="v"
                        className="font-bold"
                        style={{ color: COR_VARIANTE[vid] }}
                      >
                        {rotulo}
                      </span>,
                      <strong key="tot" className="text-slate-900">{fmtBRL(p.total)}</strong>,
                      e && f ? (
                        <span
                          key="e"
                          className="font-black"
                          style={{ color: COR_TOM[f.tom] }}
                        >
                          −{fmtBRL(Math.abs(e.valor))}
                        </span>
                      ) : (
                        "—"
                      ),
                      f ? (
                        <span
                          key="p"
                          className="font-black"
                          style={{ color: COR_TOM[f.tom] }}
                        >
                          {f.texto}
                        </span>
                      ) : (
                        "—"
                      ),
                      fmtBRL(p.empresas),
                      fmtBRL(p.educacao),
                      fmtBRL(p.saude),
                    ]
                  }),
                ]}
              />

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Metodologia DaLA (CEPAL/BID) · Simulação computacional hidrodinâmica (FURG).
                </span>
                <Link
                  href="/danos-fisicos"
                  className="font-bold text-[#055071] underline hover:no-underline"
                >
                  Ver Danos Físicos e Exposição Evitada ↗
                </Link>
              </div>
            </div>
          )
        })()
      )}
    </Section>
  )
}
