import React, { useState } from 'react';
import { Settings, User, Bell, Database, Shield, Palette, Download, Upload, Save } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { useDarkMode } from '@/hooks/useDarkMode';
import SecurityModal from '@/components/SecurityModal';
import { exportDataToPDF, exportDataToJSON, importDataFromJSON } from '@/utils/dataExport';

const ConfiguracoesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings, updateSettings } = useSettings();
  
  // Use dark mode effect
  useDarkMode(settings.darkMode);
  
  const [securityModal, setSecurityModal] = useState<{
    isOpen: boolean;
    type: 'password' | '2fa' | 'delete';
  }>({ isOpen: false, type: 'password' });

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram atualizadas com sucesso!",
    });
  };

  const handleExportPDF = () => {
    try {
      exportDataToPDF();
      toast({
        title: "PDF exportado",
        description: "Relatório em PDF foi baixado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o PDF.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    try {
      exportDataToJSON();
      toast({
        title: "Dados exportados",
        description: "Backup dos dados foi baixado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const data = await importDataFromJSON(file);
        
        // Restore data to localStorage
        if (data.despesas) localStorage.setItem('despesas', JSON.stringify(data.despesas));
        if (data.receitas) localStorage.setItem('receitas', JSON.stringify(data.receitas));
        if (data.configuracoes) localStorage.setItem('app-settings', JSON.stringify(data.configuracoes));
        
        toast({
          title: "Dados importados",
          description: "Backup foi restaurado com sucesso! Recarregue a página para ver as mudanças.",
        });
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "Não foi possível importar os dados. Verifique se o arquivo é válido.",
          variant: "destructive",
        });
      }
    };
    
    input.click();
  };

  const handleProfileUpdate = () => {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações de perfil foram atualizadas!",
    });
  };

  return (
    <div className={`flex min-h-screen ${settings.darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-100'}`}>
      <Sidebar />
      
      <div className="flex-1 lg:ml-64 transition-all duration-300 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 lg:p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                <Settings className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl lg:text-4xl font-bold bg-gradient-to-r ${settings.darkMode ? 'from-white to-gray-300' : 'from-gray-900 via-gray-800 to-gray-700'} bg-clip-text text-transparent`}>
                  Configurações
                </h1>
                <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm lg:text-lg`}>
                  Gerencie as configurações do sistema
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Perfil do Usuário */}
            <Card className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-sm border-white/20'} shadow-xl rounded-2xl`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className={`h-5 w-5 ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  <div>
                    <CardTitle className={`text-xl ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Perfil do Usuário
                    </CardTitle>
                    <CardDescription>Informações da sua conta</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={user?.email || ''} 
                      disabled 
                      className={`rounded-xl ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nome">Nome</Label>
                    <Input 
                      id="nome" 
                      value={settings.userProfile.nome}
                      onChange={(e) => updateSettings({
                        userProfile: { ...settings.userProfile, nome: e.target.value }
                      })}
                      placeholder="Seu nome completo" 
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="empresa">Empresa Principal</Label>
                  <Select 
                    value={settings.userProfile.empresaPrincipal}
                    onValueChange={(value) => updateSettings({
                      userProfile: { ...settings.userProfile, empresaPrincipal: value }
                    })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecione sua empresa principal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="churrasco">Companhia do Churrasco</SelectItem>
                      <SelectItem value="johnny">Johnny Rockets</SelectItem>
                      <SelectItem value="camerino">Camerino</SelectItem>
                      <SelectItem value="ambas">Todas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleProfileUpdate}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl"
                >
                  Atualizar Perfil
                </Button>
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-sm border-white/20'} shadow-xl rounded-2xl`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bell className={`h-5 w-5 ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  <div>
                    <CardTitle className={`text-xl ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Notificações
                    </CardTitle>
                    <CardDescription>Configure suas preferências de notificação</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Notificações Push</Label>
                    <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Receba notificações no navegador
                    </p>
                  </div>
                  <Switch 
                    checked={settings.notifications}
                    onCheckedChange={(checked) => updateSettings({ notifications: checked })}
                  />
                </div>
                
                {settings.notifications && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Lembrete de Despesas Próximas ao Vencimento</Label>
                        <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Receba notificações quando despesas estão prestes a vencer
                        </p>
                      </div>
                      <Switch 
                        checked={settings.reminderDueExpenses}
                        onCheckedChange={(checked) => updateSettings({ reminderDueExpenses: checked })}
                      />
                    </div>
                    
                    {settings.reminderDueExpenses && (
                      <div className="ml-6">
                        <Label htmlFor="reminderDays">Dias de antecedência</Label>
                        <Select 
                          value={settings.reminderDaysBeforeDue.toString()}
                          onValueChange={(value) => updateSettings({ reminderDaysBeforeDue: parseInt(value) })}
                        >
                          <SelectTrigger className="rounded-xl max-w-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 dia antes</SelectItem>
                            <SelectItem value="2">2 dias antes</SelectItem>
                            <SelectItem value="3">3 dias antes</SelectItem>
                            <SelectItem value="5">5 dias antes</SelectItem>
                            <SelectItem value="7">7 dias antes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Alertas por Email</Label>
                    <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Receba alertas importantes por email
                    </p>
                  </div>
                  <Switch 
                    checked={settings.emailAlerts}
                    onCheckedChange={(checked) => updateSettings({ emailAlerts: checked })}
                  />
                </div>
                
                {settings.emailAlerts && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Email - Lembrete de Despesas Próximas ao Vencimento</Label>
                        <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Receba emails quando despesas estão prestes a vencer
                        </p>
                      </div>
                      <Switch 
                        checked={settings.emailReminderDueExpenses}
                        onCheckedChange={(checked) => updateSettings({ emailReminderDueExpenses: checked })}
                      />
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Relatórios Automáticos</Label>
                    <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Receba relatórios mensais por email
                    </p>
                  </div>
                  <Switch 
                    checked={settings.monthlyReports}
                    onCheckedChange={(checked) => updateSettings({ monthlyReports: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Aparência */}
            <Card className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-sm border-white/20'} shadow-xl rounded-2xl`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Palette className={`h-5 w-5 ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  <div>
                    <CardTitle className={`text-xl ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Aparência
                    </CardTitle>
                    <CardDescription>Personalize a interface do sistema</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Modo Escuro</Label>
                    <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Usar tema escuro na interface
                    </p>
                  </div>
                  <Switch 
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
                  />
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Idioma</Label>
                    <Select 
                      value={settings.language} 
                      onValueChange={(value: 'pt-BR' | 'en-US' | 'es-ES') => updateSettings({ language: value })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Moeda</Label>
                    <Select 
                      value={settings.currency} 
                      onValueChange={(value: 'BRL' | 'USD' | 'EUR') => updateSettings({ currency: value })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">Real (R$)</SelectItem>
                        <SelectItem value="USD">Dólar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backup e Dados */}
            <Card className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-sm border-white/20'} shadow-xl rounded-2xl`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Database className={`h-5 w-5 ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  <div>
                    <CardTitle className={`text-xl ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Backup e Dados
                    </CardTitle>
                    <CardDescription>Gerencie seus dados e backups</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Backup Automático</Label>
                    <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Fazer backup automático dos dados
                    </p>
                  </div>
                  <Switch 
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => updateSettings({ autoBackup: checked })}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <Label>Frequência do Backup</Label>
                  <Select 
                    value={settings.backupFrequency} 
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') => updateSettings({ backupFrequency: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={handleExportPDF}
                    variant="outline" 
                    className="rounded-2xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </Button>
                  <Button 
                    onClick={handleExportData}
                    variant="outline" 
                    className="rounded-2xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Dados
                  </Button>
                  <Button 
                    onClick={handleImportData}
                    variant="outline" 
                    className="rounded-2xl"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importar Dados
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Segurança */}
            <Card className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-sm border-white/20'} shadow-xl rounded-2xl`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className={`h-5 w-5 ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  <div>
                    <CardTitle className={`text-xl ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Segurança
                    </CardTitle>
                    <CardDescription>Configure as opções de segurança</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => setSecurityModal({ isOpen: true, type: 'password' })}
                  variant="outline" 
                  className="w-full rounded-2xl"
                >
                  Alterar Senha
                </Button>
                <Button 
                  onClick={() => setSecurityModal({ isOpen: true, type: '2fa' })}
                  variant="outline" 
                  className="w-full rounded-2xl"
                >
                  Configurar Autenticação em Duas Etapas
                </Button>
                <Button 
                  onClick={() => setSecurityModal({ isOpen: true, type: 'delete' })}
                  variant="destructive" 
                  className="w-full rounded-2xl"
                >
                  Excluir Conta
                </Button>
              </CardContent>
            </Card>

            {/* Botão de Salvar */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveSettings}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg rounded-2xl px-8"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Todas as Configurações
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SecurityModal 
        isOpen={securityModal.isOpen}
        onClose={() => setSecurityModal({ ...securityModal, isOpen: false })}
        type={securityModal.type}
      />
    </div>
  );
};

export default ConfiguracoesPage;
