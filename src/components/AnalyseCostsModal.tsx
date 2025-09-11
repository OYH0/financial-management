
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { prettyLabel } from '@/utils/labelUtils';

interface AnalyseCostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  despesas: any[];
  allDespesas: any[];
  empresa: string;
}

const AnalyseCostsModal: React.FC<AnalyseCostsModalProps> = ({ isOpen, onClose, despesas, allDespesas, empresa }) => {
  // Análise por categoria usando valor_total ou valor
  const custosPorCategoria = [
    { 
      name: 'Insumos', 
      value: despesas.filter(d => d.categoria === 'INSUMOS').reduce((sum, d) => sum + (d.valor_total || d.valor), 0), 
      color: '#3b82f6' 
    },
    { 
      name: 'Fixas', 
      value: despesas.filter(d => d.categoria === 'FIXAS').reduce((sum, d) => sum + (d.valor_total || d.valor), 0), 
      color: '#8b5cf6' 
    },
    { 
      name: 'Atrasados', 
      value: despesas.filter(d => d.categoria === 'ATRASADOS').reduce((sum, d) => sum + (d.valor_total || d.valor), 0), 
      color: '#ef4444' 
    },
    { 
      name: 'Variáveis', 
      value: despesas.filter(d => d.categoria === 'VARIAVEIS' || d.categoria === 'VARIÁVEIS').reduce((sum, d) => sum + (d.valor_total || d.valor), 0), 
      color: '#f59e0b' 
    },
    { 
      name: 'Retiradas', 
      value: despesas.filter(d => d.categoria === 'RETIRADAS').reduce((sum, d) => sum + (d.valor_total || d.valor), 0), 
      color: '#10b981' 
    }
  ].filter(item => item.value > 0);

  // Dados anuais sempre baseados em allDespesas (independente do filtro de período)
  const currentYear = new Date().getFullYear();
  const despesasAnuais = allDespesas.filter(d => {
    let itemDate: Date;
    
    if (d.data_vencimento) {
      itemDate = new Date(d.data_vencimento + 'T00:00:00');
    } else if (d.data) {
      itemDate = new Date(d.data + 'T00:00:00');
    } else {
      return false;
    }
    
    return itemDate.getFullYear() === currentYear;
  });

  // Evolução dos custos (últimos 12 meses do ano atual) - sempre anual
  const evolucaoCustos = React.useMemo(() => {
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    
    return months.map((monthName, index) => {
      const monthDespesas = despesasAnuais.filter(d => {
        let itemDate: Date;
        
        if (d.data_vencimento) {
          itemDate = new Date(d.data_vencimento + 'T00:00:00');
        } else if (d.data) {
          itemDate = new Date(d.data + 'T00:00:00');
        } else {
          return false;
        }
        
        return itemDate.getMonth() === index;
      }).reduce((sum, d) => sum + (d.valor_total || d.valor), 0);
      
      return { 
        month: monthName, 
        valor: monthDespesas 
      };
    });
  }, [allDespesas]);

  // Totais anuais (independente do filtro de período)
  const totalCustos = despesasAnuais.reduce((sum, d) => sum + (d.valor_total || d.valor), 0);
  const mediaMaxima = Math.max(...evolucaoCustos.map(e => e.valor));
  const mediaMinima = Math.min(...evolucaoCustos.filter(e => e.valor > 0).map(e => e.valor));

  // Categoria com maior gasto
  const categoriaMaiorGasto = custosPorCategoria.length > 0 
    ? custosPorCategoria.reduce((max, cat) => cat.value > max.value ? cat : max)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Análise de Custos - {empresa}</DialogTitle>
          <DialogDescription>
            Análise detalhada dos custos e categorias de despesas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo dos Custos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  R$ {totalCustos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-gray-500 mt-1">{despesasAnuais.length} despesas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Maior Custo Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <div className="text-xl font-bold">
                    R$ {mediaMaxima.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Menor Custo Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <div className="text-xl font-bold">
                    R$ {(mediaMinima || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <CardDescription>Percentual de gastos por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={custosPorCategoria}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {custosPorCategoria.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Evolução Anual */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução dos Custos</CardTitle>
                <CardDescription>Custos mensais do ano atual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={evolucaoCustos}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                      <Bar dataKey="valor" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Análise Detalhada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Recomendações de Otimização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoriaMaiorGasto && (
                <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-sm">
                    <strong>Categoria com maior gasto:</strong> {prettyLabel(categoriaMaiorGasto.name)} - 
                    R$ {categoriaMaiorGasto.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm">
                  <strong>Variação mensal:</strong> Diferença de R$ {(mediaMaxima - (mediaMinima || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} entre o maior e menor mês
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <p className="text-sm">
                  <strong>Oportunidade:</strong> {categoriaMaiorGasto ? `Considere revisar contratos da categoria ${prettyLabel(categoriaMaiorGasto.name)} para possíveis reduções` : 'Mantenha o controle das categorias de despesas'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyseCostsModal;
