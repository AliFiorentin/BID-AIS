"use client"

import React from "react"
import Link from "next/link"
import { ShieldCheck, Waves, Info } from "lucide-react"
import {
  formatarEvitado,
  perdasEmDias,
  perdasEvitadasEmDias,
  type Comparativo,
  type EvitadoValor,
  type Indicadores,
  type IntervencaoAtiva,
  type IntervencaoId,
  type TomEvitado,
  fmtBRL,
  formatoBr,
} from "@/lib/comparativo"
import { useComparativo } from "@/hooks/useComparativo"

const DIAS_PERDAS = 60

type Tipo = "ha" | "n" | "brl"
type Grupo = "destaque" | "territorio" | "economia" | "servicos" | "exposicao"

interface Cartao {
  id: string
  rotulo: string
  grupo: Grupo
  tipo: Tipo
  chave: string | null
  valor: (i: Indicadores) => number | undefined
  ajuda?: string
}

const perdas = (i: Indicadores) => perdasEmDias(i, DIAS_PERDAS)

const CARTOES: Cartao[] = [
  {
    id: "area_ha",
    rotulo: "Área atingida",
    grupo: "destaque",
    tipo: "ha",
    chave: "area_ha",
    valor: (i) => i.area_ha,
  },
  {
    id: "populacao",
    rotulo: "População atingida",
    grupo: "destaque",
    tipo: "n",
    chave: "populacao",
    valor: (i) => i.populacao,
    ajuda: "Soma do raster WorldPop 2024 na mancha modelada.",
  },
  {
    id: "perdas_total",
    rotulo: `Perdas DaLA (${DIAS_PERDAS} dias)`,
    grupo: "destaque",
    tipo: "brl",
    chave: null,
    valor: (i) => perdas(i).total,
    ajuda: "DaLA: produção e serviços interrompidos. Não se soma à exposição física.",
  },
  {
    id: "exposicao_total",
    rotulo: "Exposição Física (teto)",
    grupo: "destaque",
    tipo: "brl",
    chave: "exposicao_total",
    valor: (i) => i.exposicao_total,
    ajuda: "Custo integral de reposição do patrimônio construído atingido.",
  },
  {
    id: "empresas",
    rotulo: "Empresas",
    grupo: "economia",
    tipo: "n",
    chave: "empresas",
    valor: (i) => i.empresas,
  },
  {
    id: "vinculos",
    rotulo: "Empregos (RAIS)",
    grupo: "economia",
    tipo: "n",
    chave: "vinculos",
    valor: (i) => i.vinculos,
  },
  {
    id: "massa_salarial",
    rotulo: "Massa salarial mensal",
    grupo: "economia",
    tipo: "brl",
    chave: "massa_salarial",
    valor: (i) => i.massa_salarial,
  },
  {
    id: "escolas",
    rotulo: "Escolas",
    grupo: "servicos",
    tipo: "n",
    chave: "escolas",
    valor: (i) => i.escolas,
  },
  {
    id: "matriculas",
    rotulo: "Alunos",
    grupo: "servicos",
    tipo: "n",
    chave: "matriculas",
    valor: (i) => i.matriculas,
  },
  {
    id: "unidades_saude",
    rotulo: "Unidades de saúde",
    grupo: "servicos",
    tipo: "n",
    chave: "unidades_saude",
    valor: (i) => i.unidades_saude,
  },
  {
    id: "logradouros",
    rotulo: "Ruas atingidas",
    grupo: "territorio",
    tipo: "n",
    chave: "logradouros",
    valor: (i) => i.logradouros,
  },
  {
    id: "quadras",
    rotulo: "Quadras atingidas",
    grupo: "territorio",
    tipo: "n",
    chave: "quadras",
    valor: (i) => i.quadras,
  },
  {
    id: "terrenos",
    rotulo: "Terrenos atingidos",
    grupo: "territorio",
    tipo: "n",
    chave: "terrenos",
    valor: (i) => i.terrenos,
  },
  {
    id: "exposicao_empresas",
    rotulo: "Exposição Empresas",
    grupo: "exposicao",
    tipo: "brl",
    chave: "exposicao_empresas",
    valor: (i) => i.exposicao_empresas,
  },
  {
    id: "exposicao_educacao",
    rotulo: "Exposição Educação",
    grupo: "exposicao",
    tipo: "brl",
    chave: "exposicao_educacao",
    valor: (i) => i.exposicao_educacao,
  },
  {
    id: "exposicao_saude",
    rotulo: "Exposição Saúde",
    grupo: "exposicao",
    tipo: "brl",
    chave: "exposicao_saude",
    valor: (i) => i.exposicao_saude,
  },
]

