
import { useState, useCallback, useEffect } from 'react';

export const useCamerinoAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Verificar se já está autenticado no localStorage
    return localStorage.getItem('camerino-authenticated') === 'true';
  });

  const authenticate = useCallback(() => {
    setIsAuthenticated(true);
    localStorage.setItem('camerino-authenticated', 'true');
  }, []);

  const reset = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('camerino-authenticated');
  }, []);

  return {
    isAuthenticated,
    authenticate,
    reset
  };
};
