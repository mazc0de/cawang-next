"use client";
import React, { createContext, useContext, useState } from "react";

interface TransactionsContextType {
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  showForm: boolean;
  setShowForm: (open: boolean) => void;
  editingTransaction: any;
  setEditingTransaction: (tx: any) => void;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(
  undefined,
);

export function TransactionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(undefined);

  return (
    <TransactionsContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        showForm,
        setShowForm,
        editingTransaction,
        setEditingTransaction,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactionsContext() {
  const context = useContext(TransactionsContext);
  return context;
}
