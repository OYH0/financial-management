
import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CamerinoPasswordProtectionProps {
  onPasswordCorrect: () => void;
}

const CAMERINO_PASSWORD = 'camerino2024'; // Senha fixa para acesso

const CamerinoPasswordProtection: React.FC<CamerinoPasswordProtectionProps> = ({ onPasswordCorrect }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular um pequeno delay para dar feedback visual
    setTimeout(() => {
      if (password === CAMERINO_PASSWORD) {
        onPasswordCorrect();
      } else {
        setError('Senha incorreta. Tente novamente.');
        setPassword('');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl w-fit mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">
              Acesso Restrito
            </CardTitle>
            <CardDescription className="text-gray-600">
              Digite a senha para acessar os dados do Camerino
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite a senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                  {error}
                </p>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                disabled={isLoading || !password.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Verificando...
                  </div>
                ) : (
                  'Acessar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CamerinoPasswordProtection;
