"use client"

import Link from "next/link"
import { CotaMapa } from "@/components/CotaMapa"
import type { CotasData, ExposicaoSetor, ExposicaoMun } from "./types"
import {
  SETOR_LABEL,
  SETOR_COLORS,
  fmtBRL,
  fmtN,
  fmtPct,
  MAPA_SLUG,
} from "./helpers"
import { KpiRow, Section, DataTable, Note } from "./ui"
import { DetalhePorCategoria } from "./DetalhePorCategoria"
import { GraficoBarrasEmpilhadas, GraficoLinhas } from "./GraficosDanos"

export function ExposicaoView({
  expo,
  mun,
  cota,
  setAba,
  diag,
}: {
  expo: ExposicaoMun
  diag?: CotasData["diagnostico"] | null
  mun: string
  cota: string
  setAba?: (a: "dala" | "climada") => void
}) {
  const setores = ["empresas", "educacao", "saude"]
  // Rio Grande: rasters são máscaras molhado/seco (sem profundidade): nada de "prof. média" nem de amostragem em ~5 m.
  const semProf = !!expo.premissas?.sem_profundidade
  const soma = (
    r: Record<string, ExposicaoSetor>,
    k: "valor_exposto_atingido_brl" | "exposicao_total_brl"
  ) => setores.reduce((s, st) => s + r[st][k], 0)
  const cotasLista = Object.keys(expo.por_cota).sort(
    (a, b) => parseFloat(a) - parseFloat(b)
  )
  const cotaAtiva = expo.por_cota[cota]
    ? cota
    : cotasLista[Math.floor(cotasLista.length / 2)]
  const atual = expo.por_cota[cotaAtiva]
  const titulo = `${mun} · cota ${cotaAtiva} m`
  const total = soma(atual, "valor_exposto_atingido_brl")
  const expTotal = soma(atual, "exposicao_total_brl")

  // ── Dados do resumo (cota mais baixa, mais alta e maior salto entre cotas) ──
  const cotaMin = cotasLista[0]
  const cotaMax = cotasLista[cotasLista.length - 1]
  const rMin = expo.por_cota[cotaMin]
  const rMax = expo.por_cota[cotaMax]
  const totMin = soma(rMin, "valor_exposto_atingido_brl")
  const totMax = soma(rMax, "valor_exposto_atingido_brl")
  const expMax = soma(rMax, "exposicao_total_brl")
  let salto = { de: cotaMin, para: cotaMin, valor: 0 }
  cotasLista.forEach((c, i) => {
    if (i === 0) return
    const v =
      soma(expo.por_cota[c], "valor_exposto_atingido_brl") -
      soma(expo.por_cota[cotasLista[i - 1]], "valor_exposto_atingido_brl")
    if (v > salto.valor) salto = { de: cotasLista[i - 1], para: c, valor: v }
  })
  const propSetor = (st: string) =>
    rMax[st].exposicao_total_brl
      ? rMax[st].valor_exposto_atingido_brl / rMax[st].exposicao_total_brl
      : 0
  const setorTop = setores.reduce((a, b) =>
    propSetor(b) > propSetor(a) ? b : a
  )
  const vc = (c: string) => c.replace(".", ",")
  const pilhaEmp = expo.detalhe?.maior_pilha?.empresas
  const agricolaZero = expo.detalhe
    ? Object.values(expo.detalhe.por_cota).every(
        (c) => (c.agricultura?.area_ha ?? 0) === 0
      )
    : null

  return (
    <>
      <Section id="c-resumo" num="1" title="Resumo">
        <Note type="warning">
          <strong>Este indicador é exposição, não dano.</strong> Sem curva de
          dano (JRC) não há como converter a profundidade da água em fração
          destruída, e não há perda observada para calibrar. Por isso o painel
          mostra o <strong>valor exposto atingido</strong>: o valor de reposição
          de tudo o que fica sob água. Ele é o <strong>teto</strong> do dano
          (equivale a perda total de tudo que molha), não uma estimativa dele, e{" "}
          <strong>não deve ser somado</strong> às Perdas Operacionais (
          {setAba ? (
            <Link
              href="/perdas-operacionais"
              className="font-bold underline underline-offset-2"
            >
              DaLA
            </Link>
          ) : (
            <Link
              href="/perdas-operacionais"
              className="font-bold underline underline-offset-2"
            >
              DaLA
            </Link>
          )}
          ), que medem outra coisa (produção e serviço interrompidos)
          {mun !== "Porto Alegre" &&
            "; também não se compara ao dano físico de Porto Alegre"}
          .
        </Note>

        <div className="my-4 rounded-xl border border-[#b3cdd8] bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          <p className="mb-2 text-[10px] font-black tracking-wider text-[#2f6a83] uppercase">
            Principais resultados · {mun}
          </p>
          <ul className="list-inside list-disc space-y-1.5">
            <li>
              <strong>No pico (cota {vc(cotaMax)} m)</strong>, o valor exposto
              atingido é <strong>{fmtBRL(totMax)}</strong>, ou{" "}
              <strong>{fmtPct(totMax, expMax)}</strong> da exposição total do
              município ({fmtBRL(expMax)}). Isso corresponde a{" "}
              {setores
                .map(
                  (st) =>
                    `${fmtN(rMax[st].n_atingidos)} de ${fmtN(rMax[st].n_total)} ${{ empresas: "empresas", educacao: "escolas", saude: "unidades de saúde" }[st]} (${fmtPct(rMax[st].n_atingidos, rMax[st].n_total)})`
                )
                .join(", ")}
              .
            </li>
            <li>
              <strong>Na cota mais baixa ({vc(cotaMin)} m)</strong>
              {totMin > 0
                ? `, a água alcança ${fmtBRL(totMin)}, ${fmtPct(totMin, expMax)} da exposição total: a exposição cresce cerca de ${(totMax / totMin).toFixed(0)} vezes até o pico.`
                : ", a água ainda não alcança nenhuma empresa, escola ou unidade de saúde: a exposição só aparece quando o nível sobe."}
            </li>
            <li>
              <strong>O maior salto</strong> acontece entre as cotas{" "}
              {vc(salto.de)} e {vc(salto.para)} m: o valor exposto aumenta{" "}
              {fmtBRL(salto.valor)}, {fmtPct(salto.valor, totMax)} do valor do
              pico.
            </li>
            <li>
              <strong>{SETOR_LABEL[setorTop]}</strong> é o setor mais exposto em
              proporção: no pico, a água alcança{" "}
              {fmtPct(
                rMax[setorTop].valor_exposto_atingido_brl,
                rMax[setorTop].exposicao_total_brl
              )}{" "}
              do patrimônio dele.
            </li>
            {pilhaEmp?.cota_entrada && (
              <li>
                <strong>Parte do salto vem da geocodificação:</strong>{" "}
                {fmtN(pilhaEmp.n_pontos)} empresas aparecem no mesmo ponto e
                entram juntas na cota {vc(pilhaEmp.cota_entrada)} m, quando o
                valor exposto das empresas passa de{" "}
                {fmtBRL(pilhaEmp.valor_exposto_antes_brl ?? 0)} para{" "}
                {fmtBRL(pilhaEmp.valor_exposto_na_entrada_brl ?? 0)}.
              </li>
            )}
            {agricolaZero !== null && (
              <li>
                <strong>Agricultura:</strong>{" "}
                {agricolaZero
                  ? "nenhuma área agrícola mapeada fica sob a água em nenhuma das cotas."
                  : "há área agrícola sob a água em pelo menos uma cota; veja a seção de agricultura."}
              </li>
            )}
            <li>
              <strong>Lembrete:</strong> são valores de exposição (teto), não
              perdas. Não somar às Perdas Operacionais.
            </li>
          </ul>
        </div>

        <div className="my-4 rounded-xl border border-[#b3cdd8] bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          <p className="mb-2 text-[10px] font-black tracking-wider text-[#2f6a83] uppercase">
            Como ler os resultados
          </p>
          <ul className="list-inside list-disc space-y-1.5">
            <li>
              <strong>Como é calculado:</strong> cada empresa, escola ou unidade
              de saúde é um ponto com um valor de reposição estimado. O ponto
              conta como <em>atingido</em> quando{" "}
              {semProf
                ? "está dentro da mancha daquela cota"
                : "a profundidade do raster naquela cota é maior que 0"}
              ; o valor exposto atingido é a soma desses valores. Não há fração
              de dano: o ponto entra com 100% do valor ou não entra.
            </li>
            <li>
              <strong>Os percentuais:</strong> &ldquo;% da exposição
              total&rdquo; e &ldquo;% do setor&rdquo; comparam o valor atingido
              com o patrimônio de todos os pontos do município (atingidos ou
              não). Cada cota é um cenário independente; os valores crescem com
              a cota porque o máximo é acumulado (a água de uma cota maior cobre
              pelo menos o que a menor cobria).
            </li>
            <li>
              <strong>Os dados por categoria</strong> (empresas, saúde,
              educação) somam os atributos dos pontos atingidos: empregados e
              massa salarial (RAIS), leitos e profissionais (CNES), matrículas e
              docentes (Censo Escolar). A agricultura é medida em hectares sob
              água, sem valor em R$.
            </li>
            <li>
              <strong>Ordem de grandeza, não precisão:</strong> muitos
              estabelecimentos compartilham a mesma coordenada, então o valor
              sobe em degraus (cada pilha entra de uma vez), e o valor de
              reposição é estimado. Use os números para comparar cotas e
              setores, não como perda a ser paga.
            </li>
          </ul>
        </div>
        <div className="my-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-[#b3cdd8] bg-white shadow-sm">
            <div className="px-4 py-3" style={{ backgroundColor: "#055071" }}>
              <p className="mb-0.5 text-[10px] font-black tracking-wider text-white/95 uppercase">
                {titulo}
              </p>
              <p className="text-2xl leading-none font-black text-white">
                {fmtBRL(total)}
              </p>
              <p className="mt-1 font-mono text-[9px] text-white/95">
                valor exposto atingido (3 setores) · {fmtPct(total, expTotal)}{" "}
                da exposição total · teto, não dano
              </p>
            </div>
            <div className="px-4 pt-3 pb-1">
              <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                {setores.map((st) => (
                  <div
                    key={st}
                    style={{
                      width: `${(atual[st].valor_exposto_atingido_brl / (total || 1)) * 100}%`,
                      backgroundColor: SETOR_COLORS[st],
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-y-1 px-4 pt-2 pb-4">
              {setores.map((st) => (
                <KpiRow
                  key={st}
                  label={SETOR_LABEL[st]}
                  value={fmtBRL(atual[st].valor_exposto_atingido_brl)}
                  sub={`${fmtPct(atual[st].valor_exposto_atingido_brl, atual[st].exposicao_total_brl)} do setor · ${fmtPct(atual[st].valor_exposto_atingido_brl, total)} do atingido`}
                  color={SETOR_COLORS[st]}
                />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[#b3cdd8] bg-white p-4 shadow-sm">
            <p className="mb-2 text-[10px] font-black tracking-wider text-[#2f6a83] uppercase">
              Exposição total (patrimônio no município)
            </p>
            <p className="mb-3 text-2xl leading-none font-black text-slate-800">
              {fmtBRL(expTotal)}
            </p>
            {setores.map((st) => (
              <div
                key={st}
                className="flex items-center justify-between gap-2 border-t border-slate-100 py-1 text-[11px] first:border-t-0"
              >
                <span className="text-slate-600">
                  {SETOR_LABEL[st]}: {atual[st].n_atingidos}/{atual[st].n_total}{" "}
                  pontos atingidos
                </span>
                <span className="font-bold text-slate-700">
                  {fmtPct(atual[st].n_atingidos, atual[st].n_total)}
                  {!semProf &&
                    ` · prof. média ${atual[st].profundidade_media_atingidos_m.toFixed(2).replace(".", ",")} m`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="c-tabela"
        num="2"
        title="Valor exposto atingido por cota do rio"
      >
        <p>
          Valor exposto atingido em cada cota (rasters de {cotasLista[0]} a{" "}
          {cotasLista[cotasLista.length - 1]} m), com o máximo acumulado entre
          cotas. Sem período de retorno associado a cada cota, não há EAI (perda
          anual esperada) nesta visão.
        </p>
        <DataTable
          destaque={cotasLista.indexOf(cotaAtiva)}
          rows={[
            [
              "Cota (m)",
              "Empresas atingidas",
              "Escolas atingidas",
              "Unid. saúde atingidas",
              "Valor exposto atingido",
              "% da exposição total",
            ],
            ...cotasLista.map((c) => {
              const r = expo.por_cota[c]
              const v = soma(r, "valor_exposto_atingido_brl")
              return [
                <span
                  key="c"
                  className={
                    c === cotaAtiva ? "font-black text-amber-800" : "font-bold"
                  }
                >
                  {c}
                </span>,
                `${r.empresas.n_atingidos}/${r.empresas.n_total} (${fmtPct(r.empresas.n_atingidos, r.empresas.n_total)})`,
                `${r.educacao.n_atingidos}/${r.educacao.n_total} (${fmtPct(r.educacao.n_atingidos, r.educacao.n_total)})`,
                `${r.saude.n_atingidos}/${r.saude.n_total} (${fmtPct(r.saude.n_atingidos, r.saude.n_total)})`,
                fmtBRL(v),
                fmtPct(v, soma(r, "exposicao_total_brl")),
              ]
            }),
          ]}
        />
        <GraficoBarrasEmpilhadas
          titulo="Valor exposto atingido por cota do rio (R$)"
          categorias={cotasLista}
          series={[
            {
              nome: "Empresas",
              cor: SETOR_COLORS.empresas,
              valores: cotasLista.map(
                (c) => expo.por_cota[c].empresas.valor_exposto_atingido_brl
              ),
            },
            {
              nome: "Educação",
              cor: SETOR_COLORS.educacao,
              valores: cotasLista.map(
                (c) => expo.por_cota[c].educacao.valor_exposto_atingido_brl
              ),
            },
            {
              nome: "Saúde",
              cor: SETOR_COLORS.saude,
              valores: cotasLista.map(
                (c) => expo.por_cota[c].saude.valor_exposto_atingido_brl
              ),
            },
          ]}
        />
        <GraficoLinhas
          titulo="Parcela dos ativos atingidos por cota (% do total de cada setor)"
          categorias={cotasLista}
          series={(
            [
              ["Empresas", SETOR_COLORS.empresas, "empresas"],
              ["Escolas", SETOR_COLORS.educacao, "educacao"],
              ["Unidades de saúde", SETOR_COLORS.saude, "saude"],
            ] as const
          ).map(([nome, cor, st]) => ({
            nome,
            cor,
            valores: cotasLista.map((c) => {
              const r = expo.por_cota[c][st]
              return r.n_total ? (r.n_atingidos / r.n_total) * 100 : 0
            }),
          }))}
        />
      </Section>

      {expo.detalhe && (
        <DetalhePorCategoria
          det={expo.detalhe}
          cota={cotaAtiva}
          mun={mun}
          numInicial={3}
          exposicaoCota={atual}
        />
      )}

      <Section
        id="c-limitacoes"
        num={expo.detalhe ? "7" : "3"}
        title="Limitações"
      >
        <Note type="warning">
          Estes números medem a <strong>exposição</strong> a cada cota do rio: o
          que fica sob água segundo os rasters{" "}
          {semProf
            ? "de mancha por cota (sem profundidade)"
            : "de profundidade"}
          , cruzado com os dados de empresas (RAIS), escolas (Censo Escolar),
          saúde (CNES) e agricultura (MapBiomas). Não usam o modelo CLIMADA nem
          curva de dano, e não substituem as Perdas Operacionais (DaLA). Leia os
          limites abaixo antes de usar qualquer valor:
        </Note>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-700">
          <li>
            <strong>Exposição, não dano.</strong> Todo ponto{" "}
            {semProf ? "dentro da mancha" : "com profundidade > 0"} conta com
            100% do seu valor de reposição. Não há curva de dano nem calibração
            para {mun}; o dano real fica entre zero e este valor.
          </li>
          <li>
            <strong>Valor de reposição é estimativa</strong> (CUB/RS × área por
            proxy: 9 m² por pessoa, salas por matrícula; ver metodologia), não
            cadastro de valor de mercado.
          </li>
          <li>
            <strong>Coordenadas repetidas (geocodificação).</strong>{" "}
            {diag ? (
              <>
                Em {mun}:{" "}
                {(["empresas", "saude", "educacao"] as const).map((k, i) => {
                  const r = diag.coordenadas_repetidas[k]
                  return (
                    <span key={k}>
                      {i > 0 ? "; " : ""}
                      {
                        {
                          empresas: "empresas",
                          saude: "saúde",
                          educacao: "educação",
                        }[k]
                      }{" "}
                      {fmtN(r.n_pontos)} em {fmtN(r.n_coordenadas_unicas)}{" "}
                      coordenadas (maior pilha: {fmtN(r.maior_pilha)})
                    </span>
                  )
                })}
                .
              </>
            ) : (
              "Muitos estabelecimentos compartilham a mesma coordenada."
            )}{" "}
            {expo.detalhe?.maior_pilha?.empresas &&
              (() => {
                const e = expo.detalhe.maior_pilha.empresas
                return (
                  <>
                    A maior pilha de empresas reúne {fmtN(e.n_pontos)}{" "}
                    estabelecimentos de {fmtN(e.ruas_distintas)} ruas e{" "}
                    {fmtN(e.bairros_distintos)} bairros num único ponto, o que
                    indica o geocodificador caindo num ponto padrão e não um
                    endereço real.{" "}
                  </>
                )
              })()}
            A base é mantida como reportada, sem filtro nem correção. Efeito:
            cada pilha entra de uma vez, com{" "}
            {semProf ? "a situação" : "a profundidade"} de um único pixel de
            {semProf ? " ~1 m" : " ~5 m"}, o que gera degraus no valor atingido.{" "}
            {expo.detalhe?.maior_pilha &&
              (() => {
                const pil = expo.detalhe.maior_pilha
                const partes = (["empresas", "saude", "educacao"] as const)
                  .filter((k) => pil[k]?.cota_entrada && pil[k].n_pontos > 1)
                  .map(
                    (k) =>
                      `${{ empresas: "empresas", saude: "saúde", educacao: "educação" }[k]}: ${fmtN(pil[k].n_pontos)} pontos entram na cota ${pil[k].cota_entrada} m (valor exposto de ${fmtBRL(pil[k].valor_exposto_antes_brl ?? 0)} para ${fmtBRL(pil[k].valor_exposto_na_entrada_brl ?? 0)})`
                  )
                if (partes.length)
                  return (
                    <>
                      Neste município, a maior pilha de cada setor molha de uma
                      vez: {partes.join("; ")}.
                    </>
                  )
                return (
                  <>
                    Neste município, a maior pilha de cada setor não é molhada
                    em nenhuma cota dos rasters, então não causa degrau.
                  </>
                )
              })()}
          </li>
          {diag &&
            Object.values(diag.pontos_fora_do_raster).some((v) => v > 0) && (
              <li>
                <strong>Pontos fora da grade do raster</strong> entram com
                profundidade 0 (subestima):{" "}
                {(["empresas", "saude", "educacao"] as const)
                  .filter((k) => diag.pontos_fora_do_raster[k] > 0)
                  .map(
                    (k) =>
                      `${fmtN(diag.pontos_fora_do_raster[k])} de ${fmtN(diag.n_pontos[k])} ${{ empresas: "empresas", saude: "unidades de saúde", educacao: "escolas" }[k]}`
                  )
                  .join(", ")}
                . O mesmo vale para a área agrícola fora da grade.
              </li>
            )}
          <li>
            <strong>Agricultura:</strong> área, não valor. Usa o MapBiomas{" "}
            {expo.detalhe?.ano_agricultura ?? 2024} sobreposto à grade do
            raster; a área de cada pixel é calculada pela latitude, e bordas de
            polígono podem ter erro de até um pixel. A área total de cada
            cultura é a soma geodésica dos polígonos, e a área fora da grade
            conta como seca.
          </li>
          <li>
            <strong>Setores não disjuntos:</strong> as fontes são distintas
            (RAIS, CNES, Censo Escolar), e estabelecimentos de saúde e educação
            aparecem em mais de uma delas; a soma dos três setores não é de
            ativos disjuntos.
          </li>
          <li>
            <strong>Rasters não monotônicos entre cotas:</strong> aplicado o
            máximo acumulado por ponto (e por pixel, na agricultura). Amostragem
            por pixel de {semProf ? "~1 m" : "~5 m"} (vizinho mais próximo).
          </li>
          {semProf && (
            <>
              <li>
                <strong>Sem profundidade.</strong> As manchas de {mun} são
                máscaras binárias (molhado/seco) do pico de 21/05/2024 e de
                cotas menores (1,00 a 2,62 m), união das bacias hidrográficas;
                não há altura da água, então não há curva de dano, faixas de
                profundidade nem profundidade média.
              </li>
              <li>
                <strong>Cotas irregulares:</strong> a série é 1,00 / 1,50 / 2,00
                / 2,50 / 2,62 m (a última é o pico, só 0,12 m acima da
                anterior). A referência altimétrica da cota ainda precisa ser
                confirmada com o autor dos rasters.
              </li>
            </>
          )}
        </ul>
      </Section>

      <Section id="c-mapa" num={expo.detalhe ? "8" : "4"} title="Mapa por cota">
        <p>
          A água avança sozinha em loop (pause ou arraste a cota para
          controlar). A frente de avanço, em azul-claro, mostra o que está
          alagando entre uma cota e a seguinte. Mesmos rasters das tabelas
          acima; a cota é o rótulo do raster.
        </p>
        <CotaMapa slug={MAPA_SLUG[mun] ?? ""} cotaInicial={cotaAtiva} />
      </Section>
    </>
  )
}
