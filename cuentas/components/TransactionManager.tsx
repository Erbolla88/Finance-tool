import React from 'react';
import { Transaction } from '../types';
import TransactionTable from './TransactionTable';

interface TransactionManagerProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

const TransactionManager: React.FC<TransactionManagerProps> = ({ transactions, onDeleteTransaction }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">Historial de Transacciones</h3>
      <TransactionTable
        transactions={transactions}
        onDelete={onDeleteTransaction}
      />
    </div>
  );
};

export default TransactionManager;