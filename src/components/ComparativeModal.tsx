
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, LineChart, Line } from 'recharts';
import { useDespesas } from '@/hooks/useDespesas';
import { useReceitas } from '@/hooks/useReceitas';
import { calculateProfitByPeriod } from '@/utils/dateUtils';
import { TrendingUp, TrendingDown, BarChart3, Target } from 'lucide-react';

interface ComparativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: string;
}

const ComparativeModal: React.FC<ComparativeModalProps> = ({ isOpen, onClose, empresa }) => {
  const { data: todasDespesas } = useDespesas();
  const { data: todasReceitas } = useReceitas();

  // Filtrar dados por empresa
  const getEmpresaData = (empresaNome: string) => {
    const despesas = todasDespesas?.filter(d => {
      const emp = d.empresa?.toLowerCase().trim() || '';
      switch (empresaNome.toLowerCase()) {
        case 'churrasco':
          return emp.includes('churrasco') || emp === 'companhia do churrasco' || emp === 'cia do churrasco';
        case 'johnny':
          return emp === 'johnny' || emp === 'johnny rockets' || emp === 'johnny rocket' || emp.includes('johnny');
        case 'camerino':
          return emp === 'camerino' || emp.includes('camerino');
        default:
          return emp === empresaNome.toLowerCase();
      }
    }) || [];
    
    const receitas = todasReceitas?.filter(r => {
      const emp = r.empresa?.toLowerCase().trim() || '';
      const isEmpresa = (() => {
        switch (empresaNome.toLowerCase()) {
          case 'churrasco':
            return emp.includes('churrasco') || emp === 'companhia do churrasco' || emp === 'cia do churrasco';
          case 'johnny':
            return emp === 'johnny' || emp === 'johnny rockets' || emp === 'johnny rocket' || emp.includes('johnny');
          case 'camerino':
            return emp === 'camerino' || emp.includes('camerino');
          default:
            return emp === empresaNome.toLowerCase();
        }
      })();
      
      // Excluir receitas com destino "conta" ou "cofre"
      const destino = (r as any).destino;
      return isEmpresa && (destino === 'total' || !destino);
    }) || [];
    
    return { despesas, receitas };
  };

  const empresas = ['Johnny', 'Churrasco'];
  
  // Dados comparativos por período
  const periodos = ['month', 'year'] as const;
  
  const dadosComparativos = React.useMemo(() => {
    return empresas.map(emp => {
      const { despesas, receitas } = getEmpresaData(emp);
      
      const totalDespesas = despesas.reduce((sum, d) => sum + (d.valor_total || d.valor), 0);
      const totalReceitas = receitas.reduce((sum, r) => sum + r.valor, 0);
      
      // Calcular lucro por período
      const lucroMensal = calculateProfitByPeriod(despesas, receitas, 'month');
      const lucroAnual = calculateProfitByPeriod(despesas, receitas, 'year');
      
      return {
        empresa: emp,
        despesas: totalDespesas,
        receitas: totalReceitas,
        lucroTotal: totalReceitas - totalDespesas,
        lucroMensal,
        lucroAnual,
        margemTotal: totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0,
        margemMensal: totalReceitas > 0 ? (lucroMensal / totalReceitas) * 100 : 0,
        roi: totalDespesas > 0 ? ((totalReceitas - totalDespesas) / totalDespesas) * 100 : 0
      };
    });
  }, [todasDespesas, todasReceitas]);

  // Evolução mensal comparativa (últimos 6 meses)
  const evolucaoComparativa = React.useMemo(() => {
    const now = new Date();
    const meses = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mesNome = date.toLocaleDateString('pt-BR', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const dadosMes: any = { mes: mesNome };
      
      empresas.forEach(emp => {
        const { despesas, receitas } = getEmpresaData(emp);
        
        const receitasMes = receitas.filter(r => {
          const itemDate = new Date(r.data + 'T00:00:00');
          return itemDate.getFullYear() === year && itemDate.getMonth() === month;
        }).reduce((sum, r) => sum + r.valor, 0);
        
        const despesasMes = despesas.filter(d => {
          let itemDate: Date;
          if (d.data_vencimento) {
            itemDate = new Date(d.data_vencimento + 'T00:00:00');
          } else if (d.data) {
            itemDate = new Date(d.data + 'T00:00:00');
          } else {
            return false;
          }
          return itemDate.getFullYear() === year && itemDate.getMonth() === month;
        }).reduce((sum, d) => sum + (d.valor_total || d.valor), 0);
        
        dadosMes[`${emp}_lucro`] = receitasMes - despesasMes;
      });
      
      meses.push(dadosMes);
    }
    
    return meses;
  }, [todasDespesas, todasReceitas]);

  const empresaAtual = dadosComparativos.find(e => e.empresa.toLowerCase() === empresa.toLowerCase().replace(' rockets', ''));
  const posicaoRanking = dadosComparativos
    .sort((a, b) => b.lucroAnual - a.lucroAnual)
    .findIndex(e => e.empresa.toLowerCase() === empresa.toLowerCase().replace(' rockets', '')) + 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Análise Comparativa - {empresa}</DialogTitle>
          <DialogDescription>
            Comparação de performance entre todas as empresas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo da Posição */}
          {empresaAtual && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    Posição no Ranking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {posicaoRanking}º lugar
                  </div>
                  <p className="text-xs text-gray-500 mt-1">de {empresas.length} empresas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Lucro Mensal Acumulado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${empresaAtual.lucroMensal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {empresaAtual.lucroMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{empresaAtual.margemMensal.toFixed(1)}% margem</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Lucro Anual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${empresaAtual.lucroAnual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {empresaAtual.lucroAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Ano completo</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">ROI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${empresaAtual.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {empresaAtual.roi.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Retorno sobre investimento</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Comparativo por Empresa */}
          <Card>
            <CardHeader>
              <CardTitle>Comparativo de Performance</CardTitle>
              <CardDescription>Lucro anual por empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosComparativos}>
                    <XAxis dataKey="empresa" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                    <Legend />
                    <Bar dataKey="receitas" fill="#10b981" name="Receitas" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="despesas" fill="#ef4444" name="Despesas" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Evolução Comparativa */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução Comparativa (Últimos 6 Meses)</CardTitle>
              <CardDescription>Lucro mensal por empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolucaoComparativa}>
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                    <Legend />
                    <Line type="monotone" dataKey="Johnny_lucro" stroke="#3b82f6" strokeWidth={3} name="Johnny" />
                    <Line type="monotone" dataKey="Churrasco_lucro" stroke="#10b981" strokeWidth={3} name="Churrasco" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tabela Detalhada */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Empresa</CardTitle>
              <CardDescription>Métricas detalhadas de performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Empresa</th>
                      <th className="text-right p-2">Receitas</th>
                      <th className="text-right p-2">Despesas</th>
                      <th className="text-right p-2">Lucro Mensal</th>
                      <th className="text-right p-2">Lucro Anual</th>
                      <th className="text-right p-2">Margem %</th>
                      <th className="text-right p-2">ROI %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosComparativos
                      .sort((a, b) => b.lucroAnual - a.lucroAnual)
                      .map((emp, index) => (
                      <tr key={emp.empresa} className={`border-b ${emp.empresa.toLowerCase() === empresa.toLowerCase().replace(' rockets', '') ? 'bg-blue-50' : ''}`}>
                        <td className="p-2 font-medium">
                          {index + 1}º {emp.empresa}
                          {emp.empresa.toLowerCase() === empresa.toLowerCase().replace(' rockets', '') && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Atual</span>
                          )}
                        </td>
                        <td className="text-right p-2 text-green-600">
                          R$ {emp.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-right p-2 text-red-600">
                          R$ {emp.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`text-right p-2 ${emp.lucroMensal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {emp.lucroMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`text-right p-2 ${emp.lucroAnual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {emp.lucroAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`text-right p-2 ${emp.margemMensal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {emp.margemMensal.toFixed(1)}%
                        </td>
                        <td className={`text-right p-2 ${emp.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {emp.roi.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComparativeModal;
