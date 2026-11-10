"use client"

import { DanosClient } from "../danos/DanosClient"
import type { DanosProps } from "../danos/ctx"

export function FisicosClient(props: Omit<DanosProps, "abaInicial">) {
  return <DanosClient {...props} abaInicial="climada" />
}
