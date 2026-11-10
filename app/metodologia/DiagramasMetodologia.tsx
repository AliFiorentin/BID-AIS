// Diagramas da visão geral da Metodologia: do dado ao indicador e do indicador às medidas de perdas e danos.
// SVG puro, sem dependências; as caixas e setas seguem a paleta azul do BID (#055071).

type Tom = "entrada" | "etapa" | "resultado"

const TOM: Record<
  Tom,
  { fill: string; stroke: string; titulo: string; sub: string }
> = {
  entrada: {
    fill: "#f1f5f9",
    stroke: "#94a3b8",
    titulo: "#334155",
    sub: "#64748b",
  },
  etapa: {
    fill: "#e8f4f8",
    stroke: "#3d7a94",
    titulo: "#055071",
    sub: "#2f6a83",
  },
  resultado: {
    fill: "#055071",
    stroke: "#055071",
    titulo: "#ffffff",
    sub: "#cfe8f3",
  },
}

function Caixa({
  x,
  y,
  w,
  h = 56,
  titulo,
  sub,
  tom,
}: {
  x: number
  y: number
  w: number
  h?: number
  titulo: string
  sub?: string
  tom: Tom
}) {
  const c = TOM[tom]
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={c.fill}
        stroke={c.stroke}
        strokeWidth={0.75}
      />
      <text
        x={x + w / 2}
        y={sub ? y + 19 : y + h / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={600}
        fill={c.titulo}
      >
        {titulo}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + 38}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fill={c.sub}
        >
          {sub}
        </text>
      )}
    </g>
  )
}

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <marker
        id={id}
        viewBox="0 0 10 10"
        refX={8}
        refY={5}
        markerWidth={6}
        markerHeight={6}
        orient="auto-start-reverse"
      >
        <path
          d="M2 1L8 5L2 9"
          fill="none"
          stroke="#64748b"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </marker>
    </defs>
  )
}

function Seta({
  id,
  x,
  y1,
  y2,
}: {
  id: string
  x: number
  y1: number
  y2: number
}) {
  return (
    <line
      x1={x}
      y1={y1}
      x2={x}
      y2={y2}
      stroke="#64748b"
      strokeWidth={1.5}
      markerEnd={`url(#${id})`}
    />
  )
}

const COLUNAS = [40, 194, 348, 502] as const
const LARG = 138
const CENTRO = COLUNAS.map((x) => x + LARG / 2)

const TRILHAS: { titulo: string; sub: string }[][] = [
  [
    { titulo: "Manchas & Rasters", sub: "MUP, LabModel, FURG" },
    { titulo: "Padronização", sub: "WGS 84 / UTM 22S" },
    { titulo: "Mancha / Cota", sub: "polígonos e grades" },
  ],
  [
    { titulo: "Cadastros", sub: "RAIS, INEP, CNES" },
    { titulo: "Geocodificar", sub: "endereço em ponto" },
    { titulo: "Pontos", sub: "dentro do município" },
  ],
  [
    { titulo: "Território", sub: "ruas, lotes e prédios" },
    { titulo: "Uso do solo", sub: "MapBiomas 2023/2024" },
    { titulo: "Polígonos", sub: "recorte espacial" },
  ],
  [
    { titulo: "População", sub: "WorldPop 100 m" },
    { titulo: "Recorte", sub: "limite municipal" },
    { titulo: "Pixels", sub: "habitantes por pixel" },
  ],
]
const LINHAS_Y = [40, 126, 212]
const SETORES = ["Empresas", "Serviços", "Território", "População"]

