/**
 * Sistema de Logging Condicional
 * 
 * Este utilitário substitui console.log/error/warn diretos no código,
 * permitindo que logs sejam exibidos apenas em desenvolvimento.
 * 
 * Em produção, os logs são silenciados para melhorar performance e
 * evitar vazamento de informações sensíveis.
 * 
 * USO:
 * import { logger } from '@/utils/logger';
 * 
 * logger.log('Mensagem de debug');
 * logger.error('Erro aconteceu');
 * logger.warn('Aviso importante');
 * logger.info('Informação');
 */

/**
 * Verifica se está em modo de desenvolvimento
 */
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

/**
 * Configuração de logging
 * Pode ser desabilitado mesmo em desenvolvimento via localStorage
 */
const isLoggingEnabled = (): boolean => {
  if (!isDevelopment) return false;
  
  // Permite desabilitar logs em dev via localStorage
  // Execute no console: localStorage.setItem('disable_logs', 'true')
  const disableLogs = localStorage.getItem('disable_logs') === 'true';
  return !disableLogs;
};

/**
 * Formata o timestamp para os logs
 */
const getTimestamp = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    fractionalSecondDigits: 3
  });
};

/**
 * Adiciona prefixo com timestamp e tipo
 */
const formatMessage = (type: string, ...args: any[]): any[] => {
  return [`[${getTimestamp()}] [${type}]`, ...args];
};

/**
 * Logger principal
 */
export const logger = {
  /**
   * Log padrão (console.log)
   * Use para debug geral e informações de desenvolvimento
   */
  log: (...args: any[]): void => {
    if (isLoggingEnabled()) {
      console.log(...formatMessage('LOG', ...args));
    }
  },

  /**
   * Log de erro (console.error)
   * Use para erros e exceções
   */
  error: (...args: any[]): void => {
    if (isLoggingEnabled()) {
      console.error(...formatMessage('ERROR', ...args));
    }
  },

  /**
   * Log de aviso (console.warn)
   * Use para avisos e situações suspeitas
   */
  warn: (...args: any[]): void => {
    if (isLoggingEnabled()) {
      console.warn(...formatMessage('WARN', ...args));
    }
  },

  /**
   * Log de informação (console.info)
   * Use para informações importantes
   */
  info: (...args: any[]): void => {
    if (isLoggingEnabled()) {
      console.info(...formatMessage('INFO', ...args));
    }
  },

  /**
   * Log de debug detalhado
   * Use para debug muito específico
   */
  debug: (...args: any[]): void => {
    if (isLoggingEnabled()) {
      console.debug(...formatMessage('DEBUG', ...args));
    }
  },

  /**
   * Agrupa logs relacionados
   */
  group: (label: string): void => {
    if (isLoggingEnabled()) {
      console.group(`[${getTimestamp()}] ${label}`);
    }
  },

  /**
   * Fecha grupo de logs
   */
  groupEnd: (): void => {
    if (isLoggingEnabled()) {
      console.groupEnd();
    }
  },

  /**
   * Tabela (console.table)
   * Útil para visualizar arrays e objetos
   */
  table: (data: any): void => {
    if (isLoggingEnabled()) {
      console.table(data);
    }
  },

  /**
   * Mede tempo de execução
   */
  time: (label: string): void => {
    if (isLoggingEnabled()) {
      console.time(label);
    }
  },

  /**
   * Finaliza medição de tempo
   */
  timeEnd: (label: string): void => {
    if (isLoggingEnabled()) {
      console.timeEnd(label);
    }
  }
};

/**
 * Logger específico para performance
 * Sempre ativo, mas pode ser desabilitado via config
 */
export const performanceLogger = {
  mark: (label: string): void => {
    if (isDevelopment && typeof performance !== 'undefined') {
      performance.mark(label);
    }
  },

  measure: (name: string, startMark: string, endMark: string): void => {
    if (isDevelopment && typeof performance !== 'undefined') {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        logger.info(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
      } catch (e) {
        logger.error('Erro ao medir performance:', e);
      }
    }
  }
};

/**
 * Utilitário para debug de objetos grandes
 * Formata JSON de forma legível
 */
export const debugObject = (obj: any, label?: string): void => {
  if (isLoggingEnabled()) {
    logger.group(label || 'Object Debug');
    logger.log(JSON.stringify(obj, null, 2));
    logger.groupEnd();
  }
};

/**
 * Utilitário para debug de performance de funções
 * Uso: const result = await debugPerformance('myFunction', () => myFunction());
 */
export const debugPerformance = async <T>(
  label: string,
  fn: () => T | Promise<T>
): Promise<T> => {
  if (!isLoggingEnabled()) {
    return fn();
  }

  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    logger.info(`⏱️ ${label} executou em ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    logger.error(`⏱️ ${label} falhou após ${(end - start).toFixed(2)}ms`, error);
    throw error;
  }
};

/**
 * Tipo helper para funções com logging
 */
export type LogLevel = 'log' | 'error' | 'warn' | 'info' | 'debug';

/**
 * Cria um logger com prefixo específico
 * Útil para criar loggers por módulo/componente
 */
export const createModuleLogger = (moduleName: string) => {
  return {
    log: (...args: any[]) => logger.log(`[${moduleName}]`, ...args),
    error: (...args: any[]) => logger.error(`[${moduleName}]`, ...args),
    warn: (...args: any[]) => logger.warn(`[${moduleName}]`, ...args),
    info: (...args: any[]) => logger.info(`[${moduleName}]`, ...args),
    debug: (...args: any[]) => logger.debug(`[${moduleName}]`, ...args),
  };
};

// Exemplo de uso de logger por módulo:
// const authLogger = createModuleLogger('AuthContext');
// authLogger.log('User logged in');

export default logger;

