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

export function DanosClient(props: DanosProps) {
  const ctx = useDanosContext(props)
  const {
    aba,
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
            ? "Avaliação de Impactos Econômicos Operacionais no Rio Grande do Sul"
            : "Exposição por Cota do Rio e Modelagem de Risco Físico (CLIMADA)"
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
            <DanosOperacionais ctx={ctx} />
          ) : semCurva && expo ? (
            <ExposicaoView
              expo={expo}
              diag={dadosCotas?.diagnostico}
              mun={munClimadaAtivo}
              cota={cota}
            />
          ) : cotaAtivo && dadosCotas && atualCota && cotaAtiva ? (
            <ClimadaPorCota ctx={ctx} />
          ) : dadosClimada && atualClimada && rpAtivo ? (
            <ClimadaPorRp ctx={ctx} />
          ) : null}

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
