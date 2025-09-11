
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'password' | '2fa' | 'delete';
}

const SecurityModal = ({ isOpen, onClose, type }: SecurityModalProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const { toast } = useToast();

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Senha alterada",
      description: "Sua senha foi alterada com sucesso!",
    });
    onClose();
  };

  const handle2FA = () => {
    toast({
      title: "2FA Configurado",
      description: "Autenticação em duas etapas configurada com sucesso!",
    });
    onClose();
  };

  const handleDeleteAccount = () => {
    if (confirmDelete !== 'DELETAR') {
      toast({
        title: "Erro",
        description: "Digite 'DELETAR' para confirmar.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Conta excluída",
      description: "Sua conta foi marcada para exclusão.",
      variant: "destructive",
    });
    onClose();
  };

  const getModalContent = () => {
    switch (type) {
      case 'password':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Alterar Senha</DialogTitle>
              <DialogDescription>
                Digite sua senha atual e escolha uma nova senha.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswords(!showPasswords)}
                  >
                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePasswordChange} className="flex-1">
                  Alterar Senha
                </Button>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </>
        );

      case '2fa':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Configurar Autenticação em Duas Etapas</DialogTitle>
              <DialogDescription>
                Configure a autenticação em duas etapas para maior segurança.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  1. Baixe um aplicativo autenticador (Google Authenticator, Authy, etc.)
                  <br />
                  2. Escaneie o código QR que aparecerá
                  <br />
                  3. Digite o código de 6 dígitos para confirmar
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handle2FA} className="flex-1">
                  Configurar 2FA
                </Button>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </>
        );

      case 'delete':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Excluir Conta</DialogTitle>
              <DialogDescription>
                Esta ação é irreversível. Todos os seus dados serão perdidos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ ATENÇÃO: Esta ação é irreversível!
                </p>
                <p className="text-sm text-red-700 mt-2">
                  Todos os seus dados, incluindo despesas, receitas e relatórios serão permanentemente excluídos.
                </p>
              </div>
              <div>
                <Label htmlFor="confirm-delete">
                  Digite "DELETAR" para confirmar:
                </Label>
                <Input
                  id="confirm-delete"
                  value={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.value)}
                  placeholder="DELETAR"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount} 
                  className="flex-1"
                  disabled={confirmDelete !== 'DELETAR'}
                >
                  Excluir Conta
                </Button>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {getModalContent()}
      </DialogContent>
    </Dialog>
  );
};

export default SecurityModal;
