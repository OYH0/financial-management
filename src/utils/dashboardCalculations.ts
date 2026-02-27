
import { Despesa } from '@/hooks/useDespesas';

// Função para normalizar subcategorias
const normalizeSubcategoria = (subcategoria: string): string => {
  if (!subcategoria) return 'Outros';

  // Mapeamento para normalizar subcategorias
  const normalizationMap: { [key: string]: string } = {
    'MERCADO_COMUM': 'Mercado Comum',
    'DESCARTAVEIS_LIMPEZA': 'Descartáveis e Limpeza (Antigo)',
    'DESCARTAVEIS': 'Descartáveis',
    'LIMPEZA': 'Limpeza',
    'COMBUSTIVEL_TRANSPORTE': 'Combustível e Transporte (Antigo)',
    'COMBUSTIVEL': 'Combustível',
    'TRANSPORTE': 'Transporte',
    'EMPRESTIMOS_PRESTACOES': 'Empréstimos e Prestações',
    'EMPRESTIMOS': 'Empréstimos e Prestações',
    'FOLHA_SALARIAL': 'Folha Salarial',
    'TAXA_OCUPACAO': 'Taxa de Ocupação',
    'BEBIDAS': 'Bebidas',
    'HORTIFRUTI': 'Hortifrúti',
    'PROTEINAS': 'Proteínas',
    'MANUTENCAO': 'Manutenção',
    'SAZONAIS': 'Sazonais',
    'PROLABORE': 'Pró-labore',
    'SUPERMERCADO': 'Supermercado',
    'BOVINA': 'Bovina',
    'SUINA': 'Suína',
    'AVES': 'Aves',
    'EMBUTIDOS': 'Embutidos',
    'ALCOOLICA': 'Alcoólicas',
    'NAO_ALCOOLICA': 'Não Alcoólicas',
  };

  return normalizationMap[subcategoria] || subcategoria;
};

export const calculateDistributionData = (despesas: Despesa[]) => {
  console.log('=== CALCULATING DISTRIBUTION DATA WITH SUBCATEGORIES ===');
  console.log('Despesas para calcular:', despesas?.length || 0);

  if (!despesas || despesas.length === 0) {
    return [];
  }

  // Filtrar despesas para excluir Camerino e Implementação
  const despesasSemCamerino = despesas.filter(despesa => {
    const empresa = despesa.empresa?.toLowerCase().trim() || '';
    return !empresa.includes('camerino') && !empresa.includes('implementação') && empresa !== 'implementação';
  });

  // Agrupar por categoria e subcategoria
  const categoryGroups: { [key: string]: { total: number; subcategorias: { [key: string]: number } } } = {};

  despesasSemCamerino.forEach(despesa => {
    const valor = despesa.valor_total || despesa.valor || 0;
    const categoria = despesa.categoria || 'Sem categoria';
    const subcategoriaOriginal = despesa.subcategoria || 'Outros';
    let subcategoria = normalizeSubcategoria(subcategoriaOriginal);

    // Adicionar nível de detalhe na legenda caso exista (ex: Proteínas - Bovina)
    if (despesa.detalhe_subcategoria) {
      const detalheNormalizado = normalizeSubcategoria(despesa.detalhe_subcategoria);
      subcategoria = `${subcategoria} - ${detalheNormalizado}`;
    }

    if (!categoryGroups[categoria]) {
      categoryGroups[categoria] = { total: 0, subcategorias: {} };
    }

    categoryGroups[categoria].total += valor;

    if (!categoryGroups[categoria].subcategorias[subcategoria]) {
      categoryGroups[categoria].subcategorias[subcategoria] = 0;
    }
    categoryGroups[categoria].subcategorias[subcategoria] += valor;
  });

  // Cores para as categorias
  const colors: { [key: string]: string } = {
    'INSUMOS': '#10B981',
    'FIXAS': '#EF4444',
    'VARIÁVEIS': '#F59E0B',
    'ATRASADOS': '#DC2626',
    'RETIRADAS': '#8B5CF6',
    'Sem categoria': '#6B7280'
  };

  const data = Object.entries(categoryGroups)
    .filter(([_, group]) => group.total > 0)
    .map(([categoria, group]) => ({
      name: categoria,
      value: group.total,
      color: colors[categoria] || '#6B7280',
      subcategorias: group.subcategorias
    }))
    .sort((a, b) => b.value - a.value);

  console.log('Dados de distribuição calculados (sem Camerino):', data);
  return data;
};

