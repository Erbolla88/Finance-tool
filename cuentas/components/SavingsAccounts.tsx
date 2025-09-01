import React, { useState } from 'react';
import { SavingsAccount } from '../types';
import { Icon } from './common/Icon';

interface SavingsAccountsProps {
  accounts: SavingsAccount[];
  onAddAccount: (account: Omit<SavingsAccount, 'id'>) => void;
  onUpdateAccount: (id: string, newAmount: number) => void;
  onEditAccount: (id: string, updatedData: { name: string }) => void;
  onDeleteAccount: (id: string) => void;
}

const SavingsAccounts: React.FC<SavingsAccountsProps> = ({ accounts, onAddAccount, onUpdateAccount, onEditAccount, onDeleteAccount }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateAmount, setUpdateAmount] = useState('');

  const totalSavings = accounts.reduce((sum, account) => sum + account.amount, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount || parseFloat(amount) < 0) {
      alert('Por favor, introduce un nombre y un importe inicial válidos.');
      return;
    }
    onAddAccount({ name, amount: parseFloat(amount) });
    setName('');
    setAmount('');
  };

  const handleEditClick = (account: SavingsAccount) => {
    setEditingId(account.id);
    setEditedName(account.name);
  };
  
  const handleSaveEdit = (id: string) => {
    if(!editedName.trim()) {
      alert('El nombre no puede estar vacío.');
      return;
    }
    onEditAccount(id, { name: editedName });
    setEditingId(null);
    setEditedName('');
  };

  const handleUpdateClick = (id: string) => {
    setUpdatingId(id);
    setUpdateAmount('');
  };
  
  const handleUpdateAmount = (account: SavingsAccount, operation: 'add' | 'subtract') => {
    const value = parseFloat(updateAmount);
    if(isNaN(value) || value <= 0) {
      alert('Por favor, introduce un importe válido.');
      return;
    }
    const newAmount = operation === 'add' ? account.amount + value : account.amount - value;
    onUpdateAccount(account.id, newAmount);
    setUpdatingId(null);
    setUpdateAmount('');
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cuenta de ahorro?')) {
        onDeleteAccount(id);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Cuentas de Ahorro</h2>
      
      <form onSubmit={handleAddSubmit} className="mb-6 p-4 bg-gray-700/50 rounded-lg space-y-3">
        <fieldset className="space-y-3">
            <h3 className="font-semibold text-white">Añadir Cuenta</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre (ej. Banco Principal)"
                className="sm:col-span-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
            />
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Importe Inicial (€)"
                className="sm:col-span-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
            />
            <button type="submit" className="sm:col-span-1 bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500">
                Añadir
            </button>
            </div>
        </fieldset>
      </form>
      
      <div className="space-y-4">
        {accounts.map(account => (
          <div key={account.id} className="bg-gray-700/50 p-4 rounded-lg">
            {editingId === account.id ? (
                <div className="flex items-center gap-2">
                    <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" autoFocus/>
                    <button onClick={() => handleSaveEdit(account.id)} className="bg-emerald-600 text-white font-semibold py-1.5 px-3 rounded-lg text-sm hover:bg-emerald-700">Guardar</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-400 text-sm hover:text-white">Cancelar</button>
                </div>
            ) : (
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-medium text-white">{account.name}</p>
                        <p className="text-xl font-bold text-emerald-400">{account.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button onClick={() => handleUpdateClick(account.id)} className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">+ / - Fondos</button>
                        <button onClick={() => handleEditClick(account)} className="text-gray-400 hover:text-white" aria-label="Editar nombre"><Icon name="edit" className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(account.id)} className="text-gray-400 hover:text-red-500" aria-label="Eliminar cuenta"><Icon name="trash" className="w-4 h-4" /></button>
                    </div>
                </div>
            )}
            
            {updatingId === account.id && (
                <div className="mt-3 pt-3 border-t border-gray-600 flex items-center gap-2">
                     <input 
                        type="number"
                        value={updateAmount}
                        onChange={(e) => setUpdateAmount(e.target.value)}
                        placeholder="Importe"
                        className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        autoFocus
                        required
                    />
                    <button onClick={() => handleUpdateAmount(account, 'add')} className="bg-green-600 text-white font-semibold py-1.5 px-3 rounded-lg text-sm hover:bg-green-700">Añadir</button>
                    <button onClick={() => handleUpdateAmount(account, 'subtract')} className="bg-red-600 text-white font-semibold py-1.5 px-3 rounded-lg text-sm hover:bg-red-700">Retirar</button>
                    <button type="button" onClick={() => setUpdatingId(null)} className="text-gray-400 text-sm hover:text-white">Cancelar</button>
                </div>
            )}
          </div>
        ))}
         {accounts.length === 0 && <p className="text-gray-500 text-center py-4">No has añadido ninguna cuenta de ahorro.</p>}
      </div>

      {accounts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-600 flex justify-between items-center">
            <p className="text-lg font-bold text-white">Total en Cuentas</p>
            <p className="text-xl font-bold text-emerald-400">
                {totalSavings.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </p>
        </div>
      )}
    </div>
  );
};

export default SavingsAccounts;