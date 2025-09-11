
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ExpenseDistributionChart from '@/components/ExpenseDistributionChart';
import MonthlyEvolutionChart from '@/components/MonthlyEvolutionChart';

interface DashboardChartsProps {
  despesas: any[];
  selectedPeriod: 'today' | 'week' | 'month' | 'year' | 'custom';
  customYear?: number;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ despesas, selectedPeriod, customYear }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Distribuição por Categoria */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Distribuição por Categoria</CardTitle>
          <CardDescription>Despesas por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseDistributionChart despesas={despesas} />
        </CardContent>
      </Card>

      {/* Evolução Mensal */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Evolução Mensal</CardTitle>
          <CardDescription>Gastos ao longo dos meses</CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyEvolutionChart despesas={despesas} selectedPeriod={selectedPeriod} customYear={customYear} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
