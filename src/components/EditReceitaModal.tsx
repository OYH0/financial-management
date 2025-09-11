
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Receita, useUpdateReceita } from '@/hooks/useReceitas';
import { useUpdateSaldo } from '@/hooks/useSaldos';

interface EditReceitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  receita: Receita | null;
}

const EditReceitaModal: React.FC<EditReceitaModalProps> = ({ isOpen, onClose, receita }) => {
  const [formData, setFormData] = useState({
    data: '',
    descricao: '',
    empresa: '',
    categoria: '',
    valor: '',
    data_recebimento: '',
    destino: 'total' as 'conta' | 'cofre' | 'total'
  });

  const { toast } = useToast();
  const updateReceita = useUpdateReceita();
  const updateSaldo = useUpdateSaldo();

  useEffect(() => {
    if (receita) {
      setFormData({
        data: receita.data || '',
        descricao: receita.descricao || '',
        empresa: receita.empresa || '',
        categoria: receita.categoria || '',
        valor: receita.valor?.toString() || '',
        data_recebimento: receita.data_recebimento || '',
        destino: (receita as any).destino || 'total'
      });
    }
  }, [receita]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!receita) return;

    try {
      const valor = parseFloat(formData.valor);
      if (isNaN(valor) || valor <= 0) {
        toast({
          title: "Erro",
          description: "Valor deve ser um número maior que zero",
          variant: "destructive",
        });
        return;
      }

      const oldDestino = (receita as any).destino || 'total';
      const oldValor = receita.valor;
      const newDestino = formData.destino;
      const newValor = valor;

      await updateReceita.mutateAsync({
        id: receita.id,
        data: formData.data,
        descricao: formData.descricao,
        empresa: formData.empresa,
        categoria: formData.categoria,
        valor: valor,
        data_recebimento: formData.data_recebimento || null,
        destino: formData.destino
      });

      // Handle saldo updates if destino or valor changed and involves conta/cofre
      if (oldDestino !== newDestino || (oldDestino === newDestino && oldValor !== newValor)) {
        // Revert old value if it was in conta or cofre
        if (oldDestino === 'conta' || oldDestino === 'cofre') {
          await updateSaldo.mutateAsync({
            tipo: oldDestino,
            valor: -oldValor // Subtract old value
          });
        }
        
        // Add new value if it's going to conta or cofre
        if (newDestino === 'conta' || newDestino === 'cofre') {
          await updateSaldo.mutateAsync({
            tipo: newDestino,
            valor: newValor // Add new value
          });
        }
      }

      onClose();
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Receita</DialogTitle>
          <DialogDescription>
            Faça alterações na receita selecionada.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data" className="text-sm font-medium">Data da Receita *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => handleChange('data', e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valor" className="text-sm font-medium">Valor (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={(e) => handleChange('valor', e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-sm font-medium">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descrição da receita"
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                className="w-full min-h-[80px] resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Classificação */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground border-b pb-2">Classificação</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empresa" className="text-sm font-medium">Empresa/Cliente *</Label>
                <Select value={formData.empresa} onValueChange={(value) => handleChange('empresa', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50">
                    <SelectItem value="Churrasco">Companhia do Churrasco</SelectItem>
                    <SelectItem value="Johnny">Johnny Rockets</SelectItem>
                    <SelectItem value="Camerino">Camerino</SelectItem>
                    <SelectItem value="Implementacao">Implementação</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-sm font-medium">Categoria *</Label>
                <Select value={formData.categoria} onValueChange={(value) => handleChange('categoria', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50">
                    <SelectItem value="VENDAS">Vendas</SelectItem>
                    <SelectItem value="VENDAS_DIARIAS">Vendas Diárias</SelectItem>
                    <SelectItem value="OUTROS">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destino" className="text-sm font-medium">Destino do Valor *</Label>
                <Select value={formData.destino} onValueChange={(value: 'conta' | 'cofre' | 'total') => handleChange('destino', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o destino" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50">
                    <SelectItem value="conta">Conta Bancária</SelectItem>
                    <SelectItem value="cofre">Cofre</SelectItem>
                    <SelectItem value="total">Receita Total (Empresas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_recebimento" className="text-sm font-medium">Data de Recebimento</Label>
                <Input
                  id="data_recebimento"
                  type="date"
                  value={formData.data_recebimento}
                  onChange={(e) => handleChange('data_recebimento', e.target.value)}
                  className="w-full"
                  placeholder="Opcional"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={updateReceita.isPending || updateSaldo.isPending}
            >
              {(updateReceita.isPending || updateSaldo.isPending) ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReceitaModal;
