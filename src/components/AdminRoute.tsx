
import React from 'react';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdmin, loading } = useAdminAccess();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-pink-100">
        <div className="text-center">
          <div className="mb-4 p-4 bg-white/20 rounded-2xl backdrop-blur-sm mx-auto w-fit">
            <Shield size={48} className="text-blue-600" />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-pink-100 p-8">
        <Card className="max-w-md mx-auto bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Acesso Negado
            </CardTitle>
            <CardDescription className="text-gray-600">
              Você não tem permissão para acessar esta página
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500">
              Esta área é restrita apenas para administradores do sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