export const calculateMonthlyData = (despesas: Despesa[], receitas: any[]) => {
  console.log('=== CALCULATING MONTHLY DATA ===');

  const monthlyData: { [key: string]: { despesas: number; receitas: number } } = {};

  // Filtrar despesas para excluir Camerino e Implementação
  const despesasSemCamerino = despesas.filter(despesa => {
    const empresa = despesa.empresa?.toLowerCase().trim() || '';
    return !empresa.includes('camerino') && !empresa.includes('implementação') && empresa !== 'implementação';
  });

  // Filtrar receitas para excluir Camerino e Implementação
  const receitasSemCamerino = receitas.filter(receita => {
    const empresa = receita.empresa?.toLowerCase().trim() || '';
    return !empresa.includes('camerino') && !empresa.includes('implementação') && empresa !== 'implementação';
  });

  // Processar despesas (sem Camerino)
  despesasSemCamerino.forEach(despesa => {
    if (despesa.data_vencimento) {
      const date = new Date(despesa.data_vencimento + 'T00:00:00');
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { despesas: 0, receitas: 0 };
      }

      monthlyData[monthKey].despesas += despesa.valor_total || despesa.valor || 0;
    }
  });

  // Processar receitas (sem Camerino)
  receitasSemCamerino.forEach(receita => {
    if (receita.data) {
      const date = new Date(receita.data + 'T00:00:00');
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { despesas: 0, receitas: 0 };
      }

      monthlyData[monthKey].receitas += receita.valor || 0;
    }
  });

  // Converter para array e ordenar
  const data = Object.entries(monthlyData)
    .map(([month, values]) => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });

      return {
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        despesas: values.despesas,
        receitas: values.receitas,
        lucro: values.receitas - values.despesas
      };
    })
    .sort((a, b) => {
      const monthOrder = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });

  console.log('Dados mensais calculados (sem Camerino):', data);
  return data;
};

export const calculateTotalsByCompany = (despesas: Despesa[], empresa: string) => {
  console.log(`=== CALCULATING TOTALS FOR ${empresa} ===`);

  const filteredDespesas = despesas.filter(d => d.empresa === empresa);

  const totalDespesas = filteredDespesas.reduce((sum, d) => sum + (d.valor_total || d.valor || 0), 0);
  const totalPagas = filteredDespesas
    .filter(d => d.status === 'PAGO')
    .reduce((sum, d) => sum + (d.valor_total || d.valor || 0), 0);
  const totalPendentes = filteredDespesas
    .filter(d => d.status !== 'PAGO')
    .reduce((sum, d) => sum + (d.valor_total || d.valor || 0), 0);

  console.log(`Totais para ${empresa}:`, { totalDespesas, totalPagas, totalPendentes });

  return {
    totalDespesas,
    totalPagas,
    totalPendentes,
    count: filteredDespesas.length
  };
};

// Função para normalizar nomes de empresas
export const normalizeCompanyName = (empresa: string | null | undefined): string => {
  if (!empresa) return 'unknown';

  const normalized = empresa.toLowerCase().trim();

  if (normalized.includes('camerino')) return 'camerino';

  // Separar Churrasco em Cariri e Fortaleza
  if (normalized.includes('fortaleza')) return 'churrasco_fortaleza';
  if (normalized.includes('cariri')) return 'churrasco_cariri';
  // Dados legados sem especificação vão para Cariri
  if (normalized.includes('churrasco') || normalized.includes('companhia')) return 'churrasco_cariri';

  if (normalized.includes('johnny')) return 'johnny';

  return normalized;
};

// Função para obter o valor da transação
export const getTransactionValue = (transaction: any): number => {
  return transaction.valor_total || transaction.valor || 0;
};

