import React, { useState } from 'react';
import { SavingGoal } from '../types';
import { Icon } from './common/Icon';

interface SavingsProps {
  goals: SavingGoal[];
  onUpdateGoal: (id: string, newSavedAmount: number) => void;
  onAddGoal: (goal: Omit<SavingGoal, 'id' | 'savedAmount'>) => void;
  onEditGoal: (id: string, updatedData: { name: string, targetAmount: number }) => void;
  onDeleteGoal: (id: string) => void;
}

const Savings: React.FC<SavingsProps> = ({ goals, onUpdateGoal, onAddGoal, onEditGoal, onDeleteGoal }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  
  const [contributionGoalId, setContributionGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedTargetAmount, setEditedTargetAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0) {
      alert('Por favor, introduce un nombre y un importe válidos.');
      return;
    }
    onAddGoal({ name, targetAmount: parseFloat(targetAmount) });
    setName('');
    setTargetAmount('');
  };

  const handleContributionSubmit = (e: React.FormEvent, goal: SavingGoal) => {
    e.preventDefault();
    const amount = parseFloat(contributionAmount);
    if(amount > 0) {
        onUpdateGoal(goal.id, goal.savedAmount + amount);
    }
    setContributionAmount('');
    setContributionGoalId(null);
  };

  const handleEditClick = (goal: SavingGoal) => {
    setEditingGoalId(goal.id);
    setEditedName(goal.name);
    setEditedTargetAmount(goal.targetAmount.toString());
  };

  const handleCancelEdit = () => {
    setEditingGoalId(null);
  };

  const handleSaveEdit = (goalId: string) => {
    if (!editedName.trim() || !editedTargetAmount || parseFloat(editedTargetAmount) <= 0) {
      alert('Por favor introduce un nombre y un importe objetivo válidos.');
      return;
    }
    onEditGoal(goalId, {
      name: editedName,
      targetAmount: parseFloat(editedTargetAmount),
    });
    setEditingGoalId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este objetivo de ahorro?')) {
      onDeleteGoal(id);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Objetivos de Ahorro</h2>
      
      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-700/50 rounded-lg space-y-3">
        <h3 className="font-semibold text-white">Añadir Objetivo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre (ej. Vacaciones)"
            className="sm:col-span-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="Importe Objetivo (€)"
            className="sm:col-span-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
          <button type="submit" className="sm:col-span-1 bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500">
            Añadir
          </button>
        </div>
      </form>
      
      <div className="space-y-6">
        {goals.map(goal => {
          const progress = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
          const remainingAmount = goal.targetAmount - goal.savedAmount;
          return (
            <div key={goal.id}>
              {editingGoalId === goal.id ? (
                <div className="bg-gray-700/50 p-4 rounded-lg my-2">
                  <h4 className="font-semibold text-white mb-3">Editar Objetivo</h4>
                  <div className="space-y-3">
                      <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} placeholder="Nombre" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                      <input type="number" value={editedTargetAmount} onChange={(e) => setEditedTargetAmount(e.target.value)} placeholder="Importe Objetivo (€)" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                      <button onClick={handleCancelEdit} className="text-gray-400 text-sm hover:text-white">Cancelar</button>
                      <button onClick={() => handleSaveEdit(goal.id)} className="bg-cyan-600 text-white font-semibold py-1.5 px-3 rounded-lg text-sm hover:bg-cyan-700">Guardar</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-200">{goal.name}</span>
                    <span className="text-sm text-gray-400">
                      {goal.savedAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })} / {goal.targetAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                        {remainingAmount > 0 ? `Restante: ${remainingAmount.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}` : '¡Objetivo Alcanzado!'}
                    </span>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => { setContributionGoalId(goal.id); setContributionAmount('') }} className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold">+ Añadir Fondos</button>
                      <button onClick={() => handleEditClick(goal)} className="text-gray-400 hover:text-white" aria-label="Editar objetivo">
                        <Icon name="edit" className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(goal.id)} className="text-gray-400 hover:text-red-500" aria-label="Eliminar objetivo">
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {contributionGoalId === goal.id && (
                      <form onSubmit={(e) => handleContributionSubmit(e, goal)} className="mt-2 flex gap-2 items-center">
                          <input 
                              type="number"
                              value={contributionAmount}
                              onChange={(e) => setContributionAmount(e.target.value)}
                              placeholder="Importe"
                              className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                              autoFocus
                              required
                          />
                          <button type="submit" className="bg-cyan-600 text-white font-semibold py-1.5 px-3 rounded-lg text-sm hover:bg-cyan-700">Guardar</button>
                          <button type="button" onClick={() => setContributionGoalId(null)} className="text-gray-400 text-sm hover:text-white">Cancelar</button>
                      </form>
                  )}
                </>
              )}
            </div>
          );
        })}
        {goals.length === 0 && <p className="text-gray-500 text-center py-4">Ningún objetivo de ahorro.</p>}
      </div>
    </div>
  );
};

export default Savings;