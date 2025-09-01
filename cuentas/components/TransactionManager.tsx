import React from 'react';
import { Transaction } from '../types';
import AddTransactionForm from './AddTransactionForm';
import TransactionTable from './TransactionTable';

interface TransactionManagerProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'createdAt'>) => void;
  onDeleteTransaction: (id: string) => void;
}

const TransactionManager: React.FC<TransactionManagerProps> = ({ transactions, onAddTransaction, onDeleteTransaction }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Añadir Transacción</h2>
      
      <AddTransactionForm onAddTransaction={onAddTransaction} />

      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-4">Historial de Transacciones</h3>
        <TransactionTable
          transactions={transactions}
          onDelete={onDeleteTransaction}
        />
      </div>
    </div>
  );
};

export default TransactionManager;