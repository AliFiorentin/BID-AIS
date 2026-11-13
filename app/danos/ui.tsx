"use client"

import React from "react"
import {
  DOC_PRIMARY,
  KpiRow,
  Section,
  SubTitle,
  GroupTitle,
  ExtLink,
  Math,
  GeoCard,
  MathBlock,
  DataTable,
  Note,
  SectionSources,
  RefBlock,
  RefItem,
} from "@/components/doc-kit"

export {
  DOC_PRIMARY,
  KpiRow,
  Section,
  SubTitle,
  GroupTitle,
  ExtLink,
  Math,
  GeoCard,
  MathBlock,
  DataTable,
  Note,
  SectionSources,
  RefBlock,
  RefItem,
}

export function DiasBadge({ dias }: { dias: number }) {
  return (
    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#055071]/20 bg-[#055071]/10 px-2.5 py-1">
      <div className="h-1.5 w-1.5 rounded-full bg-[#055071]" />
      <span className="text-[11px] font-black tracking-wider text-[#055071] uppercase">
        {dias} dias efetivos selecionados · f (fração do ano parada) ={" "}
        {(dias / 365).toFixed(4)}
      </span>
    </div>
  )
}
