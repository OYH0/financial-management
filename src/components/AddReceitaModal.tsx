
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateReceita } from '@/hooks/useReceitas';
import { useUpdateSaldo } from '@/hooks/useSaldos';

interface AddReceitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmpresa?: string;
}

const AddReceitaModal: React.FC<AddReceitaModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultEmpresa 
}) => {
  const [formData, setFormData] = useState({
    data: '',
    valor: '',
    data_recebimento: '',
    descricao: '',
    empresa: '',
    categoria: 'VENDAS',
    destino: 'total' as 'conta' | 'cofre' | 'total'
  });

  const createReceita = useCreateReceita();
  const updateSaldo = useUpdateSaldo();

  // Set default empresa when modal opens
  useEffect(() => {
    if (defaultEmpresa && isOpen) {
      setFormData(prev => ({ ...prev, empresa: defaultEmpresa }));
    }
  }, [defaultEmpresa, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const receitaData = {
      data: formData.data,
      valor: parseFloat(formData.valor),
      data_recebimento: formData.data_recebimento || undefined,
      descricao: formData.descricao,
      empresa: formData.empresa,
      categoria: formData.categoria,
      destino: formData.destino
    };

    createReceita.mutate(receitaData, {
      onSuccess: () => {
        console.log('Receita created successfully with destino:', formData.destino);
        
        // Update saldo only if destino is conta or cofre
        if (formData.destino === 'conta' || formData.destino === 'cofre') {
          console.log('Updating saldo - tipo:', formData.destino, 'valor:', parseFloat(formData.valor));
          updateSaldo.mutate({
            tipo: formData.destino,
            valor: parseFloat(formData.valor)
          }, {
            onSuccess: () => {
              console.log('Saldo updated successfully');
            },
            onError: (error) => {
              console.error('Error updating saldo:', error);
            }
          });
        }
        
        setFormData({
          data: '',
          valor: '',
          data_recebimento: '',
          descricao: '',
          empresa: defaultEmpresa || '',
          categoria: 'VENDAS',
          destino: 'total'
        });
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Receita</DialogTitle>
          <DialogDescription>
            Adicione uma nova receita ao sistema
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data" className="text-sm font-medium">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  className="w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-sm font-medium">Descrição *</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva a receita..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full min-h-[80px] resize-none"
                required
              />
            </div>
          </div>

          {/* Classificação */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground border-b pb-2">Classificação</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empresa" className="text-sm font-medium">Empresa/Cliente *</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, empresa: value })} value={formData.empresa}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50">
                    <SelectItem value="Churrasco">Companhia do Churrasco</SelectItem>
                    <SelectItem value="Johnny">Johnny Rockets</SelectItem>
                    <SelectItem value="Camerino">Camerino</SelectItem>
                    <SelectItem value="Implementação">Implementação</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-sm font-medium">Categoria *</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, categoria: value })} value={formData.categoria}>
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
                <Select onValueChange={(value: 'conta' | 'cofre' | 'total') => setFormData({ ...formData, destino: value })} value={formData.destino}>
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
                  onChange={(e) => setFormData({ ...formData, data_recebimento: e.target.value })}
                  className="w-full"
                  placeholder="Opcional"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createReceita.isPending || updateSaldo.isPending}>
              {(createReceita.isPending || updateSaldo.isPending) ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReceitaModal;
