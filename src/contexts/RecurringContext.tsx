"use client";
import React, { createContext, useContext, useState } from "react";

interface RecurringContextType {
  showForm: boolean;
  setShowForm: (open: boolean) => void;
  openAddModal: () => void;
}

const RecurringContext = createContext<RecurringContextType | undefined>(
  undefined,
);

export function RecurringProvider({ children }: { children: React.ReactNode }) {
  const [showForm, setShowForm] = useState(false);

  const openAddModal = () => {
    setShowForm(true);
  };

  return (
    <RecurringContext.Provider
      value={{
        showForm,
        setShowForm,
        openAddModal,
      }}
    >
      {children}
    </RecurringContext.Provider>
  );
}

export function useRecurringContext() {
  return useContext(RecurringContext);
}
