
import React from 'react';
import CompanyCard from '../CompanyCard';
import { Despesa } from '@/hooks/useDespesas';
import { calculateCompanyTotals, debugCompanies, verifyDataIntegrity } from '@/utils/dashboardCalculations';

interface DashboardCardsProps {
  despesas: Despesa[];
  receitas: any[];
  period: string;
  stats?: {
    total: number;
    pagas: number;
    pendentes: number;
    count: number;
    pagasCount: number;
    pendentesCount: number;
  };
}

// Função para gerar dados de gráfico baseados nas categorias
const generateChartData = (categories: Record<string, number>) => {
  const values = Object.values(categories).filter(v => v > 0);
  if (values.length === 0) return [{ value: 0 }];
  
  const maxValue = Math.max(...values);
  
  // Gerar 6 pontos de dados simulando evolução mensal
  return Array.from({ length: 6 }, (_, i) => ({
    value: Math.max(0, maxValue * (0.6 + (i * 0.08) + Math.random() * 0.1))
  }));
};

const DashboardCards: React.FC<DashboardCardsProps> = ({ despesas, receitas, period, stats }) => {
  console.log('\n🎯 =========================');
  console.log('🎯 DASHBOARD CARDS DEBUG');
  console.log('🎯 =========================');
  console.log('Total de despesas recebidas:', despesas.length);
  console.log('Total de receitas recebidas:', receitas.length);
  console.log('Período:', period);
  console.log('Stats:', stats);

  // Filtrar despesas para excluir Camerino e Implementação
  const despesasSemCamerino = despesas.filter(despesa => {
    const empresa = despesa.empresa?.toLowerCase().trim() || '';
    return !empresa.includes('camerino') && !empresa.includes('implementação') && empresa !== 'implementação';
  });

  // Filtrar receitas para excluir Camerino e Implementação
  const receitasSemCamerino = receitas.filter(receita => {
    const empresa = receita.empresa?.toLowerCase().trim() || '';
    return !empresa.includes('camerino') && !empresa.includes('implementação') && empresa !== 'implementação';
  });

  console.log('Total de despesas após filtrar Camerino:', despesasSemCamerino.length);
  console.log('Total de receitas após filtrar Camerino:', receitasSemCamerino.length);

  // Verificar integridade dos dados
  const integrity = verifyDataIntegrity(despesasSemCamerino);
  console.log('Integridade dos dados:', integrity);

  // Debug das empresas
  debugCompanies(despesasSemCamerino);

  // Usar função centralizada para calcular dados (sem Camerino) incluindo receitas
  const companyTotals = calculateCompanyTotals(despesasSemCamerino, receitasSemCamerino);

  console.log('\n🎯 === TOTAIS FINAIS CALCULADOS (SEM CAMERINO) ===');
  console.log('Churrasco Cariri:', {
    totalDespesas: companyTotals.churrasco_cariri?.total || 0,
    totalReceitas: companyTotals.churrasco_cariri?.totalReceitas || 0,
    despesas: companyTotals.churrasco_cariri?.expenses?.length || 0,
    receitas: companyTotals.churrasco_cariri?.receitas?.length || 0,
    categorias: companyTotals.churrasco_cariri?.categories
  });
  console.log('Churrasco Fortaleza:', {
    totalDespesas: companyTotals.churrasco_fortaleza?.total || 0,
    totalReceitas: companyTotals.churrasco_fortaleza?.totalReceitas || 0,
    despesas: companyTotals.churrasco_fortaleza?.expenses?.length || 0,
    receitas: companyTotals.churrasco_fortaleza?.receitas?.length || 0,
    categorias: companyTotals.churrasco_fortaleza?.categories
  });
  console.log('Johnny:', {
    totalDespesas: companyTotals.johnny?.total || 0,
    totalReceitas: companyTotals.johnny?.totalReceitas || 0,
    despesas: companyTotals.johnny?.expenses?.length || 0,
    receitas: companyTotals.johnny?.receitas?.length || 0,
    categorias: companyTotals.johnny?.categories
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <CompanyCard
        name="Companhia do Churrasco Cariri"
        totalDespesas={companyTotals.churrasco_cariri?.total || 0}
        totalReceitas={companyTotals.churrasco_cariri?.totalReceitas || 0}
        status={despesasSemCamerino && despesasSemCamerino.length > 0 ? "Atualizado" : "Sem dados"}
        statusColor={despesasSemCamerino && despesasSemCamerino.length > 0 ? "green" : "yellow"}
        periodo={period}
        insumos={companyTotals.churrasco_cariri?.categories.insumos > 0 ? companyTotals.churrasco_cariri.categories.insumos : undefined}
        variaveis={companyTotals.churrasco_cariri?.categories.variaveis > 0 ? companyTotals.churrasco_cariri.categories.variaveis : undefined}
        fixas={companyTotals.churrasco_cariri?.categories.fixas > 0 ? companyTotals.churrasco_cariri.categories.fixas : undefined}
        atrasados={companyTotals.churrasco_cariri?.categories.atrasados > 0 ? companyTotals.churrasco_cariri.categories.atrasados : undefined}
        retiradas={companyTotals.churrasco_cariri?.categories.retiradas > 0 ? companyTotals.churrasco_cariri.categories.retiradas : undefined}
        sem_categoria={companyTotals.churrasco_cariri?.categories.sem_categoria > 0 ? companyTotals.churrasco_cariri.categories.sem_categoria : undefined}
        chartData={generateChartData(companyTotals.churrasco_cariri?.categories || {})}
        chartColor="#ef4444"
      />

      <CompanyCard
        name="Companhia do Churrasco Fortaleza"
        totalDespesas={companyTotals.churrasco_fortaleza?.total || 0}
        totalReceitas={companyTotals.churrasco_fortaleza?.totalReceitas || 0}
        status={despesasSemCamerino && despesasSemCamerino.length > 0 ? "Atualizado" : "Sem dados"}
        statusColor={despesasSemCamerino && despesasSemCamerino.length > 0 ? "green" : "yellow"}
        periodo={period}
        insumos={companyTotals.churrasco_fortaleza?.categories.insumos > 0 ? companyTotals.churrasco_fortaleza.categories.insumos : undefined}
        variaveis={companyTotals.churrasco_fortaleza?.categories.variaveis > 0 ? companyTotals.churrasco_fortaleza.categories.variaveis : undefined}
        fixas={companyTotals.churrasco_fortaleza?.categories.fixas > 0 ? companyTotals.churrasco_fortaleza.categories.fixas : undefined}
        atrasados={companyTotals.churrasco_fortaleza?.categories.atrasados > 0 ? companyTotals.churrasco_fortaleza.categories.atrasados : undefined}
        retiradas={companyTotals.churrasco_fortaleza?.categories.retiradas > 0 ? companyTotals.churrasco_fortaleza.categories.retiradas : undefined}
        sem_categoria={companyTotals.churrasco_fortaleza?.categories.sem_categoria > 0 ? companyTotals.churrasco_fortaleza.categories.sem_categoria : undefined}
        chartData={generateChartData(companyTotals.churrasco_fortaleza?.categories || {})}
        chartColor="#f97316"
      />
      
      <CompanyCard
        name="Johnny Rockets"
        totalDespesas={companyTotals.johnny?.total || 0}
        totalReceitas={companyTotals.johnny?.totalReceitas || 0}
        status={despesasSemCamerino && despesasSemCamerino.length > 0 ? "Atualizado" : "Sem dados"}
        statusColor={despesasSemCamerino && despesasSemCamerino.length > 0 ? "green" : "yellow"}
        periodo={period}
        fixas={companyTotals.johnny?.categories.fixas > 0 ? companyTotals.johnny.categories.fixas : undefined}
        insumos={companyTotals.johnny?.categories.insumos > 0 ? companyTotals.johnny.categories.insumos : undefined}
        variaveis={companyTotals.johnny?.categories.variaveis > 0 ? companyTotals.johnny.categories.variaveis : undefined}
        atrasados={companyTotals.johnny?.categories.atrasados > 0 ? companyTotals.johnny.categories.atrasados : undefined}
        retiradas={companyTotals.johnny?.categories.retiradas > 0 ? companyTotals.johnny.categories.retiradas : undefined}
        sem_categoria={companyTotals.johnny?.categories.sem_categoria > 0 ? companyTotals.johnny.categories.sem_categoria : undefined}
        chartData={generateChartData(companyTotals.johnny?.categories || {})}
        chartColor="#3b82f6"
      />
    </div>
  );
};

export default DashboardCards;
