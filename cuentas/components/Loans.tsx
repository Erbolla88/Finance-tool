import React, { useState } from 'react';
import { Loan } from '../types';

interface LoansProps {
  loans: Loan[];
  onUpdateLoan: (id: string, newPaidAmount: number) => void;
  onAddLoan: (loan: Omit<Loan, 'id' | 'paidAmount' | 'lastPaymentProcessDate'>) => void;
}

const Loans: React.FC<LoansProps> = ({ loans, onUpdateLoan, onAddLoan }) => {
    const [name, setName] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [monthlyPayment, setMonthlyPayment] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [paymentLoanId, setPaymentLoanId] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');

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

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Préstamos</h2>

       <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-700/50 rounded-lg space-y-3">
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
      </form>

      <div className="space-y-6">
        {loans.map(loan => {
          const progress = loan.totalAmount > 0 ? (loan.paidAmount / loan.totalAmount) * 100 : 0;
          const outstandingAmount = loan.totalAmount - loan.paidAmount;
          return (
            <div key={loan.id}>
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
                 <button onClick={() => { setPaymentLoanId(loan.id); setPaymentAmount(''); }} className="text-xs text-purple-400 hover:text-purple-300 font-semibold">+ Registrar Pago</button>
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
            </div>
          );
        })}
        {loans.length === 0 && <p className="text-gray-500 text-center py-4">No hay préstamos para mostrar.</p>}
      </div>
    </div>
  );
};

export default Loans;