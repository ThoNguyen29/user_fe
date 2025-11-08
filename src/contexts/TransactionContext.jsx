// src/contexts/TransactionContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const TransactionContext = createContext();

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

const STORAGE_KEY = 'pharma_transactions';

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);

  // Load transactions from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem(STORAGE_KEY);
    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions));
      } catch (error) {
        console.error('Error loading transactions from localStorage:', error);
      }
    }
  }, []);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction) => {
    const newTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...transaction,
      date: new Date().toISOString(),
      timestamp: Date.now(),
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  };

  const getTransactionsByAccount = (account) => {
    if (!account) return [];
    return transactions.filter(tx => 
      tx.customer?.toLowerCase() === account.toLowerCase()
    );
  };

  const getTotalByAccount = (account) => {
    const userTxs = getTransactionsByAccount(account);
    return userTxs.reduce((total, tx) => total + (parseFloat(tx.price_eth) || 0), 0);
  };

  const getAllTransactions = () => {
    return transactions;
  };

  const getTotalAll = () => {
    return transactions.reduce((total, tx) => total + (parseFloat(tx.price_eth) || 0), 0);
  };

  const clearTransactions = () => {
    setTransactions([]);
  };

  const value = {
    transactions,
    addTransaction,
    getTransactionsByAccount,
    getTotalByAccount,
    getAllTransactions,
    getTotalAll,
    clearTransactions,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};








