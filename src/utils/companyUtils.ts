/**
 * Utilitários para filtros e normalizações de empresas
 * 
 * Este arquivo centraliza toda a lógica de identificação e filtro de empresas,
 * incluindo tratamento de nomes legados e variações.
 * 
 * ⚠️ IMPORTANTE: Após a migração SQL 20251102000000, os dados legados foram
 * normalizados no banco. Estas funções mantêm compatibilidade para casos edge.
 */

import { COMPANIES } from '@/constants/companies';

/**
 * Normaliza o nome da empresa para lowercase e remove espaços extras
 */
const normalizeCompanyName = (empresa?: string | null): string => {
  if (!empresa) return '';
  return empresa.toLowerCase().trim();
};

/**
 * Verifica se a empresa é Companhia do Churrasco Cariri
 * Inclui verificação de dados legados para compatibilidade
 */
export const isCompanhiaCariri = (empresa?: string | null): boolean => {
  const normalized = normalizeCompanyName(empresa);
  
  return normalized === 'companhia do churrasco cariri' ||
         normalized === 'companhia do churrasco' || // DADOS LEGADOS (raro após migração)
         normalized === 'churrasco' || // DADOS LEGADOS (raro após migração)
         normalized.includes('cariri');
};

/**
 * Verifica se a empresa é Companhia do Churrasco Fortaleza
 */
export const isCompanhiaFortaleza = (empresa?: string | null): boolean => {
  const normalized = normalizeCompanyName(empresa);
  
  return normalized === 'companhia do churrasco fortaleza' ||
         normalized.includes('fortaleza');
};

/**
 * Verifica se a empresa é qualquer unidade da Companhia do Churrasco
 */
export const isCompanhiaChurrasco = (empresa?: string | null): boolean => {
  return isCompanhiaCariri(empresa) || isCompanhiaFortaleza(empresa);
};

/**
 * Verifica se a empresa é Johnny Rockets
 */
export const isJohnnyRockets = (empresa?: string | null): boolean => {
  const normalized = normalizeCompanyName(empresa);
  
  return normalized === 'johnny rockets' ||
         normalized === 'johnny rocket' ||
         normalized === 'johnny' ||
         normalized.includes('johnny');
};

/**
 * Verifica se a empresa é Camerino
 */
export const isCamerino = (empresa?: string | null): boolean => {
  const normalized = normalizeCompanyName(empresa);
  
  return normalized === 'camerino' ||
         normalized.includes('camerino');
};

/**
 * Verifica se a empresa é Implementação
 */
export const isImplementacao = (empresa?: string | null): boolean => {
  const normalized = normalizeCompanyName(empresa);
  
  return normalized === 'implementação' ||
         normalized === 'implementacao' ||
         normalized.includes('implementa');
};

/**
 * Retorna o ID padronizado da empresa
 */
export const getCompanyId = (empresa?: string | null): string => {
  if (isCompanhiaCariri(empresa)) return COMPANIES.CHURRASCO_CARIRI.id;
  if (isCompanhiaFortaleza(empresa)) return COMPANIES.CHURRASCO_FORTALEZA.id;
  if (isJohnnyRockets(empresa)) return COMPANIES.JOHNNY_ROCKETS.id;
  if (isCamerino(empresa)) return COMPANIES.CAMERINO.id;
  if (isImplementacao(empresa)) return COMPANIES.IMPLEMENTACAO.id;
  return 'unknown';
};

/**
 * Retorna o nome padronizado da empresa
 */
export const getCompanyName = (empresa?: string | null): string => {
  if (isCompanhiaCariri(empresa)) return COMPANIES.CHURRASCO_CARIRI.name;
  if (isCompanhiaFortaleza(empresa)) return COMPANIES.CHURRASCO_FORTALEZA.name;
  if (isJohnnyRockets(empresa)) return COMPANIES.JOHNNY_ROCKETS.name;
  if (isCamerino(empresa)) return COMPANIES.CAMERINO.name;
  if (isImplementacao(empresa)) return COMPANIES.IMPLEMENTACAO.name;
  return empresa || 'Desconhecido';
};

/**
 * Retorna o nome curto da empresa
 */
export const getCompanyShortName = (empresa?: string | null): string => {
  if (isCompanhiaCariri(empresa)) return COMPANIES.CHURRASCO_CARIRI.shortName;
  if (isCompanhiaFortaleza(empresa)) return COMPANIES.CHURRASCO_FORTALEZA.shortName;
  if (isJohnnyRockets(empresa)) return COMPANIES.JOHNNY_ROCKETS.shortName;
  if (isCamerino(empresa)) return COMPANIES.CAMERINO.shortName;
  if (isImplementacao(empresa)) return COMPANIES.IMPLEMENTACAO.shortName;
  return empresa || 'Desconhecido';
};

/**
 * Retorna a cor da empresa
 */
export const getCompanyColor = (empresa?: string | null): string => {
  if (isCompanhiaCariri(empresa)) return COMPANIES.CHURRASCO_CARIRI.color;
  if (isCompanhiaFortaleza(empresa)) return COMPANIES.CHURRASCO_FORTALEZA.color;
  if (isJohnnyRockets(empresa)) return COMPANIES.JOHNNY_ROCKETS.color;
  if (isCamerino(empresa)) return COMPANIES.CAMERINO.color;
  if (isImplementacao(empresa)) return COMPANIES.IMPLEMENTACAO.color;
  return '#6B7280'; // gray-500
};

/**
 * Filtra uma lista de despesas/receitas por empresa
 * @param items - Array de items (despesas ou receitas)
 * @param companyChecker - Função que verifica se é a empresa desejada
 * @returns Array filtrado
 */
export const filterByCompany = <T extends { empresa?: string | null }>(
  items: T[],
  companyChecker: (empresa?: string | null) => boolean
): T[] => {
  return items.filter(item => companyChecker(item.empresa));
};

/**
 * Agrupa items por empresa
 */
export const groupByCompany = <T extends { empresa?: string | null }>(
  items: T[]
): Record<string, T[]> => {
  const grouped: Record<string, T[]> = {
    [COMPANIES.CHURRASCO_CARIRI.id]: [],
    [COMPANIES.CHURRASCO_FORTALEZA.id]: [],
    [COMPANIES.JOHNNY_ROCKETS.id]: [],
    [COMPANIES.CAMERINO.id]: [],
    [COMPANIES.IMPLEMENTACAO.id]: [],
    unknown: []
  };

  items.forEach(item => {
    const companyId = getCompanyId(item.empresa);
    if (grouped[companyId]) {
      grouped[companyId].push(item);
    } else {
      grouped.unknown.push(item);
    }
  });

  return grouped;
};

/**
 * Debug: Lista todas as empresas únicas em um array de items
 */
export const listUniqueCompanies = <T extends { empresa?: string | null }>(
  items: T[]
): string[] => {
  const uniqueCompanies = new Set(
    items.map(item => item.empresa).filter(Boolean)
  );
  return Array.from(uniqueCompanies) as string[];
};

