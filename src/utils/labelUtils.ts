
export const prettyLabel = (code?: string): string => {
  if (!code) return '';
  const map: Record<string, string> = {
    TAXA_OCUPACAO: 'Taxa de Ocupação',
    EMPRESTIMOS_PRESTACOES: 'Empréstimos e Prestações',
    FOLHA_SALARIAL: 'Folha Salarial',
    MERCADO_COMUM: 'Mercado Comum',
    HORTIFRUTI: 'Hortifruti',
    PROTEINAS: 'Proteínas',
    DESCARTAVEIS: 'Descartáveis',
    LIMPEZA: 'Limpeza',
    COMBUSTIVEL: 'Combustível',
    TRANSPORTE: 'Transporte',
    SAZONAIS: 'Sazonais',
    PROLABORE: 'Prolabore',
    IMPLEMENTACAO: 'Implementação',
    VARIAVEIS: 'Variáveis',
    VARIÁVEIS: 'Variáveis',
    FIXAS: 'Fixas',
    ATRASADOS: 'Atrasados',
    RETIRADAS: 'Retiradas',
    VENDAS: 'Vendas',
    VENDAS_DIARIAS: 'Vendas Diárias',
    BOVINA: 'Bovina',
    SUINA: 'Suína',
    AVES: 'Aves',
    EMBUTIDOS: 'Embutidos',
    ALCOOLICA: 'Alcoólicas',
    NAO_ALCOOLICA: 'Não Alcoólicas',
    OUTROS: 'Outros',
    EM_COFRE: 'Em Cofre',
    EM_CONTA: 'Em Conta',
    SALDO_MES_ANTERIOR: 'Saldo Mês Anterior',
  };

  const key = code.toUpperCase();
  if (map[key]) return map[key];

  // Generic beautify: split by underscores and capitalize words
  return key
    .toLowerCase()
    .split('_')
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
};
