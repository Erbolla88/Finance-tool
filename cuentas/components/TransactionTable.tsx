import React from 'react';
import { Transaction, TransactionType } from '../types';
import { Icon } from './common/Icon';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
    return <p className="text-center text-gray-500 py-8">No hay transacciones registradas.</p>;
  }

  return (
    <div className="overflow-x-auto">
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
                <button onClick={() => onDelete(transaction.id)} className="text-gray-400 hover:text-red-500">
                  <Icon name="trash" className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;