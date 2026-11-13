export interface MetricMetadata {
  titulo: string
  metodologia: string
  formula: string
  parametros?: { nome: string; valor: string }[]
  fonte: string
  observacao?: string
}

export const METRIC_METADATA: Record<string, MetricMetadata> = {
  empresas_vab: {
    titulo: "Perdas de VAB das Empresas",
    metodologia: "Metodologia DaLA (CEPAL / Banco Mundial)",
    formula: "VAB Interrompido = (Massa Salarial × 12 / Labor Share) × (Dias Efetivos / 365)",
    parametros: [
      { nome: "Labor Share Agropecuária", valor: "0,176 (17,6% da massa no VAB)" },
      { nome: "Labor Share Indústria", valor: "0,338 (33,8%)" },
      { nome: "Labor Share Serviços", valor: "0,433 (43,3%)" },
      { nome: "Labor Share Administração Pública", valor: "0,883 (88,3%)" },
      { nome: "Dias Efetivos", valor: "30 a 60 dias (30 agudos + 60 de recuperação a 50%)" },
    ],
    fonte: "RAIS 2023 (Ministério do Trabalho e Emprego) e Contas Regionais do IBGE",
    observacao:
      "A massa salarial formal é multiplicada pelo inverso do labor share setorial para reconstruir o Valor Adicionado Bruto (VAB) interrompido durante a enchente.",
  },
  massa_salarial: {
    titulo: "Massa Salarial dos Estabelecimentos",
    metodologia: "Cadastro da Relação Anual de Informações Sociais",
    formula: "Massa Salarial Mensal = Σ (Remuneração Média dos Empregados Vinculados)",
    fonte: "RAIS 2023 (MTE) georreferenciada pelo CNPJ e endereço cadastral",
    observacao:
      "Representa o fluxo mensal de rendimentos do trabalho diretamente exposto na mancha de inundação.",
  },
  educacao: {
    titulo: "Danos e Perdas Operacionais na Educação",
    metodologia: "Metodologia DaLA (CEPAL) com Parâmetros Oficiais FUNDEB",
    formula: "Perda = Matrículas × (VAAT-MIN / 200) × Dias Agudos; Custo Adicional = 1 × Perda (Total = 2 × Perda)",
    parametros: [
      { nome: "FUNDEB VAAT-MIN 2024", valor: "R$ 8.481,21 / aluno / ano" },
      { nome: "Dias Letivos Oficiais", valor: "200 dias (R$ 42,41 / aluno / dia letivo)" },
      { nome: "Dias de Paralisação Aguda", valor: "30 dias" },
      { nome: "Custo de Reposição / Sala", valor: "R$ 638.944,42 (padrão FNDE / CUB-RS)" },
    ],
    fonte: "Censo Escolar 2024 (INEP/MEC) e Portaria Interministerial MEC/MF nº 9/2024",
    observacao:
      "Inclui perdas pelo fluxo de ensino paralisado e os custos adicionais de reposição de aulas, transporte escolar e acolhimento pedagógico emergencial.",
  },
  saude: {
    titulo: "Perdas de Produção e Serviços de Saúde",
    metodologia: "Metodologia DaLA com Faturamento SIA/SIH SUS",
    formula: "Perda = Produção Ambulatorial e Hospitalar Anual SUS × (Dias Efetivos / 365)",
    parametros: [
      { nome: "Produção SUS", valor: "Faturamento aprovado de AIH (internações) e BPA (ambulatorial)" },
      { nome: "Dias Efetivos", valor: "30 a 60 dias" },
      { nome: "Custo Reposição Leito", valor: "R$ 450.000,00 por leito hospitalar" },
    ],
    fonte: "SIA/SIH DataSUS (2024) e CNES (Cadastro Nacional de Estabelecimentos de Saúde)",
    observacao:
      "Registra o impacto de atendimentos de média e alta complexidade e da atenção básica suspensos nas unidades inundadas.",
  },
  agricultura: {
    titulo: "Prejuízo e Perdas Agrícolas",
    metodologia: "Superposição Espacial MapBiomas com Coeficientes EMATER/CONAB",
    formula: "Prejuízo = Σ (Área Atingida da Cultura em ha × Custo de Produção / ha)",
    parametros: [
      { nome: "Arroz Irrigado", valor: "R$ 6.300,00 / ha" },
      { nome: "Soja", valor: "R$ 5.370,12 / ha" },
      { nome: "Milho", valor: "R$ 4.708,12 / ha" },
      { nome: "Trigo", valor: "R$ 3.800,00 / ha" },
      { nome: "Outras Culturas / Pastagens", valor: "R$ 1.100,00 / ha" },
    ],
    fonte: "MapBiomas Coleção 10 (2024), CONAB e EMATER-RS Ascar (safra 2023/2024)",
    observacao:
      "Área de cultivo em estágio de colheita ou preparo cruzada com o custo operacional efetivo de lavouras e perdas de insumos.",
  },
  populacao: {
    titulo: "População Residente Atingida",
    metodologia: "Estatística Zonal Raster-Vetor de Alta Resolução",
    formula: "População Atingida = Σ [ Células WorldPop (100m) ∩ Mancha de Inundação ]",
    fonte: "WorldPop Hub 2024 (resolução 100m) calibrado pelo Censo Demográfico 2022 (IBGE)",
    observacao:
      "Calculada por sobreposição direta da grade populacional contínua com a mancha hidrodinâmica de inundação.",
  },
  edificacoes: {
    titulo: "Edificações e Danos Físicos de Infraestrutura",
    metodologia: "Custo Unitário Básico (CUB-RS) e Metodologia CLIMADA",
    formula: "Exposição = Área Construída (m²) × CUB-RS (dez/2024) × Multiplicador de Conteúdo",
    parametros: [
      { nome: "CUB Residencial R8-N", valor: "R$ 2.457,41 / m²" },
      { nome: "CUB Comercial CSLL", valor: "R$ 3.120,50 / m²" },
      { nome: "CUB Industrial", valor: "R$ 2.210,18 / m² (×2,5 para estoques e máquinas)" },
    ],
    fonte: "Cadastro Imobiliário Municipal, OpenStreetMap e Sinduscon-RS (dezembro/2024)",
    observacao:
      "Valor patrimonial de reposição física exposto ao evento extremo de cheia.",
  },
  perdas_operacionais: {
    titulo: "Perdas Operacionais Totais (DaLA)",
    metodologia: "Damage and Loss Assessment (CEPAL / Banco Mundial)",
    formula: "Total = VAB Empresas + Perdas Educação + Custo Adic. Educação + Saúde SUS + Agricultura",
    parametros: [
      { nome: "Escala Normalizada Base", valor: "30 dias efetivos de interrupção" },
      { nome: "Curva Completa DaLA", valor: "60 dias efetivos (30 agudos + 60 a 50%)" },
      { nome: "Faixa de Sensibilidade", valor: "30 a 90 dias de paralisação gradual" },
    ],
    fonte: "RAIS 2023, Censo Escolar 2024, DataSUS 2024, CONAB e EMATER-RS",
    observacao:
      "Mede a redução de fluxos de produção e serviços decorrentes da paralisia econômica, sem contagem dupla com danos a ativos físicos.",
  },
  danos_fisicos: {
    titulo: "Danos Físicos e Exposição Patrimonial",
    metodologia: "Plataforma CLIMADA (ETH Zürich) & Custo de Reposição",
    formula: "Exposição Total = Σ Ativos Expostos (Empresas + Educação + Saúde + Residencial)",
    parametros: [
      { nome: "Variação de Sensibilidade", valor: "±10% nos custos de recomposição da construção civil" },
      { nome: "Base de Custo", valor: "CUB-RS Sinduscon (dezembro/2024)" },
    ],
    fonte: "Cadastros Municipais, OpenStreetMap, CUB Sinduscon-RS e Simulações Hidrodinâmicas",
    observacao:
      "Estima o valor monetário necessário para reconstrução ou reparo físico das estruturas e reposição de equipamentos danificados.",
  },
  area_atingida: {
    titulo: "Área Territorial Atingida",
    metodologia: "Sensoriamento Remoto Orbital & Modelagem Hidráulica",
    formula: "Área Atingida (km²) = Área poligonal da mancha máxima de cheia",
    fonte: "Imagens PlanetScope/Sentinel-1/2 (maio/2024), IPH/UFRGS e Defesa Civil RS",
    observacao:
      "Polígono delimitado pela mancha de inundação do evento de maio de 2024 ou das cotas linimétricas modeladas.",
  },
}
