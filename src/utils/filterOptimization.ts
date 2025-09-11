import { useMemo } from 'react';

// Debounce function for filter inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Optimized filter function with memoization
export const useOptimizedFilter = (data: any[], filters: any) => {
  return useMemo(() => {
    if (!data || !data.length) return [];
    
    let filtered = data;
    
    // Apply filters only if they exist
    if (filters.empresa && filters.empresa !== 'all') {
      filtered = filtered.filter(item => item.empresa === filters.empresa);
    }
    
    if (filters.categoria && filters.categoria !== 'all') {
      filtered = filtered.filter(item => item.categoria === filters.categoria);
    }
    
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    
    if (filters.valorMin !== undefined) {
      filtered = filtered.filter(item => item.valor >= filters.valorMin);
    }
    
    if (filters.valorMax !== undefined) {
      filtered = filtered.filter(item => item.valor <= filters.valorMax);
    }
    
    if (filters.dataInicio) {
      const startDate = new Date(filters.dataInicio);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.data || item.data_vencimento);
        return itemDate >= startDate;
      });
    }
    
    if (filters.dataFim) {
      const endDate = new Date(filters.dataFim);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.data || item.data_vencimento);
        return itemDate <= endDate;
      });
    }
    
    return filtered;
  }, [data, filters]);
};

// Memoized calculations for stats
export const useOptimizedStats = (data: any[]) => {
  return useMemo(() => {
    if (!data || !data.length) {
      return {
        total: 0,
        pagas: 0,
        pendentes: 0,
        count: 0,
        pagasCount: 0,
        pendentesCount: 0,
      };
    }

    let total = 0;
    let pagas = 0;
    let pendentes = 0;
    let pagasCount = 0;
    let pendentesCount = 0;

    for (const item of data) {
      const valor = item.valor || 0;
      const valorTotal = item.valor_total || valor;
      
      total += valor;
      
      if (item.status === 'PAGO') {
        pagas += valorTotal;
        pagasCount++;
      } else {
        pendentes += valor;
        pendentesCount++;
      }
    }

    return {
      total,
      pagas,
      pendentes,
      count: data.length,
      pagasCount,
      pendentesCount,
    };
  }, [data]);
};