const GRUPOS: { id: Grupo; titulo: string }[] = [
  { id: "destaque", titulo: "" },
  { id: "economia", titulo: "Atividade Econômica" },
  { id: "servicos", titulo: "Serviços Públicos e Educação" },
  { id: "territorio", titulo: "Infraestrutura Urbana" },
  { id: "exposicao", titulo: "Valor de Reposição por Setor" },
]

const COR: Record<TomEvitado, string> = {
  evitado: "#15803d",
  piora: "#b91c1c",
  neutro: "#64748b",
}
const FUNDO: Record<TomEvitado, string> = {
  evitado: "#dcfce7",
  piora: "#fee2e2",
  neutro: "#f1f5f9",
}

function fmt(tipo: Tipo, v: number): string {
  return tipo === "ha"
    ? `${formatoBr(v, 1)} ha`
    : tipo === "brl"
      ? fmtBRL(v)
      : formatoBr(v, 0)
}

function idIntervencao(cenario: string): IntervencaoId {
  if (cenario.includes("Diques + barragens")) return "diques-barragens"
  if (cenario.includes("Diques")) return "diques"
  return "sem-intervencao"
}

interface Linha {
  c: Cartao
  base: number
  com: number
  evitado: EvitadoValor
}

function montarLinhas(
  dados: Comparativo,
  eventoId: string,
  ativa: IntervencaoAtiva,
  cartoes: Cartao[]
): Linha[] {
  const ev = dados.eventos[eventoId]
  if (!ev) return []
  const sem = ev.variantes["sem-intervencao"]
  const com = ev.variantes[ativa]
  return cartoes.flatMap((c) => {
    const b = c.valor(sem)
    const v = c.valor(com)
    if (b === undefined || v === undefined) return []
    const evitado: EvitadoValor =
      c.id === "perdas_total"
        ? perdasEvitadasEmDias(sem, com, DIAS_PERDAS)
        : c.chave === null
          ? {
              valor: b - v,
              pct: b === 0 ? null : (b - v) / b,
            }
          : ev.evitado[ativa]?.[c.chave] ?? {
              valor: b - v,
              pct: b === 0 ? null : (b - v) / b,
            }
    if (!evitado) return []
    return [{ c, base: b, com: v, evitado }]
  })
}

