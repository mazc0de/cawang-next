"use client";
import React, { createContext, useContext, useState } from "react";
import type { Category } from "@/types/domain";

interface CategoriesContextType {
  showForm: boolean;
  setShowForm: (open: boolean) => void;
  editCategory: Category | null;
  setEditCategory: (cat: Category | null) => void;
  openAddModal: (type?: "inflow" | "outflow") => void;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(
  undefined,
);

export function CategoriesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const openAddModal = (_type: "inflow" | "outflow" = "outflow") => {
    setEditCategory(null);
    setShowForm(true);
  };

  return (
    <CategoriesContext.Provider
      value={{
        showForm,
        setShowForm,
        editCategory,
        setEditCategory,
        openAddModal,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategoriesContext() {
  return useContext(CategoriesContext);
}
