import { readFileSync } from "fs";
import { join } from "path";
import type {
  DanosData,
  ClimadaData,
  CotasData,
  MedidasMun,
  ExposicaoMun,
  DanosFisicosCenariosData,
  PerdasOperacionaisCotasData,
} from "./types";

/**
 * Leitura server-side compartilhada entre a página cheia (app/danos/page.tsx)
 * e a rota interceptada (app/@modal/(.)danos/page.tsx) -- as duas rodam esse
 * mesmo código no servidor, só muda o invólucro visual (página vs modal).
 */
export function getDanosPageData(): {
  dados: DanosData;
  dadosClimada: ClimadaData | null;
  dadosClimadaMun: Record<string, ClimadaData>;
  dadosCotas: Record<string, CotasData>;
  dadosMedidas: Record<string, MedidasMun>;
  dadosExposicao: Record<string, ExposicaoMun>;
  dadosFisicosCenarios: DanosFisicosCenariosData;
  dadosPerdasCotas: PerdasOperacionaisCotasData;
} {
  let dados: DanosData = {};
  try {
    const p = join(process.cwd(), "public", "dados_convertidos", "danos_operacionais.json");
    dados = JSON.parse(readFileSync(p, "utf8"));
  } catch { /* graceful degradation */ }

  let dadosFisicosCenarios: DanosFisicosCenariosData = {};
  try {
    const p = join(process.cwd(), "public", "dados_convertidos", "danos_fisicos_cenarios.json");
    dadosFisicosCenarios = JSON.parse(readFileSync(p, "utf8"));
  } catch { /* graceful degradation */ }

  let dadosPerdasCotas: PerdasOperacionaisCotasData = {};
  try {
    const p = join(process.cwd(), "public", "dados_convertidos", "perdas_operacionais_cotas.json");
    dadosPerdasCotas = JSON.parse(readFileSync(p, "utf8"));
  } catch { /* graceful degradation */ }

  let dadosClimada: ClimadaData | null = null;
  try {
    const p = join(process.cwd(), "public", "dados_convertidos", "climada_dano_fisico_prototipo.json");
    dadosClimada = JSON.parse(readFileSync(p, "utf8"));
  } catch { /* graceful degradation */ }

  // Mesmo cálculo por RP de Porto Alegre, replicado em Eldorado do Sul (RP convertido em cota):
  // pipeline/climada_rp_por_cota.py. Lajeado só tem a visão por cota.
  const dadosClimadaMun: Record<string, ClimadaData> = {};
  const arquivosRp: Record<string, string> = {
    "Eldorado do Sul": "climada_dano_fisico_eldorado_do_sul.json",
  };
  for (const [mun, arq] of Object.entries(arquivosRp)) {
    try {
      const p = join(process.cwd(), "public", "dados_convertidos", arq);
      dadosClimadaMun[mun] = JSON.parse(readFileSync(p, "utf8"));
    } catch { /* graceful degradation */ }
  }

  // Dano físico por COTA do rio (Lajeado, Eldorado do Sul, Porto Alegre; Rio Grande só exposição): pipeline/climada_cota.py.
  const dadosCotas: Record<string, CotasData> = {};
  const arquivosCota: Record<string, string> = {
    "Porto Alegre": "climada_cota_porto_alegre.json",
    "Eldorado do Sul": "climada_cota_eldorado_do_sul.json",
    "Lajeado": "climada_cota_lajeado.json",
    "Rio Grande": "climada_cota_rio_grande.json",
  };
  for (const [mun, arq] of Object.entries(arquivosCota)) {
    try {
      const p = join(process.cwd(), "public", "dados_convertidos", arq);
      dadosCotas[mun] = JSON.parse(readFileSync(p, "utf8"));
    } catch { /* graceful degradation */ }
  }

  // Medidas de adaptação (risco anual evitado por medida): pipeline/climada_medidas.py.
  let dadosMedidas: Record<string, MedidasMun> = {};
  try {
    const p = join(process.cwd(), "public", "dados_convertidos", "climada_medidas.json");
    dadosMedidas = JSON.parse(readFileSync(p, "utf8"));
  } catch { /* graceful degradation */ }

  // CLIMADA sem curva de dano (valor exposto atingido): pipeline/climada_exposicao.py.
  const dadosExposicao: Record<string, ExposicaoMun> = {};
  // Lajeado, Eldorado do Sul e Porto Alegre: só a visão "Por Cota" (valor exposto, sem curva de dano).
  for (const [mun, arq] of Object.entries({ "Lajeado": "climada_exposicao_lajeado.json", "Eldorado do Sul": "climada_exposicao_eldorado_do_sul.json", "Porto Alegre": "climada_exposicao_porto_alegre.json", "Rio Grande": "climada_exposicao_rio_grande.json" })) {
    try {
      const p = join(process.cwd(), "public", "dados_convertidos", arq);
      dadosExposicao[mun] = JSON.parse(readFileSync(p, "utf8"));
    } catch { /* graceful degradation */ }
  }

  // Indicadores do painel por categoria e por cota (pipeline/climada_cota_detalhe.py).
  const slugs: Record<string, string> = { "Lajeado": "lajeado", "Eldorado do Sul": "eldorado_do_sul", "Porto Alegre": "porto_alegre", "Rio Grande": "rio_grande" };
  for (const [mun, slug] of Object.entries(slugs)) {
    if (!dadosExposicao[mun]) continue;
    try {
      const p = join(process.cwd(), "public", "dados_convertidos", `climada_cota_detalhe_${slug}.json`);
      dadosExposicao[mun].detalhe = JSON.parse(readFileSync(p, "utf8"));
    } catch { /* graceful degradation */ }
  }

  return {
    dados,
    dadosClimada,
    dadosClimadaMun,
    dadosCotas,
    dadosMedidas,
    dadosExposicao,
    dadosFisicosCenarios,
    dadosPerdasCotas,
  };
}
