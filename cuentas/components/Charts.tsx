import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';


const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981'];

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-80 flex flex-col">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <div className="flex-grow">
            {children}
        </div>
    </div>
);

const Charts: React.FC<{ incomes: Transaction[]; expenses: Transaction[]; }> = ({ incomes, expenses }) => {
  const expenseByCategory = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    expenses.forEach(expense => {
      categoryMap[expense.category] = (categoryMap[expense.category] || 0) + expense.amount;
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [expenses]);
  
  const cashflowData = useMemo(() => ([
      { name: 'Ingresos', amount: incomes.reduce((acc, t) => acc + t.amount, 0) },
      { name: 'Gastos', amount: expenses.reduce((acc, t) => acc + t.amount, 0) },
  ]), [incomes, expenses]);

  const totalCashflowAmount = useMemo(() => cashflowData.reduce((sum, item) => sum + item.amount, 0), [cashflowData]);

  return (
    <div className="space-y-8">
      <ChartContainer title="Desglose de Gastos">
        {expenseByCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                stroke="none"
              >
                {expenseByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#d1d5db' }}
                  formatter={(value: number) => value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              />
               <Legend iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
                No hay gastos para mostrar.
            </div>
        )}
      </ChartContainer>
      <ChartContainer title="Ingresos vs. Gastos">
        {totalCashflowAmount > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflowData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" tickFormatter={(value) => `€${value.toLocaleString('es-ES')}`} />
                    <YAxis type="category" dataKey="name" stroke="#9ca3af" width={60} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '0.5rem' }}
                      itemStyle={{ color: '#d1d5db' }}
                      cursor={{fill: 'rgba(107, 114, 128, 0.1)'}}
                      formatter={(value: number) => value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      />
                    <Bar dataKey="amount" fill="#8884d8" barSize={30}>
                      {
                          cashflowData.map((entry, index) => (
                              <Cell cursor="pointer" fill={index === 0 ? '#10b981' : '#ef4444'} key={`cell-${index}`}/>
                          ))
                      }
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
                No hay transacciones para mostrar.
            </div>
        )}
      </ChartContainer>
    </div>
  );
};

export default Charts;