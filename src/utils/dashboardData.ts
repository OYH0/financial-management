
import { Despesa } from '@/hooks/useDespesas';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const processCompanyData = (despesas: Despesa[]) => {
  const companiesMap = new Map<string, {
    name: string;
    totalExpenses: number;
    categories: Map<string, number>;
    monthlyData: { month: string; value: number }[];
  }>();

  // Processar despesas por empresa
  despesas.forEach(despesa => {
    const companyName = despesa.empresa || 'Empresa Desconhecida';
    
    if (!companiesMap.has(companyName)) {
      companiesMap.set(companyName, {
        name: companyName,
        totalExpenses: 0,
        categories: new Map(),
        monthlyData: []
      });
    }

    const company = companiesMap.get(companyName)!;
    company.totalExpenses += despesa.valor || 0;
    
    const categoria = despesa.categoria || 'Outros';
    const currentCategoryValue = company.categories.get(categoria) || 0;
    company.categories.set(categoria, currentCategoryValue + (despesa.valor || 0));
  });

  // Converter para formato do componente
  return Array.from(companiesMap.values()).map((company, index) => {
    const categories = Array.from(company.categories.entries()).map(([name, value]) => ({
      name,
      value: formatCurrency(value)
    }));

    // Dados simulados para o gráfico (pode ser melhorado posteriormente)
    const chartData = Array.from({ length: 6 }, (_, i) => ({
      value: company.totalExpenses * (0.8 + Math.random() * 0.4)
    }));

    return {
      name: company.name,
      period: 'Maio 2025',
      totalExpenses: formatCurrency(company.totalExpenses),
      status: (Math.random() > 0.5 ? 'Atualizado' : 'Pendentes') as 'Atualizado' | 'Pendentes',
      categories: categories.slice(0, 3), // Mostrar apenas as 3 principais
      chartData,
      chartColor: index === 0 ? '#e74c3c' : '#3498db'
    };
  });
};

export const processTransactionData = (despesas: Despesa[]) => {
  return despesas.slice(0, 10).map(despesa => ({
    date: formatDate(despesa.data),
    company: despesa.empresa?.substring(0, 10) || 'N/A',
    description: despesa.descricao || 'Sem descrição',
    category: despesa.categoria || 'OUTROS',
    value: formatCurrency(despesa.valor || 0),
    status: (Math.random() > 0.5 ? 'PAGO' : 'PENDENTE') as 'PAGO' | 'PENDENTE'
  }));
};

export const processCategoryDistribution = (despesas: Despesa[]) => {
  const categoriesMap = new Map<string, number>();
  
  despesas.forEach(despesa => {
    const categoria = despesa.categoria || 'Outros';
    const current = categoriesMap.get(categoria) || 0;
    categoriesMap.set(categoria, current + (despesa.valor || 0));
  });

  const total = Array.from(categoriesMap.values()).reduce((sum, value) => sum + value, 0);
  const colors = ['#3498db', '#2c3e50', '#f39c12', '#e74c3c', '#9b59b6'];
  
  return Array.from(categoriesMap.entries()).map(([name, value], index) => ({
    name,
    value: Math.round((value / total) * 100),
    color: colors[index % colors.length]
  }));
};