function IndicadorCard({
  c: cartao,
  base,
  com,
  evitado,
  destaque,
  larguraTotal,
}: Linha & { destaque: boolean; larguraTotal?: boolean }) {
  const { texto, tom } = formatarEvitado(evitado.valor, evitado.pct)
  const sinal = tom === "piora" ? "+" : tom === "evitado" ? "−" : ""
  const fracao =
    evitado.pct === null || !Number.isFinite(evitado.pct)
      ? 0
      : Math.min(Math.abs(evitado.pct), 1)

  return (
    <div
      className={`rounded-xl border border-slate-200/80 bg-white/90 shadow-xs hover-lift transition-all ${
        larguraTotal ? "col-span-2" : "[&:last-child:nth-child(odd)]:col-span-2"
      } ${destaque ? "px-3 py-2.5" : "px-2.5 py-2"}`}
      title={cartao.ajuda}
    >
      <div className="text-[9px] leading-tight font-bold tracking-wide text-slate-500 uppercase">
        {cartao.rotulo}
      </div>
      <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
        <span
          className={`leading-none font-black tabular-nums ${
            destaque ? "text-lg" : "text-sm"
          }`}
          style={{ color: COR[tom] }}
        >
          {sinal}
          {fmt(cartao.tipo, Math.abs(evitado.valor))}
        </span>
        {texto !== "—" && (
          <span
            className="rounded-full px-1.5 py-px text-[9px] leading-tight font-black tabular-nums"
            style={{ color: COR[tom], backgroundColor: FUNDO[tom] }}
          >
            {texto} evitado
          </span>
        )}
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${fracao * 100}%`,
            backgroundColor: COR[tom],
          }}
        />
      </div>
      <div className="mt-1 flex flex-wrap justify-between gap-x-2 text-[9px] whitespace-nowrap text-slate-500 tabular-nums">
        <span>
          Sem: <strong className="text-slate-700">{fmt(cartao.tipo, base)}</strong>
        </span>
        <span>
          Com: <strong className="text-slate-700">{fmt(cartao.tipo, com)}</strong>
        </span>
      </div>
    </div>
  )
}

export function DanoEvitadoPainel({ cenario }: { cenario: string }) {
  const { dados, carregando, erro } = useComparativo()
  const intervencao = idIntervencao(cenario)
  const eventoId = "2024-05-21"
  const ev = dados?.eventos[eventoId]

  if (erro) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
        Não foi possível carregar o comparativo de intervenções.
      </div>
    )
  }

  if (carregando || !dados || !ev) {
    return (
      <div className="space-y-2 py-4">
        <div className="h-16 animate-pulse rounded-xl bg-slate-200/60" />
        <div className="h-28 animate-pulse rounded-xl bg-slate-200/60" />
      </div>
    )
  }

  if (intervencao === "sem-intervencao") {
    const sem = ev.variantes["sem-intervencao"]
    return (
      <div className="flex flex-col gap-3 text-slate-800">
        <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs leading-relaxed text-blue-900 shadow-xs">
          <div className="flex items-center gap-1.5 font-bold text-blue-950">
            <Waves size={14} className="text-blue-700" />
            Cenário de Referência (Sem intervenção)
          </div>
          <p className="mt-1 text-[11px]">
            Esta simulação reproduz o pico do evento histórico de <strong>21/05/2024</strong> em Rio Grande, correspondente à <strong>Cota de 2,62 m</strong>. Serve como base de comparação para mensurar o dano evitado pelas medidas estruturais de diques e barragens.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl border border-slate-200 bg-white p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-500">Área Inundada</span>
            <p className="text-base font-black text-slate-800">{fmt("ha", sem.area_ha)}</p>
            <span className="text-[10px] text-slate-500">Cota máx: 2,62 m</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-500">População Modelada</span>
            <p className="text-base font-black text-purple-800">{formatoBr(sem.populacao ?? 0, 0)}</p>
            <span className="text-[10px] text-slate-500">residentes sob mancha</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-500">Perdas DaLA (60d)</span>
            <p className="text-base font-black text-amber-800">{fmtBRL(sem.perdas_total)}</p>
            <span className="text-[10px] text-slate-500">fluxo econômico</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-500">Exposição Física</span>
            <p className="text-base font-black text-red-800">{fmtBRL(sem.exposicao_total ?? 0)}</p>
            <span className="text-[10px] text-slate-500">valor de reposição</span>
          </div>
        </div>

        <p className="text-[10px] text-slate-500">
          Selecione <strong>Simulação Maio 2024 – Diques</strong> no menu acima para visualizar o benefício e o dano evitado pelas intervenções.
        </p>
      </div>
    )
  }

  const rotulo =
    intervencao === "diques" ? "Diques" : "Diques + Barragens"

  return (
    <div className="flex flex-col gap-2.5 text-slate-800">
      <div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-emerald-600" />
          <h3 className="text-sm font-black text-[#055071]">
            Dano Evitado com {rotulo}
          </h3>
        </div>
        <p className="text-[10px] text-slate-500">
          em relação a <strong>Sem intervenção</strong> · Maio de 2024 (21/05/2024)
        </p>
      </div>

      {/* Card Hidrológico da Cota */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/60 px-3 py-2 text-[10px] text-blue-900 shadow-xs">
        <div className="flex items-center gap-1 font-bold text-blue-950">
          <Waves size={12} className="text-blue-600" />
          Relação Hidrológica e Abatimento de Cota:
        </div>
        <p className="mt-0.5 leading-snug text-blue-800">
          O pico de maio/2024 atingiu <strong>Cota 2,62 m</strong> (654,9 ha). Com {rotulo.toLowerCase()}, a mancha é contida para <strong>333,2 ha</strong>, o que equivale hidrologicamente a uma mancha de <strong>Cota ~1,90 m</strong> — um abatimento efetivo de <strong>~72 cm de inundação</strong> no tecido urbano.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {GRUPOS.map((g) => {
          const linhas = montarLinhas(
            dados,
            eventoId,
            intervencao,
            CARTOES.filter((c) => c.grupo === g.id)
          )
          if (linhas.length === 0) return null
          return (
            <section key={g.id} className="flex flex-col gap-1.5">
              {g.titulo && (
                <h4 className="flex items-center gap-2 text-[9px] font-black tracking-wider text-slate-500 uppercase after:h-px after:flex-1 after:bg-slate-300/70">
                  {g.titulo}
                </h4>
              )}
              <div className="grid grid-cols-2 gap-1.5">
                {linhas.map((l) => (
                  <IndicadorCard
                    key={l.c.id}
                    {...l}
                    destaque={g.id === "destaque"}
                    larguraTotal={l.c.id === "perdas_total" || l.c.id === "exposicao_total"}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[9px] text-slate-500 leading-snug">
        Valores calculados sobre a mancha de inundação do cenário. Perdas DaLA referem-se a 60 dias de interrupção e não se somam à exposição física (valor de reposição).
      </div>
    </div>
  )
}

export function DiferencaAba({
  aba,
  cenario,
}: {
  aba: "empresas" | "educacao" | "saude" | "infra"
  cenario: string
}) {
  const { dados } = useComparativo()
  const intervencao = idIntervencao(cenario)
  if (intervencao === "sem-intervencao" || !dados) return null

  const eventoId = "2024-05-21"
  const cartoesAba: Record<string, string[]> = {
    empresas: ["empresas", "vinculos", "massa_salarial", "exposicao_empresas"],
    educacao: ["escolas", "matriculas", "exposicao_educacao"],
    saude: ["unidades_saude", "exposicao_saude"],
    infra: ["logradouros", "quadras", "terrenos"],
  }

  const ids = cartoesAba[aba] ?? []
  const linhas = montarLinhas(
    dados,
    eventoId,
    intervencao,
    ids.flatMap((id) => CARTOES.filter((c) => c.id === id))
  )

  if (linhas.length === 0) return null
  const rotulo = intervencao === "diques" ? "Diques" : "Diques + Barragens"

  return (
    <section className="mb-3 flex flex-col gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-2 text-slate-800">
      <div className="flex items-baseline justify-between gap-2 text-[10px] font-black text-[#055071]">
        <span className="flex items-center gap-1">
          <ShieldCheck size={12} className="text-emerald-600" />
          Diferença com {rotulo}
        </span>
        <span className="text-[9px] font-medium text-slate-500">
          vs Sem intervenção
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {linhas.map((l) => (
          <IndicadorCard key={l.c.id} {...l} destaque={false} />
        ))}
      </div>
      <p className="text-[9px] leading-snug text-slate-500">
        Simulação computacional do cenário. A aba abaixo detalha os ativos sob água com a intervenção.
      </p>
    </section>
  )
}
