import React from 'react';
import { DollarSign, CheckCircle, Clock, AlertTriangle, Percent } from 'lucide-react';
import { Transaction } from '@/types/transaction';

interface DespesasStatsProps {
  totalDespesas: number;
  totalJuros: number;
  valorPago: number;
  valorPendente: number;
  valorAtrasado: number;
  despesasPagasCount: number;
  despesasPendentesCount: number;
  despesasAtrasadasCount: number;
  filteredTransactionsCount: number;
}

const DespesasStats: React.FC<DespesasStatsProps> = ({
  totalDespesas,
  totalJuros,
  valorPago,
  valorPendente,
  valorAtrasado,
  despesasPagasCount,
  despesasPendentesCount,
  despesasAtrasadasCount,
  filteredTransactionsCount
}) => {

  return (
    <div className="mb-4">
      {/* Stats principais - Compactos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-white/20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-red-100 to-red-200 rounded-lg">
              <DollarSign className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-medium text-gray-600">Total</h3>
              <p className="text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent truncate">
                R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400">{filteredTransactionsCount} reg.</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-white/20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg">
              <Percent className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-medium text-gray-600">Juros</h3>
              <p className="text-lg font-bold text-orange-600 truncate">
                R$ {totalJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400">aplicados</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-white/20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-green-100 to-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-medium text-gray-600">Pagas</h3>
              <p className="text-lg font-bold text-green-600 truncate">
                R$ {valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400">{despesasPagasCount} desp.</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-white/20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-medium text-gray-600">Pendentes</h3>
              <p className="text-lg font-bold text-yellow-600 truncate">
                R$ {valorPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400">{despesasPendentesCount} desp.</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-white/20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-red-100 to-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-medium text-gray-600">Atrasadas</h3>
              <p className="text-lg font-bold text-red-600 truncate">
                R$ {valorAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400">{despesasAtrasadasCount} desp.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DespesasStats;