"use client"

import React, { useEffect, useRef, useState } from "react"
import { Check, Link2 } from "lucide-react"

interface Props {
  /** Âncora (#id) a anexar ao link; sem ela copia a URL como está (com a query atual do painel). */
  anchor?: string
  /** Texto do botão; sem ele fica só o ícone. */
  label?: string
  className?: string
  style?: React.CSSProperties
  title?: string
}

/** Copia o link da página com a configuração atual (query string do permalink) para a área de transferência. */
export function CopyLinkButton({
  anchor,
  label,
  className,
  style,
  title = "Copiar link desta configuração",
}: Props) {
  const [copiado, setCopiado] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const copiar = async () => {
    const { origin, pathname, search } = window.location
    const url = `${origin}${pathname}${search}${anchor ? `#${anchor}` : ""}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Sem permissão de clipboard (http, iframe): cai no prompt para o usuário copiar à mão.
      window.prompt("Copie o link:", url)
      return
    }
    setCopiado(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopiado(false), 1800)
  }

  return (
    <button
      type="button"
      onClick={copiar}
      title={title}
      aria-label={label ?? title}
      className={className}
      style={style}
    >
      {copiado ? (
        <Check size={12} strokeWidth={2.5} />
      ) : (
        <Link2 size={12} strokeWidth={2.5} />
      )}
      {label && <span>{copiado ? "Link copiado" : label}</span>}
    </button>
  )
}
