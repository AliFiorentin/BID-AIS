import React from "react"
import katex from "katex"

// ─── Kit de componentes para páginas-documento (Perdas, Danos, Metodologia) ───
// Paleta BID por padrão; cada consumidor pode sobrescrever via prop `primary`.
export const DOC_PRIMARY = "#055071"

export function KpiRow({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub: string
  color: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-1 text-[11px]">
      <div className="flex min-w-0 items-center gap-1">
        <div
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="truncate text-slate-500">{label}</span>
      </div>
      <span className="shrink-0 font-bold text-slate-700">
        {value}{" "}
        <span className="text-[9px] font-normal text-slate-400">({sub})</span>
      </span>
    </div>
  )
}

export function Section({
  id,
  num,
  title,
  primary = DOC_PRIMARY,
  children,
}: {
  id: string
  num: string
  title: string
  primary?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mb-10 scroll-mt-20">
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className="shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold text-white shadow-xs"
          style={{ backgroundColor: primary }}
        >
          {num}
        </span>
        <h2 className="text-2xl font-black tracking-tight text-slate-800">
          {title}
        </h2>
      </div>
      <div className="space-y-3 text-sm leading-relaxed">{children}</div>
      <div className="mt-8 border-b border-[#b3cdd8]" />
    </section>
  )
}

/**
 * Hierarquia dos títulos nas páginas de documentação: Section (h2, 24 px) > GroupTitle (h3, 20 px) > SubTitle (16 px).
 * `nested` faz o SubTitle valer como h4 (dentro de um GroupTitle), com um corpo um pouco menor.
 */
export function SubTitle({
  primary = DOC_PRIMARY,
  nested = false,
  children,
}: {
  primary?: string
  nested?: boolean
  children: React.ReactNode
}) {
  const Tag = nested ? "h4" : "h3"
  return (
    <Tag
      className={`font-bold ${nested ? "mt-5 mb-1.5 text-[15px]" : "mt-6 mb-2 text-base"}`}
      style={{ color: primary }}
    >
      {children}
    </Tag>
  )
}

/** Título de grupo dentro de uma Section (h3, 20 px), com filete; o SubTitle dentro dele deve ser `nested`. */
export function GroupTitle({
  id,
  primary = DOC_PRIMARY,
  children,
}: {
  id?: string
  primary?: string
  children: React.ReactNode
}) {
  return (
    <h3
      id={id}
      className="mt-10 mb-3 scroll-mt-24 border-b border-[#b3cdd8] pb-1.5 text-xl font-black"
      style={{ color: primary }}
    >
      {children}
    </h3>
  )
}

export function ExtLink({
  href,
  primary = DOC_PRIMARY,
  children,
}: {
  href: string
  primary?: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium underline-offset-4 transition-colors duration-150 hover:underline"
      style={{ color: primary }}
    >
      {children}
    </a>
  )
}

export function Math({
  tex,
  display = false,
}: {
  tex: string
  display?: boolean
}) {
  const html = katex.renderToString(tex, {
    displayMode: display,
    throwOnError: false,
    trust: false,
  })
  return (
    <span
      dangerouslySetInnerHTML={{ __html: html }}
      className={display ? "my-1 block" : "inline"}
    />
  )
}

export function GeoCard({
  title,
  operation,
  primary = DOC_PRIMARY,
  children,
}: {
  title: string
  operation: string
  primary?: string
  children: React.ReactNode
}) {
  return (
    <div className="hover-lift mt-3 rounded-2xl border border-[#b3cdd8]/70 bg-white/90 p-4 shadow-xs backdrop-blur-md">
      <p
        className="mb-0.5 text-[11px] font-black tracking-wider uppercase"
        style={{ color: primary }}
      >
        {title}
      </p>
      <p className="mb-3 font-mono text-[10px]" style={{ color: primary }}>
        {operation}
      </p>
      {children}
    </div>
  )
}

