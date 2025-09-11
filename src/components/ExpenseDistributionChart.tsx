
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { calculateDistributionData } from '@/utils/dashboardCalculations';
import { prettyLabel } from '@/utils/labelUtils';

interface ExpenseDistributionChartProps {
  despesas?: any[];
}

const ExpenseDistributionChart: React.FC<ExpenseDistributionChartProps> = ({ despesas }) => {
  console.log('=== EXPENSE DISTRIBUTION CHART ===');
  console.log('Despesas recebidas:', despesas?.length || 0);

  // Usar função centralizada para calcular dados
  const data = calculateDistributionData(despesas || []);

  console.log('Dados do gráfico de distribuição:', data);

  // If there's no data with values, show placeholder
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        <p>Não há dados para mostrar</p>
      </div>
    );
  }
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const subcategorias = data.payload.subcategorias;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-sm text-gray-600">
            R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          {subcategorias && Object.keys(subcategorias).length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-1">Subcategorias:</p>
              {Object.entries(subcategorias).map(([subcat, valor]: [string, any]) => (
                <p key={subcat} className="text-xs text-gray-600">
                  {prettyLabel(subcat)}: R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex items-center gap-8">
      <div className="w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex flex-col gap-4 min-w-[200px]">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-gray-700 text-sm font-medium">{item.name}</span>
            </div>
            <span className="text-gray-900 text-sm font-semibold text-right">
              R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseDistributionChart;
