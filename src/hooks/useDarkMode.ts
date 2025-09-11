
import { useEffect } from 'react';

export const useDarkMode = (enabled: boolean) => {
  useEffect(() => {
    const root = document.documentElement;
    
    if (enabled) {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#1a1a1a';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '';
    }
    
    return () => {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '';
    };
  }, [enabled]);
};
