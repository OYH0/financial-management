
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface CompanyCardProps {
  name: string;
  totalDespesas: number;
  totalReceitas?: number;
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
  totalReceitas,
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
  const lucro = (totalReceitas || 0) - totalDespesas;
  const lucroColor = lucro >= 0 ? 'text-green-600' : 'text-red-600';

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
      
      <div className="p-4 lg:p-6 ml-2 lg:ml-3">
        <div className="flex justify-between items-start mb-3 lg:mb-4">
          <div className="min-w-0 flex-1 mr-2">
            <h3 className="text-sm lg:text-lg font-semibold text-gray-800 truncate">{name}</h3>
            <p className="text-xs lg:text-sm text-gray-500">{periodo}</p>
          </div>
          <span className={`px-2 lg:px-3 py-1 rounded-2xl text-[10px] lg:text-xs font-medium text-white shrink-0 ${statusBgColor}`}>
            {status}
          </span>
        </div>
        
        {/* Resumo Financeiro */}
        <div className="grid grid-cols-2 gap-2 lg:gap-3 mb-3 lg:mb-4">
          <div>
            <p className="text-[10px] lg:text-xs text-gray-500 mb-0.5 lg:mb-1">Receitas</p>
            <p className="text-sm lg:text-lg font-bold text-green-600">
              R$ {(totalReceitas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-[10px] lg:text-xs text-gray-500 mb-0.5 lg:mb-1">Despesas</p>
            <p className="text-sm lg:text-lg font-bold text-red-600">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Lucro/Prejuízo */}
        <div className="mb-3 lg:mb-4 p-2 lg:p-3 bg-gray-50 rounded-lg">
          <p className="text-[10px] lg:text-xs text-gray-500 mb-0.5 lg:mb-1">Lucro/Prejuízo</p>
          <p className={`text-base lg:text-xl font-bold ${lucroColor}`}>
            R$ {lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="mb-4 lg:mb-6">
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
