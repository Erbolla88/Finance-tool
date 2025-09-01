
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  date: string; // Storing as YYYY-MM-DD string
  createdAt: number;
}

export interface Loan {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  startDate: string;
  endDate: string;
  monthlyPayment: number;
  lastPaymentProcessDate?: string;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
}

export interface SavingsAccount {
  id: string;
  name: string;
  amount: number;
}
