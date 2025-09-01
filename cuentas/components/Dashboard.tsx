import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { ref, onValue, push, remove, update, serverTimestamp, query, orderByChild } from 'firebase/database';
import { Transaction, TransactionType, Loan, SavingGoal } from '../types';
import Header from './Header';
import CashflowSummary from './CashflowSummary';
import TransactionManager from './TransactionManager';
import Charts from './Charts';
import Savings from './Savings';
import Loans from './Loans';
import AddTransactionForm from './AddTransactionForm';
import FloatingActionButton from './FloatingActionButton';
import AddTransactionModal from './AddTransactionModal';

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const transactionsQuery = query(ref(db, `users/${user.uid}/transactions`), orderByChild('createdAt'));
    const loansQuery = query(ref(db, `users/${user.uid}/loans`), orderByChild('endDate'));
    const savingsQuery = query(ref(db, `users/${user.uid}/savingGoals`), orderByChild('targetAmount'));

    const unsubTransactions = onValue(transactionsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] } as Transaction));
        setTransactions(list.reverse()); // Reverse for descending order (newest first)
      } else {
        setTransactions([]);
      }
    });
    
    const unsubLoans = onValue(loansQuery, (snapshot) => {
       const data = snapshot.val();
        if (data) {
            const list = Object.keys(data).map(key => ({ id: key, ...data[key] } as Loan));
            setLoans(list);
        } else {
            setLoans([]);
        }
    });

    const unsubSavings = onValue(savingsQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const list = Object.keys(data).map(key => ({ id: key, ...data[key] } as SavingGoal));
            setSavingGoals(list);
        } else {
            setSavingGoals([]);
        }
    });

    return () => {
      unsubTransactions();
      unsubLoans();
      unsubSavings();
    };
  }, [user]);
  
  // Automatic loan payment processing
  useEffect(() => {
    if (!user || loans.length === 0) return;
    
    const processPayments = async () => {
        const today = new Date();
        const updates: { [key: string]: any } = {};
        let hasUpdates = false;

        for (const loan of loans) {
            if (!loan.monthlyPayment || loan.monthlyPayment <= 0 || loan.paidAmount >= loan.totalAmount) {
                continue;
            }
            
            let lastProcessedDate: Date;
            if (loan.lastPaymentProcessDate) {
                const [year, month] = loan.lastPaymentProcessDate.split('-').map(Number);
                lastProcessedDate = new Date(year, month - 1);
            } else {
                lastProcessedDate = new Date(loan.startDate);
            }

            const startDate = new Date(loan.startDate);
            const endDate = new Date(loan.endDate);
            
            let cursorDate = new Date(lastProcessedDate.getFullYear(), lastProcessedDate.getMonth() + 1, 1);
            let totalPaymentToAdd = 0;
            
            while (cursorDate <= today && cursorDate >= startDate && cursorDate <= endDate) {
                if (loan.paidAmount + totalPaymentToAdd < loan.totalAmount) {
                    totalPaymentToAdd += loan.monthlyPayment;
                    hasUpdates = true;
                } else {
                    break;
                }
                cursorDate.setMonth(cursorDate.getMonth() + 1);
            }
            
            if (totalPaymentToAdd > 0) {
                const newPaidAmount = Math.min(loan.paidAmount + totalPaymentToAdd, loan.totalAmount);
                const currentMonthFormatted = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
                
                const loanPath = `users/${user.uid}/loans/${loan.id}`;
                updates[`${loanPath}/paidAmount`] = newPaidAmount;
                updates[`${loanPath}/lastPaymentProcessDate`] = currentMonthFormatted;
            }
        }
        
        if (hasUpdates) {
            try {
                await update(ref(db), updates);
            } catch (error) {
                console.error("Error processing automatic loan payments: ", error);
            }
        }
    };
    
    const timer = setTimeout(() => {
        processPayments();
    }, 1000);
    
    return () => clearTimeout(timer);

  }, [user, loans]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'date' | 'createdAt'>) => {
    if (!user) return;
    const transactionsRef = ref(db, `users/${user.uid}/transactions`);
    await push(transactionsRef, {
      ...transaction,
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
    });
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!user) return;
    const transactionRef = ref(db, `users/${user.uid}/transactions/${id}`);
    await remove(transactionRef);
  }, [user]);
  
  const addSavingGoal = useCallback(async (goal: Omit<SavingGoal, 'id' | 'savedAmount'>) => {
    if (!user) return;
    const savingGoalsRef = ref(db, `users/${user.uid}/savingGoals`);
    await push(savingGoalsRef, {
      ...goal,
      savedAmount: 0,
    });
  }, [user]);

  const updateSavingGoal = useCallback(async (id: string, newSavedAmount: number) => {
    if(!user) return;
    const goal = savingGoals.find(g => g.id === id);
    if (goal) {
       const goalRef = ref(db, `users/${user.uid}/savingGoals/${id}`);
       await update(goalRef, {
        savedAmount: Math.max(0, Math.min(goal.targetAmount, newSavedAmount))
       });
    }
  }, [user, savingGoals]);
  
  const addLoan = useCallback(async (loan: Omit<Loan, 'id' | 'paidAmount' | 'lastPaymentProcessDate'>) => {
    if (!user) return;
    const loansRef = ref(db, `users/${user.uid}/loans`);
    await push(loansRef, {
      ...loan,
      paidAmount: 0,
    });
  }, [user]);

  const updateLoan = useCallback(async (id: string, newPaidAmount: number) => {
    if(!user) return;
    const loan = loans.find(l => l.id === id);
    if(loan) {
        const loanRef = ref(db, `users/${user.uid}/loans/${id}`);
        await update(loanRef, {
            paidAmount: Math.max(0, Math.min(loan.totalAmount, newPaidAmount))
        });
    }
  }, [user, loans]);

  const handleAddTransactionAndCloseModal = (transaction: Omit<Transaction, 'id' | 'date' | 'createdAt'>) => {
    addTransaction(transaction);
    setIsModalOpen(false);
  };


  const { totalIncome, totalExpenses, netCashflow } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netCashflow: income - expenses,
    };
  }, [transactions]);

  const incomesForChart = useMemo(() => transactions.filter(t => t.type === TransactionType.INCOME), [transactions]);
  const expensesForChart = useMemo(() => transactions.filter(t => t.type === TransactionType.EXPENSE), [transactions]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header user={user} />
      
      {/* Desktop Layout */}
      <main className="hidden lg:block p-8 max-w-7xl mx-auto space-y-8">
        <CashflowSummary totalIncome={totalIncome} totalExpenses={totalExpenses} netCashflow={netCashflow} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-4">Añadir Transacción</h2>
              <AddTransactionForm onAddTransaction={addTransaction} />
            </div>
            <TransactionManager 
              transactions={transactions}
              onDeleteTransaction={deleteTransaction}
            />
          </div>
          <div className="space-y-8">
            <Charts incomes={incomesForChart} expenses={expensesForChart} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Savings goals={savingGoals} onUpdateGoal={updateSavingGoal} onAddGoal={addSavingGoal} />
            <Loans loans={loans} onUpdateLoan={updateLoan} onAddLoan={addLoan} />
        </div>
      </main>

      {/* Mobile Layout */}
      <main className="lg:hidden p-4 space-y-6 pb-24">
        <CashflowSummary totalIncome={totalIncome} totalExpenses={totalExpenses} netCashflow={netCashflow} />
        <TransactionManager 
            transactions={transactions}
            onDeleteTransaction={deleteTransaction}
        />
        <Charts incomes={incomesForChart} expenses={expensesForChart} />
        <Savings goals={savingGoals} onUpdateGoal={updateSavingGoal} onAddGoal={addSavingGoal} />
        <Loans loans={loans} onUpdateLoan={updateLoan} onAddLoan={addLoan} />
      </main>
      
      <FloatingActionButton onClick={() => setIsModalOpen(true)} />
      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddTransaction={handleAddTransactionAndCloseModal}
      />
    </div>
  );
};

export default Dashboard;