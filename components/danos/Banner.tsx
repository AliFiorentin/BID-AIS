import Link from "next/link"
import { TrendingDown, Waves } from "lucide-react"
import { HeaderLogos } from "@/components/HeaderLogos"

export type PaginaDanos = "perdas" | "fisicos"

const PAGINAS: { id: PaginaDanos; href: string; rotulo: string }[] = [
  { id: "perdas", href: "/perdas-operacionais", rotulo: "Perdas Operacionais" },
  { id: "fisicos", href: "/danos-fisicos", rotulo: "Danos Físicos" },
]

/**
 * Banner de título das páginas Perdas Operacionais e Danos Físicos.
 * Alterna entre as duas páginas via links em pílula; mantém "← Dashboard" e "Metodologia →" e logos do BID.
 */
export function Banner({
  ativa,
  titulo,
  subtitulo,
  nota,
}: {
  ativa: PaginaDanos
  titulo: string
  subtitulo: string
  nota?: string
}) {
  const Icone = ativa === "perdas" ? TrendingDown : Waves
  const linkNav =
    "active-press hover-lift flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold text-white/95 transition-all duration-150 hover:bg-white/20 hover:border-white/35 active:scale-[0.97] shadow-xs"
  return (
    <header className="bg-gradient-to-br from-[#055071] via-[#075d83] to-[#0a6e9a] px-6 py-10 text-white print:py-5 border-b border-white/10 shadow-lg">
      <div className="mx-auto flex max-w-[1440px] items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="mb-5 flex items-center gap-2 print:hidden">
            <Link href="/" className={linkNav}>
              ← Dashboard
            </Link>
            <Link href="/metodologia" className={linkNav}>
              Metodologia →
            </Link>
          </div>
          <p className="mb-2 text-[11px] font-semibold tracking-[0.18em] uppercase opacity-70">
            BID · GPEA · FURG · IPH/UFRGS
          </p>
          <h1 className="mb-2 flex items-center gap-3 text-4xl leading-none font-black tracking-tight">
            <Icone
              size={36}
              strokeWidth={2.5}
              className="shrink-0 opacity-85"
            />
            {titulo}
          </h1>
          <p className="text-base font-medium opacity-80">{subtitulo}</p>
          {nota && (
            <p className="mt-3 font-mono text-[11px] opacity-65">{nota}</p>
          )}
          <nav
            className="mt-5 flex flex-wrap gap-2 print:hidden"
            aria-label="Páginas de perdas e danos"
          >
            {PAGINAS.map(({ id, href, rotulo }) => (
              <Link
                key={id}
                href={href}
                aria-current={ativa === id ? "page" : undefined}
                className={`active-press hover-lift rounded-full border px-4 py-1.5 text-xs font-semibold active:scale-[0.97] transition-all duration-150 ${
                  ativa === id
                    ? "bg-white text-[#055071] border-white shadow-sm"
                    : "bg-white/10 text-white/90 border-white/20 hover:bg-white/20 hover:border-white/35"
                }`}
              >
                {rotulo}
              </Link>
            ))}
          </nav>
        </div>
        <HeaderLogos />
      </div>
    </header>
  )
}
