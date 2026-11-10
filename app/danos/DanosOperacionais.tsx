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
          <SensibChart dados={dados} diasSelecionado={dias} />
        </div>

        {/* Tabelas por município */}
        {Object.entries(dados).map(([mun, cens]) => {
          const [cenNome, cenValOrig] = Object.entries(cens).reduce(
            (acc, cur) => (cur[1].total > acc[1].total ? cur : acc)
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
          marcador ◀ indica a duração atualmente selecionada no painel.
        </Note>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════════
            SEÇÃO 4 — NOTAS E RESSALVAS
        ══════════════════════════════════════════════════════════════════════ */}
      <Section id="notas" num="4" title="Notas e Ressalvas">
        <Note type="info">
          A metodologia completa (curva de recuperação DaLA, fórmulas por
          componente, parâmetros e fontes) está na{" "}
          <Link
            href="/metodologia#danos"
            className="font-semibold underline-offset-4 hover:underline"
          >
            Seção 9 da Metodologia ↗
          </Link>
          , e as limitações por cenário, metodologia e município estão na{" "}
          <Link
            href="/metodologia#limitacoes"
            className="font-semibold underline-offset-4 hover:underline"
          >
            Seção 12 da Metodologia ↗
          </Link>
          .
        </Note>

        <SubTitle>O que é o f (fator de interrupção)</SubTitle>
        <p>
          O <strong>f</strong> é a{" "}
          <strong>fração do ano em que a atividade ficou parada</strong>: f =
          dias efetivos de interrupção ÷ 365. Os dias efetivos seguem a curva de
          recuperação DaLA (período agudo + período de recuperação × 0,5). Ex.:
          60 dias efetivos → f = 0,1644, ou seja, ≈ 16,4% de um ano de atividade
          perdida.
        </p>
        <p>
          Ele multiplica as bases <em>anuais</em>: a perda das{" "}
          <strong>empresas</strong> é o VAB anual (massa salarial anual ÷
          participação do trabalho no valor adicionado) × f, e a perda da{" "}
          <strong>saúde</strong> é a produção SUS anual × f. Educação (custo
          FUNDEB por aluno e dia de aula) e agricultura (R$/ha por cultura e
          período do evento) usam outros parâmetros, sem o f.
        </p>

        <SubTitle>Administração Pública (CNAE 84)</SubTitle>
        <p>
          Os estabelecimentos com CNAE 84 (
          <em>Administração Pública, Defesa e Seguridade Social</em>) são{" "}
          <strong>incluídos</strong> na estimativa: a interrupção de serviços
          governamentais representa perdas reais para a sociedade, conforme a
          metodologia DaLA (CEPAL, 2024).
        </p>
        <DataTable
          rows={[
            ["Indicador (Porto Alegre / ADA)", "Valor"],
            ["Estabelecimentos CNAE 84", "51"],
            ["Participação na massa salarial", "45,3%  (R$ 559,7 mi/mês)"],
            [
              "Contribuição ao total (60 dias)",
              "≈ R$ 1,25 bi de R$ 4,42 bi (28,3%)",
            ],
          ]}
        />
        <Note type="warning">
          O labor share de Adm. Pública (88,3%) é elevado, pois o VAB deste
          setor é predominantemente composto por remunerações. Leitores que
          desejam excluir o setor público devem subtrair a contribuição do CNAE
          84 dos valores apresentados.
        </Note>

        <SubTitle>Por que não usar ICMS como alternativa?</SubTitle>
        <div className="mt-1 mb-2 space-y-1.5 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 text-[11px] leading-relaxed text-amber-900">
          <p>
            A arrecadação de ICMS municipal (SEFAZ-RS) foi avaliada como
            possível proxy de VAB perdido, seguindo abordagem similar à adotada
            pela CEPAL (2024) em nível estadual via série ARIMA. A validação
            cruzada realizada identificou três limitações estruturais que
            inviabilizam o ICMS como substituto do método RAIS +{" "}
            <em>labor share</em>:
          </p>
          <ul className="list-none space-y-1 pl-1">
            <li>
              <strong>1. Domicílio fiscal fora do município atingido.</strong>{" "}
              Em Lajeado, o shortfall ICMS maio/2024 foi de apenas R$ 8 mil,
              enquanto nosso VAB estimado implica R$ 1,90 mi de queda de ICMS
              (razão de 225×). Grandes empregadoras como Tramontina recolhem
              ICMS na sede em Carlos Barbosa (RS), não em Lajeado, tornando o
              ICMS municipal completamente dissociado da atividade econômica
              local.
            </li>
            <li>
              <strong>2. Cobertura setorial parcial.</strong> O ICMS incide
              sobre circulação de mercadorias e alguns serviços de comunicação e
              transporte. Serviços em geral, que representam a maior parcela do
              VAB nas cidades maiores, recolhem ISS ao município, não ICMS ao
              Estado. Em Porto Alegre, o ICMS capturou apenas R$ 136,8 mi de
              shortfall frente a R$ 389 mi implicados pelo nosso VAB estimado
              (razão 2,84×), refletindo que bancos, consultorias e tecnologia
              estão fora do escopo do ICMS.
            </li>
            <li>
              <strong>3. Timing divergente e efeitos de compensação.</strong> Em
              Rio Grande, o ICMS de maio/2024 apresentou alta de +43,8% em
              relação ao baseline, enquanto o evento de cheia afetou
              principalmente abril/2024 (−41,4%). O movimento positivo em maio
              reflete provavelmente a refinaria e o porto (atividades não
              atingidas), gerando ICMS normalmente, além de demanda emergencial
              de combustíveis. O ICMS municipal, por ser agregado, não permite
              isolar a parcela gerada por estabelecimentos dentro da mancha de
              inundação.
            </li>
          </ul>
          <p>
            O método RAIS + <em>labor share</em> resolve as três limitações:
            opera no nível do estabelecimento (CNPJ), aplica o teste
            ponto-em-polígono para isolar apenas firmas dentro da mancha, e
            cobre todos os setores formais independentemente do tributo
            recolhido. O ICMS permanece útil apenas como sinal de validação de
            ordem de grandeza (consistente com Eldorado do Sul, razão 1,12×),
            não como metodologia de estimação.
          </p>
        </div>
      </Section>
    </>
  )
}
