
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, Eye, EyeOff } from 'lucide-react';
import { useTabPermissions } from '@/hooks/useTabPermissions';

interface Profile {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

interface TabPermissionsManagerProps {
  profiles: Profile[];
}

const TabPermissionsManager: React.FC<TabPermissionsManagerProps> = ({ profiles }) => {
  const { userPermissions, loading, updateTabPermission, getUserTabVisibility } = useTabPermissions();

  const tabLabels = {
    camerino: 'Camerino',
    companhia: 'Companhia do Churrasco',
    johnny: 'Johnny Rockets',
    admin: 'Admin',
    despesas: 'Despesas',
    receitas: 'Receitas'
  };

  const handlePermissionChange = async (userId: string, tabName: string, isVisible: boolean) => {
    await updateTabPermission(userId, tabName, isVisible);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando permissões...</p>
      </div>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg">
            <Settings className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <CardTitle className="text-gray-800">Permissões de Abas</CardTitle>
            <CardDescription className="text-gray-600">
              Configure quais abas cada usuário pode visualizar
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {profiles.map((profile) => {
            const visibility = getUserTabVisibility(profile.id);
            
            return (
              <div key={profile.id} className="p-4 bg-white/50 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{profile.email}</p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={profile.is_admin ? "default" : "secondary"}
                          className={profile.is_admin ? "bg-green-100 text-green-800" : ""}
                        >
                          {profile.is_admin ? 'Administrador' : 'Usuário'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(tabLabels).map(([tabKey, tabLabel]) => {
                    const isVisible = visibility[tabKey as keyof typeof visibility];
                    
                    return (
                      <div key={tabKey} className="flex items-center justify-between p-3 bg-white/70 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {isVisible ? (
                            <Eye className="h-4 w-4 text-green-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                          <Label htmlFor={`${profile.id}-${tabKey}`} className="text-sm font-medium">
                            {tabLabel}
                          </Label>
                        </div>
                        <Switch
                          id={`${profile.id}-${tabKey}`}
                          checked={isVisible}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(profile.id, tabKey, checked)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {profiles.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium">Nenhum usuário encontrado</p>
            <p className="text-sm">Os usuários aparecerão aqui quando estiverem cadastrados</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TabPermissionsManager;
