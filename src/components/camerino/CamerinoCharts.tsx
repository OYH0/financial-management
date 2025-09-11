
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from 'recharts';
import ExpenseDistribution from '@/components/ExpenseDistribution';
import { useDespesas } from '@/hooks/useDespesas';
import { useReceitas } from '@/hooks/useReceitas';

interface CamerinoChartsProps {
  despesas: any[];
  receitas: any[];
}

const CamerinoCharts: React.FC<CamerinoChartsProps> = ({ despesas, receitas }) => {
  // Buscar dados completos diretamente dos hooks para o gráfico de evolução mensal (que sempre mostra dados anuais)
  const { data: todasDespesas } = useDespesas();
  const { data: todasReceitas } = useReceitas();

  // Filtrar dados apenas para Camerino para evolução mensal
  const despesasCamerino = React.useMemo(() => {
    return todasDespesas?.filter(d => {
      const empresa = d.empresa?.toLowerCase().trim() || '';
      return empresa.includes('camerino');
    }) || [];
  }, [todasDespesas]);

  const receitasCamerino = React.useMemo(() => {
    return todasReceitas?.filter(r => {
      const empresa = r.empresa?.toLowerCase().trim() || '';
      const isCamerino = empresa.includes('camerino');
      
      // Excluir receitas com destino "conta" ou "cofre"
      const destino = (r as any).destino;
      const isDestinoProd = destino === 'total' || !destino;
      
      return isCamerino && isDestinoProd;
    }) || [];
  }, [todasReceitas]);

  const evolucaoMensal = React.useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthDespesas = despesasCamerino.filter(d => {
        const date = d.data_vencimento ? new Date(d.data_vencimento + 'T00:00:00') : 
                      d.data ? new Date(d.data + 'T00:00:00') : null;
        return date && date.getMonth() === index && date.getFullYear() === currentYear;
      }).reduce((sum, d) => sum + (d.valor_total || d.valor || 0), 0);
      
      const monthReceitas = receitasCamerino.filter(r => {
        const date = r.data ? new Date(r.data + 'T00:00:00') : null;
        return date && date.getMonth() === index && date.getFullYear() === currentYear;
      }).reduce((sum, r) => sum + (r.valor || 0), 0);
      
      return {
        month,
        despesas: monthDespesas,
        receitas: monthReceitas
      };
    });
  }, [despesasCamerino, receitasCamerino]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Evolução Mensal - sem lucro */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Evolução Mensal</CardTitle>
          <CardDescription>Performance financeira mês a mês - {new Date().getFullYear()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evolucaoMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={true} vertical={true} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="receitas" fill="#10b981" name="Receitas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" fill="#3b82f6" name="Despesas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição de Despesas - Agora usa dados filtrados */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Distribuição de Despesas</CardTitle>
          <CardDescription>Categorias de gastos no período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseDistribution despesas={despesas} empresa="Camerino" />
        </CardContent>
      </Card>
    </div>
  );
};

export default CamerinoCharts;
