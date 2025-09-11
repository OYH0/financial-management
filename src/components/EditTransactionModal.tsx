
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Transaction } from '@/types/transaction';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateDespesa } from '@/hooks/useDespesas';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onTransactionUpdated: () => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onTransactionUpdated
}) => {
  const [formData, setFormData] = useState({
    data: '',
    valor: '',
    empresa: '',
    descricao: '',
    categoria: '',
    subcategoria: '',
    data_vencimento: '',
    valor_juros: '',
    origem_pagamento: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const updateDespesa = useUpdateDespesa();

  // Get categories based on selected company
  const getCategoriesForCompany = (empresa: string) => {
    switch (empresa) {
      case 'Camerino':
        return [
          { value: 'FIXAS', label: 'Fixas' },
          { value: 'VARIÁVEIS', label: 'Variáveis' },
          { value: 'SAZONAIS', label: 'Sazonais' }
        ];
      case 'Implementação':
        return [
          { value: 'OBRA', label: 'Obra' },
          { value: 'EQUIPAMENTO', label: 'Equipamento' },
          { value: 'SERVIÇO', label: 'Serviço' },
          { value: 'CUSTO EXTRA', label: 'Custo Extra' }
        ];
      default:
        return [
          { value: 'INSUMOS', label: 'Insumos' },
          { value: 'FIXAS', label: 'Fixas' },
          { value: 'VARIÁVEIS', label: 'Variáveis' },
          { value: 'RETIRADAS', label: 'Retiradas' }
        ];
    }
  };

  // Get subcategories based on selected company and category
  const getSubcategoriesForCompanyAndCategory = (empresa: string, categoria: string) => {
    // Camerino and Implementação don't have subcategories
    if (empresa === 'Camerino' || empresa === 'Implementação') {
      return [];
    }

    const subcategories: { [key: string]: { value: string; label: string }[] } = {
      'INSUMOS': [
        { value: 'PROTEINAS', label: 'Proteínas' },
        { value: 'HORTIFRUTI', label: 'Hortifrúti' },
        { value: 'BEBIDAS', label: 'Bebidas' },
        { value: 'MERCADO_COMUM', label: 'Mercado Comum' },
        { value: 'DESCARTAVEIS_LIMPEZA', label: 'Descartáveis e Limpeza' },
        { value: 'COMBUSTIVEL_TRANSPORTE', label: 'Combustível e Transporte' }
      ],
      'FIXAS': [
        { value: 'TAXA_OCUPACAO', label: 'Taxa de Ocupação' },
        { value: 'FOLHA_SALARIAL', label: 'Folha Salarial' },
        { value: 'EMPRESTIMOS_PRESTACOES', label: 'Empréstimos e Prestações' }
      ],
      'VARIÁVEIS': [
        { value: 'MANUTENCAO', label: 'Manutenção' },
        { value: 'SAZONAIS', label: 'Sazonais' }
      ],
      'RETIRADAS': [
        { value: 'PROLABORE', label: 'Prolabore' },
        { value: 'IMPLEMENTACAO', label: 'Implementação' }
      ]
    };

    return subcategories[categoria] || [];
  };

  const companies = ['Churrasco', 'Johnny', 'Camerino', 'Implementação'];

  // Update form data when transaction changes
  useEffect(() => {
    if (transaction && isOpen) {
      setFormData({
        data: transaction.date || '',
        valor: transaction.valor?.toString() || '',
        empresa: transaction.company || '',
        descricao: transaction.description || '',
        categoria: transaction.category || '',
        subcategoria: transaction.subcategoria || '',
        data_vencimento: transaction.data_vencimento || '',
        valor_juros: transaction.valor_juros?.toString() || '',
        origem_pagamento: transaction.origem_pagamento || ''
      });
    }
  }, [transaction, isOpen]);

  // Function to create corresponding receita for Retiradas subcategory Implementação
  const createImplementacaoReceita = async (despesaData: any) => {
    try {
      console.log('Creating Implementação receita from edit with data:', despesaData);
      
      const receitaData = {
        data: despesaData.data_vencimento,
        valor: despesaData.valor,
        data_recebimento: despesaData.data_vencimento, // Same as due date
        descricao: `Receita da Implementação: ${despesaData.descricao}`,
        empresa: 'Implementação',
        categoria: 'IMPLEMENTACAO',
        user_id: user.id
      };

      console.log('Inserting receita data from edit:', receitaData);

      const { data: insertedReceita, error: receitaError } = await supabase
        .from('receitas')
        .insert([receitaData])
        .select()
        .single();

      if (receitaError) {
        console.error('Error creating receita for Implementação:', receitaError);
        toast({
          title: "Aviso",
          description: "Despesa atualizada, mas houve erro ao criar a receita correspondente na Implementação.",
          variant: "destructive"
        });
      } else {
        console.log('Receita de Implementação criada com sucesso no edit:', insertedReceita);
        toast({
          title: "Sucesso!",
          description: "Receita de Implementação criada automaticamente.",
        });
      }
    } catch (error) {
      console.error('Error in createImplementacaoReceita:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar receita de Implementação.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !transaction) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da transação.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.valor || !formData.empresa || !formData.data_vencimento) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('=== EDITANDO DESPESA ===');
      console.log('Valores originais:', {
        valor: transaction.valor,
        valor_juros: transaction.valor_juros,
        valor_total: transaction.valor_total,
        status: transaction.status,
        origem_pagamento: transaction.origem_pagamento
      });
      console.log('Novos valores:', {
        valor: parseFloat(formData.valor),
        valor_juros: formData.valor_juros ? parseFloat(formData.valor_juros) : 0,
        status: transaction.status,
        origem_pagamento: formData.origem_pagamento
      });

      const updateData: any = {
        data: formData.data || null,
        valor: parseFloat(formData.valor),
        empresa: formData.empresa,
        descricao: formData.descricao,
        categoria: formData.categoria,
        subcategoria: formData.subcategoria || null,
        data_vencimento: formData.data_vencimento,
        valor_juros: formData.valor_juros ? parseFloat(formData.valor_juros) : 0,
        status: transaction.status,
        origem_pagamento: formData.origem_pagamento || null
      };

      console.log('Updating despesa with data:', updateData);

      // Usar o hook de atualização que já gerencia o saldo
      await updateDespesa.mutateAsync({
        id: transaction.id,
        originalData: transaction,
        ...updateData
      });

      // If categoria changed to RETIRADAS with subcategoria Implementação and it wasn't before
      const wasImplementacao = transaction.category === 'RETIRADAS' && transaction.subcategoria === 'IMPLEMENTACAO';
      const isImplementacao = formData.categoria === 'RETIRADAS' && formData.subcategoria === 'IMPLEMENTACAO';
      
      if (isImplementacao && !wasImplementacao) {
        await createImplementacaoReceita(updateData);
      }

      toast({
        title: "Sucesso!",
        description: isImplementacao && !wasImplementacao
          ? "Transação atualizada e receita de Implementação criada com sucesso."
          : "Transação atualizada com sucesso.",
      });

      onTransactionUpdated();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset subcategoria when categoria changes
      if (field === 'categoria') {
        newData.subcategoria = '';
      }
      
      // Reset categoria and subcategoria when empresa changes
      if (field === 'empresa') {
        const availableCategories = getCategoriesForCompany(value);
        newData.categoria = availableCategories[0]?.value || '';
        newData.subcategoria = '';
      }
      
      return newData;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data">Data de Pagamento</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => handleInputChange('data', e.target.value)}
              className="rounded-full"
            />
            <p className="text-xs text-gray-500">Deixe vazio se ainda não foi paga.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
            <Input
              id="data_vencimento"
              type="date"
              value={formData.data_vencimento}
              onChange={(e) => handleInputChange('data_vencimento', e.target.value)}
              required
              className="rounded-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$) *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.valor}
              onChange={(e) => handleInputChange('valor', e.target.value)}
              required
              className="rounded-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor_juros">Valor dos Juros (R$)</Label>
            <Input
              id="valor_juros"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.valor_juros}
              onChange={(e) => handleInputChange('valor_juros', e.target.value)}
              className="rounded-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa *</Label>
            <Select value={formData.empresa} onValueChange={(value) => handleInputChange('empresa', value)}>
              <SelectTrigger className="rounded-full">
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {companies.map(company => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
              <SelectTrigger className="rounded-full">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {getCategoriesForCompany(formData.empresa).map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.categoria === 'RETIRADAS' && formData.subcategoria === 'IMPLEMENTACAO' && 
           !(transaction?.category === 'RETIRADAS' && transaction?.subcategoria === 'IMPLEMENTACAO') && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Ao alterar para subcategoria Implementação em Retiradas, será criada uma receita correspondente para a empresa Implementação.
              </p>
            </div>
          )}

          {formData.categoria && getSubcategoriesForCompanyAndCategory(formData.empresa, formData.categoria).length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="subcategoria">Subcategoria</Label>
              <Select value={formData.subcategoria} onValueChange={(value) => handleInputChange('subcategoria', value)}>
                <SelectTrigger className="rounded-full">
                  <SelectValue placeholder="Selecione uma subcategoria" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {getSubcategoriesForCompanyAndCategory(formData.empresa, formData.categoria).map(subcategory => (
                    <SelectItem key={subcategory.value} value={subcategory.value}>
                      {subcategory.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.data && (
            <div className="space-y-2">
              <Label htmlFor="origem_pagamento">Origem do Pagamento *</Label>
              <Select value={formData.origem_pagamento || ''} onValueChange={(value) => handleInputChange('origem_pagamento', value)}>
                <SelectTrigger className="rounded-full">
                  <SelectValue placeholder="Selecione a origem do pagamento" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="cofre">Cofre</SelectItem>
                  <SelectItem value="conta">Conta</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Obrigatório quando há data de pagamento.</p>
            </div>
          )}

          <div className="space-y-2">`
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Descrição da despesa..."
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              rows={3}
              className="rounded-2xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-full">
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionModal;
