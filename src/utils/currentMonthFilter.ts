import { Transaction } from '@/types/transaction';
import { Receita } from '@/hooks/useReceitas';

// Robust date parser that handles: 'DD/MM/YYYY', 'YYYY-MM-DD', and ISO strings with time
export const parseDateFlexible = (input?: string | null): Date | null => {
  if (!input) return null;
  const s = String(input).trim();
  if (!s) return null;

  // Brazilian format: DD/MM/YYYY
  if (s.includes('/')) {
    const [dia, mes, ano] = s.split('/').map(Number);
    if (!dia || !mes || !ano) return null;
    return new Date(ano, mes - 1, dia);
  }

  // ISO or timestamp: let Date parse it safely
  if (s.includes('T')) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  // YYYY-MM-DD (with or without zero padding)
  const ymdMatch = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymdMatch) {
    const ano = Number(ymdMatch[1]);
    const mes = Number(ymdMatch[2]);
    const dia = Number(ymdMatch[3]);
    return new Date(ano, mes - 1, dia);
  }

  // Fallback
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

export const filterDespesasCurrentMonth = (transactions: Transaction[], dateFrom?: string, dateTo?: string, excludeCamerino: boolean = true) => {
  if (!transactions || transactions.length === 0) return [];






  // Se foram fornecidas datas específicas, usar elas
  if (dateFrom || dateTo) {


    const filteredByDate = transactions.filter(transaction => {
      const transactionDateStr = transaction.data_vencimento || transaction.date;
      const itemDate = parseDateFlexible(transactionDateStr);
      if (!itemDate) return false;

      const fromDate = dateFrom ? parseDateFlexible(dateFrom) : null;
      const toDate = dateTo ? parseDateFlexible(dateTo) : null;
      if (toDate) toDate.setHours(23, 59, 59, 999);

      if (fromDate && itemDate < fromDate) return false;
      if (toDate && itemDate > toDate) return false;
      return true;
    });

    // Aplicar filtro Camerino se necessário
    const finalFiltered = excludeCamerino
      ? filteredByDate.filter(transaction => {
        const empresa = transaction.company?.toLowerCase().trim() || '';
        return !empresa.includes('camerino');
      })
      : filteredByDate;



    return finalFiltered;
  }

  // Caso contrário, filtrar APENAS pelo mês atual
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);





  const filtered = transactions.filter(transaction => {
    const vencimento = transaction.data_vencimento;
    const pagamento = transaction.date;

    let includeTransaction = false;

    // Logar todas as despesas para debug
    if (vencimento && vencimento.includes('2025-09') && parseInt(vencimento.split('-')[2]) >= 16) {
      console.log('🔍 Analisando despesa:', {
        id: transaction.id,
        descricao: transaction.description,
        vencimento: vencimento,
        pagamento: pagamento,
        empresa: transaction.company
      });
    }

    // Se foi paga (tem data de pagamento), usar a data de pagamento como critério principal
    if (pagamento) {
      const pagamentoDate = parseDateFlexible(pagamento);

      if (pagamentoDate >= currentMonthStart && pagamentoDate <= currentMonthEnd) {
        includeTransaction = true;

      } else {

      }
    }
    // Se não foi paga ainda, usar data de vencimento
    else if (vencimento) {
      const vencimentoDate = parseDateFlexible(vencimento);

      const isInRange = vencimentoDate >= currentMonthStart && vencimentoDate <= currentMonthEnd;

      if (vencimento && vencimento.includes('2025-09') && parseInt(vencimento.split('-')[2]) >= 16) {
        console.log('🔍 Debug vencimento:', {
          vencimento: vencimento,
          vencimentoDate: vencimentoDate.toLocaleDateString('pt-BR'),
          currentMonthStart: currentMonthStart.toLocaleDateString('pt-BR'),
          currentMonthEnd: currentMonthEnd.toLocaleDateString('pt-BR'),
          isInRange: isInRange,
          descricao: transaction.description
        });
      }

      if (isInRange) {
        includeTransaction = true;

      } else {
        if (vencimento && vencimento.includes('2025-09') && parseInt(vencimento.split('-')[2]) >= 16) {

        }
      }
    }

    return includeTransaction;
  });

  // Aplicar filtro Camerino se necessário
  const finalFiltered = excludeCamerino
    ? filtered.filter(transaction => {
      const empresa = transaction.company?.toLowerCase().trim() || '';
      return !empresa.includes('camerino');
    })
    : filtered;



  return finalFiltered;
};

export const filterReceitasCurrentMonth = (receitas: Receita[], dateFrom?: string, dateTo?: string, excludeCamerino: boolean = true) => {
  if (!receitas || receitas.length === 0) return [];






  // Se foram fornecidas datas específicas, usar elas
  if (dateFrom || dateTo) {


    const filteredByDate = receitas.filter(receita => {
      const receitaDate = receita.data_recebimento || receita.data;
      if (!receitaDate) return false;

      let itemDate: Date;
      if (receitaDate.includes('/')) {
        const [dia, mes, ano] = receitaDate.split('/');
        itemDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      } else {
        itemDate = new Date(receitaDate + 'T00:00:00');
      }

      const fromDate = dateFrom ? new Date(dateFrom + 'T00:00:00') : null;
      const toDate = dateTo ? new Date(dateTo + 'T23:59:59') : null;

      if (fromDate && itemDate < fromDate) return false;
      if (toDate && itemDate > toDate) return false;

      return true;
    });

    // Aplicar filtro Camerino se necessário
    const finalFiltered = excludeCamerino
      ? filteredByDate.filter(receita => {
        const empresa = receita.empresa?.toLowerCase().trim() || '';
        return !empresa.includes('camerino');
      })
      : filteredByDate;



    return finalFiltered;
  }

  // Caso contrário, filtrar APENAS pelo mês atual
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);




  const filtered = receitas.filter(receita => {
    const dataReceita = receita.data;
    const dataRecebimento = receita.data_recebimento;

    let includeReceita = false;

    // Verificar data da receita (deve ser do mês atual)
    if (dataReceita) {
      let receitaDate: Date;
      if (dataReceita.includes('/')) {
        const [dia, mes, ano] = dataReceita.split('/');
        receitaDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      } else {
        receitaDate = new Date(dataReceita + 'T00:00:00');
      }

      if (receitaDate >= currentMonthStart && receitaDate <= currentMonthEnd) {
        includeReceita = true;

      }
    }

    // Se não foi incluído por data da receita, verificar data de recebimento
    if (!includeReceita && dataRecebimento) {
      let recebimentoDate: Date;
      if (dataRecebimento.includes('/')) {
        const [dia, mes, ano] = dataRecebimento.split('/');
        recebimentoDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      } else {
        recebimentoDate = new Date(dataRecebimento + 'T00:00:00');
      }

      if (recebimentoDate >= currentMonthStart && recebimentoDate <= currentMonthEnd) {
        includeReceita = true;

      }
    }

    return includeReceita;
  });

  // Aplicar filtro Camerino se necessário
  const finalFiltered = excludeCamerino
    ? filtered.filter(receita => {
      const empresa = receita.empresa?.toLowerCase().trim() || '';
      return !empresa.includes('camerino');
    })
    : filtered;



  return finalFiltered;
};
