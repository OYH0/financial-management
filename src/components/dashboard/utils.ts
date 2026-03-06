/**
 * Sanitiza uma string de data, corrigindo anos mal formatados
 * Exemplo: "20225-09-23" -> "2025-09-23"
 */
const sanitizeDate = (dateStr: string | null | undefined): string | null => {
  if (!dateStr) return null;

  // Corrigir anos com 5 dígitos (ex: 20225 -> 2025)
  // Padrão: NNNNN-MM-DD onde NNNNN começa com 202
  const invalidYearPattern = /^(202\d)\d-/;
  if (invalidYearPattern.test(dateStr)) {
    const correctedDate = dateStr.replace(invalidYearPattern, '$1-');
    console.warn(`⚠️ Data corrigida: ${dateStr} -> ${correctedDate}`);
    return correctedDate;
  }

  return dateStr;
};

export const filterDataByPeriod = (data: any[], period: string, customMonth?: number, customYear?: number) => {
  if (!data || data.length === 0) return [];




  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case 'today':
      // Para "hoje", usar apenas a data (ignorar horário)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startDate = today;
      endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Fim do dia

      break;
    case 'week':
      // Semana atual (domingo a sábado)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      startDate = startOfWeek;
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      break;
    case 'month':
      // Mês atual
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      break;
    case 'year':
      // Ano atual
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

      break;
    case 'custom':
      // Período personalizado - APENAS o mês selecionado (não acumulado)
      if (customMonth && customYear) {
        startDate = new Date(customYear, customMonth - 1, 1); // Primeiro dia do mês selecionado
        endDate = new Date(customYear, customMonth, 0, 23, 59, 59, 999); // Último dia do mês selecionado

      } else {

        return data;
      }
      break;
    default:

      return data; // Return all data if period is not recognized
  }

  const filtered = data.filter(item => {
    // Parse da data - PRIORIZAR data_vencimento para despesas
    let itemDate: Date;
    let tipoItem = 'DESCONHECIDO';

    // Identificar se é receita ou despesa
    if (item.data_vencimento || item.valor_total !== undefined) {
      tipoItem = 'DESPESA';
    } else if (item.data && !item.data_vencimento) {
      tipoItem = 'RECEITA';
    }

    // Para despesas, usar data_vencimento primeiro, depois data
    if (item.data_vencimento) {
      const sanitizedDate = sanitizeDate(item.data_vencimento);
      if (!sanitizedDate) {

        return false;
      }

      if (sanitizedDate.includes('/')) {
        // Formato DD/MM/YYYY
        const [dia, mes, ano] = sanitizedDate.split('/');
        itemDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      } else {
        // Formato YYYY-MM-DD
        const [ano, mes, dia] = sanitizedDate.split('-');
        itemDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia || "1"));
      }

    } else if (item.data) {
      // Para receitas com mes_referencia, usar mes_referencia como data de filtro
      const dateToUse = item.mes_referencia ? sanitizeDate(item.mes_referencia) : sanitizeDate(item.data);
      if (!dateToUse) {

        return false;
      }

      if (dateToUse.includes('/')) {
        // Formato DD/MM/YYYY
        const [dia, mes, ano] = dateToUse.split('/');
        itemDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      } else {
        // Formato YYYY-MM-DD
        const [ano, mes, dia] = dateToUse.split('-');
        itemDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia || "1"));
      }
      // Para receitas, mostrar também data_recebimento se existir
      const dataRecebimentoInfo = item.data_recebimento ? ` | Data Recebimento: ${item.data_recebimento}` : ' | Pendente';
      const mesRefInfo = item.mes_referencia ? ` | Mês Ref: ${item.mes_referencia}` : '';

    } else if (item.data_pagamento) {
      const sanitizedDate = sanitizeDate(item.data_pagamento);
      if (!sanitizedDate) {

        return false;
      }

      // Usar data_pagamento apenas se não houver data_vencimento nem data
      if (sanitizedDate.includes('/')) {
        const [dia, mes, ano] = sanitizedDate.split('/');
        itemDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      } else {
        const [ano, mes, dia] = sanitizedDate.split('-');
        itemDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia || "1"));
      }

    } else {

      return false;
    }

    if (period === 'today') {
      // Para hoje, comparar apenas a data (ano, mês, dia)
      const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
      const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const match = itemDateOnly.getTime() === todayOnly.getTime();

      if (match) {

      }

      return match;
    }

    const match = itemDate >= startDate && itemDate <= endDate;

    if (match) {

    }

    return match;
  });


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
