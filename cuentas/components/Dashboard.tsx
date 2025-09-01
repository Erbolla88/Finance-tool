import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { ref, onValue, push, remove, update, serverTimestamp, query, orderByChild } from 'firebase/database';
import { Transaction, TransactionType, Loan, SavingGoal, SavingsAccount } from '../types';
import Header from './Header';
import CashflowSummary from './CashflowSummary';
import TransactionManager from './TransactionManager';
import Charts from './Charts';
import Savings from './Savings';
import Loans from './Loans';
import AddTransactionForm from './AddTransactionForm';
import FloatingActionButton from './FloatingActionButton';
import AddTransactionModal from './AddTransactionModal';
import EditTransactionModal from './EditTransactionModal';
import SavingsAccounts from './SavingsAccounts';
import MonthTabs from './MonthTabs';

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  const [selectedDate, setSelectedDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [isDuplicating, setIsDuplicating] = useState(false);


  const monthTabs = useMemo(() => {
    const tabs: Date[] = [];
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(2026, 11, 1); // December is month 11

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      tabs.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return tabs;
  }, []);

  useEffect(() => {
    if (!user) return;

    const transactionsQuery = query(ref(db, `users/${user.uid}/transactions`), orderByChild('createdAt'));
    const loansQuery = query(ref(db, `users/${user.uid}/loans`), orderByChild('endDate'));
    const savingsQuery = query(ref(db, `users/${user.uid}/savingGoals`), orderByChild('targetAmount'));
    const savingsAccountsQuery = query(ref(db, `users/${user.uid}/savingsAccounts`), orderByChild('name'));

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
    
    const unsubSavingsAccounts = onValue(savingsAccountsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] } as SavingsAccount));
        setSavingsAccounts(list);
      } else {
        setSavingsAccounts([]);
      }
    });

    return () => {
      unsubTransactions();
      unsubLoans();
      unsubSavings();
      unsubSavingsAccounts();
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

  const transactionsForSelectedMonth = useMemo(() => {
    // FIX: Compare date strings directly to avoid timezone issues.
    // new Date('YYYY-MM-DD') is parsed as UTC, which can cause .getMonth() to return the previous month.
    const selectedYearMonth = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}`;
    return transactions.filter(t => t.date.startsWith(selectedYearMonth));
  }, [transactions, selectedDate]);
  
  // Duplicate transactions for future months
  useEffect(() => {
    if (!user || transactions.length === 0 || isDuplicating) return;

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const selectedMonthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

    const isFutureMonth = selectedMonthStart > now;
    if (!isFutureMonth || transactionsForSelectedMonth.length > 0) return;

    const prevMonthDate = new Date(selectedDate);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    
    // FIX: Use robust string comparison for dates to avoid timezone bugs.
    const prevMonthYear = prevMonthDate.getFullYear();
    const prevMonthMonth = (prevMonthDate.getMonth() + 1).toString().padStart(2, '0');
    const prevMonthPrefix = `${prevMonthYear}-${prevMonthMonth}`;
    const prevMonthTransactions = transactions.filter(t => t.date.startsWith(prevMonthPrefix));

    if (prevMonthTransactions.length > 0) {
      const duplicateTransactions = async () => {
        setIsDuplicating(true);
        const transactionsRef = ref(db, `users/${user.uid}/transactions`);
        const promises = prevMonthTransactions.map(transaction => {
          const [, , day] = transaction.date.split('-').map(Number);
          const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);

          // Handle cases where day is invalid for the new month (e.g., 31st in a 30-day month)
          if (newDate.getMonth() !== selectedDate.getMonth()) {
            newDate.setDate(0); 
          }

          const newTransactionData = {
            ...transaction,
            date: newDate.toISOString().split('T')[0],
            createdAt: serverTimestamp(),
          };
          delete (newTransactionData as any).id;
          return push(transactionsRef, newTransactionData);
        });
        
        try {
          await Promise.all(promises);
        } catch (error) {
          console.error("Failed to duplicate transactions:", error);
        } finally {
          setIsDuplicating(false);
        }
      };
      duplicateTransactions();
    }
  }, [selectedDate, transactions, user, transactionsForSelectedMonth, isDuplicating]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'date' | 'createdAt'>) => {
    if (!user) return;
    const transactionsRef = ref(db, `users/${user.uid}/transactions`);
    
    const newDate = new Date(selectedDate);
    const today = new Date();
    newDate.setDate(today.getDate());
    
    if (newDate.getMonth() !== selectedDate.getMonth()) {
        newDate.setDate(0); 
    }

    await push(transactionsRef, {
      ...transaction,
      date: newDate.toISOString().split('T')[0],
      createdAt: serverTimestamp(),
    });
  }, [user, selectedDate]);

  const updateTransaction = useCallback(async (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'date'>>) => {
    if (!user) return;
    const transactionRef = ref(db, `users/${user.uid}/transactions/${id}`);
    await update(transactionRef, data);
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
  
  const editSavingGoal = useCallback(async (id: string, updatedData: Partial<SavingGoal>) => {
    if (!user) return;
    const goalRef = ref(db, `users/${user.uid}/savingGoals/${id}`);
    await update(goalRef, updatedData);
  }, [user]);

  const deleteSavingGoal = useCallback(async (id: string) => {
    if (!user) return;
    const goalRef = ref(db, `users/${user.uid}/savingGoals/${id}`);
    await remove(goalRef);
  }, [user]);

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
  
  const editLoan = useCallback(async (id: string, updatedData: Partial<Loan>) => {
    if (!user) return;
    const loanRef = ref(db, `users/${user.uid}/loans/${id}`);
    await update(loanRef, updatedData);
  }, [user]);

  const deleteLoan = useCallback(async (id: string) => {
    if (!user) return;
    const loanRef = ref(db, `users/${user.uid}/loans/${id}`);
    await remove(loanRef);
  }, [user]);

  const addSavingsAccount = useCallback(async (account: Omit<SavingsAccount, 'id'>) => {
    if (!user) return;
    const accountsRef = ref(db, `users/${user.uid}/savingsAccounts`);
    await push(accountsRef, account);
  }, [user]);

  const updateSavingsAccount = useCallback(async (id: string, newAmount: number) => {
    if (!user) return;
    const accountRef = ref(db, `users/${user.uid}/savingsAccounts/${id}`);
    await update(accountRef, { amount: Math.max(0, newAmount) });
  }, [user]);
  
  const editSavingsAccount = useCallback(async (id: string, updatedData: Partial<Omit<SavingsAccount, 'id'>>) => {
      if (!user) return;
      const accountRef = ref(db, `users/${user.uid}/savingsAccounts/${id}`);
      await update(accountRef, updatedData);
  }, [user]);

  const deleteSavingsAccount = useCallback(async (id: string) => {
    if (!user) return;
    const accountRef = ref(db, `users/${user.uid}/savingsAccounts/${id}`);
    await remove(accountRef);
  }, [user]);

  const handleAddTransactionAndCloseModal = (transaction: Omit<Transaction, 'id' | 'date' | 'createdAt'>) => {
    addTransaction(transaction);
    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setTransactionToEdit(null);
    setIsEditModalOpen(false);
  };
  
  const handleSaveTransaction = async (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'date'>>) => {
    await updateTransaction(id, data);
    handleCloseEditModal();
  }

  const { totalIncome, totalExpenses, netCashflow } = useMemo(() => {
    const income = transactionsForSelectedMonth
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactionsForSelectedMonth
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netCashflow: income - expenses,
    };
  }, [transactionsForSelectedMonth]);
  
  const monthOffset = useMemo(() => {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return (selectedDate.getFullYear() - startOfCurrentMonth.getFullYear()) * 12 + (selectedDate.getMonth() - startOfCurrentMonth.getMonth());
  }, [selectedDate]);

  const projectedLoans = useMemo(() => {
    if (monthOffset <= 0) return loans;

    return loans.map(loan => {
      const loanEndDate = new Date(loan.endDate);
      if (selectedDate > loanEndDate) {
        return {
          ...loan,
          paidAmount: loan.totalAmount,
        };
      }

      let projectedPaidAmount = loan.paidAmount;
      const loanStartDate = new Date(loan.startDate);
      const now = new Date();
      const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      for (let i = 1; i <= monthOffset; i++) {
        if (projectedPaidAmount >= loan.totalAmount) break;
        
        const paymentMonth = new Date(startOfCurrentMonth.getFullYear(), startOfCurrentMonth.getMonth() + i, 1);
        
        if (paymentMonth >= loanStartDate && paymentMonth <= loanEndDate) {
          projectedPaidAmount += loan.monthlyPayment;
        }
      }

      return {
        ...loan,
        paidAmount: Math.min(loan.totalAmount, projectedPaidAmount),
      };
    });
  }, [loans, monthOffset, selectedDate]);


  const incomesForChart = useMemo(() => transactionsForSelectedMonth.filter(t => t.type === TransactionType.INCOME), [transactionsForSelectedMonth]);
  const expensesForChart = useMemo(() => transactionsForSelectedMonth.filter(t => t.type === TransactionType.EXPENSE), [transactionsForSelectedMonth]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header user={user} />
      
      <main className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-24">
        <MonthTabs tabs={monthTabs} selectedTab={selectedDate} onSelectTab={(date) => setSelectedDate(new Date(date))} />
        
        <CashflowSummary totalIncome={totalIncome} totalExpenses={totalExpenses} netCashflow={netCashflow} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="hidden lg:block bg-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-4">Añadir Transacción</h2>
              <AddTransactionForm onAddTransaction={addTransaction} />
            </div>
            <TransactionManager 
              transactions={transactionsForSelectedMonth}
              onDeleteTransaction={deleteTransaction}
              onEditTransaction={handleOpenEditModal}
            />
          </div>
          
          <div className="space-y-8">
            <Charts incomes={incomesForChart} expenses={expensesForChart} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Savings 
              goals={savingGoals} 
              onUpdateGoal={updateSavingGoal} 
              onAddGoal={addSavingGoal} 
              onEditGoal={editSavingGoal}
              onDeleteGoal={deleteSavingGoal}
            />
            <Loans 
              loans={projectedLoans} 
              onUpdateLoan={updateLoan} 
              onAddLoan={addLoan} 
              onEditLoan={editLoan}
              onDeleteLoan={deleteLoan}
            />
        </div>

        <SavingsAccounts
          accounts={savingsAccounts}
          onAddAccount={addSavingsAccount}
          onUpdateAccount={updateSavingsAccount}
          onEditAccount={editSavingsAccount}
          onDeleteAccount={deleteSavingsAccount}
        />

      </main>
      
      <FloatingActionButton onClick={() => setIsAddModalOpen(true)} />
      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddTransaction={handleAddTransactionAndCloseModal}
      />
       <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveTransaction}
        transaction={transactionToEdit}
      />
    </div>
  );
};

export default Dashboard;