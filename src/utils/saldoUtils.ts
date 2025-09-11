import { supabase } from '@/integrations/supabase/client';

export interface SaldoAjuste {
  tipo: 'conta' | 'cofre';
  valor: number; // Positivo para somar, negativo para subtrair
}

/**
 * Função centralizada para ajustar saldos
 * @param tipo - 'conta' ou 'cofre'
 * @param valor - Valor a ser aplicado (positivo para somar, negativo para subtrair)
 */
export const ajustarSaldo = async (tipo: 'conta' | 'cofre', valor: number): Promise<void> => {
  if (valor === 0) return; // Não faz nada se o valor for zero

  console.log(`=== AJUSTANDO SALDO ===`);
  console.log(`Tipo: ${tipo}, Valor: ${valor}`);

  // Buscar o saldo atual ou criar se não existir
  const { data: currentSaldo, error: fetchError } = await supabase
    .from('saldos')
    .select('*')
    .eq('tipo', tipo)
    .maybeSingle();

  if (fetchError) {
    console.error('Erro ao buscar saldo:', fetchError);
    throw fetchError;
  }

  const valorAtual = currentSaldo?.valor || 0;
  const novoValor = valorAtual + valor;

  console.log(`Saldo atual: ${valorAtual}, Novo saldo: ${novoValor}`);

  if (currentSaldo) {
    // Atualizar registro existente
    const { error } = await supabase
      .from('saldos')
      .update({ valor: novoValor })
      .eq('tipo', tipo);

    if (error) {
      console.error('Erro ao atualizar saldo:', error);
      throw error;
    }
  } else {
    // Criar novo registro
    const { error } = await supabase
      .from('saldos')
      .insert({ tipo, valor: novoValor });

    if (error) {
      console.error('Erro ao criar saldo:', error);
      throw error;
    }
  }

  console.log('Saldo ajustado com sucesso');
};

/**
 * Calcula a diferença entre dois valores de despesa para ajuste de saldo
 * @param valorOriginal - Valor original da despesa (incluindo juros)
 * @param valorNovo - Novo valor da despesa (incluindo juros)
 * @returns Diferença que deve ser aplicada ao saldo (negativa se o saldo deve diminuir)
 */
export const calcularDiferencaSaldo = (valorOriginal: number, valorNovo: number): number => {
  const diferenca = valorNovo - valorOriginal;
  return -diferenca; // Negativo porque despesas diminuem o saldo
};