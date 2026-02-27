/**
 * Utility for "Saldo do Mês Anterior" logic.
 * 
 * - Receitas with categoria SALDO_MES_ANTERIOR go to a separate "saldo" pool
 * - Despesas first consume this saldo pool before counting as real expenses
 * - Receita Total excludes SALDO_MES_ANTERIOR entries
 */

export interface SaldoCalculation {
  /** Total from SALDO_MES_ANTERIOR receitas */
  saldoMesAnterior: number;
  /** Remaining saldo after expenses consumed it */
  saldoRestante: number;
  /** Effective expenses (after saldo abatement) */
  despesasEfetivas: number;
  /** Total receitas excluding SALDO_MES_ANTERIOR */
  receitasVendas: number;
}

export function calcularSaldoMesAnterior(
  receitas: any[],
  despesas: any[]
): SaldoCalculation {
  // Separate SALDO_MES_ANTERIOR from regular receitas
  const receitasSaldo = receitas.filter(r => r.categoria === 'SALDO_MES_ANTERIOR');
  const receitasVendasArr = receitas.filter(r =>
    r.categoria !== 'SALDO_MES_ANTERIOR' &&
    r.categoria !== 'EM_COFRE' &&
    r.categoria !== 'EM_CONTA' &&
    !r.descricao?.toUpperCase().includes('PAGAMENTO DE DESPESA') &&
    ((r as any).destino === 'total' || !(r as any).destino)
  );

  const saldoMesAnterior = receitasSaldo.reduce((sum: number, r: any) => sum + (r.valor || 0), 0);
  const totalDespesas = despesas.reduce((sum: number, d: any) => sum + (d.valor_total || d.valor || 0), 0);
  const receitasVendas = receitasVendasArr.reduce((sum: number, r: any) => sum + (r.valor || 0), 0);

  // Expenses consume saldo first
  const saldoRestante = Math.max(0, saldoMesAnterior - totalDespesas);
  const despesasEfetivas = Math.max(0, totalDespesas - saldoMesAnterior);

  return {
    saldoMesAnterior,
    saldoRestante,
    despesasEfetivas,
    receitasVendas,
  };
}
