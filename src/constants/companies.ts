/**
 * Constantes centralizadas de empresas
 * 
 * Este arquivo centraliza todas as informações sobre as empresas do sistema,
 * incluindo IDs, nomes padronizados, nomes curtos e nomes legados (para filtros).
 * 
 * ⚠️ IMPORTANTE: Após a migração SQL 20251102000000, os dados legados
 * ("Companhia do Churrasco") foram normalizados no banco de dados.
 * Mantemos as referências legadas aqui apenas para compatibilidade com
 * possíveis dados que não foram migrados ou para filtros de busca.
 */

export interface Company {
  id: string;
  name: string;
  shortName: string;
  legacyNames: string[];
  color: string;
  icon: string;
}

export const COMPANIES = {
  CHURRASCO_CARIRI: {
    id: 'companhia-churrasco-cariri',
    name: 'Companhia do Churrasco Cariri',
    shortName: 'Churrasco - Cariri',
    legacyNames: ['Companhia do Churrasco', 'Churrasco'],
    color: '#EF4444', // red-500
    icon: 'Building2'
  },
  CHURRASCO_FORTALEZA: {
    id: 'companhia-churrasco-fortaleza',
    name: 'Companhia do Churrasco Fortaleza',
    shortName: 'Churrasco - Fortaleza',
    legacyNames: [],
    color: '#F97316', // orange-500
    icon: 'Building2'
  },
  JOHNNY_ROCKETS: {
    id: 'johnny-rockets',
    name: 'Johnny Rockets',
    shortName: 'Johnny',
    legacyNames: ['Johnny', 'Johnny Rocket'],
    color: '#3B82F6', // blue-500
    icon: 'Store'
  },
  CAMERINO: {
    id: 'camerino',
    name: 'Camerino',
    shortName: 'Camerino',
    legacyNames: [],
    color: '#8B5CF6', // purple-500
    icon: 'Building2'
  },
  IMPLEMENTACAO: {
    id: 'implementacao',
    name: 'Implementação',
    shortName: 'Implementação',
    legacyNames: [],
    color: '#6366F1', // indigo-500
    icon: 'Rocket'
  }
} as const;

/**
 * Array de todas as empresas para uso em selects e loops
 */
export const COMPANIES_ARRAY = Object.values(COMPANIES);

/**
 * Opções para Select (formato compatível com shadcn/ui)
 */
export const COMPANY_SELECT_OPTIONS = [
  {
    value: COMPANIES.CHURRASCO_CARIRI.name,
    label: COMPANIES.CHURRASCO_CARIRI.shortName
  },
  {
    value: COMPANIES.CHURRASCO_FORTALEZA.name,
    label: COMPANIES.CHURRASCO_FORTALEZA.shortName
  },
  {
    value: COMPANIES.JOHNNY_ROCKETS.name,
    label: COMPANIES.JOHNNY_ROCKETS.shortName
  },
  {
    value: COMPANIES.CAMERINO.name,
    label: COMPANIES.CAMERINO.shortName
  },
  {
    value: COMPANIES.IMPLEMENTACAO.name,
    label: COMPANIES.IMPLEMENTACAO.shortName
  }
];

/**
 * Categorias de despesas padronizadas
 */
export const EXPENSE_CATEGORIES = {
  INSUMOS: {
    id: 'INSUMOS',
    name: 'Insumos',
    color: '#10B981', // green-500
    subcategories: [
      'Proteínas',
      'Hortifrúti',
      'Bebidas',
      'Mercado Comum',
      'Supermercado'
    ]
  },
  FIXAS: {
    id: 'FIXAS',
    name: 'Fixas',
    color: '#EF4444', // red-500
    subcategories: [
      'Folha Salarial',
      'Taxa de Ocupação',
      'Empréstimos e Prestações'
    ]
  },
  VARIAVEIS: {
    id: 'VARIÁVEIS',
    name: 'Variáveis',
    color: '#F59E0B', // amber-500
    subcategories: [
      'Descartáveis e Limpeza',
      'Combustível e Transporte',
      'Manutenção',
      'Sazonais'
    ]
  },
  OBRAS: {
    id: 'OBRAS',
    name: 'Obras',
    color: '#F97316', // orange-500
    subcategories: []
  },
  RETIRADAS: {
    id: 'RETIRADAS',
    name: 'Retiradas',
    color: '#8B5CF6', // purple-500
    subcategories: ['Pró-labore']
  },
  IMPLEMENTACAO: {
    id: 'IMPLEMENTACAO',
    name: 'Implementação',
    color: '#6366F1', // indigo-500
    subcategories: []
  }
} as const;

export const EXPENSE_CATEGORIES_ARRAY = Object.values(EXPENSE_CATEGORIES);

/**
 * Status de transações
 */
export const TRANSACTION_STATUS = {
  PAGO: {
    id: 'PAGO',
    name: 'Pago',
    color: 'bg-green-100 text-green-800'
  },
  PENDENTE: {
    id: 'PENDENTE',
    name: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800'
  },
  ATRASADO: {
    id: 'ATRASADO',
    name: 'Atrasado',
    color: 'bg-red-100 text-red-800'
  }
} as const;

