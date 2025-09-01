import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<Omit<Transaction, 'id' | 'date' | 'createdAt'>>) => void;
  transaction: Transaction | null;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ isOpen, onClose, onSave, transaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(String(transaction.amount));
      setCategory(transaction.category);
      setType(transaction.type);
    }
  }, [transaction]);

  if (!isOpen || !transaction) {
    return null;
  }

  const categories = type === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) {
      alert('Por favor, completa todos los campos');
      return;
    }
    onSave(transaction.id, {
      description,
      amount: parseFloat(amount),
      category,
      type,
    });
  };

  const handleTypeChange = (newType: TransactionType) => {
    const isCategoryValidForNewType = (newType === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).includes(category);
    setType(newType);
    if (!isCategoryValidForNewType) {
        setCategory(''); // Reset category if it's not valid for the new type
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Editar Transacción</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none font-semibold focus:outline-none">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 bg-gray-700/50 rounded-lg space-y-4">
            <div className="flex bg-gray-700 rounded-lg p-1">
                <button type="button" onClick={() => handleTypeChange(TransactionType.EXPENSE)} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${type === TransactionType.EXPENSE ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Gasto</button>
                <button type="button" onClick={() => handleTypeChange(TransactionType.INCOME)} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${type === TransactionType.INCOME ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Ingreso</button>
            </div>
            <div className="space-y-4">
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                />
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Importe"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                >
                    <option value="">Selecciona Categoría</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
                 <button type="button" onClick={onClose} className="py-2 px-4 text-gray-300 rounded-lg hover:bg-gray-600">Cancelar</button>
                <button type="submit" className="bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    Guardar Cambios
                </button>
            </div>
        </form>

      </div>
    </div>
  );
};

export default EditTransactionModal;
