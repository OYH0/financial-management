
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip, ReferenceLine } from 'recharts';
import { normalizeCompanyName, getTransactionValue } from '@/utils/dashboardCalculations';

interface MonthlyEvolutionChartProps {
  despesas?: any[];
  selectedPeriod: 'today' | 'week' | 'month' | 'year' | 'custom';
  customYear?: number;
}

const MonthlyEvolutionChart: React.FC<MonthlyEvolutionChartProps> = ({ despesas, selectedPeriod, customYear }) => {
  console.log('=== MONTHLY EVOLUTION CHART ===');
  console.log('Despesas recebidas:', despesas?.length || 0);
  console.log('Período selecionado:', selectedPeriod);
  
  // Gerar dados anuais (Jan-Dez) - ano atual ou customYear no filtro personalizado
  const chartData = React.useMemo(() => {
    if (!despesas) return [];

    const targetYear = selectedPeriod === 'custom' && customYear ? customYear : new Date().getFullYear();

    // Filtrar despesas para excluir Camerino e fora do ano atual
    const despesasProcessadas = despesas.filter(d => {
      const empresa = normalizeCompanyName(d.empresa);
      const date = new Date(d.data);
      return (
        empresa !== 'camerino' &&
        date.getFullYear() === targetYear
      );
    });

    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const data = months.map((m, index) => ({ period: m, index, churrasco: 0, johnny: 0 }));

    despesasProcessadas.forEach(despesa => {
      const date = new Date(despesa.data);
      const monthIndex = date.getMonth();
      const valor = getTransactionValue(despesa);
      const empresa = normalizeCompanyName(despesa.empresa);
      if (empresa === 'churrasco') data[monthIndex].churrasco += valor;
      if (empresa === 'johnny') data[monthIndex].johnny += valor;
    });

    const result = data.sort((a, b) => a.index - b.index);
    console.log('Dados finais do gráfico anual (sem Camerino):', result);
    return result;
  }, [despesas, selectedPeriod, customYear]);
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'churrasco' ? 'Companhia do Churrasco' : 
               entry.name === 'johnny' ? 'Johnny Rockets' : entry.name}: R$ {entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        <p>Não há dados para mostrar</p>
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="period" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#4B5563', fontSize: 12 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#4B5563', fontSize: 12 }} 
            tickFormatter={(value) => `${value.toLocaleString('pt-BR', { notation: 'compact' })}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value) => 
              value === 'churrasco' ? 'Companhia do Churrasco' : 
              value === 'johnny' ? 'Johnny Rockets' : value
            }
          />
          <ReferenceLine 
            y={0} 
            stroke="#D1D5DB" 
            strokeWidth={1}
          />
          <Bar 
            name="churrasco"
            dataKey="churrasco" 
            fill="#ef4444" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            name="johnny"
            dataKey="johnny" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyEvolutionChart;
