
import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip, CartesianGrid } from 'recharts';
import { normalizeCompanyName, getTransactionValue } from '@/utils/dashboardCalculations';

interface MonthlyEvolutionChartProps {
  despesas?: any[];
  receitas?: any[];
  selectedPeriod: 'today' | 'week' | 'month' | 'year' | 'custom';
  customYear?: number;
}

const MonthlyEvolutionChart: React.FC<MonthlyEvolutionChartProps> = ({ despesas, receitas, selectedPeriod, customYear }) => {
  console.log('=== MONTHLY EVOLUTION CHART ===');
  console.log('Despesas recebidas:', despesas?.length || 0);
  console.log('Receitas recebidas:', receitas?.length || 0);
  console.log('Período selecionado:', selectedPeriod);
  
  // Gerar dados anuais (Jan-Dez) - ano atual ou customYear no filtro personalizado
  const chartData = React.useMemo(() => {
    if (!despesas && !receitas) return [];

    const targetYear = selectedPeriod === 'custom' && customYear ? customYear : new Date().getFullYear();
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    
    const data = months.map((m, index) => ({ 
      period: m, 
      index,
      // Receitas
      receita_cariri: 0,
      receita_fortaleza: 0,
      receita_johnny: 0,
      // Despesas
      despesa_cariri: 0,
      despesa_fortaleza: 0,
      despesa_johnny: 0,
      // Lucro (será calculado depois)
      lucro_cariri: 0,
      lucro_fortaleza: 0,
      lucro_johnny: 0
    }));

    // Processar receitas
    if (receitas) {
      receitas.forEach(receita => {
        const empresa = normalizeCompanyName(receita.empresa);
        if (empresa === 'camerino' || empresa === 'implementacao') return;
        
        // Só contar receitas recebidas
        if (!receita.data_recebimento) return;
        
        // Não contar "SALDO DO DIA"
        const descricao = (receita.descricao || '').toUpperCase().trim();
        if (descricao.includes('SALDO DO DIA')) return;
        
        const date = new Date(receita.data);
        if (date.getFullYear() !== targetYear) return;
        
        const monthIndex = date.getMonth();
        const valor = receita.valor || 0;
        
        if (empresa === 'churrasco_cariri') data[monthIndex].receita_cariri += valor;
        if (empresa === 'churrasco_fortaleza') data[monthIndex].receita_fortaleza += valor;
        if (empresa === 'johnny') data[monthIndex].receita_johnny += valor;
      });
    }

    // Processar despesas
    if (despesas) {
      despesas.forEach(despesa => {
        const empresa = normalizeCompanyName(despesa.empresa);
        if (empresa === 'camerino' || empresa === 'implementacao') return;
        
        const date = new Date(despesa.data);
        if (date.getFullYear() !== targetYear) return;
        
        const monthIndex = date.getMonth();
        const valor = getTransactionValue(despesa);
        
        if (empresa === 'churrasco_cariri') data[monthIndex].despesa_cariri += valor;
        if (empresa === 'churrasco_fortaleza') data[monthIndex].despesa_fortaleza += valor;
        if (empresa === 'johnny') data[monthIndex].despesa_johnny += valor;
      });
    }

    // Calcular lucro
    data.forEach(month => {
      month.lucro_cariri = month.receita_cariri - month.despesa_cariri;
      month.lucro_fortaleza = month.receita_fortaleza - month.despesa_fortaleza;
      month.lucro_johnny = month.receita_johnny - month.despesa_johnny;
    });

    const result = data.sort((a, b) => a.index - b.index);
    console.log('Dados finais do gráfico anual:', result);
    return result;
  }, [despesas, receitas, selectedPeriod, customYear]);
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const empresas = [
        { nome: 'Churrasco Cariri', prefixo: 'cariri', cor: '#ef4444' },
        { nome: 'Churrasco Fortaleza', prefixo: 'fortaleza', cor: '#f97316' },
        { nome: 'Johnny Rockets', prefixo: 'johnny', cor: '#3b82f6' }
      ];

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-bold text-gray-800 mb-2 border-b pb-1">{label}</p>
          {empresas.map(({ nome, prefixo, cor }) => {
            const receita = payload.find((p: any) => p.dataKey === `receita_${prefixo}`)?.value || 0;
            const despesa = payload.find((p: any) => p.dataKey === `despesa_${prefixo}`)?.value || 0;
            const lucro = payload.find((p: any) => p.dataKey === `lucro_${prefixo}`)?.value || 0;
            
            if (receita === 0 && despesa === 0) return null;
            
            return (
              <div key={prefixo} className="mb-2 last:mb-0">
                <p className="font-semibold text-sm" style={{ color: cor }}>{nome}</p>
                <div className="ml-2 text-xs space-y-0.5">
                  <p className="text-green-600">Receita: R$ {receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-red-600">Despesa: R$ {despesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className={`font-medium ${lucro >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    Lucro: R$ {lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Não há dados para mostrar</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="period" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#4B5563', fontSize: 11 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#4B5563', fontSize: 11 }} 
            tickFormatter={(value) => `${value.toLocaleString('pt-BR', { notation: 'compact' })}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value) => {
              if (value === 'lucro_cariri') return 'Lucro Cariri';
              if (value === 'lucro_fortaleza') return 'Lucro Fortaleza';
              if (value === 'lucro_johnny') return 'Lucro Johnny';
              return value;
            }}
          />
          
          {/* Linhas de Lucro */}
          <Line 
            type="monotone"
            name="lucro_cariri"
            dataKey="lucro_cariri" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line 
            type="monotone"
            name="lucro_fortaleza"
            dataKey="lucro_fortaleza" 
            stroke="#f97316" 
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line 
            type="monotone"
            name="lucro_johnny"
            dataKey="lucro_johnny" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyEvolutionChart;
