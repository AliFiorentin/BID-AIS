import React from "react";
import Link from "next/link";
import { HeaderLogos } from "@/components/HeaderLogos";
import {
  Section,
  GroupTitle,
  SubTitle,
  MathBlock,
  DataTable,
  Note,
  SectionSources,
  ExtLink,
  Math,
  GeoCard,
  RefBlock,
  RefItem,
} from "@/components/doc-kit";
import {
  DiagramaDadoAoIndicador,
  DiagramaIndicadorAosDanos,
} from "./DiagramasMetodologia";
import type { ClimadaData } from "@/app/danos/types";

// ─── Constantes visuais — Dano Físico (CLIMADA) ────────────────────────────────
const SETOR_LABEL: Record<string, string> = { empresas: "Empresas", educacao: "Educação", saude: "Saúde" };
const SETOR_COLORS: Record<string, string> = { empresas: "#055071", educacao: "#2da8cc", saude: "#e35d4b" };
// Nomes técnicos (campos do RAIS/Censo Escolar/CNES) traduzidos para rótulo legível.
const PORTE_LABEL: Record<string, string> = {
  qtd_vinculos: "Nº de vínculos empregatícios",
  salas_equivalentes: "Salas de aula equivalentes (por matrícula e etapa)",
  leitos_ou_profissionais: "Profissionais + leitos (pessoas que ocupam a unidade)",
};
function fmtBRLPreciso(v: number): string {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function MetodologiaContent({ dadosClimada }: { dadosClimada: ClimadaData | null }) {
  return (
    <div className="min-h-screen bg-[#f0f7fa] text-slate-800 font-sans">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-[#055071] text-white px-6 py-10 print:py-5">
        <div className="max-w-[1440px] mx-auto flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-5 print:hidden flex-wrap">
              <Link href="/" className="text-[10px] max-lg:text-xs max-lg:min-h-11 font-bold text-white/95 hover:text-white transition-colors px-3 py-1 rounded-full border border-white/20 hover:border-white/40 flex items-center gap-1.5">← Dashboard</Link>
              <Link href="/perdas-operacionais" className="text-[10px] max-lg:text-xs max-lg:min-h-11 font-bold text-white/95 hover:text-white transition-colors px-3 py-1 rounded-full border border-white/20 hover:border-white/40 flex items-center gap-1.5">Perdas Operacionais →</Link>
              <Link href="/danos-fisicos" className="text-[10px] max-lg:text-xs max-lg:min-h-11 font-bold text-white/95 hover:text-white transition-colors px-3 py-1 rounded-full border border-white/20 hover:border-white/40 flex items-center gap-1.5">Danos Físicos →</Link>
            </div>
            <p className="mb-2 text-[11px] font-semibold tracking-[0.18em] uppercase opacity-70">
              BID · GPEA · FURG · IPH/UFRGS
            </p>
            <h1 className="text-4xl font-black leading-none mb-2 tracking-tight flex items-center gap-3">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 shrink-0">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              Metodologia
            </h1>
            <p className="text-base opacity-75 font-medium">
              Avaliação de Impactos Socioeconômicos das Enchentes no Rio Grande do Sul
            </p>
            <p className="text-[11px] opacity-75 mt-3 font-mono">
              Enchentes de Maio/2024 e Setembro/2023 · 4 municípios avaliados
            </p>
          </div>
          <HeaderLogos />
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-6 py-10 print:py-5 flex gap-8 items-start print:block">

        {/* ── Sidebar (Índice fixo) ────────────────────────────────────────────── */}
        <aside className="hidden lg:block w-52 shrink-0 print:hidden">
          <div className="sticky top-6 flex flex-col gap-3">
            <nav className="bg-white border border-[#b3cdd8] rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#055071] mb-2">Índice</p>
              <ol className="flex flex-col gap-1">
                {([
                  ["#manchas",        "1. Manchas de Inundação"],
                  ["#sobreposicao",   "2. Sobreposição Espacial"],
                  ["#empresas",       "3. Empresas"],
                  ["#agricultura",    "4. Agricultura"],
                  ["#educacao",       "5. Educação"],
                  ["#saude",          "6. Saúde"],
                  ["#infraestrutura", "7. Infraestrutura"],
                  ["#edificacoes",    "8. Edificações"],
                  ["#danos",          "9. Perdas Operacionais (DaLA)"],
                  ["#dano-fisico",    "10. Danos Físicos (Por Cota e CLIMADA)"],
                  ["#populacao",      "11. População Exposta"],
                  ["#limitacoes",     "12. Limitações"],
                  ["#fontes",         "13. Fontes e Referências"],
                ] as [string, string][]).map(([href, label]) => (
                  <li key={href}>
                    <a href={href} className="text-[11px] text-[#055071] font-medium hover:underline underline-offset-4 transition-colors duration-150 leading-snug block py-0.5">
                      {label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-w-0 print:py-0">

        {/* ── Contexto ────────────────────────────────────────────────────────── */}
        <div className="bg-white border border-[#b3cdd8] rounded-xl p-5 mb-8 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#055071] mb-2">Contexto</p>
          <p className="text-sm leading-relaxed text-slate-700 mt-2">
            A metodologia distingue dois planos analíticos: (a) a{" "}
            <strong>exposição física</strong>, identificação dos estabelecimentos, escolas,
            unidades de saúde, edificações, infraestrutura urbana e áreas agrícolas dentro da
            mancha de inundação; e (b) as <strong>perdas econômicas operacionais</strong>,
            estimativa do fluxo de produção e serviços não realizado durante o período de
            interrupção, seguindo a abordagem DaLA (CEPAL/BID). Todo o processamento espacial é
            pré-computado offline; o painel web exibe os resultados consolidados.
          </p>
        </div>

        {/* ── Visão geral: dois diagramas ─────────────────────────────────────── */}
        <div className="mb-8 rounded-xl border border-[#b3cdd8] bg-white p-5 shadow-sm">
          <p className="mb-1 text-[10px] font-black tracking-wider text-[#055071] uppercase">
            Visão geral do método
          </p>
          <p className="mb-3 text-sm leading-relaxed text-slate-700">
            Duas figuras resumem o caminho, do dado bruto às estimativas econômicas. A
            primeira mostra como cada fonte é preparada e vira indicador espacial; a
            segunda, como os indicadores alimentam as duas medidas em reais (Perdas
            Operacionais e Exposição/Dano Físico), que não se somam.
          </p>
          <figure className="mx-auto max-w-[760px]">
            <DiagramaDadoAoIndicador />
            <figcaption className="mt-1 text-center text-[11px] text-slate-500">
              Figura 1. Do dado ao indicador: quatro trilhas de dados convergem no
              cruzamento espacial (Seções 1 a 8 e 11).
            </figcaption>
          </figure>
          <figure className="mx-auto mt-6 max-w-[760px]">
            <DiagramaIndicadorAosDanos />
            <figcaption className="mt-1 text-center text-[11px] text-slate-500">
              Figura 2. Do indicador às estimativas em reais: perdas operacionais (fluxo)
              e exposição/dano físico (estoque) não se somam (Seções 9 e 10).
            </figcaption>
          </figure>
        </div>


        {/* ══════════════════════════════════════════════════════════════════════
            1. MANCHAS
        ══════════════════════════════════════════════════════════════════════ */}
        <Section id="manchas" num="1" title="Manchas de Inundação: Definição dos Cenários">
          <p>
            As manchas de inundação são <strong>polígonos vetoriais que delimitam a extensão
            geográfica máxima de cada evento</strong>. Cada município possui um ou mais cenários,
            representando eventos históricos distintos ou cotas de cheia alternativas para análise
            de sensibilidade. Os polígonos foram elaborados por diferentes instituições com base
            em modelagem hidráulica, sensoriamento remoto e dados de campo.
          </p>

          <DataTable rows={[
            ["Município",       "Cenário",                  "Referência temporal",           "Descrição",                               "Fonte"],
            ["Eldorado do Sul", "Cenário ADA",              "Maio 2024",                     "Área Diretamente Afetada (extensão máxima registrada)", "MUP / Gov. RS"],
            ["Lajeado",         "Cenário 27 m",             "Maio 2024, cota 27 m",          "Cota de 27 m no Rio Taquari",             "LabModel"],
            ["Lajeado",         "Cenário 30 m",             "Maio 2024, cota 30 m",          "Cota de 30 m no Rio Taquari",             "LabModel"],
            ["Porto Alegre",    "Cenário ADA",              "Maio 2024",                     "Área Diretamente Afetada (extensão máxima registrada)", "MUP / Gov. RS"],
            ["Porto Alegre",    "Climada - UNU/EHS",        "Maio 2024",                     "Duração da inundação (dias) do evento real, usado na calibração do modelo CLIMADA (vetorizado, duração > 0)", "CLIMADA"],
            ["Rio Grande",      "Cenário Maio 2024",        "Maio 2024",                     "Extensão modelada para o evento de maio", "CIEX/FURG"],
            ["Rio Grande",      "Cenário Maio 2024 + 50%",  "Maio 2024, extensão ampliada",  "Extensão hipotética com 50% de área adicional (análise de sensibilidade)", "CIEX/FURG"],
            ["Rio Grande",      "Cenário Setembro 2023",    "Setembro 2023",                 "Evento de menor magnitude (setembro 2023)", "CIEX/FURG"],
          ]} />

          <SubTitle>Definições-chave</SubTitle>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-700">
            <li>
              <strong>ADA (Área Diretamente Afetada)</strong>: extensão máxima da mancha
              registrada durante o evento de maio de 2024, derivada do Mapa Único do Plano Rio
              Grande (MUP), que integrou imagens de satélite, dados de nível dos rios e
              registros de campo em tempo real.
            </li>
            <li>
              <strong>Cenário Maio 2024 + 50%</strong>: extensão hipotética obtida expandindo
              geometricamente a mancha do evento de maio em 50% da área. Utilizado para análise
              de sensibilidade em Rio Grande, onde a urbanização costeira torna a extensão da
              inundação especialmente relevante para planejamento de risco.
            </li>
            <li>
              <strong>Cotas do Rio Taquari (Lajeado)</strong>: as manchas de 27 m e 30 m foram
              geradas pelo LabModel por modelagem hidráulica 2D, correspondendo a diferentes
              níveis de extravasamento do Rio Taquari sobre a área urbana.
            </li>
            <li>
              <strong>Climada - UNU/EHS (Porto Alegre)</strong>: mancha de risco hidrológico do
              estudo de adaptação climática da UNU-EHS para o BID (independente da mancha
              ADA do MUP), a partir do raster de duração da inundação (dias) do evento real de
              maio/2024 usado na calibração do modelo. Vetorizado (pixels com duração {'>'} 0,
              suavizado por fechamento morfológico para remover ruído em escala de quadra) e
              passa pelo mesmo pipeline de sobreposição espacial dos demais cenários (Seção 2). O
              estudo também modela profundidade máxima de água por período de retorno
              sintético (RP10 a RP500, de 10 a 500 anos); esses rasters ainda não entram como
              cenário aqui porque representam uma métrica de risco diferente (profundidade × função
              de dano × valor de reposição do ativo), não um polígono &ldquo;atingido sim/não&rdquo; como os
              demais cenários.
            </li>
          </ul>

          <SubTitle>Sistema de Referência de Coordenadas (CRS)</SubTitle>
          <DataTable rows={[
            ["CRS",                     "EPSG",   "Uso no pipeline"],
            ["SIRGAS 2000 / Geográfico", "4674",  "Dados cadastrais RS (RAIS, CNES, Censo Escolar)"],
            ["WGS 84 / Geográfico",     "4326",   "Manchas de entrada e saída para MapLibre GL"],
            ["WGS 84 / UTM Zone 22S",   "32722",  "Cálculos de área (ha) e comprimento (km) em metros"],
          ]} />

          <SubTitle>Origem dos dados</SubTitle>
          <DataTable rows={[
            ["Fonte",        "Período",                    "Municípios",                        "Método de mapeamento"],
            ["MUP / Gov. RS","Maio 2024",                  "Eldorado do Sul · Porto Alegre",    "Fusão de imagens SAR + registros de campo + nível hidrométrico"],
            ["LabModel",     "Maio 2024",                  "Lajeado (cotas 27 m e 30 m)",       "Modelagem hidráulica 2D (HEC-RAS)"],
            ["CLIMADA",      "Maio 2024",                  "Porto Alegre",                      "Modelagem de risco hidrológico (estudo de adaptação BID/UNU-EHS)"],
            ["CIEX/FURG",    "Maio 2024 · Setembro 2023",  "Rio Grande",                        "Modelagem hidrológica e hidráulica costeira"],
          ]} />
          <SectionSources links={[
            ["MUP: Mapa Único do Plano Rio Grande (Gov. RS)", "https://mup.rs.gov.br/"],
            ["CIEX/FURG: Centro Interinstitucional de Observação e Previsão de Eventos Extremos", "https://ciex.org.br/"],
            ["CLIMADA: plataforma de modelagem de risco climático (ETH Zürich)", "https://climada-python.readthedocs.io/"],
            ["CEPAL (2024): Avaliação dos Efeitos e Impactos das Inundações no RS", "https://www.cepal.org/pt-br/publicacoes/81035-avaliacao-efeitos-impactos-inundacoes-rio-grande-sul-novembro-2024"],
          ]} />
        </Section>

        {/* ══════════════════════════════════════════════════════════════════════
            2. SOBREPOSIÇÃO ESPACIAL
        ══════════════════════════════════════════════════════════════════════ */}
        <Section id="sobreposicao" num="2" title="Sobreposição Espacial: Cálculo dos Atingidos">
          <p>
            A identificação dos elementos atingidos é feita por{" "}
            <strong>sobreposição espacial (spatial overlay)</strong> entre cada camada de feições
            georreferenciadas e o polígono da mancha de inundação do cenário selecionado. Todo
            o processamento é realizado offline com{" "}
            <ExtLink href="https://geopandas.org">GeoPandas</ExtLink> e{" "}
            <ExtLink href="https://shapely.readthedocs.io">Shapely</ExtLink>, em Python.
            O painel web carrega apenas os arquivos pré-computados; não realiza interseção
            em tempo real.
          </p>

          <SubTitle>Método por tipo de geometria</SubTitle>
          <DataTable rows={[
            ["Geometria", "Camadas", "Predicado", "Resultado"],
            ["Ponto",    "Empresas · Escolas · Unidades de Saúde", "within", "Ponto dentro do polígono da mancha"],
            ["Polígono", "Lotes · Quadras · Terrenos · Agricultura · Edificações", "intersects + intersection()", "Área de interseção em ha (EPSG:32722)"],
            ["Linha",    "Logradouros · Eixos · Rede de Esgoto", "intersects + intersection()", "Comprimento de interseção em km (EPSG:32722)"],
          ]} />

          <GeoCard title="Pontos: Empresas · Escolas · Unidades de Saúde" operation='geopandas.sjoin(predicate="within")'>
            <p className="text-sm text-[#2f6a83] mb-2">
              Um ponto <em>p</em> com coordenadas <Math tex={"(\\lambda, \\phi)"} /> é classificado
              como atingido se e somente se está geometricamente contido no interior ou fronteira
              do polígono da mancha <em>M</em>:
            </p>
            <MathBlock exprs={[
              { tex: "\\text{atingido}(p) = \\mathbf{1}[p \\in M]" },
            ]} />
            <p className="text-[11px] text-[#2f6a83] mt-2">
              Empresas e escolas: o ponto geocodificado só é aceito se estiver dentro do polígono
              do município declarado (IBGE). Unidades de saúde: coordenadas informadas pelo próprio
              CNES. Em todas as camadas, pontos em (0, 0) ou fora do retângulo do RS
              (lat ∈ [−34°, −27°], lon ∈ [−58°, −49°]) são excluídos da análise.
            </p>
          </GeoCard>

          <GeoCard title="Polígonos: Lotes · Quadras · Agricultura · Edificações" operation='sjoin(predicate="intersects") → intersection() → área em EPSG:32722'>
            <p className="text-sm text-[#2f6a83] mb-2">
              Um polígono <em>F</em> é atingido se sua interseção com a mancha é não-vazia.
              A área atingida é calculada reprojetando para UTM Zone 22S (EPSG:32722):
            </p>
            <MathBlock exprs={[
              { tex: "\\text{atingido}(F) = \\mathbf{1}[\\mathcal{A}(F \\cap M) > 0]" },
              { label: "Área atingida [m²]", tex: "A = \\mathcal{A}(F \\cap M) \\quad \\text{(EPSG:32722)}" },
              { label: "Área atingida [ha]", tex: "A_{\\text{ha}} = A / 10{.}000" },
            ]} />
          </GeoCard>

          <GeoCard title="Linhas: Logradouros · Eixos · Rede de Esgoto" operation='sjoin(predicate="intersects") → intersection() → comprimento em EPSG:32722'>
            <p className="text-sm text-[#2f6a83] mb-2">
              Um segmento <em>L</em> é atingido se intersecta a mancha. O comprimento atingido
              é o trecho da linha dentro do polígono:
            </p>
            <MathBlock exprs={[
              { tex: "\\text{atingido}(L) = \\mathbf{1}[\\ell(L \\cap M) > 0]" },
              { label: "Comprimento [m]",  tex: "C = \\ell(L \\cap M) \\quad \\text{(EPSG:32722)}" },
              { label: "Comprimento [km]", tex: "C_{\\text{km}} = C / 1{.}000" },
            ]} />
          </GeoCard>

          <SubTitle>Notação formal: indicadores agregados</SubTitle>
          <p>
            Para um conjunto de <Math tex={"N_t"} /> feições e uma mancha <Math tex={"M_j"} />
            do cenário <em>j</em>:
          </p>
          <MathBlock exprs={[
            { label: "Indicadora de impacto",  tex: "\\chi_i = \\begin{cases} 1 & \\text{se}\\ \\mathcal{A}(F_i \\cap M_j) > 0 \\\\ 0 & \\text{caso contrário} \\end{cases}" },
            { label: "Unidades afetadas",      tex: "N_a = \\sum_{i=1}^{N_t} \\chi_i" },
            { label: "Percentual",             tex: "P = \\dfrac{N_a}{N_t} \\times 100\\,\\%" },
            { label: "Atributo ponderado",     tex: "Q_a = \\sum_{i=1}^{N_t} q_i \\cdot \\chi_i \\quad (q_i = \\text{empregados, matrículas, etc.})" },
            { label: "Percentual ponderado",   tex: "P_q = \\dfrac{Q_a}{\\sum_i q_i} \\times 100\\,\\%" },
            { label: "Razão de cobertura",     tex: "r_i = \\dfrac{\\mathcal{A}(F_i \\cap M_j)}{\\mathcal{A}(F_i)}, \\quad r_i \\in [0,\\,1]" },
            { label: "Intensidade média",      tex: "R = \\dfrac{\\sum_i \\mathcal{A}(F_i \\cap M_j)}{\\sum_i \\mathcal{A}(F_i)} \\times 100\\,\\%" },
          ]} />
          <p className="text-[11px] italic text-[#2f6a83]">
            Fluxo CRS: SIRGAS 2000 (EPSG:4674) nos dados cadastrais →
            WGS 84 (EPSG:4326) para as manchas → EPSG:32722 para cálculos de área e comprimento →
            EPSG:4326 na saída GeoJSON para MapLibre GL.
          </p>
          <SectionSources links={[
            ["GeoPandas Documentation", "https://geopandas.org/en/stable/docs.html"],
            ["Shapely Documentation", "https://shapely.readthedocs.io"],
            ["IBGE: Malha Municipal RS", "https://www.ibge.gov.br/geociencias/organizacao-do-territorio/malhas-territoriais.html"],
          ]} />
        </Section>

        {/* ══════════════════════════════════════════════════════════════════════
            3. EMPRESAS
        ══════════════════════════════════════════════════════════════════════ */}
        <Section id="empresas" num="3" title="Empresas: Estabelecimentos Formais Atingidos">
          <p>
            O painel quantifica a <strong>exposição física dos estabelecimentos do setor formal</strong>{" "}
            dentro de cada mancha de inundação, com base na{" "}
            <ExtLink href="https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/estatisticas-trabalho/rais/rais-2025/rais-2025">
              RAIS: Relação Anual de Informações Sociais (MTE)
            </ExtLink>,
            ano-base 2023. Cada estabelecimento é georreferenciado a partir do endereço
            constante na própria RAIS, geocodificado via instância local do Nominatim
            (OpenStreetMap).
          </p>

          <SubTitle>Dados base: RAIS 2023</SubTitle>
          <p>
            A RAIS 2023 contém todos os vínculos empregatícios ativos em 31/12/2023 no
            território nacional. Para este painel foram selecionados apenas estabelecimentos
            nos quatro municípios avaliados (filtragem por código IBGE de 6 dígitos).
            As variáveis extraídas por estabelecimento (CNPJ) são:
          </p>
          <DataTable rows={[
            ["Variável RAIS",           "Uso no painel"],
            ["cnpj_cei",                "Identificador do estabelecimento (14 dígitos, com zeros à esquerda)"],
            ["municipio (ibge6)",        "Filtragem dos 4 municípios de interesse"],
            ["qtd_vinc_ativos",         "Contagem de vínculos ativos = empregados expostos"],
            ["vl_remun_media_nom",      "Remuneração média mensal por vínculo → soma = folha salarial do estabelecimento"],
            ["cnae20_classe",           "CNAE 2.0 (5 dígitos) → classificação setorial → labor share para estimativa de VAB"],
            ["logradouro + município",  "Endereço para geocodificação via Nominatim"],
          ]} />

          <SubTitle>Geocodificação dos endereços</SubTitle>
          <p>
            A geocodificação é realizada com uma instância local do{" "}
            <ExtLink href="https://nominatim.org">Nominatim</ExtLink> (OpenStreetMap),
            que converte o endereço textual em coordenadas geográficas (lat/lon, EPSG:4326).
            O ponto só é aceito se estiver dentro do polígono do município declarado na fonte
            (malha municipal do IBGE), o que descarta correspondências em municípios vizinhos com
            logradouro homônimo. Na conversão para GeoJSON, pontos em (0, 0) ou fora do retângulo
            do Rio Grande do Sul (lat ∈ [−34°, −27°], lon ∈ [−58°, −49°]) também são excluídos.
            As coordenadas ficam em cache para uso posterior.
          </p>
          <Note type="info">
            Estabelecimentos sem endereço geocodificável (endereços incompletos, caixas postais
            ou rurais sem numeração) são excluídos do mapeamento mas contabilizados separadamente
            no relatório de cobertura de geocodificação.
          </Note>

          <SubTitle>Classificação setorial por CNAE</SubTitle>
          <p>
            O código CNAE 2.0 (Classificação Nacional de Atividades Econômicas) de cada
            estabelecimento determina o setor para fins de cálculo de perdas operacionais:
          </p>
          <DataTable rows={[
            ["Divisão CNAE",     "Setor",             "Labor share (LS)", "Exemplos de atividades"],
            ["01–03",            "Agropecuária",       "17,6%",            "Lavouras, criação de animais, silvicultura"],
            ["05–39",            "Indústria",          "33,8%",            "Extração mineral, manufatura, utilidades"],
            ["41–43",            "Construção",         "43,3%",            "Obras, instalações, acabamento"],
            ["84",               "Adm. Pública",       "88,3%",            "Administração, defesa, seguridade social"],
            ["Demais (45–99)",   "Serviços",           "43,3%",            "Comércio, transporte, TI, saúde privada, educação privada"],
          ]} />

          <SubTitle>Indicadores calculados</SubTitle>
          <DataTable rows={[
            ["Indicador",                  "Fórmula / Descrição"],
            ["Estabelecimentos atingidos", <span key="e">Contagem <Math tex={"N_a = \\sum \\chi_i"} /> (pontos dentro da mancha)</span>],
            ["Empregados expostos",        <span key="emp"><Math tex={"Q_{\\text{emp}} = \\sum_{i} \\text{qtd\\_vinculos}_i \\cdot \\chi_i"} /></span>],
            ["Massa salarial exposta",     <span key="ms"><Math tex={"W = \\sum_{i} w_i \\cdot \\chi_i"} /> (R$/mês, soma das remunerações médias)</span>],
            ["Salário médio",              <span key="sm"><Math tex={"\\bar{w} = W / Q_{\\text{emp}}"} /></span>],
            ["Distribuição por setor",     "Participação de cada divisão CNAE no total de estabelecimentos e empregados atingidos"],
          ]} />

          <Note type="info">
            Para estimativas causais de perdas no mercado de trabalho formal (comparando
            municípios atingidos com controles similares antes e após o evento), ver Teixeira et al.
            (2025), que aplica o método Diferenças em Diferenças sobre microdados RAIS mensais.
            Os indicadores deste painel medem a <em>exposição estática</em> (snap-shot de 2023),
            não o efeito causal.
          </Note>

          <SubTitle>Origem dos dados</SubTitle>
          <DataTable rows={[
            ["Fonte",                      "Referência temporal", "Variáveis utilizadas"],
            ["RAIS (MTE)",                 "Ano-base 2023",       "Vínculos ativos, endereços, CNAE, remuneração"],
            ["OpenStreetMap / Nominatim",  "—",                   "Geocodificação de endereços (instância local)"],
          ]} />
          <SectionSources links={[
            ["RAIS: Microdados MTE", "https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/estatisticas-trabalho/rais/rais-2025/rais-2025"],
            ["Nominatim: OpenStreetMap Geocoder", "https://nominatim.org"],
          ]} />
        </Section>

        {/* ══════════════════════════════════════════════════════════════════════
            4. AGRICULTURA
        ══════════════════════════════════════════════════════════════════════ */}
        <Section id="agricultura" num="4" title="Agricultura: Impacto por Cultura e Período">
          <p>
            A estimativa de perdas agrícolas combina o <strong>mapeamento de uso do solo</strong>{" "}
            (MapBiomas), fonte da área cultivada, com <strong>coeficientes de impacto direto</strong>{" "}
            (R$/ha) calibrados ao estágio
            fenológico de cada cultura no momento do evento. O resultado representa o custo
            direto de produção perdido (insumos, sementes, corretivos e trabalho), sem
            considerar renda futura, preços de mercado ou perdas de solo de longo prazo.
          </p>

          <SubTitle>Mapeamento de uso do solo: MapBiomas Coleção 10</SubTitle>
          <p>
            O{" "}
            <ExtLink href="https://brasil.mapbiomas.org/downloads/mapas-para-download-geotiff/">
              MapBiomas Coleção 10
            </ExtLink>{" "}
            fornece rasters anuais de uso e cobertura do solo com resolução de 30 m. Para cada
            cenário, o ano do raster é selecionado conforme o período do evento:
          </p>
          <DataTable rows={[
            ["Cenário",         "Ano do raster MapBiomas", "Justificativa"],
            ["Maio 2024",       "2024",                    "Reflete a ocupação agrícola da safra 2023/24"],
            ["Setembro 2023",   "2023",                    "Reflete a ocupação agrícola da safra 2022/23"],
          ]} />
          <p>
            As classes de lavouras temporárias mapeadas são:
          </p>
          <DataTable rows={[
            ["Código MapBiomas", "Classe",                       "Cor no painel"],
            ["39",               "Soja",                         "#D4A017 (amarelo-ouro)"],
            ["40",               "Arroz",                        "#4FC3F7 (azul-claro)"],
            ["41, 20, 62",       "Outras Lavouras Temporárias (inclui cana e algodão)", "#AED581 (verde-claro)"],
          ]} />
          <p>
            Lavouras perenes (café, citros, dendê e outras; códigos 36, 46, 47, 35 e 48) ficam fora
            da camada. Como o raster é referenciado em graus, a área de cada pixel depende da
            latitude: cerca de 0,078 ha nas regiões-foco, e não os 0,09 ha nominais de 30 × 30 m.
          </p>
          <MathBlock exprs={[
            { label: "Área por pixel [ha]", tex: "a_{\\text{pixel}} = \\dfrac{|\\Delta\\lambda| \\cdot 111{.}320 \\cdot \\cos\\varphi_c \\cdot |\\Delta\\varphi| \\cdot 111{.}320}{10{.}000}" },
            { label: "Área total [ha]",     tex: "A_{\\text{total}} = N_{\\text{pixels}} \\times a_{\\text{pixel}}" },
          ]} />
          <p className="text-[12px] text-slate-600">
            Δλ e Δφ: resolução angular do raster; φ<sub>c</sub>: latitude central do recorte municipal.
            A área atingida é medida sobre os polígonos de cultura recortados pela mancha
            (EPSG:32722), após suavização da geometria e descarte de fragmentos menores que 5 m².
          </p>

          <SubTitle>Coeficientes de impacto: calendário agrícola do RS</SubTitle>
          <p>
            Os coeficientes (R$/ha) refletem o estágio fenológico no momento do evento
            e representam o custo direto de produção incorrido até aquele ponto da safra:
          </p>
          <DataTable rows={[
            ["Cultura",                     "Período",    "Status fenológico",                "Coef. (R$/ha)", "Componentes estimados"],
            ["Soja",                        "Maio 2024",  "Colhida (fev–abr/2024)",           "R$ 1.100",      "Insumos para próxima safra já aplicados + compactação de solo"],
            ["Arroz",                       "Maio 2024",  "Colhido (fev–abr/2024)",           "R$ 1.100",      "Infraestrutura de irrigação danificada + compactação"],
            ["Outras Lavouras Temporárias", "Maio 2024",  "Plantio inicial (mai–jun/2024)",   "R$ 1.400",      "Sementes, fertilizantes base, preparo do solo"],
            ["Soja",                        "Set. 2023",  "Pré-plantio",                      "R$ 250",        "Solo em preparo, impacto mínimo, insumos não aplicados"],
            ["Arroz",                       "Set. 2023",  "Pré-plantio",                      "R$ 250",        "Solo em preparo, impacto mínimo"],
            ["Outras Lavouras Temporárias", "Set. 2023",  "Colheita (set–out/2023)",          "R$ 2.800",      "Perda quase total de trigo/aveia em ponto de colheita"],
          ]} />
          <MathBlock exprs={[
            { label: "Perda total [R$]", tex: "L_{\\text{agr}} = \\sum_{c \\in \\text{culturas}} A_c\\,[\\text{ha}] \\times \\text{Coef}_c\\,[\\text{R}\\$/\\text{ha}]" },
          ]} />
          <Note type="warning">
            Escopo restrito a custos diretos de produção. Excluídos: variação de preço de mercado,
            contratos forward, renda futura de safras seguintes, recuperação de solo (calcário,
            gesso) e perdas na pecuária.
          </Note>

          <SubTitle>Origem dos dados</SubTitle>
          <DataTable rows={[
            ["Fonte",                      "Referência temporal", "Variáveis"],
            ["MapBiomas (Coleção 10)",     "2023 e 2024",         "Raster 30 m; classes 39 (Soja), 40 (Arroz), 41, 20 e 62 (Outras)"],
            ["CONAB (Preços Mínimos)",     "2024",                "Base para calibração dos coeficientes R$/ha"],
          ]} />
          <SectionSources links={[
            ["MapBiomas: Coleção 10", "https://brasil.mapbiomas.org/downloads/mapas-para-download-geotiff/"],
            ["MapBiomas: Códigos da legenda da Coleção 10", "https://brasil.mapbiomas.org/wp-content/uploads/sites/4/2025/08/Legenda-Colecao-10-Legend-Code.pdf"],
            ["CONAB: Preços Mínimos 2024", ""],
          ]} />
        </Section>

        {/* ══════════════════════════════════════════════════════════════════════
            5. EDUCAÇÃO
        ══════════════════════════════════════════════════════════════════════ */}
        <Section id="educacao" num="5" title="Educação: Estrutura Atingida">
          <p>
            O painel mapeia a <strong>infraestrutura educacional da educação básica</strong>{" "}
            dentro das manchas de inundação, com base no{" "}
            <ExtLink href="https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-escolar">
              Censo Escolar 2024 (INEP)
            </ExtLink>.
            O Censo Escolar é o maior levantamento estatístico educacional do Brasil, cobrindo
            todas as escolas de educação básica (pré-escola ao ensino médio) dos sistemas
            federal, estadual, municipal e privado.
          </p>

          <SubTitle>Indicadores de exposição</SubTitle>
          <DataTable rows={[
            ["Indicador",                  "Descrição"],
            ["Escolas atingidas",          "Estabelecimentos com ponto geocodificado dentro da mancha"],
            ["Matrículas afetadas",        "Soma de todas as matrículas ativas nas escolas atingidas (pré-escola ao EM)"],
            ["Turmas afetadas",            "Número de turmas em funcionamento nas escolas atingidas"],
            ["Professores afetados",       "Vínculos de docentes nas escolas atingidas"],
            ["Dependência administrativa", "Federal / Estadual / Municipal / Privada"],
            ["Tipo de atendimento",        "Creche, Pré-escola, EF Anos Iniciais, EF Anos Finais, EM, EJA, Educação Especial"],
          ]} />

          <SubTitle>Dependência administrativa</SubTitle>
          <DataTable rows={[
            ["Código", "Dependência",  "Mantenedora"],
            ["1",      "Federal",      "União (IFs, colégios de aplicação e militares)"],
            ["2",      "Estadual",     "Governo do estado (escolas estaduais de EF e EM)"],
            ["3",      "Municipal",    "Prefeituras (principalmente pré-escola e EF inicial)"],
            ["4",      "Privada",      "Entidades privadas com ou sem fins lucrativos"],
          ]} />

          <SubTitle>Geocodificação das escolas</SubTitle>
          <p>
            As escolas são georreferenciadas pelo endereço registrado no Censo Escolar, com o mesmo
            procedimento das empresas: geocodificação na instância local do Nominatim (OSM) e aceite
            do ponto apenas dentro do polígono do município (IBGE).
          </p>

          <Note type="info">
            A interrupção do calendário letivo e os custos de reconstrução predial não são
            estimados nesta seção. A estimativa do custo de <strong>reposição dos dias letivos</strong>{" "}
            perdidos (via FUNDEB/VAAT-MIN) é calculada na{" "}
            <a href="#danos" className="text-[#055071] font-semibold hover:underline underline-offset-4">
              Seção 9: Danos Operacionais
            </a>.
          </Note>

          <SubTitle>Origem dos dados</SubTitle>
          <DataTable rows={[
            ["Fonte",                     "Referência temporal", "Variáveis"],
            ["INEP (Censo Escolar)",      "2024",               "Estabelecimentos, matrículas, turmas, docentes, coordenadas"],
            ["OpenStreetMap / Nominatim", "—",                  "Geocodificação de escolas sem coordenada na base INEP"],
          ]} />
          <SectionSources links={[
            ["INEP: Censo Escolar", "https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-escolar"],
            ["INEP: Microdados Censo Escolar 2024", "https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar"],
          ]} />
        </Section>

        {/* ══════════════════════════════════════════════════════════════════════
            6. SAÚDE
        ══════════════════════════════════════════════════════════════════════ */}
        <Section id="saude" num="6" title="Saúde: Capacidade Instalada Atingida">
          <p>
            O painel quantifica a <strong>capacidade instalada do sistema de saúde</strong>{" "}
            dentro das manchas de inundação, com base no{" "}
            <ExtLink href="https://cnes.datasus.gov.br">
              CNES: Cadastro Nacional de Estabelecimentos de Saúde (DataSUS)
            </ExtLink>,
            referência de abril/2024. O CNES registra todos os estabelecimentos de saúde do
            SUS e do setor privado, com localização georreferenciada por latitude/longitude
            disponível diretamente na fonte.
          </p>

          <SubTitle>Tipos de estabelecimento (TP_UNID)</SubTitle>
          <DataTable rows={[
            ["Tipo",  "Descrição"],
            ["Hospital Geral",                 "Atendimento de internação geral, urgência e emergência"],
            ["Hospital Especializado",         "Internação para especialidade específica (cardio, onco, psiquiatria, etc.)"],
            ["Pronto-Socorro",                 "Atendimento de urgência/emergência sem internação"],
            ["UBS (Unidade Básica de Saúde)",  "Atenção primária, prevenção e acompanhamento de crônicas"],
            ["Ambulatório",                    "Consultas e procedimentos especializados sem internação"],
            ["CAPS",                           "Centro de Atenção Psicossocial"],
            ["Clínica Especializada",          "Serviços especializados (hemodiálise, radioterapia, etc.)"],
            ["Laboratório",                    "Diagnósticos e análises clínicas"],
          ]} />

          <SubTitle>Categorias de profissionais (CBO)</SubTitle>
          <p>
            Os vínculos de profissionais de saúde são agrupados em 11 categorias com base no
            código CBO (Classificação Brasileira de Ocupações) de 4 dígitos:
          </p>
          <DataTable rows={[
            ["Categoria painel",     "Códigos CBO (4 dígitos)",          "Exemplos de ocupações"],
            ["Médicos",              "2251–2252, 2231–2235",              "Clínicos, cirurgiões, especialistas"],
            ["Enfermagem",           "3222–3225, 2235",                   "Enfermeiros, técnicos e auxiliares de enfermagem"],
            ["Odontologia",          "2232, 3224",                        "Cirurgiões-dentistas, técnicos em saúde bucal"],
            ["Farmácia",             "2234, 3227",                        "Farmacêuticos e auxiliares"],
            ["Diagnóstico/Imagem",   "3241–3242, 2236",                   "Técnicos em radiologia, biomédicos, laboratoristas"],
            ["ACS/Endemias",         "5151–5152",                         "Agentes Comunitários de Saúde, agentes de endemias"],
            ["Transporte/Urgência",  "5162–5163",                         "Socorristas, condutores de ambulância"],
            ["Admin/Gestão",         "4110–4130",                         "Auxiliares administrativos, recepcionistas"],
            ["Serv. Gerais",         "5143, 7100–7200",                   "Higienização, limpeza, manutenção"],
            ["Outros (Sup.)",        "2030, 2040",                        "Psicólogos, fisioterapeutas, nutricionistas"],
            ["Outros",               "Demais",                            "Ocupações não classificadas nas anteriores"],
          ]} />

          <SubTitle>Indicadores calculados</SubTitle>
          <DataTable rows={[
            ["Indicador",              "Fórmula"],
            ["Unidades atingidas",     <span key="u"><Math tex={"N_a = \\sum_k \\chi_k"} /> (CNES dentro da mancha)</span>],
            ["Profissionais afetados", <span key="p"><Math tex={"P_a = \\sum_k \\sum_c \\text{staff}_{k,c} \\cdot \\chi_k"} /> (soma por categoria CBO)</span>],
            ["Leitos expostos",        "Soma de leitos SUS nas unidades atingidas (quando disponível no CNES)"],
          ]} />

          <Note type="info">
            A estimativa da <strong>perda de produção SUS</strong> (valor não realizado de
            procedimentos ambulatoriais e internações durante a interrupção) está na{" "}
            <a href="#danos" className="text-[#055071] font-semibold hover:underline underline-offset-4">
              Seção 9: Danos Operacionais
            </a>.
          </Note>

          <SubTitle>Origem dos dados</SubTitle>
          <DataTable rows={[
            ["Fonte",                "Referência temporal", "Variáveis"],
            ["CNES (DataSUS)",       "Abril/2024",          "co_cnes, tipo de unidade, lat/lon, vínculos por CBO"],
            ["SIA/SIH (DataSUS)",    "Jan–Jul/2024",        "Produção ambulatorial (SIA) e hospitalar (SIH) por CNES"],
          ]} />
          <SectionSources links={[
            ["CNES: DataSUS", "https://cnes.datasus.gov.br"],
            ["DataSUS: Produção Hospitalar SIH/SUS", "https://datasus.saude.gov.br/acesso-a-informacao/producao-hospitalar-sih-sus"],
            ["DataSUS: Produção Ambulatorial SIA/SUS", "https://datasus.saude.gov.br/acesso-a-informacao/producao-ambulatorial-sia-sus"],
          ]} />
        </Section>

        {/* ══════════════════════════════════════════════════════════════════════
            7. INFRAESTRUTURA
        ══════════════════════════════════════════════════════════════════════ */}
        <Section id="infraestrutura" num="7" title="Infraestrutura Urbana">
          <p>
            As camadas de infraestrutura urbana são fornecidas pelas prefeituras e órgãos
            municipais de cada cidade, em formato vetorial (shapefile / GeoJSON). A análise
            identifica os elementos com interseção com a mancha de inundação e calcula a
            extensão atingida conforme o tipo de geometria.
          </p>

          <SubTitle>Camadas por município</SubTitle>
          <DataTable rows={[
            ["Município",       "Camada",                  "Geometria",  "Métrica calculada"],
            ["Porto Alegre",    "Eixos de Logradouros",    "Linha",      "Comprimento atingido (km)"],
            ["Porto Alegre",    "Lotes",                   "Polígono",   "Área atingida (ha), contagem"],
            ["Porto Alegre",    "Quarteirões",             "Polígono",   "Área atingida (ha), contagem"],
            ["Porto Alegre",    "Terminais / Paradas",     "Ponto",      "Contagem atingida"],
            ["Porto Alegre",    "Rede de Esgoto",          "Linha",      "Comprimento atingido (km)"],
            ["Porto Alegre",    "Hidrantes / Postes / Gás","Ponto",      "Contagem atingida"],
            ["Porto Alegre",    "Bocas de Lobo",           "Ponto",      "Contagem atingida"],
            ["Rio Grande",      "Logradouros",             "Linha",      "Comprimento atingido (km)"],
            ["Rio Grande",      "Quadras / Terrenos",      "Polígono",   "Área atingida (ha), contagem"],
            ["Rio Grande",      "Imóveis / Prédios Públicos","Polígono", "Área atingida (ha), contagem"],
            ["Rio Grande",      "Pontos de Segurança",     "Ponto",      "Contagem atingida"],
            ["Lajeado",         "Iluminação Pública",      "Ponto",      "Contagem atingida"],
            ["Lajeado",         "Logradouros / Lotes / Quadras","Linha/Polígono","Comprimento / Área atingida"],
            ["Eldorado do Sul", "Edificações",             "Polígono",   "Contagem e área construída atingida (m²)"],
          ]} />

          <SubTitle>Métricas calculadas</SubTitle>
          <ul className="list-disc list-inside space-y-1.5 text-sm">
            <li><strong>Contagem atingida</strong>: número de elementos com interseção com a mancha (<Math tex={"N_a = \\sum \\chi_i"} />).</li>
            <li><strong>Comprimento (km)</strong>: trecho de linhas dentro da mancha, calculado em EPSG:32722 e convertido para km.</li>
            <li><strong>Área (ha)</strong>: interseção geométrica de polígonos com a mancha, em EPSG:32722, convertida para hectares.</li>
            <li><strong>Percentual atingido</strong>: razão entre o total atingido e o total da camada dentro do município.</li>
          </ul>

          <Note type="info">
            Camadas de infraestrutura variam entre municípios conforme disponibilidade de dados
            abertos das prefeituras. Porto Alegre possui a cobertura mais abrangente via{" "}
            <ExtLink href="https://dadosabertos.poa.br">POA Dados Abertos</ExtLink>.
          </Note>

          <SubTitle>Origem dos dados</SubTitle>
          <DataTable rows={[
            ["Fonte",                         "Tipo",        "Municípios"],
            ["Prefeitura de Porto Alegre / EPTC", "Aberto", "Porto Alegre: logradouros, lotes, terminais, rede esgoto"],
            ["Prefeitura de Rio Grande",       "Fornecido",  "Rio Grande: logradouros, quadras, terrenos, imóveis"],
            ["Prefeitura de Lajeado",          "Fornecido",  "Lajeado: iluminação, logradouros, lotes, quadras"],
            ["Google Open Buildings",          "Aberto",     "Todos os municípios: edificações"],
          ]} />
          <SectionSources links={[
            ["POA Dados Abertos", "https://dadosabertos.poa.br"],
            ["EPTC Porto Alegre", "https://www2.portoalegre.rs.gov.br/eptc"],
          ]} />
        </Section>

        {/* ══════════════════════════════════════════════════════════════════════
            8. EDIFICAÇÕES
        ══════════════════════════════════════════════════════════════════════ */}
        <Section id="edificacoes" num="8" title="Edificações: Google Open Buildings">
          <p>
            A camada de edificações exibe <strong>polígonos de footprint de construções</strong>{" "}
            detectados por visão computacional a partir de imagens de satélite de alta resolução,
            fornecidos pelo{" "}
            <ExtLink href="https://sites.research.google/open-buildings/">
              Google Open Buildings
            </ExtLink>{" "}
            (Google Research, 2023). Cada feição representa a projeção horizontal da edificação
            e inclui a área estimada em m², a pontuação de confiança do modelo e o código
            Plus Code do centróide.
          </p>

          <SubTitle>Cobertura e filtragem por município</SubTitle>
          <p>
            O arquivo-fonte cobre todo o Rio Grande do Sul com <strong>7.438.931 edificações</strong>.
            Para cada município, as feições são recortadas pela bounding box territorial e
            filtradas por limiar mínimo de confiança do modelo de detecção:
          </p>
          <DataTable rows={[
            ["Município",       "Edificações BASE", "Confiança mínima", "Justificativa do limiar"],
            ["Porto Alegre",    "494.590",           "0,80",             "Reduz volume de ~998 mil para ~494 mil; área densa exige maior precisão"],
            ["Rio Grande",      "220.655",           "0,65",             "Limiar padrão (área mista urbana/rural)"],
            ["Eldorado do Sul", "142.554",           "0,65",             "Limiar padrão"],
            ["Lajeado",         "84.925",            "0,65",             "Limiar padrão"],
          ]} />
          <p>
            A pontuação de confiança (0–1) reflete a probabilidade de que a feição detectada
            seja de fato uma edificação. Valores abaixo do limiar tendem a corresponder a
            sombras, cobertura vegetal densa ou artefatos de processamento.
          </p>
          <p>
            Simplificação geométrica aplicada (tolerância 2 m, algoritmo Douglas-Peucker)
            para reduzir o número de vértices sem perda visual perceptível na escala municipal.
          </p>

          <SubTitle>Cálculo dos atingidos</SubTitle>
          <GeoCard
            title="Polígonos: Edificações"
            operation="geopandas.sjoin(predicate=intersects), pré-computado offline"
          >
            <p className="text-sm text-[#2f6a83] mb-2">
              Uma edificação <em>F</em> é classificada como atingida se seu polígono intersecta
              o polígono da mancha <em>M</em>:
            </p>
            <MathBlock exprs={[
              { tex: "\\text{atingida}(F) = \\mathbf{1}[F \\cap M \\neq \\emptyset]" },
            ]} />
          </GeoCard>

          <SubTitle>Indicadores calculados</SubTitle>
          <DataTable rows={[
            ["Indicador",                "Fórmula",                                                                     "Unidade"],
            ["Edificações atingidas",    <Math key="c" tex={"N_a = \\sum_{i} \\mathbf{1}[F_i \\cap M \\neq \\emptyset]"} />, "unidades"],
            ["Percentual atingido",      <Math key="p" tex={"P = N_a / N_t \\times 100\\,\\%"} />,                     "%"],
            ["Área construída atingida", <Math key="a" tex={"A_a = \\sum_{i:\\,\\text{atingida}} \\text{area\\_m2}_i"} />, "m²"],
          ]} />

          <Note type="warning">
            Os footprints são detectados por modelo de visão computacional; podem incluir
            estruturas provisórias, galpões, coberturas e feições não-residenciais.
            O limiar de confiança de 0,65 exclui a maioria dos falsos positivos, mas não
            todos. Recomenda-se interpretar as contagens como <em>estimativas de ordem de
            grandeza</em>, não como inventário cadastral preciso.
          </Note>
          <SectionSources links={[
            ["Google Open Buildings: Research Page", "https://sites.research.google/open-buildings/"],
            ["Google Open Buildings: Dataset (Earth Engine)", "https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_Research_open-buildings_v3_polygons"],
            ["Sirko et al. (2021): Continent-Scale Building Detection from High Resolution Satellite Imagery", "https://arxiv.org/abs/2107.12283"],
          ]} />
        </Section>

        {/* ══════════════════════════════════════════════════════════════════════
            9. DANOS OPERACIONAIS — DaLA
        ══════════════════════════════════════════════════════════════════════ */}
        <Section id="danos" num="9" title="Danos Operacionais: Metodologia DaLA">
          <p>
            A estimativa de perdas econômicas segue a metodologia{" "}
            <strong>DaLA (Damage and Loss Assessment)</strong>, desenvolvida pela CEPAL em
            parceria com o BID e o Banco Mundial, aplicada pela CEPAL na avaliação das enchentes
            RS/2024. O DaLA distingue dois conceitos:
          </p>
          <DataTable rows={[
            ["Conceito",  "Definição",                                           "Exemplo"],
            ["Danos",     "Destruição total ou parcial de ativos físicos (estoque)", "Edificação destruída, equipamento perdido"],
            ["Perdas",    "Fluxo de produção ou serviço não realizado durante a interrupção", "VAB não gerado, aulas não ministradas, consultas não realizadas"],
          ]} />
          <p>
            Este painel estima as <strong>perdas operacionais</strong>: o fluxo econômico que
            deixou de ocorrer. Os danos físicos (estoque) têm uma estimativa à parte, via
            protótipo CLIMADA; ver{" "}
            <a href="#dano-fisico" className="text-[#055071] font-semibold hover:underline underline-offset-4">
              Seção 10: Danos Físicos
            </a>.
          </p>

          <SubTitle>Curva de Recuperação Linear (DaLA)</SubTitle>
          <p>
            A produção não se recupera instantaneamente após o evento. O DaLA modela a
            recuperação como uma função linear: durante a{" "}
            <strong>fase aguda</strong> (d<sub>a</sub> dias) a capacidade produtiva é zero;
            durante a <strong>fase de recuperação</strong> (d<sub>r</sub> dias) ela retorna
            gradualmente, atingindo plena capacidade ao final. A perda integrada equivale a
            d<sub>a</sub> dias de produção zero mais d<sub>r</sub>/2 dias de produção perdida
            (média de 50% do fluxo durante a recuperação):
          </p>
          <MathBlock exprs={[
            { label: "Dias efetivos perdidos", tex: "d_{\\text{ef}} = d_a + \\dfrac{d_r}{2}" },
            { label: "Fator de interrupção",   tex: "f = \\dfrac{d_{\\text{ef}}}{365} \\in (0,\\,1)" },
          ]} />
          <DataTable rows={[
            ["Período",       "Fase aguda (dₐ)", "Recuperação (dᵣ)", "Dias ef.", "f",      "Base"],
            ["Maio 2024",     "30 dias",         "60 dias",          "60 dias",  "0,1644", "DaLA RS (CEPAL, nov. 2024)"],
            ["Setembro 2023", "15 dias",         "30 dias",          "30 dias",  "0,0822", "DaLA RS (CEPAL, nov. 2024)"],
          ]} />
          <Note type="info">
            A análise de sensibilidade do painel permite testar d<sub>ef</sub> = 30, 45 ou 60
            dias para todos os cenários: ver{" "}
            <a href="/danos" target="_blank" rel="noopener noreferrer"
              className="text-[#055071] font-semibold hover:underline underline-offset-4">
              página de Danos Operacionais ↗
            </a>.
          </Note>

          <SubTitle>Componente 1 · Empresas: Perda de VAB</SubTitle>
          <p>
            A RAIS fornece a folha salarial mensal por estabelecimento, mas não o Valor
            Adicionado Bruto (VAB). O método utilizado é a <strong>inversão pelo labor share
            setorial</strong>: abordagem padrão da contabilidade nacional quando apenas o
            dado salarial está disponível (Karabarbounis &amp; Neiman, 2014; IBGE SCN).
          </p>
          <p>
            O <em>labor share</em> (LS) mede a fração do VAB de um setor que corresponde à
            remuneração do trabalho. Os valores são extraídos diretamente da{" "}
            <strong>Tabela 17 do Sistema de Contas Nacionais (IBGE SCN 2021)</strong>, que
            publica Remunerações totais e VAB a preços básicos por atividade econômica:
          </p>
          <MathBlock exprs={[
            { label: "Labor share setorial", tex: "LS_s = \\dfrac{\\text{Remunerações}_s}{\\text{VAB}_s} \\quad \\text{(fonte: IBGE SCN 2021, Tab17)}" },
            { label: "VAB anual (est.)",     tex: "\\widehat{\\text{VAB}}_i = \\dfrac{w_{i,\\text{mensal}} \\times 12}{LS_s}" },
            { label: "Perda operacional",    tex: "\\Delta_i = \\widehat{\\text{VAB}}_i \\times f" },
            { label: "Total empresas",       tex: "L_{\\text{emp}} = \\sum_{i \\in \\text{atingidos}} \\Delta_i" },
          ]} />
          <DataTable rows={[
            ["Setor (CNAE)",         "Labor share (LS)",  "Fonte (IBGE SCN 2021, Tab17)"],
            ["Agropecuária (01–03)", "17,6%",             "SCN 2021, Tabela 17, linha Agropecuária"],
            ["Indústria (05–39)",    "33,8%",             "SCN 2021, Tabela 17, linha Indústria"],
            ["Construção (41–43)",   "43,3%",             "SCN 2021, Tabela 17, linha Construção"],
            ["Adm. Pública (84)",    "88,3%",             "SCN 2021, Tab17 (VAB ≈ custo salarial na Adm. Pública)"],
            ["Serviços (demais)",    "43,3%",             "SCN 2021, Tabela 17, linha Serviços"],
          ]} />
          <Note type="info">
            Estabelecimentos CNAE 84 (Administração Pública) são incluídos no cálculo; ver a
            nota detalhada e as limitações sobre esse ponto na{" "}
            <a href="#limitacoes"
              className="text-[#055071] font-semibold hover:underline underline-offset-4">
              Seção 12: Limitações ↓
            </a>.
          </Note>

          <SubTitle>Componente 2 · Educação: Custo de Reposição FUNDEB</SubTitle>
          <p>
            A Lei de Diretrizes e Bases (LDB, Art. 24, I) exige mínimo de 200 dias letivos
            por ano. Dias interrompidos por calamidade geram obrigação legal de reposição.
            O custo é estimado pelo Valor Anual por Aluno Total Mínimo (VAAT-MIN) do FUNDEB:
            dois componentes distintos, ambos com o mesmo custo unitário FUNDEB/aluno/dia:
          </p>
          <MathBlock exprs={[
            { label: "Custo por aluno/dia",         tex: "c = \\dfrac{\\text{VAAT-MIN}}{D_{\\text{letivos}}} = \\dfrac{\\text{R}\\$\\,8.481{,}21}{200} = \\text{R}\\$\\,42{,}41/\\text{aluno/dia}" },
            { label: "Perdas (serv. não prestado)", tex: "P_{\\text{edu}} = c \\times N_{\\text{alunos}} \\times d_a" },
            { label: "Custo adicional (reposição)", tex: "C_{\\text{adic}} = c \\times N_{\\text{alunos}} \\times d_a" },
            { label: "Total educação",              tex: "L_{\\text{edu}} = P_{\\text{edu}} + C_{\\text{adic}} = 2\\,c\\,N\\,d_a" },
          ]} />
          <p className="text-[12px] text-slate-600 mt-1">
            Usa <em>d</em><sub>a</sub> (dias de fechamento real), não <em>d</em><sub>ef</sub>,
            porque escolas são obrigadas a compensar 100% dos dias perdidos; não há recuperação
            parcial como em firmas.
          </p>
          <DataTable rows={[
            ["Parâmetro",      "Valor",       "Fonte"],
            ["VAAT-MIN 2024",  "R$ 8.481,21", "Portaria Interministerial MEC/MF nº 9, 28/08/2024"],
            ["Dias letivos",   "200/ano",     "LDB, Art. 24, I"],
            ["dₐ (Maio 2024)", "30 dias",     "DaLA RS (CEPAL, 2024)"],
            ["dₐ (Set. 2023)", "15 dias",     "DaLA RS (CEPAL, 2024)"],
          ]} />

          <SubTitle>Componente 3 · Saúde: Perda de Produção SUS</SubTitle>
          <p>
            A perda de produção do SUS é estimada pela receita de procedimentos não realizada
            durante a interrupção. A produção de cada unidade CNES é apurada a partir de dois
            sistemas de informação do DataSUS:
          </p>
          <DataTable rows={[
            ["Sistema", "Sigla", "Conteúdo", "Granularidade"],
            ["Sistema de Informações Ambulatoriais", "SIA",  "Procedimentos ambulatoriais aprovados (consultas, exames, terapias): valor em R$ por competência mensal e por CNES",      "Mensal por CNES"],
            ["Sistema de Informações Hospitalares",  "SIH",  "Autorizações de Internação Hospitalar (AIH) aprovadas: valor total das AIH pagas por competência mensal e por CNES", "Mensal por CNES"],
          ]} />
          <p>
            A produção disponível cobre <strong>7 meses</strong> (competências mais recentes
            disponíveis no DataSUS no momento da extração). Para obter uma estimativa anual,
            aplica-se uma projeção linear proporcional:
          </p>
          <MathBlock exprs={[
            { label: "Produção mensal (CNES k)", tex: "P_{\\text{mensal},k} = \\dfrac{P_{\\text{SIA},k} + P_{\\text{SIH},k}}{7}" },
            { label: "Produção anual",           tex: "P_k = P_{\\text{mensal},k} \\times 12" },
            { label: "Perda saúde",              tex: "L_{\\text{sau}} = \\sum_{k \\in \\text{atingidos}} P_k \\times f" },
          ]} />

          <SubTitle>Componente 4 · Agricultura: Custo Direto de Produção</SubTitle>
          <MathBlock exprs={[
            { label: "Perda agrícola", tex: "L_{\\text{agr}} = \\sum_{c \\in \\text{culturas}} A_c\\,[\\text{ha}] \\times \\text{Coef}_c\\,[\\text{R}\\$/\\text{ha}]" },
          ]} />
          <p>
            Custo fixo por área, independente de <em>f</em> (não é um fluxo contínuo,
            mas um custo incorrido no momento do evento).
          </p>
          <DataTable rows={[
            ["Cultura",                     "Período",    "Status",                      "Coef. (R$/ha)"],
            ["Soja",                        "Maio 2024",  "Colhida (fev–abr/2024)",      "R$ 1.100"],
            ["Arroz",                       "Maio 2024",  "Colhido (fev–abr/2024)",      "R$ 1.100"],
            ["Outras Lavouras Temporárias", "Maio 2024",  "Plantio inicial (mai/2024)",  "R$ 1.400"],
            ["Soja",                        "Set. 2023",  "Pré-plantio",                 "R$ 250"],
            ["Arroz",                       "Set. 2023",  "Pré-plantio",                 "R$ 250"],
            ["Outras Lavouras Temporárias", "Set. 2023",  "Colheita (set–out/2023)",     "R$ 2.800"],
          ]} />
          <p>
            Ver a delimitação espacial das áreas agrícolas na{" "}
            <a href="#agricultura" className="text-[#055071] font-semibold hover:underline underline-offset-4">
              Seção 4: Agricultura
            </a>.
          </p>

          <SubTitle>Perda total estimada</SubTitle>
          <MathBlock exprs={[
            { label: "Total (por cenário)", tex: "L_{\\text{total}} = L_{\\text{emp}} + L_{\\text{edu}} + L_{\\text{sau}} + L_{\\text{agr}}" },
          ]} />

          <SubTitle>Parâmetros consolidados</SubTitle>
          <DataTable rows={[
            ["Parâmetro",                   "Valor",          "Fonte"],
            ["VAAT-MIN FUNDEB 2024",        "R$ 8.481,21",    "Portaria Interministerial MEC/MF nº 9/2024"],
            ["Dias letivos/ano",            "200",            "LDB Art. 24, I"],
            ["Labor share (Agropecuária)",  "17,6%",          "IBGE SCN 2021, Tab17"],
            ["Labor share (Indústria)",     "33,8%",          "IBGE SCN 2021, Tab17"],
            ["Labor share (Adm. Pública)",  "88,3%",          "IBGE SCN 2021, Tab17"],
            ["Labor share (Serviços)",      "43,3%",          "IBGE SCN 2021, Tab17"],
            ["Fase aguda (Maio 2024)",      "30 dias",        "DaLA RS (CEPAL, 2024)"],
            ["Recuperação (Maio 2024)",     "60 dias",        "DaLA RS (CEPAL, 2024)"],
            ["Fase aguda (Set. 2023)",      "15 dias",        "DaLA RS (CEPAL, 2024)"],
            ["Recuperação (Set. 2023)",     "30 dias",        "DaLA RS (CEPAL, 2024)"],
            ["Meses SIA/SIH disponíveis",   "7 (jan–jul/24)", "DataSUS"],
          ]} />

          <SectionSources links={[
            ["CEPAL (2024): Avaliação dos Efeitos e Impactos das Inundações no Rio Grande do Sul", "https://www.cepal.org/pt-br/publicacoes/81035-avaliacao-efeitos-impactos-inundacoes-rio-grande-sul-novembro-2024"],
            ["PDNA Vol. A Guidelines (GFDRR/UNDP/BM, 2013)", "https://www.gfdrr.org/sites/default/files/2017-09/PDNA-Volume-A.pdf"],
            ["IBGE: SCN 2021, Tabela 17 (Tab17.xls)", "https://ftp.ibge.gov.br/Contas_Nacionais/Sistema_de_Contas_Nacionais/2021/tabelas_xls/sinoticas/"],
            ["Karabarbounis & Neiman (2014, QJE): The Global Decline of the Labor Share", "https://doi.org/10.1093/qje/qjt032"],
            ["LDB: Lei nº 9.394/1996, Art. 24", "https://www.planalto.gov.br/ccivil_03/leis/l9394.htm"],
            ["Portaria Interministerial MEC/MF nº 9, 28/08/2024 (VAAT-MIN FUNDEB 2024)", "https://www.fnde.gov.br"],
            ["CONAB: Preços Mínimos 2024", ""],
            ["MapBiomas: Coleção 10", "https://brasil.mapbiomas.org/downloads/mapas-para-download-geotiff/"],
            ["FNDE: FUNDEB 2024", "https://www.fnde.gov.br"],
            ["DataSUS: Produção Hospitalar SIH/SUS", "https://datasus.saude.gov.br/acesso-a-informacao/producao-hospitalar-sih-sus"],
            ["DataSUS: Produção Ambulatorial SIA/SUS", "https://datasus.saude.gov.br/acesso-a-informacao/producao-ambulatorial-sia-sus"],
          ]} />
        </Section>

        {/* ══════════════════════════════════════════════════════════════════════
            10. DANO FÍSICO — CLIMADA (PROTÓTIPO)
        ══════════════════════════════════════════════════════════════════════ */}
        {dadosClimada && (
        <Section id="dano-fisico" num="10" title="Danos Físicos: Por Cota do Rio e Metodologia CLIMADA">
          <SubTitle>Por Cota do Rio: Valor Exposto</SubTitle>
          <Note type="info">
            <strong>Exposição, não dano.</strong> A visão <em>Por cota</em> da aba Danos Físicos mostra o que fica sob água
            em cada cota do rio e o valor de reposição desses ativos (<em>valor exposto atingido</em>). É o{" "}
            <strong>teto</strong> do dano (equivale a perda total de tudo que molha), não uma estimativa dele. Não usa o
            modelo CLIMADA nem curva de dano, e não deve ser somado aos Danos Operacionais (Seção 9).
          </Note>

          <p>
            Cada cota é um cenário independente, associado a um raster de profundidade da água. Como os rasters não têm
            período de retorno, não há risco anual esperado (EAI) nem projeção 2050 nesta visão.
          </p>
          <DataTable rows={[
            ["Município", "Rasters de profundidade", "Cotas", "Observação"],
            ["Lajeado", "Rio Taquari", "18,45 a 34,45 m (passo 1 m)", "Altitude ortométrica; a régua do posto seria o raster + 0,55 m (hipótese do parecer do SGB, não confirmada pelo autor dos rasters)"],
            ["Porto Alegre", "Guaíba", "1,75 a 6,00 m (passo 0,25 m)", "Mesmo raster dos dois municípios; a cota é o rótulo do raster, sem conversão para a régua"],
            ["Eldorado do Sul", "Guaíba (mesmo de Porto Alegre)", "1,75 a 6,00 m (passo 0,25 m)", "A parte oeste do município fica fora da grade (profundidade 0, subestima)"],
          ]} />

          <SubTitle>Cálculo</SubTitle>
          <DataTable rows={[
            ["Etapa", "Descrição"],
            ["1. Pontos", "Camadas BASE de empresas, escolas e unidades de saúde (as mesmas do painel). Pontos geocodificados fora do polígono do município (malha municipal do IBGE) são excluídos."],
            ["2. Profundidade", "Amostragem do raster no pixel mais próximo do ponto (~5 m, EPSG:4326). Nodata e valores negativos viram 0."],
            ["3. Máximo acumulado", "A profundidade de cada ponto é o máximo entre a cota e as cotas anteriores: a água de uma cota maior cobre pelo menos o que a menor cobria."],
            ["4. Atingido", "O ponto é atingido quando a profundidade é maior que 0. Entra com 100% do valor, sem fração de dano."],
            ["5. Agregação", "Soma dos valores de reposição e dos atributos dos pontos atingidos, por categoria e por cota."],
          ]} />
          <MathBlock exprs={[
            { label: "Atingido na cota c", tex: "\\chi_i(c) = \\mathbf{1}\\left[\\max_{c' \\le c} h_i(c') > 0\\right]" },
            { label: "Valor exposto atingido", tex: "VE(c) = \\sum_i V_i \\cdot \\chi_i(c)" },
            { label: "Atributo ponderado", tex: "Q(c) = \\sum_i q_i \\cdot \\chi_i(c)" },
          ]} />
          <p className="text-sm text-[#2f6a83] mt-2">
            <Math tex={"h_i(c)"} />: profundidade do ponto <em>i</em> no raster da cota <em>c</em>. <Math tex={"V_i"} />: valor
            de reposição do ponto (seção &ldquo;Custo de reposição&rdquo; abaixo: CUB/RS × área por proxy de porte × fator de
            conteúdo). <Math tex={"q_i"} />: atributo do ponto (empregados, massa salarial, leitos, matrículas etc.). O fator de
            conteúdo vem de Huizinga et al. (2017), Tabela 3-26; a curva de dano (MDD), não.
          </p>

          <SubTitle>Indicadores por categoria</SubTitle>
          <DataTable rows={[
            ["Categoria", "Indicadores por cota", "Quebras"],
            ["Empresas (RAIS 2023)", "Estabelecimentos, empregados, massa salarial, salário médio (massa ÷ empregados) e valor exposto", "Setor CNAE (mesmos rótulos do painel)"],
            ["Saúde (CNES)", "Estabelecimentos, leitos, profissionais e valor exposto", "Categoria profissional (CBO) e tipo de unidade"],
            ["Educação (Censo Escolar 2024)", "Escolas, matrículas, docentes e valor exposto", "Etapa de ensino e dependência administrativa"],
            ["Agricultura (MapBiomas 2024)", "Área sob água (ha) e % da área da cultura", "Cultura. Sem valor em R$: não há valor de reposição para lavouras"],
          ]} />
          <p>
            <strong>Agricultura.</strong> Os polígonos da cultura são rasterizados na grade do raster de profundidade e soma-se a
            área dos pixels com água (a área de cada pixel é calculada pela latitude; máximo acumulado entre cotas). A área total
            da cultura, usada no percentual, é a soma geodésica dos polígonos (elipsoide WGS84), independente da grade; a área fora
            da grade conta como seca e subestima o atingido.
          </p>

          <SubTitle>Diferenças em relação à Sobreposição Espacial (Seção 2)</SubTitle>
          <DataTable rows={[
            ["Aspecto", "Sobreposição Espacial (Seção 2)", "Por Cota"],
            ["Insumo", "Polígono vetorial da mancha do cenário", "Raster de profundidade por cota (~5 m)"],
            ["Ponto atingido", "Ponto dentro da mancha (within)", "Profundidade > 0 no pixel mais próximo, com máximo acumulado entre cotas"],
            ["Polígonos (agricultura)", "intersects + intersection(), área em UTM 22S (EPSG:32722)", "Rasterização na grade e soma da área dos pixels com água"],
            ["Filtro por município", "Empresas e escolas dentro do município (IBGE)", "Empresas, escolas e unidades de saúde dentro do município (malha IBGE)"],
          ]} />

          <SubTitle>Limitações da visão por cota</SubTitle>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
            <li><strong>Exposição, não dano:</strong> o dano real fica entre zero e o valor exposto.</li>
            <li><strong>Coordenadas repetidas:</strong> muitos estabelecimentos compartilham o mesmo ponto, e a maior pilha de cada município reúne dezenas ou centenas de ruas e bairros, indicando que a geocodificação caiu num ponto padrão. A base é mantida como reportada: cada pilha entra de uma vez, com a profundidade de um único pixel, o que gera degraus no valor por cota.</li>
            <li><strong>Valor de reposição estimado</strong> (CUB/RS × área por proxy de porte), não valor de mercado.</li>
            <li><strong>Setores não disjuntos:</strong> empresas de saúde e educação (RAIS) também aparecem nas camadas CNES e Censo Escolar, então a soma dos três setores não é de ativos disjuntos.</li>
            <li><strong>Pontos fora da grade do raster</strong> entram com profundidade 0 (subestima), principalmente em Eldorado do Sul.</li>
            <li><strong>Pontos fora do município</strong> (coordenada do CNES, RAIS ou Censo em outro local) são excluídos do cálculo; a contagem aparece nas Limitações da aba.</li>
            <li><strong>Pontos no leito do rio ou lago:</strong> na cota mais baixa já há pontos molhados; são mantidos, pois cada cota é um cenário.</li>
          </ul>

          <SubTitle>Por Período de Retorno: Metodologia CLIMADA</SubTitle>
          <Note type="info">
            <strong>Protótipo exploratório</strong>, não uma métrica oficial do painel. Mede{" "}
            <strong>destruição de patrimônio</strong> (estoque: prédio + equipamento), diferente
            da metodologia DaLA acima, que mede perdas de fluxo (Seção 9). Resultados, comparativo
            por período de retorno e limitações completas na{" "}
            <a href="/danos?aba=climada" target="_blank" rel="noopener noreferrer"
              className="font-semibold hover:underline underline-offset-4">
              página de Danos, aba Danos Físicos ↗
            </a>.
          </Note>

          <SubTitle>Curvas de Dano (Profundidade → MDD)</SubTitle>
          <p>
            MDD (<em>Mean Damage Degree</em>) é a fração do valor de reposição do ativo destruída
            em cada profundidade de água. Curvas calibradas pelo CLIMADA para Porto Alegre a
            partir da base JRC (Huizinga et al., 2017).
          </p>
          <div className="bg-white border border-[#b3cdd8] rounded-xl p-5 shadow-sm mt-3">
            <p className="text-[10px] text-slate-600 font-medium mb-2">
              Eixo horizontal: profundidade da água no ponto (m). Eixo vertical: % do valor do
              imóvel destruída nessa profundidade. Curva mais alta/íngreme no início = setor mais
              vulnerável a alagamentos rasos; todas achatam (platô) a partir de ~2-3m, quando o
              dano já atingiu o teto do modelo.
            </p>
            <CurvasChart curvas={dadosClimada.premissas.curvas} />
            <div className="flex gap-4 flex-wrap mt-4 justify-center">
              {Object.keys(dadosClimada.premissas.curvas).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: SETOR_COLORS[s] }} />
                  <span className="text-[10px] text-slate-600 font-medium">{SETOR_LABEL[s] ?? s}</span>
                </div>
              ))}
            </div>
          </div>
          <DataTable rows={[
            ["Setor", "Porte usado p/ ponderar", "Fonte da curva de dano"],
            ...Object.entries(dadosClimada.premissas.curvas).map(([s, c]) => [
              SETOR_LABEL[s] ?? s,
              PORTE_LABEL[c.porte_campo] ?? c.porte_campo,
              <span key="f" className="text-[11px]">{c.fonte}</span>,
            ]),
          ]} />
          <SectionSources links={[
            ["Huizinga, J., de Moel, H. & Szewczyk, W. (2017): Global flood depth-damage functions (JRC105688)", "https://publications.jrc.ec.europa.eu/repository/bitstream/JRC105688/global_flood_depth-damage_functions__10042017.pdf"],
            ["CLIMADA: plataforma de modelagem de risco climático (ETH Zürich)", "https://climada-python.readthedocs.io/"],
          ]} />

          <SubTitle>Fórmula geral</SubTitle>
          <MathBlock exprs={[
            { label: "Dano físico", tex: "D_i = \\text{MDD}(h_i) \\times PAA \\times V_i" },
            { label: "PAA", tex: "PAA = 1" },
          ]} />
          <p className="text-[12px] text-slate-600">
            <Math tex="D_i" />: dano físico do ponto <Math tex="i" />.{" "}
            <Math tex="\text{MDD}(h_i)" />: fração do valor destruída na profundidade{" "}
            <Math tex="h_i" /> (curvas acima). PAA: percentual de ativos afetados, fixo em 1
            quando há profundidade {'>'} 0. <Math tex="V_i" />: valor de reposição do ponto.
          </p>

          <SubTitle>Profundidade</SubTitle>
          <p>
            Amostrada do raster de profundidade máxima do CLIMADA correspondente ao período de
            retorno (RP) selecionado (vizinho mais próximo, ~90 m/pixel) em cada ponto
            geocodificado de empresa, escola ou unidade de saúde.
          </p>

          <SubTitle>Custo de reposição</SubTitle>
          <p>
            Estimativa de custo de reposição a partir de referências brasileiras reais e
            datadas, com dois componentes: construção e conteúdo/equipamento.
          </p>
          <MathBlock exprs={[
            { label: "Empresas", tex: "V_i = a \\times N_i \\times c_{\\text{com}} \\times k_{\\text{com}}" },
            { label: "Saúde", tex: "V_i = a \\times N_i \\times c_{\\text{inst}} \\times k_{\\text{sau}}" },
            { label: "Educação", tex: "V_i = S_i \\times a_{\\text{sala}} \\times c_{\\text{inst}} \\times k_{\\text{edu}}" },
          ]} />
          <p className="text-[12px] text-slate-600">
            Nas Empresas, os pontos com CNAE industrial ({dadosClimada.premissas.n_empresas_industria} de{" "}
            {dadosClimada.premissas.n_empresas_total.toLocaleString("pt-BR")} estabelecimentos) usam{" "}
            <Math tex="c_{\text{ind}}" /> e <Math tex="k_{\text{ind}}" /> em vez de{" "}
            <Math tex="c_{\text{com}}" /> e <Math tex="k_{\text{com}}" />; o resto (comércio,
            serviços, agropecuária e administração pública) segue com o tratamento comercial abaixo.
          </p>
          <DataTable rows={[
            ["Símbolo", "Significado", "Valor", "Fonte"],
            [<Math key="s" tex="a" />, "Área construída por pessoa (Empresas/Saúde)", `${dadosClimada.premissas.area_m2_por_pessoa.toFixed(0)} m²/pessoa`, "Manual de Padrão de Ocupação e Dimensionamento de Ambientes em Imóveis, Projeto Racionaliza, Min. da Gestão"],
            [<Math key="s" tex="a_{\text{sala}}" />, "Área construída por sala de aula (Educação)", `${dadosClimada.premissas.area_por_sala_m2.toFixed(2)} m²/sala`, "derivado do projeto padrão FNDE, ver abaixo"],
            [<Math key="s" tex="c_{\text{com}}" />, "Custo de construção, categoria comercial", `${fmtBRLPreciso(dadosClimada.premissas.cub_comercial_rs)}/m²`, "Sinduscon-RS, CUB/RS dez/2024, categoria CSL 8-N"],
            [<Math key="s" tex="c_{\text{inst}}" />, "Custo de construção, categoria institucional", `${fmtBRLPreciso(dadosClimada.premissas.cub_institucional_rs)}/m²`, "Sinduscon-RS, CUB/RS dez/2024, categoria PP 4-N"],
            [<Math key="s" tex="c_{\text{ind}}" />, "Custo de construção, categoria industrial (Empresas com CNAE industrial)", `${fmtBRLPreciso(dadosClimada.premissas.cub_industrial_rs)}/m²`, "Sinduscon-RS, CUB/RS dez/2024, categoria GI (Galpão Industrial)"],
            [<Math key="s" tex="k_{\text{com}}, k_{\text{ind}}, k_{\text{res}}" />, "Conteúdo/equipamento, % do valor de construção", "100% / 150% / 50%", "Huizinga, de Moel & Szewczyk (2017), Table 3-26"],
            [<Math key="s" tex="N_i" />, "Porte do ponto i (vínculos ou leitos/profissionais)", "por ponto", "RAIS / CNES"],
            [<Math key="s" tex="S_i" />, "Salas de aula equivalentes da escola i", "por ponto", "Censo Escolar, ver abaixo"],
          ]} />
          <p>
            O CUB (Custo Unitário Básico) só cobre a casca construtiva: o próprio Sinduscon-RS
            declara que a tabela exclui equipamentos e instalações. Isso subestimaria o valor em
            risco, já que o CLIMADA (via JRC) trata &ldquo;dano máximo&rdquo; como estrutura mais conteúdo
            somados. A Table 3-26 do relatório JRC (Huizinga et al., 2017) informa o conteúdo
            como percentual do valor da construção por categoria de uso: Residencial 50%,
            Comercial 100%, Industrial 150%. Essas categorias são aplicadas como multiplicador{" "}
            <Math tex="k = 1 + \%_{\text{conteúdo}}" /> sobre o valor de construção:
          </p>
          <DataTable rows={[
            ["Setor", "Categoria JRC usada", <span key="k">Multiplicador (<Math tex="k" />)</span>, "Justificativa"],
            ["Empresas", "Commercial (100%)", `${dadosClimada.premissas.multiplicador_empresas.toFixed(2)}×`, "categoria direta da Table 3-26"],
            ["Empresas (CNAE industrial)", "Industrial (150%)", `${dadosClimada.premissas.multiplicador_empresas_industria.toFixed(2)}×`, "categoria direta da Table 3-26, aplicada aos estabelecimentos com CNAE 05-39"],
            ["Saúde", "média Commercial + Industrial", `${dadosClimada.premissas.multiplicador_saude.toFixed(2)}×`, "aparelhagem médica e farmácia têm caráter mais industrial que uma loja comum, mesma lógica do blend usado na curva MDD"],
            ["Educação", "Residential (50%)", `${dadosClimada.premissas.multiplicador_educacao.toFixed(2)}×`, "mobiliário e material didático, sem estoque comercial para vender"],
          ]} />
          <p>
            O CUB também não tem categoria própria para escola ou unidade de saúde: PP 4-N
            (prédio público/institucional simples, sem elevador) é a aproximação disponível mais
            próxima.
          </p>
          <p>
            RAIS e CNES não têm contagem de professores e funcionários, então nem &ldquo;área por
            pessoa&rdquo; (como em Empresas/Saúde) nem &ldquo;área por matrícula&rdquo; direto são boas
            aproximações: as duas ignoram o espaço de apoio (administração, cozinha, banheiros,
            circulação) que a escola precisa além das salas de aula, e esse espaço escala com o{" "}
            <em>tamanho da escola</em>, não com o aluno isolado. A saída: estimar quantas{" "}
            <strong>salas de aula</strong> a matrícula implica, e converter salas em área pela
            mesma proporção do projeto padrão FNDE: assim o espaço de apoio fica embutido
            proporcionalmente, sem precisar saber quantos funcionários a escola tem.
          </p>
          <MathBlock exprs={[
            { label: "Área por sala", tex: `a_{\\text{sala}} = \\dfrac{A_{\\text{esc}}}{6} = \\dfrac{${dadosClimada.premissas.area_escola_padrao_m2.toLocaleString("pt-BR")}}{6} \\approx ${dadosClimada.premissas.area_por_sala_m2.toFixed(2)}\\,\\text{m}^2` },
            { label: "Salas necessárias", tex: "S_i = \\dfrac{M_i}{T \\times L}" },
          ]} />
          <p>
            <Math tex="M_i" /> é a matrícula da escola numa etapa, <Math tex="L" /> é
            a lotação máxima por turma dessa etapa, e <Math tex="T" /> é o número de turnos
            (a maioria das escolas funciona em dois turnos, manhã e tarde: a mesma sala atende
            grupos diferentes de alunos ao longo do dia, então a matrícula anual é bem maior que a
            ocupação simultânea que a sala precisa suportar). O total de salas de uma escola soma
            essa conta por etapa:
          </p>
          <DataTable rows={[
            ["Etapa", <span key="l">Lotação máxima por turma (<Math tex="L" />)</span>, <span key="t">Turnos (<Math tex="T" />)</span>, "Fonte"],
            ["Educação Infantil", `${dadosClimada.premissas.lotacao_infantil} alunos/turma`, `${dadosClimada.premissas.turnos_padrao}`, "CNE/CEB Resolução nº 1/2024, Art. 6º-V (faixa de 4-5 anos, a mais numerosa da pré-escola)"],
            ["Ensino Fundamental (+ Especial)", `${dadosClimada.premissas.lotacao_fundamental} alunos/turma`, `${dadosClimada.premissas.turnos_padrao}`, "Média ponderada dos limites da rede estadual RS por ano (25 no 1º ano, 30 do 2º ao 4º, 35 do 5º ao 9º)"],
            ["Ensino Médio, Profissional e EJA", `${dadosClimada.premissas.lotacao_medio} alunos/turma`, `${dadosClimada.premissas.turnos_padrao}`, "Parecer CEEd/RS nº 580/2000, também usado para Profissional/EJA por falta de norma específica"],
          ]} />
          <p className="text-[12px] text-slate-600">
            Área construída do projeto padrão FNDE (6 salas): {dadosClimada.premissas.area_escola_padrao_m2.toLocaleString("pt-BR")} m².
            Cobre salas de aula, bloco administrativo, cozinha, banheiros, circulação e pátio
            coberto (área construída total do prédio, não só as 6 salas); não inclui quadra
            coberta nem área externa descoberta.
          </p>
          <SectionSources links={[
            ["Sinduscon-RS: Preços e Custos da Construção, CUB/RS dezembro/2024", "https://sinduscon-rs.com.br/wp-content/uploads/2025/01/PRECOS-E-CUSTOS-DA-CONSTRUCAO-JANEIRO-2025.pdf"],
            ["FNDE: planilha orçamentária, projeto padrão Escola 6 Salas", "https://www.fnde.gov.br/phocadownload/programas/plano_de_acoes_articuladas/projetos_arquitetonicos/planilhas_orcamentarias/planilha_orcamentaria_6salas.pdf"],
            ["CNE/CEB: Resolução nº 1, de 17 de outubro de 2024 (lotação máxima na Educação Infantil)", "https://abmes.org.br/arquivos/legislacoes/Resolucao-cne-ceb-001-2024-10-17.pdf"],
            ["CEEd/RS: Parecer nº 580/2000 (lotação máxima no Ensino Médio)", "https://www.ceed.rs.gov.br/parecer-n-0580-2000-revogado-pela-resolucao-n-340-2018"],
            ["Manual de Padrão de Ocupação e Dimensionamento de Ambientes em Imóveis (Projeto Racionaliza, Min. da Gestão)", "https://www.gov.br/gestao/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/projeto-racionaliza/manual-racionalia-v1-1-junho-2022.pdf"],
            ["Huizinga, J., de Moel, H. & Szewczyk, W. (2017): Global flood depth-damage functions (JRC105688), Table 3-26", "https://publications.jrc.ec.europa.eu/repository/bitstream/JRC105688/global_flood_depth-damage_functions__10042017.pdf"],
          ]} />

          <SubTitle>Fator de recalibração de Porto Alegre</SubTitle>
          <p>
            A amplitude bruta da curva JRC (Huizinga et al., 2017) superestimava a perda
            observada em Porto Alegre em maio de 2024. A curva de Empresas foi recalibrada
            usando o RP200 como âncora:
          </p>
          <MathBlock exprs={[
            { label: "Fator POA", tex: `\\lambda = \\dfrac{\\text{MDD}_{\\text{ajustado}}}{\\text{MDD}_{\\text{JRC}}} = ${dadosClimada.premissas.poa_calibration_factor.toFixed(6)}` },
          ]} />
          <p>
            É a única evidência empírica disponível de quanto reduzir a curva bruta para esta
            cidade, reaproveitada na curva sintetizada de Saúde (que não tem âncora própria).
            O fator afeta a <em>curva de dano</em> (fração destruída por profundidade),
            independentemente da mudança no <em>valor de reposição</em> descrita acima.
          </p>

          <Note type="warning">
            Premissas explícitas que precisam de validação antes de qualquer uso além de
            exploração metodológica: ver a lista completa na{" "}
            <a href="#limitacoes"
              className="font-semibold hover:underline underline-offset-4">
              Seção 12: Limitações ↓
            </a>.
          </Note>

          <SectionSources links={[
            ["CLIMADA: plataforma de modelagem de risco climático (ETH Zürich)", "https://climada-python.readthedocs.io/"],
            ["Huizinga, J., de Moel, H. & Szewczyk, W. (2017): Global flood depth-damage functions (JRC105688)", "https://publications.jrc.ec.europa.eu/repository/bitstream/JRC105688/global_flood_depth-damage_functions__10042017.pdf"],
            ["Sinduscon-RS: Preços e Custos da Construção, CUB/RS dezembro/2024", "https://sinduscon-rs.com.br/wp-content/uploads/2025/01/PRECOS-E-CUSTOS-DA-CONSTRUCAO-JANEIRO-2025.pdf"],
            ["FNDE: planilha orçamentária, projeto padrão Escola 6 Salas", "https://www.fnde.gov.br/phocadownload/programas/plano_de_acoes_articuladas/projetos_arquitetonicos/planilhas_orcamentarias/planilha_orcamentaria_6salas.pdf"],
            ["Manual de Padrão de Ocupação e Dimensionamento de Ambientes em Imóveis (Projeto Racionaliza, Min. da Gestão)", "https://www.gov.br/gestao/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/projeto-racionaliza/manual-racionalia-v1-1-junho-2022.pdf"],
            ["Comparativo CCDR × DaLA (pipeline/docs/comparativo_ccdr_dala.md, mesmo repositório)", ""],
            ["pipeline/climada_risco_prototipo.py: script fonte deste protótipo", ""],
          ]} />
        </Section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            11. POPULAÇÃO EXPOSTA
        ══════════════════════════════════════════════════════════════════════ */}
        <Section id="populacao" num="11" title="População Exposta: WorldPop 2024">
          <p>
            A camada de população exposta quantifica o número de habitantes residentes dentro
            de cada mancha de inundação, cruzando as geometrias de flood extent com o raster
            de população do{" "}
            <ExtLink href="https://data.humdata.org/dataset/worldpop-population-counts-for-brazil">WorldPop</ExtLink>.
            Esse dado complementa as estimativas de danos operacionais com a perspectiva humana
            direta: <strong>quantas pessoas vivem na área afetada</strong>.
          </p>

          <SubTitle>Fonte dos dados</SubTitle>
          <DataTable rows={[
            ["Atributo",      "Valor"],
            ["Produto",       "WorldPop Global Mosaic 2024: Population Counts (Constrained)"],
            ["Sigla do arquivo", "bra_pop_2024_CN_100m_R2025A_v1.tif"],
            ["Tipo",          "Constrained (CN), ajustado ao censo demográfico brasileiro"],
            ["Resolução",     "100 m × 100 m por pixel (~1 ha)"],
            ["CRS",           "WGS 84 geográfico (EPSG:4326)"],
            ["Unidade",       "Número de habitantes por pixel"],
            ["Cobertura",     "Brasil inteiro"],
            ["Referência",    "Estimativa para 2024 (Revisão A, 2025)"],
            ["Repositório",   "Humanitarian Data Exchange (HDX), data.humdata.org"],
          ]} />

          <SubTitle>Método de cálculo</SubTitle>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-700 mt-2">
            <li>
              <strong>Limite municipal</strong>: polígono oficial obtido via API de malhas do
              IBGE, utilizado para recortar o raster ao território de cada município.
            </li>
            <li>
              <strong>População total municipal</strong>: recorte do raster pelo limite municipal;
              soma de todos os pixels com valor positivo (pixels sem dado excluídos).
            </li>
            <li>
              <strong>População atingida por cenário</strong>: recorte pela interseção da mancha de
              inundação com o limite municipal; mesma operação de soma. A interseção é necessária
              porque algumas manchas se estendem sobre municípios vizinhos (a ADA de Porto Alegre,
              por exemplo, cobre áreas de Canoas), cuja população não pertence à região-foco.
            </li>
            <li>
              <strong>Heatmap</strong>: raster recortado pelo limite municipal convertido a imagem
              colorida com paleta <em>plasma</em> em escala logarítmica, sobreposto ao mapa
              interativo para visualização da densidade populacional.
            </li>
          </ol>

          <SubTitle>Fórmulas</SubTitle>
          <MathBlock exprs={[
            { label: "Pop. total",    tex: "P_{\\text{total}}(M) = \\sum_{(i,j)\\,\\in\\,\\text{Município}(M)} \\text{pop}_{ij}" },
            { label: "Pop. atingida", tex: "P_{\\text{atingida}}(M,C) = \\sum_{(i,j)\\,\\in\\,\\text{Mancha}(M,C)} \\text{pop}_{ij}" },
            { label: "% exposta",     tex: "\\% = \\dfrac{P_{\\text{atingida}}}{P_{\\text{total}}} \\times 100" },
          ]} />

          <SubTitle>Limitações</SubTitle>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-700">
            <li>
              Os modelos WorldPop são estimativas estatísticas baseadas em dados censitários de
              2022 e covariáveis geoespaciais (construções, uso do solo, luminosidade noturna);
              não capturam migrações pós-enchente nem desalojamentos.
            </li>
            <li>
              A resolução de 100 m é adequada para análises municipais, mas pode superestimar
              a população em áreas de uso misto (industrial/comercial) onde residentes não existem.
            </li>
            <li>
              A população <em>exposta</em> (dentro da mancha) não equivale a população{" "}
              <em>afetada</em> (que efetivamente sofreu impactos): parte das edificações pode
              ter sido evacuada antes da inundação ou estar em pavimentos superiores.
            </li>
          </ul>

          <SectionSources links={[
            ["WorldPop (2025): Brazil Population Counts 100m 2024, constrained individual countries", "https://data.humdata.org/dataset/worldpop-population-counts-for-brazil"],
            ["IBGE: Malhas Municipais (API v3)", "https://servicodados.ibge.gov.br/api/v3/malhas/municipios/"],
            ["rasterio: Raster I/O in Python", "https://rasterio.readthedocs.io"],
          ]} />
        </Section>

        {/* ══════════════════════════════════════════════════════════════════════
            12. LIMITAÇÕES
        ══════════════════════════════════════════════════════════════════════ */}
        <Section id="limitacoes" num="12" title="Limitações e Ressalvas Metodológicas">
          <p>
            Esta seção consolida todas as limitações, premissas e ressalvas metodológicas dos
            resultados do painel (anteriormente distribuídas entre as páginas de Perdas
            Operacionais e Danos Físicos), organizadas em três eixos: por{" "}
            <a href="#lim-cenarios" className="font-semibold underline underline-offset-4">
              cenário
            </a>
            , por{" "}
            <a href="#lim-metodologia" className="font-semibold underline underline-offset-4">
              metodologia
            </a>{" "}
            e por{" "}
            <a href="#lim-municipio" className="font-semibold underline underline-offset-4">
              município e geocodificação
            </a>
            .
          </p>

          <GroupTitle id="lim-cenarios">A. Por cenário</GroupTitle>

          <SubTitle nested>Cenário ADA (Eldorado do Sul e Porto Alegre)</SubTitle>
          <ul className="ml-1 list-inside list-disc space-y-1.5 text-sm text-slate-700">
            <li>
              Polígono de extensão máxima registrada pelo MUP/Gov. RS em maio de 2024: trata todos
              os pontos no interior como atingidos de forma binária (dentro/fora), sem distinguir
              lâmina d&apos;água rasa de submersão profunda.
            </li>
            <li>
              Os cenários representam eventos independentes ou recortes alternativos e seus valores
              não devem ser somados entre si.
            </li>
          </ul>

          <SubTitle nested>Cenário Maio 2024 + 50% (Rio Grande)</SubTitle>
          <ul className="ml-1 list-inside list-disc space-y-1.5 text-sm text-slate-700">
            <li>
              O nome &ldquo;+50%&rdquo; é herdado da fonte dos dados: a mancha corresponde à água
              60 cm mais alta que o pico de maio de 2024 e tem 59,4 km² (cerca de 7 vezes a área da
              mancha de Maio de 2024 sem o acréscimo). É um cenário de sensibilidade, não uma
              previsão.
            </li>
          </ul>

          <SubTitle nested>Simulação por Cotas (Lajeado, Porto Alegre, Eldorado do Sul e Rio Grande)</SubTitle>
          <ul className="ml-1 list-inside list-disc space-y-1.5 text-sm text-slate-700">
            <li>
              Mostra a exposição de empresas, educação, saúde e agricultura em função do nível do
              rio/lagoa. Em Rio Grande (1,00 / 1,50 / 2,00 / 2,50 / 2,62 m — a última é o pico de
              21/05/2024, só 0,12 m acima da anterior), as manchas são máscaras binárias
              (molhado/seco, união das bacias hidrográficas, sem profundidade), razão pela qual não
              há curva de dano, faixas de profundidade nem profundidade média naquele município.
            </li>
            <li>
              Aplica-se o máximo acumulado entre cotas por ponto (e por pixel, na agricultura) para
              garantir monotonicidade (a água de uma cota superior cobre pelo menos o que a cota
              inferior cobria), corrigindo células que ficam mais rasas entre cotas consecutivas nos
              rasters brutos. Amostragem por vizinho mais próximo (~5 m em Lajeado, Porto Alegre e
              Eldorado do Sul; ~1 m nas máscaras binárias de Rio Grande).
            </li>
            <li>
              Sem período de retorno ou frequência associada a cada cota, não há risco anual
              esperado (EAI) nem projeção 2050 na visão por cota.
            </li>
          </ul>

          <GroupTitle id="lim-metodologia">B. Por metodologia</GroupTitle>

          <SubTitle nested>Perdas Operacionais (DaLA · Seção 9)</SubTitle>
          <ul className="ml-1 list-inside list-disc space-y-1.5 text-sm text-slate-700">
            <li>
              <strong>Fluxo vs. estoque:</strong> mede interrupção de <em>fluxo</em> (produção e
              serviços não realizados), não destruição de <em>estoque</em> (prédios e equipamentos).
              Não deve ser somado à exposição por cota nem ao dano físico (CLIMADA).
            </li>
            <li>
              <strong>Fator de interrupção (<em>f</em>):</strong> representa a fração do ano em que a
              atividade ficou parada (<Math tex="f = d_{\text{ef}} / 365" />, onde{" "}
              <Math tex="d_{\text{ef}} = d_a + 0{,}5 \times d_r" />). Ex.: 60 dias efetivos →{" "}
              <Math tex="f = 0{,}1644" /> (≈ 16,4% de um ano de atividade perdida). Multiplica as
              bases anuais de Empresas (VAB anual) e Saúde (produção SUS anual); Educação (custo
              FUNDEB por aluno/dia de fechamento real <Math tex="d_a" />) e Agricultura (R$/ha fixo
              no estágio da cultura) não utilizam <Math tex="f" />.
            </li>
            <li>
              <strong>Setor formal e Educação:</strong> considera apenas vínculos formais da RAIS
              2023; o setor informal não está representado. Na educação, o custo unitário diário
              (VAAT-MIN/200) é aplicado a todas as matrículas atingidas (inclusive rede privada) e
              duplicado para somar serviço não prestado e reposição obrigatória (LDB Art. 24, I).
            </li>
          </ul>

          <SubTitle nested>Administração Pública (CNAE 84) nas Perdas Operacionais</SubTitle>
          <p>
            Os estabelecimentos com CNAE 84 (
            <em>Administração Pública, Defesa e Seguridade Social</em>) são{" "}
            <strong>incluídos</strong> na estimativa de Perdas Operacionais: a interrupção de
            serviços governamentais representa perdas reais para a sociedade, conforme a metodologia
            DaLA (CEPAL, 2024).
          </p>
          <DataTable
            rows={[
              ["Indicador (Porto Alegre / Cenário ADA)", "Valor"],
              ["Estabelecimentos CNAE 84", "51"],
              ["Participação na massa salarial atingida", "45,3% (R$ 559,7 mi/mês)"],
              ["Contribuição ao total (60 dias efetivos)", "≈ R$ 1,25 bi de R$ 4,42 bi (28,3%)"],
            ]}
          />
          <Note type="warning">
            O <em>labor share</em> de Administração Pública (88,3%) é elevado, pois o VAB deste
            setor nas Contas Nacionais é predominantemente composto por remunerações. Leitores que
            desejam avaliar apenas o setor privado devem subtrair a contribuição do CNAE 84 dos
            valores apresentados.
          </Note>

          <SubTitle nested>Por que não usar ICMS como alternativa nas Perdas Operacionais?</SubTitle>
          <div className="mt-1 mb-2 space-y-1.5 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 text-[11px] leading-relaxed text-amber-900">
            <p>
              A arrecadação de ICMS municipal (SEFAZ-RS) foi avaliada como possível proxy de VAB
              perdido, seguindo abordagem similar à adotada pela CEPAL (2024) em nível estadual via
              série ARIMA. A validação cruzada realizada identificou três limitações estruturais que
              inviabilizam o ICMS como substituto do método RAIS + <em>labor share</em> em escala
              municipal:
            </p>
            <ul className="list-none space-y-1 pl-1">
              <li>
                <strong>1. Domicílio fiscal fora do município atingido.</strong> Em Lajeado, o{" "}
                <em>shortfall</em> de ICMS em maio/2024 foi de apenas R$ 8 mil, enquanto nosso VAB
                estimado implica R$ 1,90 mi de queda de ICMS (razão de 225×). Grandes empregadoras
                como a Tramontina recolhem ICMS na sede em Carlos Barbosa (RS), não em Lajeado,
                tornando o ICMS municipal dissociado da atividade econômica local.
              </li>
              <li>
                <strong>2. Cobertura setorial parcial.</strong> O ICMS incide sobre circulação de
                mercadorias e alguns serviços de comunicação e transporte. Serviços em geral, que
                representam a maior parcela do VAB nas cidades maiores, recolhem ISS ao município,
                não ICMS ao Estado. Em Porto Alegre, o ICMS capturou apenas R$ 136,8 mi de{" "}
                <em>shortfall</em> frente a R$ 389 mi implicados pelo VAB estimado (razão 2,84×),
                refletindo que bancos, consultorias e tecnologia estão fora do escopo do ICMS.
              </li>
              <li>
                <strong>3. Timing divergente e efeitos de compensação.</strong> Em Rio Grande, o ICMS
                de maio/2024 apresentou alta de +43,8% em relação ao baseline, enquanto o evento de
                cheia afetou principalmente abril/2024 (−41,4%). O movimento positivo em maio reflete
                provavelmente a refinaria e o porto (atividades não atingidas), além de demanda
                emergencial de combustíveis. O ICMS municipal, por ser agregado, não permite isolar a
                parcela gerada por estabelecimentos dentro da mancha de inundação.
              </li>
            </ul>
            <p>
              O método RAIS + <em>labor share</em> resolve as três limitações: opera no nível do
              estabelecimento (CNPJ), aplica o teste ponto-em-polígono para isolar apenas firmas
              dentro da mancha e cobre todos os setores formais independentemente do tributo
              recolhido. O ICMS permanece útil apenas como sinal de validação de ordem de grandeza
              (consistente com Eldorado do Sul, razão 1,12×), não como metodologia de estimação.
            </p>
          </div>

          <SubTitle nested>Danos Físicos: Exposição por Cota e Protótipo CLIMADA (Seção 10)</SubTitle>
          <ul className="ml-1 list-inside list-disc space-y-1.5 text-sm text-slate-700">
            <li>
              <strong>Exposição por cota é um teto, não dano:</strong> todo ponto atingido entra com
              100% do seu valor de reposição estimado (CUB/RS × área por proxy de porte ×
              multiplicador de conteúdo). Não há curva de dano nem calibração empírica para Lajeado,
              Eldorado do Sul e Rio Grande; o dano real fica entre zero e esse valor.
            </li>
            <li>
              <strong>Curva de Saúde sintetizada a partir da base JRC:</strong> o modelo CLIMADA não
              possui curva nativa para unidades de saúde (apenas Schools, Residential e Companies),
              e a base JRC (Huizinga et al., 2017) não discrimina hospitais entre suas 6 categorias.
              A curva utilizada é a média ponto a ponto das curvas brutas JRC de <em>Commerce</em> e{" "}
              <em>Industry</em>, recalibrada pelo mesmo fator empírico de Empresas (tratar como
              ilustrativa, não calibrada).
            </li>
            <li>
              <strong>Proxy de ocupação de 9 m²/pessoa (Empresas e Saúde):</strong> padrão de
              escritório da administração pública federal (Projeto Racionaliza), já que RAIS e CNES
              não informam área construída. Tende a subestimar indústrias, galpões e estabelecimentos
              capital-intensivos com poucos vínculos (ex.: postos de combustível) e pode superestimar
              atividades intensivas em mão de obra com baixo patrimônio físico.
            </li>
            <li>
              <strong>Categorias do CUB/RS e multiplicadores de conteúdo:</strong> o CUB
              (Sinduscon-RS) não possui categoria específica para escolas ou unidades de saúde;
              adota-se PP 4-N (Prédio Popular) como aproximação institucional simples. Os
              multiplicadores de conteúdo/equipamento (50% Residencial/Educação, 100% Comercial,
              150% Industrial e 125% Saúde) vêm de Huizinga et al. (2017, Tabela 3-26), na ausência
              de levantamento nacional público.
            </li>
            <li>
              <strong>Área por sala e hipóteses de turnos na Educação:</strong> a área construída por
              sala deriva de um único projeto padrão FNDE (6 salas, incluindo administração, cozinha
              e pátio coberto, mas sem quadra coberta). Assume-se funcionamento em 2 turnos para
              todas as etapas e turmas cheias no teto legal: escolas de turno único/integral ou com
              turmas menores que o teto legal têm o número de salas (e o valor de reposição)
              subestimado.
            </li>
            <li>
              <strong>Tratamento setorial nas Empresas e piso mínimo de porte:</strong>{" "}
              estabelecimentos com CNAE industrial (05–39) usam custo de construção (GI) e curva de
              dano industriais próprios; comércio, serviços, agropecuária e administração pública
              seguem sob tratamento comercial genérico. Além disso, todo ponto recebe porte mínimo =
              1 (afetando &lt; 0,1% de Empresas e Educação, e ~3,4% dos pontos do CNES sem leitos nem
              profissionais informados).
            </li>
            <li>
              <strong>Teto de ~36% nas curvas recalibradas (Empresas e Saúde) e calibração por cota:</strong>{" "}
              a recalibração empírica para Porto Alegre multiplica a curva JRC bruta por ~0,36
              (ancorada no RP200), comprimindo o teto máximo de destruição para ~36% mesmo em
              lâminas extremas (enquanto Educação chega a 100%). Na visão CLIMADA por cota, a curva
              JRC crua é exibida em paralelo como limite superior da incerteza (≈ 2× a 2,8× o valor
              recalibrado).
            </li>
            <li>
              <strong>Agricultura por cota medida em área (ha), sem valor de reposição:</strong>{" "}
              polígonos do MapBiomas são sobrepostos à grade do raster (área por pixel calculada pela
              latitude; soma geodésica para a área total da cultura), pois não há conceito de custo
              construtivo de reposição para lavouras na metodologia CLIMADA.
            </li>
            <li>
              <strong>Setores não disjuntos:</strong> estabelecimentos privados de saúde e educação
              podem constar simultaneamente na RAIS e no CNES/Censo Escolar, de modo que a soma dos
              três setores não representa ativos estritamente disjuntos.
            </li>
          </ul>

          <GroupTitle id="lim-municipio">C. Por município e geocodificação</GroupTitle>
          <ul className="ml-1 list-inside list-disc space-y-1.5 text-sm text-slate-700">
            <li>
              <strong>Pilhas de geocodificação (coordenadas repetidas):</strong> quando o endereço
              cadastral na RAIS, no CNES ou no Censo Escolar é incompleto, o geocodificador aloca
              múltiplos estabelecimentos num único ponto padrão (centroide de rua, CEP ou
              município), reunindo dezenas de ruas e bairros na mesma coordenada. A base oficial é
              mantida sem filtro: cada pilha entra ou sai da mancha de uma só vez e recebe a
              profundidade de um único pixel (~5 m por cota ou ~90 m por RP), gerando degraus nas
              curvas de exposição e dano. No mapa e na aba Empresas, essas pilhas são sinalizadas
              com aviso específico.
            </li>
            <li>
              <strong>Pontos fora da grade do raster e pontos molhados na cota mínima:</strong>{" "}
              ativos localizados fora dos limites geográficos do raster (especialmente na porção
              oeste de Eldorado do Sul, que utiliza a grade do Guaíba de Porto Alegre, e em áreas
              rurais) recebem profundidade zero, subestimando a exposição. Inversamente, pontos cujas
              coordenadas caem sobre o leito do rio ou lagoa já aparecem molhados na cota mais baixa
              da série e são mantidos porque cada cota constitui um cenário próprio.
            </li>
            <li>
              <strong>Resolução espacial dos rasters:</strong> a amostragem por vizinho mais próximo
              opera em ~90 m/pixel nos cenários de Período de Retorno (CLIMADA/UNU-EHS em Porto
              Alegre), ~5 m/pixel nos rasters de profundidade por cota (Lajeado, Porto Alegre e
              Eldorado do Sul) e ~1 m/pixel nas máscaras binárias de Rio Grande, podendo super ou
              subestimar a lâmina em pontos próximos às bordas da mancha.
            </li>
            <li>
              <strong>Datas de referência das bases:</strong> RAIS (2023), Censo Escolar (2024),
              CNES (abril/2024), SIA/SIH (jan–jul/2024), MapBiomas Coleção 10 (2023/2024) e WorldPop
              (2024).
            </li>
          </ul>
        </Section>

        {/* ══════════════════════════════════════════════════════════════════════
            13. FONTES E REFERÊNCIAS
        ══════════════════════════════════════════════════════════════════════ */}
        <Section id="fontes" num="13" title="Fontes e Referências">
          <div className="space-y-4">

            <RefBlock title="Manchas de Inundação e Contexto">
              <RefItem href="https://mup.rs.gov.br/"
                label="MUP: Mapa Único do Plano Rio Grande (Gov. RS)"
                desc="Plataforma geoespacial oficial do RS com delimitação das áreas inundadas em 2024. Fonte das manchas ADA de Eldorado do Sul e Porto Alegre." />
              <RefItem href="https://ciex.org.br/"
                label="CIEX/FURG: Centro Interinstitucional de Observação e Previsão de Eventos Extremos"
                desc="Modelagem hidrológica e hidráulica costeira para Rio Grande: manchas de Maio 2024, Maio 2024 + 50% e Setembro 2023." />
              <RefItem href="https://www.cepal.org/pt-br/publicacoes/81035-avaliacao-efeitos-impactos-inundacoes-rio-grande-sul-novembro-2024"
                label="CEPAL (nov/2024): Avaliação dos Efeitos e Impactos das Inundações no Rio Grande do Sul"
                desc="Avaliação oficial DaLA das enchentes RS 2024: R$ 88,9 bi em danos e perdas. Referência metodológica para a curva de recuperação linear e parâmetros de interrupção." />
              <RefItem href="https://www.ibge.gov.br/geociencias/organizacao-do-territorio/malhas-territoriais.html"
                label="IBGE: Malha Municipal RS"
                desc="Limites territoriais municipais em SIRGAS 2000 (EPSG:4674), usados para delimitação geográfica e filtragem por município." />
            </RefBlock>

            <RefBlock title="Dados Socioeconômicos">
              <RefItem href="https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/estatisticas-trabalho/rais/rais-2025/rais-2025"
                label="RAIS: Relação Anual de Informações Sociais (MTE, 2023)"
                desc="Microdados de vínculos ativos, estabelecimentos, CNAE, remuneração e endereços. Base para mapeamento de empresas atingidas e estimativa de VAB." />
              <RefItem href="https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-escolar"
                label="INEP: Censo Escolar 2024"
                desc="Levantamento completo de estabelecimentos de educação básica, matrículas, turmas e docentes. Base para mapeamento de escolas atingidas e custo de reposição FUNDEB." />
              <RefItem href="https://cnes.datasus.gov.br"
                label="CNES: Cadastro Nacional de Estabelecimentos de Saúde (DataSUS, abr/2024)"
                desc="Registro de todos os estabelecimentos de saúde com localização georeferenciada, vínculos profissionais por CBO e tipo de unidade." />
              <RefItem href="https://datasus.saude.gov.br/acesso-a-informacao/producao-hospitalar-sih-sus"
                label="SIH/SUS: Produção Hospitalar (DataSUS, jan–jul/2024)"
                desc="Autorização de Internação Hospitalar (AIH) por estabelecimento CNES: base para estimativa da perda de produção hospitalar durante a interrupção." />
              <RefItem href="https://datasus.saude.gov.br/acesso-a-informacao/producao-ambulatorial-sia-sus"
                label="SIA/SUS: Produção Ambulatorial (DataSUS, jan–jul/2024)"
                desc="Boletim de Produção Ambulatorial (BPA) por estabelecimento CNES: base para estimativa da perda de produção ambulatorial durante a interrupção." />
              <RefItem href="https://nominatim.org"
                label="OpenStreetMap / Nominatim"
                desc="Geocodificador de endereços baseado em dados OSM, instância local. Usado para os estabelecimentos da RAIS e as escolas do Censo Escolar, que não trazem coordenadas; as unidades de saúde usam as coordenadas do CNES." />
            </RefBlock>

            <RefBlock title="Dados Agrícolas">
              <RefItem href="https://brasil.mapbiomas.org/downloads/mapas-para-download-geotiff/"
                label="MapBiomas: Coleção 10"
                desc="Mapeamento anual de uso e cobertura do solo no Brasil em raster de 30 m, fonte da área cultivada. Anos 2023 e 2024 utilizados conforme o período do cenário. Classes: Soja (39), Arroz (40), Outras Lavouras Temporárias (41, 20 e 62)." />
              <RefItem href=""
                label="CONAB: Preços Mínimos 2024"
                desc="Base para calibração dos coeficientes R$/ha de impacto direto por cultura e estágio fenológico." />
            </RefBlock>

            <RefBlock title="Edificações">
              <RefItem href="https://sites.research.google/open-buildings/"
                label="Google Open Buildings (Google Research, 2023)"
                desc="Dataset de footprints de edificações detectados por visão computacional a partir de imagens de satélite de alta resolução. Cobre o RS com 7,4 milhões de feições." />
              <RefItem href="https://arxiv.org/abs/2107.12283"
                label="Sirko et al. (2021): Continent-Scale Building Detection from High Resolution Satellite Imagery"
                desc="Artigo científico descrevendo o modelo de detecção, as métricas de confiança e a metodologia de avaliação do dataset Google Open Buildings. arXiv:2107.12283." />
            </RefBlock>

            <RefBlock title="Metodologia DaLA e Referências Econômicas">
              <RefItem href="https://www.gfdrr.org/sites/default/files/2017-09/PDNA-Volume-A.pdf"
                label="PDNA Vol. A Guidelines (GFDRR/UNDP/BM, 2013)"
                desc="Guia metodológico para avaliação de pós-desastre: danos ao estoque e perdas de fluxo. Define que perdas = mudanças nos fluxos econômicos durante e após o desastre." />
              <RefItem href="https://ftp.ibge.gov.br/Contas_Nacionais/Sistema_de_Contas_Nacionais/2021/tabelas_xls/sinoticas/"
                label="IBGE: SCN 2021, Tabela 17 (Tab17.xls)"
                desc="Sistema de Contas Nacionais 2021, única fonte pública IBGE com Remunerações por atividade econômica. Base dos labor shares setoriais usados na inversão VAB = w_anual / LS." />
              <RefItem href="https://doi.org/10.1093/qje/qjt032"
                label="Karabarbounis & Neiman (2014, QJE): The Global Decline of the Labor Share"
                desc="Referência canônica para o labor share como métrica de distribuição funcional da renda. Valida VAB = Remunerações / LS como identidade contábil padrão em análises macroeconômicas." />
              <RefItem href="https://www.fnde.gov.br"
                label="Portaria Interministerial MEC/MF nº 9, 28/08/2024"
                desc="Define o VAAT-MIN FUNDEB 2024 = R$ 8.481,21, parâmetro do custo de reposição dos dias letivos interrompidos." />
              <RefItem href="https://www.planalto.gov.br/ccivil_03/leis/l9394.htm"
                label="Lei nº 9.394/1996 (LDB), Art. 24, I"
                desc="Estabelece o mínimo de 200 dias letivos por ano e a obrigatoriedade de reposição dos dias perdidos por calamidade pública." />
            </RefBlock>

            <RefBlock title="Ferramentas e Infraestrutura Geoespacial">
              <RefItem href="https://geopandas.org/en/stable/docs.html"
                label="GeoPandas"
                desc="Biblioteca Python para análise de dados geoespaciais vetoriais. Utilizada para operações de sobreposição (sjoin, intersection) e transformação de CRS." />
              <RefItem href="https://shapely.readthedocs.io"
                label="Shapely"
                desc="Biblioteca Python para manipulação de geometrias vetoriais (interseção, diferença, simplificação). Base das operações de cálculo de área e comprimento atingido." />
              <RefItem href="https://maplibre.org/maplibre-gl-js/docs/"
                label="MapLibre GL JS"
                desc="Motor de renderização de mapas vetoriais no navegador. Utilizado para exibição das camadas GeoJSON e manchas de inundação no painel interativo." />
            </RefBlock>

          </div>
        </Section>

        {/* ── Rodapé ──────────────────────────────────────────────────────────── */}
        <footer className="mt-12 pt-6 border-t border-[#b3cdd8] text-center print:mt-4">
          <p className="text-[11px] text-[#055071]">
            Painel desenvolvido por GPEA/FURG em parceria com o BID (Banco Interamericano de Desenvolvimento).
          </p>
          <p className="text-[11px] text-[#2f6a83] mt-0.5">
            © 2024 Alisson Tallys Geraldo Fiorentin · Dados de referência: 2024.
          </p>
        </footer>

        </main>
      </div>
    </div>
  );
}

// ─── Componentes internos ────────────────────────────────────────────────────

function CurvasChart({ curvas }: { curvas: Record<string, ClimadaData["premissas"]["curvas"][string]> }) {
  // globalThis.Math (não `Math` puro): este arquivo já importa um componente
  // <Math> para renderizar KaTeX, que sombreia o objeto global Math.
  const { min, round } = globalThis.Math;
  const W = 480, H = 200, pL = 34, pB = 22, pT = 8, pR = 8;
  const chartW = W - pL - pR, chartH = H - pT - pB;
  const maxDepth = 4; // recorte visual -- todas as curvas platôam antes disso
  const xOf = (d: number) => pL + (min(d, maxDepth) / maxDepth) * chartW;
  const yOf = (mdd: number) => pT + (1 - mdd) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
        <g key={i}>
          <line x1={pL} y1={yOf(p)} x2={W - pR} y2={yOf(p)} stroke="#e2eef3" strokeWidth={i === 0 ? 1.5 : 0.75} />
          <text x={pL - 6} y={yOf(p) + 3} textAnchor="end" fontSize="8" fill="#6b7280">{round(p * 100)}%</text>
        </g>
      ))}
      {[0, 1, 2, 3, 4].map((d) => (
        <text key={d} x={xOf(d)} y={H - pB + 12} textAnchor="middle" fontSize="8" fill="#6b7280">{d}m</text>
      ))}
      {Object.entries(curvas).map(([setor, c]) => {
        const lastMdd = c.mdd[c.mdd.length - 1];
        const lastDepth = c.depth[c.depth.length - 1];
        const depths = lastDepth < maxDepth ? [...c.depth, maxDepth] : c.depth;
        const mdds = lastDepth < maxDepth ? [...c.mdd, lastMdd] : c.mdd;
        const pts = depths.map((d, i) => `${xOf(d)},${yOf(mdds[i])}`).join(" ");
        return <polyline key={setor} points={pts} fill="none" stroke={SETOR_COLORS[setor]} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />;
      })}
      <text x={pL} y={H - 2} fontSize="8" fill="#6b7280">Profundidade da água</text>
      <text x={W - pR} y={12} textAnchor="end" fontSize="8" fill="#6b7280">MDD (% do valor destruído)</text>
    </svg>
  );
}
