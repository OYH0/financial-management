import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Edit, Plus, Target, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMetasMensais, useCreateMetaMensal, useUpdateMetaMensal, useDeleteMetaMensal } from '@/hooks/useMetasMensais';
import { useReceitas } from '@/hooks/useReceitas';

interface MonthlyGoalsProps {
  empresa: string;
  selectedPeriod?: 'today' | 'week' | 'month' | 'year' | 'custom';
  customMonth?: number;
  customYear?: number;
}

const MonthlyGoals: React.FC<MonthlyGoalsProps> = ({ 
  empresa, 
  selectedPeriod = 'month', 
  customMonth = new Date().getMonth() + 1, 
  customYear = new Date().getFullYear() 
}) => {
  const { data: allMetas = [] } = useMetasMensais(empresa);
  const { data: receitas = [] } = useReceitas();
  const createMeta = useCreateMetaMensal();
  const updateMeta = useUpdateMetaMensal();
  const deleteMeta = useDeleteMetaMensal();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    nome_meta: '',
    valor_meta: '',
    categoria_receita: 'VENDAS',
    cor: '#8b5cf6',
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear()
  });

  // Determinar o mês e ano a serem exibidos baseado no período selecionado
  const getDisplayMonthYear = () => {
    if (selectedPeriod === 'custom') {
      return { month: customMonth, year: customYear };
    }
    // Para outros períodos, usar o mês e ano atual
    return { month: new Date().getMonth() + 1, year: new Date().getFullYear() };
  };

  const { month: displayMonth, year: displayYear } = getDisplayMonthYear();

  // Filtrar metas baseado no período selecionado
  const metas = allMetas.filter(meta => 
    meta.mes === displayMonth && meta.ano === displayYear
  );

  // Calcular receitas baseado no mês e ano específico de cada meta
  const calcularValorAtual = (categoriaReceita: string, mes: number, ano: number) => {
    const receitasDoMes = receitas.filter(r => {
      const receitaDate = new Date(r.data + 'T00:00:00');
      const isEmpresaMatch = r.empresa === empresa;
      const isCategoriaMatch = r.categoria === categoriaReceita;
      const isDateMatch = receitaDate.getMonth() + 1 === mes && receitaDate.getFullYear() === ano;
      
      // Excluir receitas com destino "conta" ou "cofre"
      const destino = (r as any).destino;
      const isDestinoProd = destino === 'total' || !destino;
      
      return isEmpresaMatch && isCategoriaMatch && isDateMatch && isDestinoProd;
    });
    
    return receitasDoMes.reduce((sum, r) => sum + r.valor, 0);
  };

  const handleEditMeta = (meta: any) => {
    setEditingMeta(meta);
    setFormData({
      nome_meta: meta.nome_meta,
      valor_meta: (meta.valor_meta).toString(),
      categoria_receita: meta.categoria_receita || 'VENDAS',
      cor: meta.cor,
      mes: meta.mes,
      ano: meta.ano
    });
    setIsDialogOpen(true);
  };

  const handleSaveMeta = async () => {
    try {
      const valorAtual = calcularValorAtual(formData.categoria_receita, formData.mes, formData.ano);
      
      const metaData = {
        nome_meta: formData.nome_meta,
        valor_meta: parseFloat(formData.valor_meta),
        valor_atual: valorAtual,
        categoria_receita: formData.categoria_receita,
        cor: formData.cor,
        empresa,
        mes: formData.mes,
        ano: formData.ano
      };

      if (editingMeta) {
        await updateMeta.mutateAsync({ id: editingMeta.id, ...metaData });
      } else {
        await createMeta.mutateAsync(metaData);
      }

      setIsDialogOpen(false);
      setEditingMeta(null);
      setFormData({
        nome_meta: '',
        valor_meta: '',
        categoria_receita: 'VENDAS',
        cor: '#8b5cf6',
        mes: displayMonth,
        ano: displayYear
      });
    } catch (error) {
      console.error('Error saving meta:', error);
    }
  };

  const handleAddMeta = () => {
    setEditingMeta(null);
    setFormData({
      nome_meta: '',
      valor_meta: '',
      categoria_receita: 'VENDAS',
      cor: '#8b5cf6',
      mes: displayMonth,
      ano: displayYear
    });
    setIsDialogOpen(true);
  };

  const handleDeleteMeta = async (id: string) => {
    try {
      await deleteMeta.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting meta:', error);
    }
  };

  const getProgress = (target: number, valorAtual: number) => {
    return Math.min(100, Math.max(0, (valorAtual / target) * 100));
  };

  const getMonthName = (monthNumber: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[monthNumber - 1];
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Metas do Mês
            </CardTitle>
            <CardDescription>
              {getMonthName(displayMonth)} {displayYear}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddMeta}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {metas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma meta definida para {getMonthName(displayMonth)} {displayYear}</p>
            <p className="text-sm">Clique em "Adicionar" para criar uma meta</p>
          </div>
        ) : (
          metas.map((meta) => {
            const valorAtual = calcularValorAtual(meta.categoria_receita || 'VENDAS', meta.mes, meta.ano);
            const progress = getProgress(meta.valor_meta, valorAtual);
            return (
              <div key={meta.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">{meta.nome_meta}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({meta.categoria_receita || 'VENDAS'})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{progress.toFixed(2)}%</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMeta(meta)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMeta(meta.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>R$ {valorAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span>Meta: R$ {meta.valor_meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMeta ? 'Editar Meta' : 'Nova Meta'}
              </DialogTitle>
              <DialogDescription>
                {editingMeta ? 'Edite os detalhes da meta' : 'Adicione uma nova meta para acompanhar'}. O valor atual será calculado automaticamente com base nas receitas da categoria selecionada.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="goalName">Nome da Meta</Label>
                <Input
                  id="goalName"
                  value={formData.nome_meta}
                  onChange={(e) => setFormData({ ...formData, nome_meta: e.target.value })}
                  placeholder="Ex: Meta de Vendas Mensais"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mes">Mês</Label>
                  <Select 
                    value={formData.mes.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, mes: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {getMonthName(month)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ano">Ano</Label>
                  <Select 
                    value={formData.ano.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, ano: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i - 2).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="goalTarget">Valor Meta (R$)</Label>
                <Input
                  id="goalTarget"
                  type="number"
                  step="0.01"
                  value={formData.valor_meta}
                  onChange={(e) => setFormData({ ...formData, valor_meta: e.target.value })}
                  placeholder="Ex: 10000"
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria de Receita</Label>
                <Select 
                  value={formData.categoria_receita} 
                  onValueChange={(value) => setFormData({ ...formData, categoria_receita: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VENDAS">Vendas</SelectItem>
                    <SelectItem value="VENDAS_DIARIAS">Vendas Diárias</SelectItem>
                    <SelectItem value="SERVICOS">Serviços</SelectItem>
                    <SelectItem value="OUTROS">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Valor atual calculado:</strong> R$ {calcularValorAtual(formData.categoria_receita, formData.mes, formData.ano).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Baseado nas receitas de {empresa} na categoria "{formData.categoria_receita}" para {getMonthName(formData.mes)}/{formData.ano}
                </p>
              </div>
              <div>
                <Label htmlFor="goalColor">Cor</Label>
                <Input
                  id="goalColor"
                  type="color"
                  value={formData.cor}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveMeta}
                disabled={createMeta.isPending || updateMeta.isPending}
              >
                {editingMeta ? 'Salvar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MonthlyGoals;
