'use client';
import React, { createContext, useContext, useState } from 'react';

interface BudgetContextType {
  showWizard: boolean;
  setShowWizard: (open: boolean) => void;
  showAddDialog: boolean;
  setShowAddDialog: (open: boolean) => void;
  editBudget: any;
  setEditBudget: (b: any) => void;
  openAddModal: () => void;
  openWizardModal: () => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [showWizard, setShowWizard] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editBudget, setEditBudget] = useState<any>(null);

  const openAddModal = () => {
    setEditBudget(null);
    setShowAddDialog(true);
  };

  const openWizardModal = () => {
    setShowWizard(true);
  };

  return (
    <BudgetContext.Provider
      value={{
        showWizard,
        setShowWizard,
        showAddDialog,
        setShowAddDialog,
        editBudget,
        setEditBudget,
        openAddModal,
        openWizardModal,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudgetContext() {
  return useContext(BudgetContext);
}
