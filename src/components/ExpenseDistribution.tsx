
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Despesa } from '@/hooks/useDespesas';
import { prettyLabel } from '@/utils/labelUtils';

interface ExpenseDistributionProps {
  despesas: Despesa[];
  empresa: string;
}

const ExpenseDistribution: React.FC<ExpenseDistributionProps> = ({ despesas, empresa }) => {
  console.log('=== EXPENSE DISTRIBUTION ===');
  console.log('Empresa:', empresa);
  console.log('Despesas recebidas (já filtradas):', despesas?.length || 0);

  // Calcular dados de distribuição diretamente das despesas passadas
  const data = React.useMemo(() => {
    if (!despesas || despesas.length === 0) {
      return [];
    }

    // Agrupar por categoria e subcategoria
    const categoryGroups: { [key: string]: { total: number; subcategorias: { [key: string]: number } } } = {};

    despesas.forEach(despesa => {
      const valor = despesa.valor_total || despesa.valor || 0;
      const categoria = despesa.categoria || 'Sem categoria';
      const subcategoria = despesa.subcategoria || 'Outros';

      if (!categoryGroups[categoria]) {
        categoryGroups[categoria] = { total: 0, subcategorias: {} };
      }

      categoryGroups[categoria].total += valor;
      
      if (!categoryGroups[categoria].subcategorias[subcategoria]) {
        categoryGroups[categoria].subcategorias[subcategoria] = 0;
      }
      categoryGroups[categoria].subcategorias[subcategoria] += valor;
    });

    // Cores para as categorias
    const colors: { [key: string]: string } = {
      'INSUMOS': '#10B981',
      'FIXAS': '#EF4444', 
      'VARIÁVEIS': '#F59E0B',
      'ATRASADOS': '#DC2626',
      'RETIRADAS': '#8B5CF6',
      'PESSOAIS': '#06B6D4',
      'Sem categoria': '#6B7280'
    };

    const result = Object.entries(categoryGroups)
      .filter(([_, group]) => group.total > 0)
      .map(([categoria, group]) => ({
        name: categoria,
        value: group.total,
        color: colors[categoria] || '#6B7280',
        subcategorias: group.subcategorias
      }))
      .sort((a, b) => b.value - a.value);

    console.log('Dados de distribuição calculados:', result);
    return result;
  }, [despesas]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const subcategorias = data.payload.subcategorias;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-sm text-gray-600">
            R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-600">
            {((data.value / data.payload.total) * 100).toFixed(1)}%
          </p>
          {subcategorias && Object.keys(subcategorias).length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-1">Subcategorias:</p>
              {Object.entries(subcategorias).map(([subcat, valor]: [string, any]) => {
                const percentualSub = ((valor / data.value) * 100);
                return (
                  <p key={subcat} className="text-xs text-gray-600">
                    {prettyLabel(subcat)}: R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
                    <span className="text-gray-500"> ({percentualSub.toFixed(1)}%)</span>
                  </p>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        <p>Não há dados de despesas para exibir no período selecionado</p>
      </div>
    );
  }

  // Calcular total para percentuais
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithTotal}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            dataKey="value"
          >
            {dataWithTotal.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value) => <span className="text-sm">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseDistribution;
