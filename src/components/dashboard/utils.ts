
export const filterDataByPeriod = (data: any[], period: string, customMonth?: number, customYear?: number) => {
  if (!data || data.length === 0) return [];
  
  console.log(`\n=== FILTRO DE PERÍODO: ${period.toUpperCase()} ===`);
  console.log('Total de dados para filtrar:', data.length);
  
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case 'today':
      // Para "hoje", usar apenas a data (ignorar horário)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startDate = today;
      endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Fim do dia
      console.log('Filtro HOJE - Data:', today.toLocaleDateString('pt-BR'));
      break;
    case 'week':
      // Semana atual (domingo a sábado)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      startDate = startOfWeek;
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      console.log('Filtro SEMANA - De:', startOfWeek.toLocaleDateString('pt-BR'), 'até:', endDate.toLocaleDateString('pt-BR'));
      break;
    case 'month':
      // Mês atual
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      console.log('Filtro MÊS - De:', startDate.toLocaleDateString('pt-BR'), 'até:', endDate.toLocaleDateString('pt-BR'));
      break;
    case 'year':
      // Ano atual
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      console.log('Filtro ANO - De:', startDate.toLocaleDateString('pt-BR'), 'até:', endDate.toLocaleDateString('pt-BR'));
      break;
    case 'custom':
      // Período personalizado - APENAS o mês selecionado (não acumulado)
      if (customMonth && customYear) {
        startDate = new Date(customYear, customMonth - 1, 1); // Primeiro dia do mês selecionado
        endDate = new Date(customYear, customMonth, 0, 23, 59, 59, 999); // Último dia do mês selecionado
        console.log('Filtro PERSONALIZADO - APENAS o mês selecionado - De:', startDate.toLocaleDateString('pt-BR'), 'até:', endDate.toLocaleDateString('pt-BR'));
      } else {
        console.log('Período personalizado sem dados válidos, retornando todos os dados');
        return data;
      }
      break;
    default:
      console.log('Período não reconhecido, retornando todos os dados');
      return data; // Return all data if period is not recognized
  }

  const filtered = data.filter(item => {
    // Parse da data - PRIORIZAR data_vencimento para despesas
    let itemDate: Date;
    
    // Para despesas, usar data_vencimento primeiro, depois data
    if (item.data_vencimento) {
      if (item.data_vencimento.includes('/')) {
        // Formato DD/MM/YYYY
        const [dia, mes, ano] = item.data_vencimento.split('/');
        itemDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      } else {
        // Formato YYYY-MM-DD
        itemDate = new Date(item.data_vencimento + 'T00:00:00');
      }
      console.log('Usando data_vencimento:', item.data_vencimento, 'para item:', item.descricao || item.empresa);
    } else if (item.data) {
      if (item.data.includes('/')) {
        // Formato DD/MM/YYYY
        const [dia, mes, ano] = item.data.split('/');
        itemDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      } else {
        // Formato YYYY-MM-DD
        itemDate = new Date(item.data + 'T00:00:00');
      }
      console.log('Usando data:', item.data, 'para item:', item.descricao || item.empresa);
    } else if (item.data_pagamento) {
      // Usar data_pagamento apenas se não houver data_vencimento nem data
      if (item.data_pagamento.includes('/')) {
        const [dia, mes, ano] = item.data_pagamento.split('/');
        itemDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      } else {
        itemDate = new Date(item.data_pagamento + 'T00:00:00');
      }
      console.log('Usando data_pagamento:', item.data_pagamento, 'para item:', item.descricao || item.empresa);
    } else {
      console.log('Item sem data válida:', item);
      return false;
    }
    
    if (period === 'today') {
      // Para hoje, comparar apenas a data (ano, mês, dia)
      const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
      const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const match = itemDateOnly.getTime() === todayOnly.getTime();
      
      if (match) {
        console.log('Item de HOJE encontrado:', item.data_vencimento || item.data || item.data_pagamento, item.descricao || item.empresa);
      }
      
      return match;
    }
    
    const match = itemDate >= startDate && itemDate <= endDate;
    
    if (match) {
      console.log(`Item do período ${period} encontrado:`, item.data_vencimento || item.data || item.data_pagamento, item.descricao || item.empresa);
    }
    
    return match;
  });
  
  console.log(`Dados filtrados para ${period}:`, filtered.length, 'de', data.length);
  return filtered;
};

export const getPeriodString = (selectedPeriod: string, customMonth?: number, customYear?: number) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  switch (selectedPeriod) {
    case 'today':
      return `Hoje - ${currentDate.toLocaleDateString('pt-BR')}`;
    case 'week':
      return `Esta Semana`;
    case 'month':
      const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(currentDate);
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
      return `${capitalizedMonth} ${currentYear}`;
    case 'year':
      return `Ano ${currentYear}`;
    case 'custom':
      if (customMonth && customYear) {
        const customDate = new Date(customYear, customMonth - 1, 1);
        const customMonthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(customDate);
        const capitalizedCustomMonth = customMonthName.charAt(0).toUpperCase() + customMonthName.slice(1);
        return `${capitalizedCustomMonth} ${customYear}`;
      }
      return 'Período Personalizado';
    default:
      return `${currentMonth} ${currentYear}`;
  }
};