export function MathBlock({
  exprs,
  primary = DOC_PRIMARY,
}: {
  exprs: Array<{ label?: string; tex: string }>
  primary?: string
}) {
  return (
    <div className="my-3 space-y-3 overflow-x-auto rounded-xl border border-[#b3cdd8]/70 bg-slate-50/80 px-5 py-4">
      {exprs.map(({ label, tex }, i) => {
        const html = katex.renderToString(tex, {
          displayMode: true,
          throwOnError: false,
          trust: false,
        })
        return (
          <div key={i} className="flex flex-wrap items-baseline gap-4">
            {label && (
              <span
                className="w-44 shrink-0 text-[10px] font-bold tracking-wider uppercase"
                style={{ color: primary }}
              >
                {label}
              </span>
            )}
            <span
              dangerouslySetInnerHTML={{ __html: html }}
              className="my-1 block"
            />
          </div>
        )
      })}
    </div>
  )
}

export function DataTable({
  rows,
  primary = DOC_PRIMARY,
  destaque,
}: {
  rows: React.ReactNode[][]
  primary?: string
  destaque?: number
}) {
  const [header, ...body] = rows
  return (
    <div className="my-3 overflow-x-auto rounded-2xl border border-[#b3cdd8]/70 shadow-xs">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr style={{ backgroundColor: primary }} className="text-white">
            {header.map((h, i) => (
              <th key={i} className="px-3.5 py-2.5 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr
              key={ri}
              className={`border-t border-[#b3cdd8]/60 transition-colors duration-100 ${ri === destaque ? "font-bold" : "hover:bg-[#f0f7fa]"}`}
              style={
                ri === destaque
                  ? {
                      backgroundColor: "#fde8b0",
                      boxShadow: "inset 4px 0 0 #e8890c",
                    }
                  : { backgroundColor: ri % 2 === 0 ? "#ffffff" : "#f7fafc" }
              }
            >
              {row.map((cell, ci) => (
                <td key={ci} className="px-3.5 py-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Note({
  type,
  children,
}: {
  type: "warning" | "info"
  children: React.ReactNode
}) {
  const cfg = {
    warning: {
      bg: "bg-amber-50/90",
      border: "border-amber-400",
      text: "text-amber-900",
      icon: "⚠",
    },
    info: {
      bg: "bg-[#eff6ff]/90",
      border: "border-[#60a5fa]",
      text: "text-[#1e40af]",
      icon: "ℹ",
    },
  }[type]
  return (
    <div
      className={`my-3 rounded-xl border-l-[3.5px] px-4 py-3 text-[12px] leading-relaxed shadow-xs ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      <span className="mr-1.5 font-bold">{cfg.icon}</span>
      {children}
    </div>
  )
}

export function SectionSources({
  links,
  primary = DOC_PRIMARY,
}: {
  links: [string, string][]
  primary?: string
}) {
  return (
    <div className="mt-4 border-t border-[#b3cdd8] pt-3">
      <p
        className="mb-1.5 text-[10px] font-bold tracking-wider uppercase"
        style={{ color: primary }}
      >
        Fontes
      </p>
      <ul className="space-y-0.5">
        {links.map(([label, href]) => (
          <li key={label}>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] underline-offset-4 transition-colors duration-150 hover:underline"
                style={{ color: primary }}
              >
                ↗ {label}
              </a>
            ) : (
              <span className="text-[11px]" style={{ color: primary }}>
                — {label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function RefBlock({
  title,
  primary = DOC_PRIMARY,
  children,
}: {
  title: string
  primary?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-[#b3cdd8] bg-white p-4 shadow-sm">
      <p
        className="mb-3 text-[11px] font-black tracking-wider uppercase"
        style={{ color: primary }}
      >
        {title}
      </p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

export function RefItem({
  href,
  label,
  desc,
  primary = DOC_PRIMARY,
}: {
  href: string
  label: string
  desc: string
  primary?: string
}) {
  return (
    <div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold underline-offset-4 transition-colors duration-150 hover:underline"
          style={{ color: primary }}
        >
          {label} ↗
        </a>
      ) : (
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      )}
      <p
        className="mt-0.5 text-[11px] leading-relaxed"
        style={{ color: primary }}
      >
        {desc}
      </p>
    </div>
  )
}
