"use client";

import React from "react";
import { Building2, GraduationCap, HeartPulse, Sprout, Coins } from "lucide-react";
import { FitHeight } from "@/components/FitHeight";
import { ResumoPerdasDanos } from "@/components/ResumoPerdasDanos";
import type { CotaRaster } from "@/hooks/useCotaRaster";
import type { DetalheCotaMun, DetalheCotaValores } from "@/lib/cotas-types";
import { fonteCotas, IMPACTO_AGRICOLA } from "@/lib/constants";

// Painel do cenário "Todas as cotas": valores (do que fica sob água) na cota atual do slider.
// Os valores vêm de climada_cota_detalhe_{slug}.json, que tem uma entrada por cota-raster; entre
// duas cotas vale a última cota já atingida (o valor exposto é cumulativo, não diminui com a cota).

const fmtN = (v: number) => Math.round(v).toLocaleString("pt-BR");
const fmtBRL = (v: number) => {
  if (v >= 1e9) return `R$ ${(v / 1e9).toFixed(2).replace(".", ",")} bi`;
  if (v >= 1e6) return `R$ ${(v / 1e6).toFixed(1).replace(".", ",")} mi`;
  if (v >= 1e3) return `R$ ${(v / 1e3).toFixed(0)} mil`;
  return `R$ ${fmtN(v)}`;
};
const fmtCota = (v: number) => v.toFixed(2).replace(".", ",");
const totalExposto = (v: DetalheCotaValores) =>
  v.empresas.valor_exposto_brl + v.saude.valor_exposto_brl + v.educacao.valor_exposto_brl;

interface Props {
  raster: CotaRaster;
  detalhe: DetalheCotaMun | null;
  municipio: string;
  cenario?: string;
  isVisaoGeral?: boolean;
  mostraImpacto?: boolean;
}

