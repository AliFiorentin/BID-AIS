"use client"

import Link from "next/link"
import { cenarioLabel } from "@/lib/constants"
import { AVISO_MAIO_2024_MAIS_50 } from "@/lib/avisos"
import {
  MUN_COLORS,
  MUN_CARD_COLORS,
  COMP_COLORS,
  DIAS_OPCOES,
  fmtBRL,
  pct,
  scaleTo,
} from "./helpers"
import { CompositionBar, TotaisBarChart, SensibChart } from "./charts"
import { LegendaComposicao } from "../perdas-operacionais/composicao"
import { DiasBadge, Section, SubTitle, DataTable, Note } from "./ui"
import type { DanosCtx } from "./ctx"

export function DanosOperacionais({ ctx }: { ctx: DanosCtx }) {
  const {
    CENARIOS_VISAO_GERAL,
    dados,
    dadosClimada,
    dadosEscalados,
    dias,
    maxTotalDala,
    pioresCenarios,
    todosCenarios,
  } = ctx
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════
            SEÇÃO 1 — RESUMO GERAL
        ══════════════════════════════════════════════════════════════════════ */}
      <Section id="resumo" num="1" title="Resumo Geral">
        <DiasBadge dias={dias} />
        <Note type="warning">
          <strong>Perdas operacionais não são exposição física.</strong> Medem a
          produção e os serviços interrompidos (método DaLA) e{" "}
          <strong>não se somam</strong> à exposição por cota nem ao dano físico
          (CLIMADA) da página{" "}
          <Link
            href="/danos-fisicos"
            className="font-bold underline underline-offset-2"
          >
            Danos Físicos
          </Link>
          .
        </Note>

        {/* KPI cards */}
        <div className="my-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {pioresCenarios.map(({ mun, cenNome, cenVal }) => (
            <div
              key={mun}
              className="overflow-hidden rounded-xl border border-[#b3cdd8] bg-white shadow-sm"
            >
              <div
                className="px-5 py-3.5"
                style={{
                  backgroundColor: MUN_CARD_COLORS[mun] ?? "#055071",
                }}
              >
                <p className="mb-0.5 text-[10px] font-black tracking-wider text-white/95 uppercase">
                  {mun}
                </p>
                <p className="text-2xl leading-none font-black text-white">
                  {fmtBRL(cenVal.total)}
                </p>
                <p className="mt-1 font-mono text-[9px] text-white/90">
                  {cenarioLabel(cenNome)} · {dias} dias ef.
                </p>
              </div>
              <div className="px-5 pt-3.5 pb-1">
                <CompositionBar v={cenVal} />
              </div>
              <div className="px-5 pt-3 pb-4">
                <LegendaComposicao
                  total={cenVal.total}
                  fmt={fmtBRL}
                  itens={[
                    {
                      rotulo: "Empresas (VAB)",
                      valor: cenVal.empresas_vab,
                      cor: COMP_COLORS.empresas,
                    },
                    {
                      rotulo: "Educação",
                      valor:
                        cenVal.educacao_perdas +
                        cenVal.educacao_custo_adicional,
                      cor: COMP_COLORS.educacao,
                    },
                    {
                      rotulo: "Saúde (SUS)",
                      valor: cenVal.saude_producao,
                      cor: COMP_COLORS.saude,
                    },
                    {
                      rotulo: "Agricultura",
                      valor: cenVal.agricultura_perdas,
                      cor: COMP_COLORS.agricultura,
                    },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico de barras total por cenário */}
        <SubTitle>Total de Perdas por Cenário ({dias} dias ef.)</SubTitle>
        <p>Comparação de todos os cenários avaliados (em R$ milhões).</p>
        <div className="mt-3 rounded-xl border border-[#b3cdd8] bg-white p-5 shadow-sm">
          <TotaisBarChart
            todosCenarios={todosCenarios}
            maxTotal={maxTotalDala}
          />
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {Object.entries(MUN_COLORS).map(([mun, cor]) => (
              <div key={mun} className="flex items-center gap-1.5">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: cor }}
                />
                <span className="text-[10px] font-medium text-slate-600">
                  {mun}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Note type="warning">
          A soma dos piores cenários <strong>não é um agregado único</strong>:
          cada município pode ter cenários com extensões distintas. Os valores
          representam impactos independentes.
        </Note>
        {dadosClimada && (
          <Note type="info">
            Esta seção mede <strong>perda de fluxo</strong> (DaLA:
            produção/serviço não realizado). Para{" "}
            <strong>exposição por cota e destruição de patrimônio</strong>{" "}
            (estoque), ver a página{" "}
            <Link
              href="/danos-fisicos"
              className="font-bold underline underline-offset-2"
            >
              Danos Físicos
            </Link>{" "}
            acima. São métricas complementares, não somáveis.
          </Note>
        )}
      </Section>

      {/* ══════════════════════════════════════════════════════════════════════
            SEÇÃO 2 — ANÁLISE POR CENÁRIO
        ══════════════════════════════════════════════════════════════════════ */}
      <Section id="cenarios" num="2" title="Análise por Cenário">
        <DiasBadge dias={dias} />
        <Note type="info">{AVISO_MAIO_2024_MAIS_50}</Note>

        {Object.entries(dadosEscalados).map(([mun, cens]) => (
          <div key={mun} className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <div
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: MUN_COLORS[mun] ?? "#055071" }}
              />
              <h3 className="text-base font-black text-slate-800">{mun}</h3>
            </div>

            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${Math.min(Object.keys(cens).length, 2)}, 1fr)`,
              }}
            >
              {Object.entries(cens).map(([cen, v]) => (
                <div
                  key={cen}
                  className="overflow-hidden rounded-xl border border-[#b3cdd8] bg-white shadow-sm"
                >
                  <div className="flex items-baseline justify-between border-b border-[#b3cdd8] bg-[#f0f7fa] px-4 py-2.5">
                    <p className="text-[11px] font-black tracking-wide text-[#055071] uppercase">
                      {cenarioLabel(cen)}
                    </p>
                    <p
                      className="font-mono text-[9px] text-slate-600"
                      title="f = fator de interrupção: fração do ano em que a atividade ficou parada (dias efetivos ÷ 365)."
                    >
                      {dias} dias ef. · f = {v.f_interrup.toFixed(4)}
                    </p>
                  </div>
                  <div className="px-4 pt-3 pb-4">
                    <p className="mb-3 text-xl font-black text-slate-800">
                      {fmtBRL(v.total)}
                    </p>
                    <CompositionBar v={v} />
                    {/* Breakdown com barras horizontais */}
                    <div className="mt-3 space-y-2">
                      {(
                        [
                          {
                            label: "Empresas (VAB)",
                            value: v.empresas_vab,
                            color: COMP_COLORS.empresas,
                          },
                          {
                            label: "Educação",
                            value:
                              v.educacao_perdas + v.educacao_custo_adicional,
                            color: COMP_COLORS.educacao,
                          },
                          {
                            label: "Saúde (SUS)",
                            value: v.saude_producao,
                            color: COMP_COLORS.saude,
                          },
                          {
                            label: "Agricultura",
                            value: v.agricultura_perdas,
                            color: COMP_COLORS.agricultura,
                          },
                        ] as const
                      ).map(({ label, value, color }) => (
                        <div key={label}>
                          <div className="mb-0.5 flex justify-between text-[10px]">
                            <div className="flex items-center gap-1">
                              <div
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-slate-600">{label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-700">
                                {fmtBRL(value)}
                              </span>
                              <span className="w-8 text-right text-slate-600">
                                {pct(value, v.total)}
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-[#e8f4f8]">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: pct(value, v.total),
                                backgroundColor: color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>

      {/* ══════════════════════════════════════════════════════════════════════
            SEÇÃO 3 — SENSIBILIDADE
        ══════════════════════════════════════════════════════════════════════ */}
      <Section
        id="sensib"
        num="3"
        title="Sensibilidade por Duração da Interrupção"
      >
        <p>
          Comparação do total estimado para{" "}
          <strong>30, 45 e 60 dias efetivos</strong>. Perdas agrícolas refletem
          custo de produção no estágio da cultura no momento do evento.
          Independem da duração.
        </p>

        {/* Gráfico agrupado */}
        <div className="mt-3 rounded-xl border border-[#b3cdd8] bg-white p-5 shadow-sm">
          <p className="mb-4 text-[11px] font-black tracking-wider text-[#2f6a83] uppercase">
            Total por duração (cenário principal de cada município)
          </p>
          <SensibChart
            dados={dados}
            diasSelecionado={dias}
            cenariosPrincipais={CENARIOS_VISAO_GERAL}
          />
        </div>

        {/* Tabelas por município */}
        {Object.entries(dados).map(([mun, cens]) => {
          const cenPadrao = CENARIOS_VISAO_GERAL[mun]
          const [cenNome, cenValOrig] =
            cenPadrao && cens[cenPadrao]
              ? [cenPadrao, cens[cenPadrao]]
              : Object.entries(cens).reduce((acc, cur) =>
                  cur[1].total > acc[1].total ? cur : acc
                )
          return (
            <div key={mun} className="mt-6">
              <SubTitle>
                {mun} · {cenarioLabel(cenNome)}
              </SubTitle>
              <DataTable
                rows={[
                  [
                    "Duração",
                    "Empresas (VAB)",
                    "Educação",
                    "Saúde (SUS)",
                    "Agricultura",
                    "Total",
                  ],
                  ...DIAS_OPCOES.map((d) => {
                    const sc = scaleTo(cenValOrig, d)
                    const isSelected = d === dias
                    return [
                      <span
                        key="d"
                        className={`font-mono font-black ${isSelected ? "text-[#055071]" : "text-slate-600"}`}
                      >
                        {d} dias{isSelected ? " ◀" : ""}
                      </span>,
                      fmtBRL(sc.empresas_vab),
                      fmtBRL(sc.educacao_perdas + sc.educacao_custo_adicional),
                      fmtBRL(sc.saude_producao),
                      fmtBRL(sc.agricultura_perdas),
                      <span
                        key="t"
                        className={`font-black ${isSelected ? "text-[#055071]" : "text-slate-700"}`}
                      >
                        {fmtBRL(sc.total)}
                      </span>,
                    ]
                  }),
                ]}
              />
            </div>
          )
        })}

        <Note type="info">
          Empresas, educação e saúde escalam linearmente com a duração. O
          marcador ◀ indica a duração atualmente selecionada no painel. A
          metodologia completa (curva de recuperação DaLA, fator{" "}
          <strong>f</strong>, inclusão de Administração Pública CNAE 84 e
          validação com ICMS) está na{" "}
          <Link
            href="/metodologia#danos"
            className="font-semibold underline underline-offset-2"
          >
            Seção 9 da Metodologia ↗
          </Link>{" "}
          e as limitações detalhadas estão na{" "}
          <Link
            href="/metodologia#limitacoes"
            className="font-semibold underline underline-offset-2"
          >
            Seção 12 (Limitações) ↗
          </Link>
          .
        </Note>
      </Section>
    </>
  )
}
