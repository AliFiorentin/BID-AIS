"use client"

import { DanosClient } from "../danos/DanosClient"
import type { DanosProps } from "../danos/ctx"

export function PerdasClient(props: Omit<DanosProps, "abaInicial">) {
  return <DanosClient {...props} abaInicial="dala" />
}