export function CotasPanel({
  raster,
  detalhe,
  municipio,
  cenario = "Todas as cotas",
  isVisaoGeral = false,
  mostraImpacto = true,
}: Props) {
  const { cota, meta } = raster;
  if (!detalhe || !meta || cota === null) {
    return <div className="py-6 text-center text-[11px] text-slate-500">Carregando valores por cota…</div>;
  }
  const chaves = Object.keys(detalhe.por_cota).sort((a, b) => parseFloat(a) - parseFloat(b));
  const alcancadas = chaves.filter((c) => parseFloat(c) <= cota + 1e-6);
  const chave = alcancadas[alcancadas.length - 1] ?? null;
  const v = chave ? detalhe.por_cota[chave] : null;
  const total = v ? totalExposto(v) : 0;
  const serie = chaves.map((c) => totalExposto(detalhe.por_cota[c]));
  const maxSerie = Math.max(...serie, 1);
  const cotas = chaves.map(parseFloat);
  const x0 = cotas[0],
    x1 = cotas[cotas.length - 1];
  const px = (c: number) => 6 + ((c - x0) / (x1 - x0 || 1)) * 228;
  const py = (val: number) => 56 - (val / maxSerie) * 48;
  const linha = cotas.map((c, i) => `${px(c).toFixed(1)},${py(serie[i]).toFixed(1)}`).join(" ");
  const xAtual = px(Math.min(Math.max(cota, x0), x1));
  const yAtual = py(total);
  const areaPontos = [
    `${px(x0).toFixed(1)},56`,
    ...cotas.map((c, i) => `${px(c).toFixed(1)},${py(serie[i]).toFixed(1)}`),
    `${px(x1).toFixed(1)},56`,
  ].join(" ");

  // Layout compacto (cabe no painel sem rolagem): empresas em largura total; educação e saúde
  // lado a lado; agricultura em uma linha.
  const card = (
    titulo: string,
    icone: React.ReactNode,
    cor: string,
    linhas: [string, string][],
    valor: number,
    colunas = 2
  ) => (
    <div
      className="rounded-lg border bg-white/70 px-2.5 py-2 min-w-0 flex flex-col justify-center"
      style={{ borderColor: cor + "55" }}
    >
      <div
        className={
          colunas === 2
            ? "flex items-center justify-between gap-2"
            : "flex flex-col items-start gap-0.5"
        }
      >
        <div className="flex items-center gap-1 font-black text-xs shrink-0" style={{ color: cor }}>
          {icone}
          {titulo}
        </div>
        <div className="font-black text-xs whitespace-nowrap tabular-nums text-slate-800">
          {fmtBRL(valor)}
        </div>
      </div>
      <div className={`mt-0.5 grid gap-x-2.5 gap-y-0.5 ${colunas === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {linhas.map(([k, val]) => (
          <div
            key={k}
            className="flex justify-between gap-1 text-[10.5px] leading-snug text-slate-600"
          >
            <span className="min-w-0 break-words">{k}</span>
            <span className="font-bold tabular-nums text-slate-800 shrink-0">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <FitHeight min={0.6} max={1} className="pb-2">
      <div className="flex flex-col gap-1.5">
        {/* Cards de Perdas Operacionais e Danos Físicos */}
        <ResumoPerdasDanos
          municipio={municipio}
          cenario={cenario}
          isVisaoGeral={isVisaoGeral}
          mostraImpacto={mostraImpacto}
          cotaValores={v}
          cotaAtual={cota}
        />

        {/* Card do valor exposto atingido com curva hidrométrica */}
        <div
          className="rounded-xl px-3 py-2 text-white flex flex-col shrink-0 shadow-sm"
          style={{ background: "linear-gradient(135deg, #055071 0%, #0a6e9a 100%)" }}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-white/90">
              Valor exposto atingido · cota {fmtCota(cota)} m
            </span>
            <span className="text-lg font-black tabular-nums leading-none">
              {fmtBRL(total)}
            </span>
          </div>
          <svg
            viewBox="0 0 240 64"
            preserveAspectRatio="none"
            className="w-full h-16 sm:h-[72px] mt-1.5"
            role="img"
            aria-label="Evolução do valor exposto por cota"
          >
            <defs>
              <linearGradient id="cotaAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {/* Linha base e guias horizontais sutis */}
            <line x1="6" y1="56" x2="234" y2="56" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1="6" y1="32" x2="234" y2="32" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="6" y1="8" x2="234" y2="8" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3,3" />

            {/* Área preenchida sob a curva */}
            <polygon points={areaPontos} fill="url(#cotaAreaGrad)" />

            {/* Curva de transição suave */}
            <polyline
              points={linha}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />

            {/* Linha vertical da cota atual */}
            <line
              x1={xAtual}
              x2={xAtual}
              y1="4"
              y2="58"
              stroke="#fbbf24"
              strokeWidth="1.75"
              strokeDasharray="3,2"
              vectorEffect="non-scaling-stroke"
            />

            {/* Marcador na curva na cota atual */}
            <circle
              cx={xAtual}
              cy={yAtual}
              r="3.5"
              fill="#fbbf24"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </svg>
          <div className="flex justify-between items-center text-[8px] text-white/80 mt-1 font-semibold">
            <span>Mín: <strong>{fmtCota(x0)} m</strong></span>
            <span className="rounded bg-black/20 px-1.5 py-0.5 text-[8px] font-bold text-amber-300 border border-white/10">
              Cota {fmtCota(cota)} m · {fmtBRL(total)}
            </span>
            <span>Pico: <strong>{fmtCota(x1)} m</strong></span>
          </div>
        </div>

        {!v ? (
          <p className="text-[11px] text-slate-500 px-1">
            Abaixo da menor cota ({fmtCota(x0)} m) ainda não há ponto sob água em {municipio}.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div>
              {card(
                "Empresas",
                <Building2 size={12} strokeWidth={2.5} />,
                "#055071",
                [
                  ["Atingidas", `${fmtN(v.empresas.n)}/${fmtN(detalhe.totais.empresas?.n ?? 0)}`],
                  ["Empregados", fmtN(v.empresas.empregados)],
                  ["Massa salarial", fmtBRL(v.empresas.massa_salarial_brl)],
                  ["Salário médio", `R$ ${fmtN(v.empresas.salario_medio_brl)}`],
                ],
                v.empresas.valor_exposto_brl
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {card(
                "Educação",
                <GraduationCap size={12} strokeWidth={2.5} />,
                "#2da8cc",
                [
                  ["Escolas", `${fmtN(v.educacao.n)}/${fmtN(detalhe.totais.educacao?.n ?? 0)}`],
                  ["Matrículas", fmtN(v.educacao.matriculas)],
                  ["Docentes", fmtN(v.educacao.docentes)],
                ],
                v.educacao.valor_exposto_brl,
                1
              )}
              {card(
                "Saúde",
                <HeartPulse size={12} strokeWidth={2.5} />,
                "#e35d4b",
                [
                  ["Unidades", `${fmtN(v.saude.n)}/${fmtN(detalhe.totais.saude?.n ?? 0)}`],
                  ["Leitos", fmtN(v.saude.leitos)],
                  ["Profissionais", fmtN(v.saude.profissionais)],
                ],
                v.saude.valor_exposto_brl,
                1
              )}
            </div>
            {v.agricultura && (() => {
              const coefsAgri = IMPACTO_AGRICOLA["maio_2024"] ?? {};
              const cults = v.agricultura.culturas ?? {};
              const valorAgri = v.agricultura.valor_estimado_brl ?? (
                Object.keys(cults).length > 0
                  ? Object.entries(cults).reduce(
                      (sum, [cultura, ha]) => sum + (ha ?? 0) * (coefsAgri[cultura]?.coef ?? 1100),
                      0
                    )
                  : (v.agricultura.area_ha ?? 0) * 1100
              );
              const topCult = Object.entries(cults)
                .filter(([, ha]) => ha > 0)
                .sort((a, b) => b[1] - a[1])[0];
              const principalStr = topCult
                ? `${topCult[0] === "Outras Lavouras Temporárias" ? "Outras" : topCult[0]} (${fmtN(topCult[1])} ha)`
                : "Nenhuma";

              return (
                <div>
                  {card(
                    "Agricultura",
                    <Sprout size={12} strokeWidth={2.5} />,
                    "#4d9e3a",
                    [
                      ["Área atingida", `${fmtN(v.agricultura.area_ha)} ha`],
                      ["Principal", principalStr],
                    ],
                    valorAgri,
                    2
                  )}
                </div>
              );
            })()}
            <div className="flex flex-col gap-0.5 text-[8.5px] leading-tight text-slate-500 px-0.5 pt-1 border-t border-slate-200/60">
              <div className="flex items-start gap-1">
                <Coins size={9} className="shrink-0 mt-px text-slate-400" />
                <span>Exposição física na cota {fmtCota(parseFloat(chave!))} m (valor de reposição sob água).</span>
              </div>
              <div className="flex items-center justify-between font-bold text-slate-500">
                <span>Fonte das cotas: <strong className="text-[#055071] font-black">{fonteCotas(municipio)}</strong></span>
                <span className="text-[8px] text-slate-400">Ver Danos</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </FitHeight>
  );
}