// Função para calcular totais por empresa (excluindo Camerino) com receitas
export const calculateCompanyTotals = (despesas: Despesa[], receitas: any[] = []) => {
  const companies = {
    churrasco_cariri: {
      total: 0,
      totalReceitas: 0,
      expenses: [] as Despesa[],
      receitas: [] as any[],
      categories: { fixas: 0, insumos: 0, variaveis: 0, atrasados: 0, retiradas: 0, sem_categoria: 0 }
    },
    churrasco_fortaleza: {
      total: 0,
      totalReceitas: 0,
      expenses: [] as Despesa[],
      receitas: [] as any[],
      categories: { fixas: 0, insumos: 0, variaveis: 0, atrasados: 0, retiradas: 0, sem_categoria: 0 }
    },
    johnny: {
      total: 0,
      totalReceitas: 0,
      expenses: [] as Despesa[],
      receitas: [] as any[],
      categories: { fixas: 0, insumos: 0, variaveis: 0, atrasados: 0, retiradas: 0, sem_categoria: 0 }
    }
  };

  // Processar despesas
  despesas.forEach(despesa => {
    const normalizedCompany = normalizeCompanyName(despesa.empresa);
    const valor = getTransactionValue(despesa);
    const categoria = despesa.categoria?.toUpperCase() || 'SEM_CATEGORIA';

    // Pular despesas da Camerino
    if (normalizedCompany === 'camerino') {
      return;
    }

    if (companies[normalizedCompany as keyof typeof companies]) {
      const company = companies[normalizedCompany as keyof typeof companies];
      company.total += valor;
      company.expenses.push(despesa);

      // Categorizar despesas - usando comparação exata com categorias corretas
      if (categoria.includes('FIXAS')) {
        company.categories.fixas += valor;
      } else if (categoria.includes('INSUMOS')) {
        company.categories.insumos += valor;
      } else if (categoria === 'VARIÁVEIS') {
        company.categories.variaveis += valor;
      } else if (categoria.includes('ATRASADOS')) {
        company.categories.atrasados += valor;
      } else if (categoria.includes('RETIRADAS')) {
        company.categories.retiradas += valor;
      } else {
        company.categories.sem_categoria += valor;
      }
    }
  });

  // Processar receitas
  console.log('\n💰 === PROCESSANDO RECEITAS ===');
  console.log('Total de receitas para processar:', receitas.length);

  let receitasRecebidas = 0;
  let receitasPendentes = 0;

  receitas.forEach(receita => {
    const normalizedCompany = normalizeCompanyName(receita.empresa);
    const valor = receita.valor || 0;
    const foiRecebida = !!receita.data_recebimento; // Só contar se foi recebida
    const descricao = (receita.descricao || '').toUpperCase().trim();
    const isSaldoDia = descricao.includes('SALDO DO DIA') || descricao === 'SALDO DO DIA';

    console.log(`📊 Receita: ${receita.descricao} | Empresa: ${receita.empresa} (normalizado: ${normalizedCompany}) | Valor: R$ ${valor} | Data: ${receita.data} | Data Recebimento: ${receita.data_recebimento || 'Pendente'} | Status: ${foiRecebida ? '✅ RECEBIDA' : '⏳ PENDENTE'}${isSaldoDia ? ' | 💰 SALDO' : ''}`);

    // Pular receitas da Camerino
    if (normalizedCompany === 'camerino') {
      console.log('  ❌ Pulando receita da Camerino');
      return;
    }

    // IMPORTANTE: Só contabilizar receitas que já foram recebidas (data_recebimento preenchido)
    if (!foiRecebida) {
      console.log('  ⏳ Receita pendente - NÃO será contabilizada no total');
      receitasPendentes++;
      return;
    }

    // IMPORTANTE: NÃO contabilizar "SALDO DO DIA" como receita (é apenas movimentação de caixa)
    if (isSaldoDia) {
      console.log('  💰 SALDO DO DIA - NÃO será contabilizado como receita (apenas movimentação de caixa)');
      return;
    }

    if (companies[normalizedCompany as keyof typeof companies]) {
      const company = companies[normalizedCompany as keyof typeof companies];
      company.totalReceitas += valor;
      company.receitas.push(receita);
      receitasRecebidas++;
      console.log(`  ✅ Receita RECEBIDA adicionada a ${normalizedCompany} | Novo total receitas: R$ ${company.totalReceitas}`);
    } else {
      console.log(`  ⚠️ Empresa não reconhecida: ${normalizedCompany}`);
    }
  });

  console.log('\n📈 === ESTATÍSTICAS DE PROCESSAMENTO ===');
  console.log('Receitas RECEBIDAS contabilizadas:', receitasRecebidas);
  console.log('Receitas PENDENTES ignoradas:', receitasPendentes);

  console.log('\n💰 === RESUMO DE RECEITAS POR EMPRESA ===');
  console.log('Churrasco Cariri - Total Receitas:', companies.churrasco_cariri.totalReceitas, '| Qtd:', companies.churrasco_cariri.receitas.length);
  console.log('Churrasco Fortaleza - Total Receitas:', companies.churrasco_fortaleza.totalReceitas, '| Qtd:', companies.churrasco_fortaleza.receitas.length);
  console.log('Johnny - Total Receitas:', companies.johnny.totalReceitas, '| Qtd:', companies.johnny.receitas.length);

  return companies;
};

// Função para debug das empresas
export const debugCompanies = (despesas: Despesa[]) => {
  console.log('🔍 DEBUG: Empresas encontradas:');
  const empresas = [...new Set(despesas.map(d => d.empresa))];
  empresas.forEach(empresa => {
    console.log(`- ${empresa} (normalizado: ${normalizeCompanyName(empresa)})`);
  });
};

// Função para verificar integridade dos dados
export const verifyDataIntegrity = (despesas: Despesa[]) => {
  const totalRecords = despesas.length;
  const recordsWithCompany = despesas.filter(d => d.empresa).length;
  const recordsWithValue = despesas.filter(d => d.valor || d.valor_total).length;
  const recordsWithDate = despesas.filter(d => d.data_vencimento).length;

  return {
    totalRecords,
    recordsWithCompany,
    recordsWithValue,
    recordsWithDate,
    integrity: {
      company: (recordsWithCompany / totalRecords) * 100,
      value: (recordsWithValue / totalRecords) * 100,
      date: (recordsWithDate / totalRecords) * 100
    }
  };
};
