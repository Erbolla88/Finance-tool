import React from 'react';
import { Icon } from './common/Icon';

interface CashflowSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  netCashflow: number;
}

const StatCard: React.FC<{ title: string; amount: number; iconName: string; colorClass: string; }> = ({ title, amount, iconName, colorClass }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-2xl flex items-center space-x-4">
            <div className={`p-3 rounded-full ${colorClass}`}>
                <Icon name={iconName} className="h-6 w-6 text-white" />
            </div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-white">
                    {amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </p>
            </div>
        </div>
    );
};


const CashflowSummary: React.FC<CashflowSummaryProps> = ({ totalIncome, totalExpenses, netCashflow }) => {
  const netCashflowColor = netCashflow >= 0 ? 'bg-green-500/80' : 'bg-red-500/80';
  const netCashflowIcon = netCashflow >= 0 ? 'chart' : 'chart-down';

  return (
    <div>
        <h2 className="text-2xl font-bold text-white mb-4">Resumen Financiero</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Ingresos Totales" amount={totalIncome} iconName="arrow-up" colorClass="bg-green-500/80" />
            <StatCard title="Gastos Totales" amount={totalExpenses} iconName="arrow-down" colorClass="bg-red-500/80" />
            <StatCard title="Flujo de Caja Neto" amount={netCashflow} iconName={netCashflowIcon} colorClass={netCashflowColor} />
        </div>
    </div>
  );
};

export default CashflowSummary;