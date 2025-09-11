
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface CompanyCardProps {
  name: string;
  totalDespesas: number;
  status: string;
  statusColor: 'green' | 'yellow';
  periodo: string;
  insumos?: number;
  variaveis?: number;
  fixas?: number;
  atrasados?: number;
  retiradas?: number;
  sem_categoria?: number;
  chartData: Array<{ value: number }>;
  chartColor: string;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  name,
  totalDespesas,
  status,
  statusColor,
  periodo,
  insumos,
  variaveis,
  fixas,
  atrasados,
  retiradas,
  sem_categoria,
  chartData,
  chartColor
}) => {
  const statusBgColor = statusColor === 'green' ? 'bg-green-500' : 'bg-yellow-500';

  // Criar dados específicos para o gráfico baseado nas categorias
  const categoryData = [
    { name: 'Insumos', value: insumos || 0, color: '#0ea5e9' },
    { name: 'Variáveis', value: variaveis || 0, color: '#f59e0b' },
    { name: 'Fixas', value: fixas || 0, color: '#1e293b' },
    { name: 'Atrasados', value: atrasados || 0, color: '#ef4444' },
    { name: 'Retiradas', value: retiradas || 0, color: '#8b5cf6' }
  ].filter(item => item.value > 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm relative">
      {/* Borda lateral vermelha que se estende por toda a altura */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
      
      <div className="p-6 ml-3">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
            <p className="text-sm text-gray-500">{periodo}</p>
          </div>
          <span className={`px-3 py-1 rounded-2xl text-xs font-medium text-white ${statusBgColor}`}>
            {status}
          </span>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Total Despesas</p>
          <p className="text-2xl font-bold text-gray-900">
            R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-3">Por Categoria</p>
          <div className="space-y-2">
            {insumos !== undefined && insumos > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Insumos:</span>
                <span className="text-sm font-medium text-blue-600">
                  R$ {insumos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {variaveis !== undefined && variaveis > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Variáveis:</span>
                <span className="text-sm font-medium text-amber-600">
                  R$ {variaveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {fixas !== undefined && fixas > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fixas:</span>
                <span className="text-sm font-medium text-slate-700">
                  R$ {fixas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {atrasados !== undefined && atrasados > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Atrasados:</span>
                <span className="text-sm font-medium text-red-600">
                  R$ {atrasados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {retiradas !== undefined && retiradas > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Retiradas:</span>
                <span className="text-sm font-medium text-purple-600">
                  R$ {retiradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de linha representando a evolução */}
        <div className="h-16 mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={chartColor} 
                strokeWidth={3}
                dot={{ fill: chartColor, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: chartColor }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Indicadores de categoria com cores */}
        {categoryData.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-xs text-gray-600">{category.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyCard;
