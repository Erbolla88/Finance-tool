import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';

interface AddTransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'createdAt'>) => void;
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ onAddTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);

  const categories = type === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) {
      alert('Por favor, completa todos los campos');
      return;
    }
    onAddTransaction({
      description,
      amount: parseFloat(amount),
      category,
      type,
    });
    setDescription('');
    setAmount('');
    setCategory('');
  };
  
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(''); // Reset category when type changes
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-700/50 rounded-lg space-y-4">
        <div className="flex bg-gray-700 rounded-lg p-1">
            <button type="button" onClick={() => handleTypeChange(TransactionType.EXPENSE)} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${type === TransactionType.EXPENSE ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Gasto</button>
            <button type="button" onClick={() => handleTypeChange(TransactionType.INCOME)} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${type === TransactionType.INCOME ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Ingreso</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción"
                className="col-span-1 md:col-span-2 lg:col-span-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
            <button type="submit" className="w-full bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500">
                Añadir
            </button>
        </div>
    </form>
  );
};

export default AddTransactionForm;