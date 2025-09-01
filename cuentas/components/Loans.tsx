import React, { useState } from 'react';
import { Loan } from '../types';
import { Icon } from './common/Icon';

interface LoansProps {
  loans: Loan[];
  onUpdateLoan: (id: string, newPaidAmount: number) => void;
  onAddLoan: (loan: Omit<Loan, 'id' | 'paidAmount' | 'lastPaymentProcessDate'>) => void;
  onEditLoan: (id: string, updatedData: Partial<Loan>) => void;
  onDeleteLoan: (id: string) => void;
}

const Loans: React.FC<LoansProps> = ({ loans, onUpdateLoan, onAddLoan, onEditLoan, onDeleteLoan }) => {
    const [name, setName] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [monthlyPayment, setMonthlyPayment] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [paymentLoanId, setPaymentLoanId] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    
    const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
    const [editedLoan, setEditedLoan] = useState<Partial<Loan>>({});


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim() || !totalAmount || !monthlyPayment || parseFloat(totalAmount) <= 0 || parseFloat(monthlyPayment) <= 0 || !startDate || !endDate) {
            alert('Por favor, completa todos los campos correctamente.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            alert('La fecha de inicio no puede ser posterior a la fecha de fin.');
            return;
        }
        onAddLoan({ name, totalAmount: parseFloat(totalAmount), startDate, endDate, monthlyPayment: parseFloat(monthlyPayment) });
        setName('');
        setTotalAmount('');
        setMonthlyPayment('');
        setStartDate('');
        setEndDate('');
    };

    const handlePaymentSubmit = (e: React.FormEvent, loan: Loan) => {
      e.preventDefault();
      const amount = parseFloat(paymentAmount);
      if(amount > 0) {
        onUpdateLoan(loan.id, loan.paidAmount + amount);
      }
      setPaymentAmount('');
      setPaymentLoanId(null);
    };

    const handleEditClick = (loan: Loan) => {
      setEditingLoanId(loan.id);
      setEditedLoan({ ...loan });
    };

    const handleCancelEdit = () => {
      setEditingLoanId(null);
      setEditedLoan({});
    };

    const handleSaveEdit = (loanId: string) => {
      if (!editedLoan.name || !editedLoan.totalAmount || !editedLoan.monthlyPayment || !editedLoan.startDate || !editedLoan.endDate) {
        alert('Por favor, completa todos los campos de edición.');
        return;
      }
      onEditLoan(loanId, {
        name: editedLoan.name,
        totalAmount: Number(editedLoan.totalAmount),
        monthlyPayment: Number(editedLoan.monthlyPayment),
        startDate: editedLoan.startDate,
        endDate: editedLoan.endDate,
      });
      handleCancelEdit();
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este préstamo?')) {
            onDeleteLoan(id);
        }
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setEditedLoan(prev => ({ ...prev, [name]: value }));
    };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Préstamos</h2>

       <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-700/50 rounded-lg space-y-3">
        <fieldset className="space-y-3">
            <h3 className="font-semibold text-white">Añadir Préstamo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre (ej. Hipoteca)"
                className="sm:col-span-2 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
            />
            <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="Importe Total (€)"
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
            />
            <input
                type="number"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                placeholder="Cuota Mensual (€)"
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
            />
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                title="Fecha de Inicio"
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
            />
            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                title="Fecha de Fin"
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
            />
            <button type="submit" className="sm:col-span-2 bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500">
                Añadir
            </button>
            </div>
        </fieldset>
      </form>

      <div className="space-y-6">
        {loans.map(loan => {
          const progress = loan.totalAmount > 0 ? (loan.paidAmount / loan.totalAmount) * 100 : 0;
          const outstandingAmount = loan.totalAmount - loan.paidAmount;
          return (
            <div key={loan.id}>
              {editingLoanId === loan.id ? (
                <div className="bg-gray-700/50 p-4 rounded-lg my-2 space-y-3">
                  <h4 className="font-semibold text-white">Editar Préstamo</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" name="name" value={editedLoan.name || ''} onChange={handleEditInputChange} placeholder="Nombre" className="sm:col-span-2 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <input type="number" name="totalAmount" value={editedLoan.totalAmount || ''} onChange={handleEditInputChange} placeholder="Importe Total (€)" className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <input type="number" name="monthlyPayment" value={editedLoan.monthlyPayment || ''} onChange={handleEditInputChange} placeholder="Cuota Mensual (€)" className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <input type="date" name="startDate" value={editedLoan.startDate || ''} onChange={handleEditInputChange} className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <input type="date" name="endDate" value={editedLoan.endDate || ''} onChange={handleEditInputChange} className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div className="flex justify-end gap-3 mt-2">
                      <button onClick={handleCancelEdit} className="text-gray-400 text-sm hover:text-white">Cancelar</button>
                      <button onClick={() => handleSaveEdit(loan.id)} className="bg-purple-600 text-white font-semibold py-1.5 px-3 rounded-lg text-sm hover:bg-purple-700">Guardar</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <p className="font-medium text-gray-200">{loan.name}</p>
                      <p className="text-xs text-gray-500">Vencimiento: {loan.endDate}</p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {loan.paidAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })} / {loan.totalAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-purple-500 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                        {outstandingAmount > 0 ? `Pendiente: ${outstandingAmount.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}` : '¡Préstamo Pagado!'}
                    </span>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => { setPaymentLoanId(loan.id); setPaymentAmount(''); }} className="text-xs text-purple-400 hover:text-purple-300 font-semibold">+ Registrar Pago</button>
                      <button onClick={() => handleEditClick(loan)} className="text-gray-400 hover:text-white" aria-label="Editar préstamo">
                        <Icon name="edit" className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(loan.id)} className="text-gray-400 hover:text-red-500" aria-label="Eliminar préstamo">
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {paymentLoanId === loan.id && (
                      <form onSubmit={(e) => handlePaymentSubmit(e, loan)} className="mt-2 flex gap-2 items-center">
                          <input 
                              type="number"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              placeholder="Importe del Pago"
                              className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              autoFocus
                              required
                          />
                          <button type="submit" className="bg-purple-600 text-white font-semibold py-1.5 px-3 rounded-lg text-sm hover:bg-purple-700">Guardar</button>
                          <button type="button" onClick={() => setPaymentLoanId(null)} className="text-gray-400 text-sm hover:text-white">Cancelar</button>
                      </form>
                  )}
                </>
              )}
            </div>
          );
        })}
        {loans.length === 0 && <p className="text-gray-500 text-center py-4">No hay préstamos para mostrar.</p>}
      </div>
    </div>
  );
};

export default Loans;