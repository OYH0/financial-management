import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateSaldo } from '@/hooks/useSaldos';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionAdded: () => void;
  defaultEmpresa?: string;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onTransactionAdded,
  defaultEmpresa
}) => {
  const [formData, setFormData] = useState({
    data: '',
    valor: '',
    empresa: '',
    descricao: '',
    categoria: 'INSUMOS',
    subcategoria: '',
    data_vencimento: '',
    valor_juros: '',
    origem_pagamento: 'conta' as 'conta' | 'cofre'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const updateSaldo = useUpdateSaldo();

  // Get categories based on selected company
  const getCategoriesForCompany = (empresa: string) => {
    switch (empresa) {
      case 'Camerino':
        return ['FIXAS', 'VARIÁVEIS', 'SAZONAIS'];
      case 'Implementação':
        return ['OBRA', 'EQUIPAMENTO', 'SERVIÇO', 'CUSTO EXTRA'];
      default:
        return ['INSUMOS', 'FIXAS', 'VARIÁVEIS', 'RETIRADAS'];
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

  // Set default empresa when modal opens
  useEffect(() => {
    if (defaultEmpresa && isOpen) {
      setFormData(prev => ({ ...prev, empresa: defaultEmpresa }));
    }
  }, [defaultEmpresa, isOpen]);

  // Function to create corresponding receita for Retiradas subcategory Implementação
  const createImplementacaoReceita = async (despesaData: any) => {
    try {
      console.log('Creating Implementação receita with data:', despesaData);
      
      const receitaData = {
        data: despesaData.data_vencimento,
        valor: despesaData.valor,
        data_recebimento: despesaData.data_vencimento, // Same as due date
        descricao: `Receita da Implementação: ${despesaData.descricao}`,
        empresa: 'Implementação',
        categoria: 'IMPLEMENTACAO',
        user_id: user.id
      };

      console.log('Inserting receita data:', receitaData);

      const { data: insertedReceita, error: receitaError } = await supabase
        .from('receitas')
        .insert([receitaData])
        .select()
        .single();

      if (receitaError) {
        console.error('Error creating receita for Implementação:', receitaError);
        toast({
          title: "Aviso",
          description: "Despesa criada, mas houve erro ao criar a receita correspondente na Implementação.",
          variant: "destructive"
        });
      } else {
        console.log('Receita de Implementação criada com sucesso:', insertedReceita);
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
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para adicionar transações.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.valor || !formData.empresa || !formData.data_vencimento) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios (Valor, Empresa e Data de Vencimento).",
        variant: "destructive"
      });
      return;
    }

    if (formData.data && !formData.origem_pagamento) {
      toast({
        title: "Erro",
        description: "Por favor, selecione a origem do pagamento quando a data de pagamento for informada.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const insertData: any = {
        data: formData.data || null,
        valor: parseFloat(formData.valor),
        empresa: formData.empresa,
        descricao: formData.descricao || 'Sem descrição',
        categoria: formData.categoria,
        subcategoria: formData.subcategoria || null,
        data_vencimento: formData.data_vencimento,
        valor_juros: formData.valor_juros ? parseFloat(formData.valor_juros) : 0,
        status: formData.data ? 'PAGO' : null,
        origem_pagamento: formData.data && formData.origem_pagamento ? formData.origem_pagamento : null,
        user_id: user.id
      };

      // Se foi marcado como pago na criação e tem origem de pagamento, subtrair do saldo correspondente
      if (formData.data && formData.origem_pagamento) {
        console.log('=== DESPESA PAGA - DEBITANDO SALDO ===');
        console.log('Data de pagamento:', formData.data);
        console.log('Origem do pagamento:', formData.origem_pagamento);
        console.log('Valor:', formData.valor);
        console.log('Valor juros:', formData.valor_juros);
        
        const valorTotal = parseFloat(formData.valor) + (formData.valor_juros ? parseFloat(formData.valor_juros) : 0);
        console.log('Valor total a ser debitado:', valorTotal);
        
        // Update balance using the new saldos system
        updateSaldo.mutate({
          tipo: formData.origem_pagamento,
          valor: -valorTotal // Negative to subtract from balance
        });
        
        console.log('Comando de débito enviado para saldo');
      } else {
        console.log('=== SALDO NÃO DEBITADO ===');
        console.log('Data de pagamento:', formData.data);
        console.log('Origem do pagamento:', formData.origem_pagamento);
        console.log('Condições para débito: data preenchida E origem selecionada');
      }

      console.log('Inserting despesa with data:', insertData);

      const { data: insertedDespesa, error } = await supabase
        .from('despesas')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error inserting despesa:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar transação. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      console.log('Despesa inserted successfully:', insertedDespesa);

      // If subcategoria is Implementação in RETIRADAS, create corresponding receita
      if (formData.categoria === 'RETIRADAS' && formData.subcategoria === 'IMPLEMENTACAO') {
        await createImplementacaoReceita(insertData);
      }

      toast({
        title: "Sucesso!",
        description: formData.categoria === 'RETIRADAS' && formData.subcategoria === 'IMPLEMENTACAO'
          ? "Despesa adicionada e receita de Implementação criada com sucesso."
          : "Transação adicionada com sucesso.",
      });

      // Reset form
      setFormData({
        data: '',
        valor: '',
        empresa: defaultEmpresa || '',
        descricao: '',
        categoria: 'INSUMOS',
        subcategoria: '',
        data_vencimento: '',
        valor_juros: '',
        origem_pagamento: 'conta'
      });

      onTransactionAdded();
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
        newData.categoria = availableCategories[0] || '';
        newData.subcategoria = '';
      }
      
      return newData;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data">Data de Pagamento</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => handleInputChange('data', e.target.value)}
              disabled={formData.categoria === 'IMPLEMENTACAO'}
              className="rounded-full"
            />
            {formData.categoria === 'IMPLEMENTACAO' ? (
              <p className="text-xs text-blue-600">Preenchida automaticamente com a data de vencimento para categoria Implementação.</p>
            ) : (
              <p className="text-xs text-gray-500">Deixe vazio se ainda não foi paga. Será preenchida automaticamente ao marcar como paga.</p>
            )}
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
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.categoria === 'RETIRADAS' && formData.subcategoria === 'IMPLEMENTACAO' && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Esta despesa de implementação criará automaticamente uma receita correspondente para a empresa Implementação.
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

          <div className="space-y-2">
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

          {formData.data && (
            <div className="space-y-2">
              <Label htmlFor="origem_pagamento">Origem do Pagamento *</Label>
              <Select value={formData.origem_pagamento} onValueChange={(value) => handleInputChange('origem_pagamento', value)}>
                <SelectTrigger className="rounded-full">
                  <SelectValue placeholder="Selecione a origem do pagamento" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="cofre">Cofre</SelectItem>
                  <SelectItem value="conta">Conta</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Obrigatório quando a data de pagamento é informada.</p>
            </div>
          )}

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
              {isLoading ? 'Salvando...' : 'Salvar Transação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;
