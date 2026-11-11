"use client"

import dynamic from "next/dynamic"
import { Banner } from "@/components/danos/Banner"
import { useDanosContext, type DanosProps } from "./ctx"
import { DanosToolbar } from "./DanosToolbar"
import { DanosIndice } from "./DanosIndice"
import { DanosOperacionais } from "./DanosOperacionais"

export * from "./types"

const ExposicaoView = dynamic(() =>
  import("./ExposicaoView").then((m) => m.ExposicaoView)
)
const ClimadaPorCota = dynamic(() =>
  import("./ClimadaPorCota").then((m) => m.ClimadaPorCota)
)
const ClimadaPorRp = dynamic(() =>
  import("./ClimadaPorRp").then((m) => m.ClimadaPorRp)
)
const DanosFisicosCenariosView = dynamic(() =>
  import("./DanosFisicosCenariosView").then((m) => m.DanosFisicosCenariosView)
)
const PerdasPorCotaView = dynamic(() =>
  import("./PerdasPorCotaView").then((m) => m.PerdasPorCotaView)
)

export function DanosClient(props: DanosProps) {
  const ctx = useDanosContext(props)
  const {
    aba,
    visao,
    visaoPerdas,
    semCurva,
    expo,
    dadosCotas,
    atualCota,
    cotaAtiva,
    cotaAtivo,
    dadosClimada,
    atualClimada,
    rpAtivo,
    munClimadaAtivo,
    cota,
  } = ctx

  const isPerdas = aba === "dala"

  return (
    <div className="min-h-screen bg-[#f0f7fa] font-sans text-slate-800">
      <Banner
        ativa={isPerdas ? "perdas" : "fisicos"}
        titulo={isPerdas ? "Perdas Operacionais" : "Danos Físicos"}
        subtitulo={
          isPerdas
            ? "Avaliação de Impactos Econômicos Operacionais no Rio Grande do Sul (DaLA)"
            : "Exposição por Cenários de Inundação, Cotas do Rio e Modelagem CLIMADA"
        }
        nota={
          isPerdas
            ? "Metodologia DaLA (CEPAL/BID) · RAIS 2023 · DataSUS/CNES · INEP 2024 · MapBiomas Col. 10"
            : "4 municípios avaliados · Porto Alegre, Lajeado, Eldorado do Sul e Rio Grande"
        }
      />
      <DanosToolbar ctx={ctx} />

      <div className="mx-auto flex max-w-[1440px] items-start gap-8 px-6 py-10 print:block print:py-5">
        <DanosIndice ctx={ctx} />

        <main className="min-w-0 flex-1">
          {aba === "dala" ? (
            visaoPerdas === "cota" ? (
              <PerdasPorCotaView ctx={ctx} />
            ) : (
              <DanosOperacionais ctx={ctx} />
            )
          ) : visao === "cenario" ? (
            <DanosFisicosCenariosView ctx={ctx} />
          ) : visao === "cota" ? (
            semCurva && expo ? (
              <ExposicaoView
                expo={expo}
                diag={dadosCotas?.diagnostico}
                mun={munClimadaAtivo}
                cota={cota}
              />
            ) : cotaAtivo && dadosCotas && atualCota && cotaAtiva ? (
              <ClimadaPorCota ctx={ctx} />
            ) : (
              <DanosFisicosCenariosView ctx={ctx} />
            )
          ) : dadosClimada && atualClimada && rpAtivo ? (
            <ClimadaPorRp ctx={ctx} />
          ) : (
            <DanosFisicosCenariosView ctx={ctx} />
          )}

          <footer className="mt-12 border-t border-[#b3cdd8] pt-6 text-center print:mt-4">
            <p className="text-[11px] text-[#055071]">
              Painel desenvolvido por GPEA/FURG em parceria com o BID (Banco
              Interamericano de Desenvolvimento).
            </p>
            <p className="mt-0.5 text-[11px] text-[#2f6a83]">
              © 2024 Alisson Tallys Geraldo Fiorentin · Dados de referência:
              2024.
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}