/** Parte 1: das quatro trilhas de dados ao cruzamento espacial e aos indicadores por setor. */
export function DiagramaDadoAoIndicador() {
  const id = "seta-dado-indicador"
  return (
    <svg
      viewBox="0 0 680 540"
      className="w-full"
      role="img"
      aria-label="Do dado ao indicador: quatro trilhas de dados (manchas, cadastros, território e população) passam por etapas de preparação, convergem no cruzamento espacial e geram indicadores por setor."
    >
      <Defs id={id} />
      {TRILHAS.map((trilha, c) =>
        trilha.map((p, r) => (
          <g key={`${c}-${r}`}>
            <Caixa
              x={COLUNAS[c]}
              y={LINHAS_Y[r]}
              w={LARG}
              titulo={p.titulo}
              sub={p.sub}
              tom={r === 0 ? "entrada" : "etapa"}
            />
            <Seta
              id={id}
              x={CENTRO[c]}
              y1={LINHAS_Y[r] + 56}
              y2={r < 2 ? LINHAS_Y[r + 1] - 2 : 296}
            />
          </g>
        ))
      )}
      <Caixa
        x={40}
        y={298}
        w={600}
        titulo="Cruzamento espacial"
        sub="o que está dentro ou toca a mancha de inundação"
        tom="resultado"
      />
      <Seta id={id} x={340} y1={354} y2={382} />
      <Caixa
        x={40}
        y={384}
        w={600}
        titulo="Indicadores por setor, município e cenário"
        sub="contagens, áreas, população e valores"
        tom="resultado"
      />
      {SETORES.map((s, i) => (
        <g key={s}>
          <Seta id={id} x={CENTRO[i]} y1={440} y2={468} />
          <Caixa
            x={COLUNAS[i]}
            y={470}
            w={LARG}
            h={44}
            titulo={s}
            tom="entrada"
          />
        </g>
      ))}
    </svg>
  )
}

/** Parte 2: dos indicadores às duas medidas em R$ (Perdas Operacionais e Danos Físicos, que não se somam). */
export function DiagramaIndicadorAosDanos() {
  const id = "seta-indicador-dano"
  return (
    <svg
      viewBox="0 0 680 490"
      className="w-full"
      role="img"
      aria-label="Do indicador às estimativas em reais: os indicadores por município e cenário geram perdas operacionais pelo método DaLA e exposição/dano físico pelo valor de reposição e curvas de dano, duas medidas em reais que não se somam."
    >
      <Defs id={id} />
      <Caixa
        x={40}
        y={40}
        w={600}
        titulo="Indicadores por município, cenário e cota"
        sub="Eldorado do Sul, Lajeado, Porto Alegre e Rio Grande"
        tom="resultado"
      />
      {[165, 515].map((x) => (
        <g key={x}>
          <Seta id={id} x={x} y1={96} y2={126} />
          <Seta id={id} x={x} y1={184} y2={212} />
          <Seta id={id} x={x} y1={270} y2={298} />
          <Seta id={id} x={x} y1={356} y2={398} />
        </g>
      ))}
      <Caixa
        x={40}
        y={128}
        w={250}
        titulo="Dias de interrupção"
        sub="aguda + recuperação ÷ 2"
        tom="etapa"
      />
      <Caixa
        x={390}
        y={128}
        w={250}
        titulo="Ativos atingidos"
        sub="empresas, escolas, saúde"
        tom="etapa"
      />
      <Caixa
        x={40}
        y={214}
        w={250}
        titulo="Fluxo econômico parado"
        sub="VAB, ensino, SUS, lavouras"
        tom="etapa"
      />
      <Caixa
        x={390}
        y={214}
        w={250}
        titulo="Valor de reposição"
        sub="custo × área × multiplicador"
        tom="etapa"
      />
      <Caixa
        x={40}
        y={300}
        w={250}
        titulo="Perdas operacionais"
        sub="método DaLA (fluxo), em R$"
        tom="resultado"
      />
      <Caixa
        x={390}
        y={300}
        w={250}
        titulo="Exposição e Dano Físico"
        sub="por cota (teto) e CLIMADA, em R$"
        tom="resultado"
      />
      <text x={340} y={322} textAnchor="middle" fontSize={12} fill="#64748b">
        não se
      </text>
      <text x={340} y={340} textAnchor="middle" fontSize={12} fill="#64748b">
        somam
      </text>
      <Caixa
        x={40}
        y={400}
        w={250}
        titulo="Perdas Operacionais"
        sub="30, 45 ou 60 dias efetivos"
        tom="entrada"
      />
      <Caixa
        x={390}
        y={400}
        w={250}
        titulo="Danos Físicos"
        sub="exposição por cota e RP"
        tom="entrada"
      />
    </svg>
  )
}
