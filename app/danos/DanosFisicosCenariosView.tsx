"use client"

import React from "react"
import Link from "next/link"
import { Building2, GraduationCap, HeartPulse, Waves, AlertTriangle } from "lucide-react"
import type { DanosCtx } from "./ctx"
import { Section, SubTitle, DataTable, Note } from "./ui"
import { fmtBRL, fmtN, MUN_COLORS, MUN_CARD_COLORS } from "./helpers"
import { CENARIO_FISICO_LABELS } from "./ctx"

export function DanosFisicosCenariosView({ ctx }: { ctx: DanosCtx }) {
  const {
    dadosFisicosCenarios,
    munClimadaAtivo,
    cenarioFisicoAtivo,
    cenariosFisicosDisponiveis,
    dadosCenarioFisico,
    setCenarioFisico,
  } = ctx

  if (!dadosCenarioFisico) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Nenhum cenário físico disponível para {munClimadaAtivo}.
      </div>
    )
  }

  // Piores cenários de cada município para o resumo inicial (Cenário ADA em todos)
  const pioresCenarios = [
    { mun: "Porto Alegre", cen: "cenario_ada", d: dadosFisicosCenarios["Porto Alegre"]?.["cenario_ada"] },
    { mun: "Eldorado do Sul", cen: "cenario_ada", d: dadosFisicosCenarios["Eldorado do Sul"]?.["cenario_ada"] },
    { mun: "Rio Grande", cen: "cenario_ada", d: dadosFisicosCenarios["Rio Grande"]?.["cenario_ada"] },
    { mun: "Lajeado", cen: "cenario_ada", d: dadosFisicosCenarios["Lajeado"]?.["cenario_ada"] },
  ].filter((p) => !!p.d)

  const totalGeralRs = pioresCenarios.reduce((acc, cur) => acc + (cur.d?.total ?? 0), 0)

  return (
    <>
      {/* ═══ 1. RESUMO DOS CENÁRIOS ═══ */}
      <Section id="resumo-cenarios" num="1" title="Resumo dos Cenários de Danos Físicos">
        <Note type="info">
          <strong>O que representa este indicador:</strong> O valor exposto de reposição mede o custo integral para
          reconstruir e repor o patrimônio físico (edificações, maquinários, estoques e equipamentos públicos)
          localizado dentro da mancha de inundação de cada evento. É o limite superior (teto) do dano físico.
        </Note>

        {cenarioFisicoAtivo !== "cenario_ada" && (
          <div className="my-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 shadow-sm flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">Aviso de Simulação Numérica ({CENARIO_FISICO_LABELS[cenarioFisicoAtivo] ?? cenarioFisicoAtivo}):</p>
              <p className="mt-0.5 leading-relaxed text-[11.5px]">
                Este cenário é uma <strong>modelagem computacional/simulação numérica</strong>, sujeita a incertezas de modelo e calibração hidrodinâmica. Para dados do evento histórico real observado em campo, utilize o <strong>Cenário ADA (Maio 2024)</strong>.
              </p>
            </div>
          </div>
        )}

        {munClimadaAtivo === "Porto Alegre" && (
          <div className="my-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">Colapso do Sistema de Proteção em Porto Alegre (Cenário ADA):</p>
              <p className="mt-1 leading-relaxed">
                Durante a enchente de maio de 2024, falhas nas comportas e estações de bombeamento inundaram o Centro
                Histórico, o 4º Distrito e o Aeroporto Salgado Filho, totalizando <strong>R$ 10,44 bilhões</strong> em
                patrimônio atingido (8.692 empresas, 126 escolas e 852 estabelecimentos de saúde). Na simulação
                hidrodinâmica teórica de cota pura (onde os diques são considerados estanques), a exposição calculada
                era de apenas R$ 381 milhões (restrita à orla desprotegida e ilhas).
              </p>
            </div>
          </div>
        )}

        {/* Cards comparativos por município */}
        <SubTitle>Piores Cenários Avaliados por Município (Maio 2024)</SubTitle>
        <p className="mb-4 text-xs text-slate-500">
          Soma do patrimônio exposto nos eventos agudos dos quatro municípios: <strong>{fmtBRL(totalGeralRs)}</strong>.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {pioresCenarios.map(({ mun, cen, d }) => {
            if (!d) return null
            const ativo = mun === munClimadaAtivo
            return (
              <div
                key={mun}
                className={`hover-lift overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-150 ${
                  ativo ? "border-[#055071] ring-2 ring-[#055071]/30" : "border-[#b3cdd8]/70"
                }`}
              >
                <div
                  className="px-4 py-3 text-white"
                  style={{ backgroundColor: MUN_CARD_COLORS[mun] ?? "#055071" }}
                >
                  <p className="text-[10px] font-black tracking-wider uppercase text-white/90">{mun}</p>
                  <p className="text-xl font-black leading-tight mt-0.5">{fmtBRL(d.total)}</p>
                  <p className="text-[9px] font-mono text-white/80 mt-1">{CENARIO_FISICO_LABELS[cen] ?? cen}</p>
                </div>
                <div className="p-3 text-[11px] space-y-1.5 text-slate-600">
                  <div className="flex justify-between border-b pb-1">
                    <span>Empresas</span>
                    <span className="font-bold text-slate-800">{fmtBRL(d.empresas_valor_brl)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Educação</span>
                    <span className="font-bold text-slate-800">{fmtBRL(d.educacao_valor_brl)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saúde</span>
                    <span className="font-bold text-slate-800">{fmtBRL(d.saude_valor_brl)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* ═══ 2. DETALHE DO CENÁRIO ATIVO ═══ */}
      <Section
        id="detalhe-cenario"
        num="2"
        title={`Detalhamento: ${munClimadaAtivo} · ${CENARIO_FISICO_LABELS[cenarioFisicoAtivo] ?? cenarioFisicoAtivo}`}
      >
        <p className="mb-4">
          Valores físicos expostos e quantitativo de equipamentos atingidos dentro da mancha do cenário.
        </p>

        {cenariosFisicosDisponiveis.length > 1 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase text-[#055071]">Alternar Cenário:</span>
            {cenariosFisicosDisponiveis.map((c) => (
              <button
                key={c}
                onClick={() => setCenarioFisico(c)}
                className={`active-press hover-lift rounded-full border px-3.5 py-1 text-xs font-semibold active:scale-[0.97] transition-all duration-150 ${
                  cenarioFisicoAtivo === c
                    ? "border-[#055071] bg-[#055071] text-white shadow-xs"
                    : "border-slate-300 bg-white text-slate-600 hover:border-[#055071] hover:text-[#055071]"
                }`}
              >
                {CENARIO_FISICO_LABELS[c] ?? c}
              </button>
            ))}
          </div>
        )}

        {/* 4 Cards de KPI do Cenário */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="hover-lift rounded-2xl border border-[#055071] bg-gradient-to-br from-[#055071] to-[#0a6e9a] p-4 text-white shadow-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
              <Waves size={13} strokeWidth={2.5} /> Total Exposto
            </div>
            <div className="mt-2 text-2xl font-black">{fmtBRL(dadosCenarioFisico.total)}</div>
            <div className="mt-1 text-[10px] text-white/70">
              {fmtN(
                dadosCenarioFisico.empresas_atingidas +
                  dadosCenarioFisico.educacao_atingidas +
                  dadosCenarioFisico.saude_atingidas
              )}{" "}
              estabelecimentos atingidos
            </div>
          </div>

          <div className="hover-lift rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#055071]">
              <Building2 size={13} strokeWidth={2.5} /> Empresas
            </div>
            <div className="mt-2 text-2xl font-black text-slate-800">
              {fmtBRL(dadosCenarioFisico.empresas_valor_brl)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              <strong>{fmtN(dadosCenarioFisico.empresas_atingidas)}</strong> empresas atingidas
            </div>
          </div>

          <div className="hover-lift rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#2da8cc]">
              <GraduationCap size={13} strokeWidth={2.5} /> Educação
            </div>
            <div className="mt-2 text-2xl font-black text-slate-800">
              {fmtBRL(dadosCenarioFisico.educacao_valor_brl)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              <strong>{fmtN(dadosCenarioFisico.educacao_atingidas)}</strong> escolas atingidas
            </div>
          </div>

          <div className="hover-lift rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#e35d4b]">
              <HeartPulse size={13} strokeWidth={2.5} /> Saúde
            </div>
            <div className="mt-2 text-2xl font-black text-slate-800">
              {fmtBRL(dadosCenarioFisico.saude_valor_brl)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              <strong>{fmtN(dadosCenarioFisico.saude_atingidas)}</strong> unidades de saúde
            </div>
          </div>
        </div>

        {/* Barra de composição */}
        <div className="rounded-2xl border border-[#b3cdd8]/70 bg-white p-5 shadow-xs">
          <SubTitle>Composição Setorial da Exposição</SubTitle>
          <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-slate-100 flex">
            <div
              style={{
                width: `${(dadosCenarioFisico.empresas_valor_brl / dadosCenarioFisico.total) * 100}%`,
                backgroundColor: "#055071",
              }}
              title={`Empresas: ${fmtBRL(dadosCenarioFisico.empresas_valor_brl)}`}
            />
            <div
              style={{
                width: `${(dadosCenarioFisico.educacao_valor_brl / dadosCenarioFisico.total) * 100}%`,
                backgroundColor: "#2da8cc",
              }}
              title={`Educação: ${fmtBRL(dadosCenarioFisico.educacao_valor_brl)}`}
            />
            <div
              style={{
                width: `${(dadosCenarioFisico.saude_valor_brl / dadosCenarioFisico.total) * 100}%`,
                backgroundColor: "#e35d4b",
              }}
              title={`Saúde: ${fmtBRL(dadosCenarioFisico.saude_valor_brl)}`}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#055071]" />
              <span>
                Empresas: <strong>{fmtBRL(dadosCenarioFisico.empresas_valor_brl)}</strong> (
                {((dadosCenarioFisico.empresas_valor_brl / dadosCenarioFisico.total) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#2da8cc]" />
              <span>
                Educação: <strong>{fmtBRL(dadosCenarioFisico.educacao_valor_brl)}</strong> (
                {((dadosCenarioFisico.educacao_valor_brl / dadosCenarioFisico.total) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#e35d4b]" />
              <span>
                Saúde: <strong>{fmtBRL(dadosCenarioFisico.saude_valor_brl)}</strong> (
                {((dadosCenarioFisico.saude_valor_brl / dadosCenarioFisico.total) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 3. TABELA COMPLETA DE CENÁRIOS ═══ */}
      <Section id="tabela-cenarios" num="3" title="Tabela Comparativa de Todos os Cenários Físicos">
        <p className="mb-4">
          Comparação estruturada entre todos os cenários de inundação mapeados para os municípios avaliados.
        </p>

        <DataTable
          rows={[
            [
              "Município",
              "Cenário",
              "Empresas",
              "Educação",
              "Saúde",
              "Total Exposto",
            ],
            ...(["Porto Alegre", "Eldorado do Sul", "Lajeado", "Rio Grande"] as const).flatMap((mun) => {
              const cens = dadosFisicosCenarios[mun]
              if (!cens) return []
              const keys = Object.keys(cens).filter((k) => !k.toLowerCase().includes("setembro"))
              const dedupedKeys = keys.filter((k) => {
                if (k === "cenario_ada") return true
                if (k.startsWith("cenario_") && keys.includes(k.replace("cenario_", "simulacao_"))) return false
                if (k === "climada_evento_2024" && keys.includes("simulacao_climada_evento_2024")) return false
                return true
              })
              const sortedKeys = dedupedKeys.sort((a, b) =>
                a === "cenario_ada" ? -1 : b === "cenario_ada" ? 1 : a.localeCompare(b)
              )
              return sortedKeys.map((cenKey) => {
                const val = cens[cenKey]
                return [
                  <span key="m" className="font-bold flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: MUN_COLORS[mun] ?? "#055071" }}
                    />
                    {mun}
                  </span>,
                  CENARIO_FISICO_LABELS[cenKey] ?? cenKey,
                  `${fmtN(val.empresas_atingidas)} (${fmtBRL(val.empresas_valor_brl)})`,
                  `${fmtN(val.educacao_atingidas)} (${fmtBRL(val.educacao_valor_brl)})`,
                  `${fmtN(val.saude_atingidas)} (${fmtBRL(val.saude_valor_brl)})`,
                  <strong key="t" className="text-slate-900">
                    {fmtBRL(val.total)}
                  </strong>,
                ]
              })
            }),
          ]}
        />

        <Note type="info">
          Para ver a estimativa de fluxo econômico e serviços paralisados (metodologia DaLA/CEPAL), acesse a página de{" "}
          <Link href="/perdas-operacionais" className="font-bold underline underline-offset-2">
            Perdas Operacionais
          </Link>
          .
        </Note>
      </Section>
    </>
  )
}
