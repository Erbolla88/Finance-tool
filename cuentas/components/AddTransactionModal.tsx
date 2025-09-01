import React from 'react';
import AddTransactionForm from './AddTransactionForm';
import { Transaction } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'createdAt'>) => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAddTransaction }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Añadir Transacción</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none font-semibold focus:outline-none">&times;</button>
        </div>
        <AddTransactionForm onAddTransaction={onAddTransaction} />
      </div>
    </div>
  );
};

export default AddTransactionModal;
