import React from 'react';
import { Transaction, TransactionType } from '../types';
import { Icon } from './common/Icon';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onDelete, onEdit }) => {
  if (transactions.length === 0) {
    return <p className="text-center text-gray-500 py-8">No hay transacciones registradas.</p>;
  }

  return (
    <>
      {/* Mobile View: Card List */}
      <div className="md:hidden">
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const isIncome = transaction.type === TransactionType.INCOME;
            return (
              <div key={transaction.id} className="bg-gray-700/50 p-4 rounded-lg flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${isIncome ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    <Icon name={isIncome ? 'arrow-up' : 'arrow-down'} className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white max-w-[120px] truncate">{transaction.description}</p>
                    <p className="text-sm text-gray-400">{transaction.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="text-right">
                        <p className={`font-semibold ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                            {transaction.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.date}</p>
                    </div>
                    <div className="flex flex-col">
                        <button onClick={() => onEdit(transaction)} className="text-gray-400 hover:text-cyan-400 p-1">
                          <Icon name="edit" className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(transaction.id)} className="text-gray-400 hover:text-red-500 p-1">
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-300 uppercase bg-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3">Descripción</th>
              <th scope="col" className="px-6 py-3">Categoría</th>
              <th scope="col" className="px-6 py-3">Fecha</th>
              <th scope="col" className="px-6 py-3 text-right">Importe</th>
              <th scope="col" className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{transaction.description}</td>
                <td className="px-6 py-4">{transaction.category}</td>
                <td className="px-6 py-4">{transaction.date}</td>
                <td className={`px-6 py-4 text-right font-semibold ${transaction.type === TransactionType.INCOME ? 'text-green-400' : 'text-red-400'}`}>
                  {transaction.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => onEdit(transaction)} className="text-gray-400 hover:text-cyan-400 mr-4 inline-block">
                    <Icon name="edit" className="w-5 h-5" />
                  </button>
                  <button onClick={() => onDelete(transaction.id)} className="text-gray-400 hover:text-red-500 inline-block">
                    <Icon name="trash" className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TransactionTable;
