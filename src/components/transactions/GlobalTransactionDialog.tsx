"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import {
  TransactionFormDialog,
  type TransactionFormData,
} from "@/components/transactions/TransactionFormDialog";
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { useTransactionsContext } from "@/contexts/TransactionsContext";

export function GlobalTransactionDialog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const txContext = useTransactionsContext();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();

  const showForm = txContext?.showForm ?? false;
  const setShowForm = txContext?.setShowForm ?? (() => {});
  const editingTransaction = txContext?.editingTransaction;
  const setEditingTransaction = txContext?.setEditingTransaction ?? (() => {});
  const selectedDate = txContext?.selectedDate ?? new Date();

  const handleTransactionSubmit = async (data?: TransactionFormData) => {
    if (!data || !user) return;

    if (editingTransaction) {
      if (editingTransaction.transfer_pair_id) {
        await updateTransaction.mutateAsync({
          id: editingTransaction.id,
          amount: data.amount,
          date: data.date,
          notes: data.notes,
        });
        await updateTransaction.mutateAsync({
          id: editingTransaction.transfer_pair_id,
          amount: data.amount,
          date: data.date,
        });
        queryClient.invalidateQueries({ queryKey: ["transactions", user.id] });
        queryClient.invalidateQueries({ queryKey: ["accounts", user.id] });
      } else {
        await updateTransaction.mutateAsync({
          id: editingTransaction.id,
          account_id: data.account_id,
          category_id: data.category_id!,
          amount: data.amount,
          date: data.date,
          notes: data.notes,
        });
      }
      setEditingTransaction(undefined);
      return;
    }

    if (data.type === "transfer") {
      const { data: tx1 } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            account_id: data.account_id,
            category_id:
              categories.find((c) => c.type === "outflow")?.id ?? "",
            amount: data.amount,
            type: "outflow",
            date: data.date,
            notes:
              data.notes ||
              `Transfer ke ${accounts.find((a) => a.id === data.to_account_id)?.name}`,
            is_adjustment: false,
          },
        ])
        .select()
        .single();

      if (!tx1) return;

      const { data: tx2 } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            account_id: data.to_account_id!,
            category_id:
              categories.find((c) => c.type === "inflow")?.id ?? "",
            amount: data.amount,
            type: "inflow",
            date: data.date,
            notes:
              data.notes ||
              `Transfer dari ${accounts.find((a) => a.id === data.account_id)?.name}`,
            is_adjustment: false,
            transfer_pair_id: tx1.id,
          },
        ])
        .select()
        .single();

      if (tx2) {
        await supabase
          .from("transactions")
          .update({ transfer_pair_id: tx2.id })
          .eq("id", tx1.id);
      }

      queryClient.invalidateQueries({ queryKey: ["transactions", user.id] });
      queryClient.invalidateQueries({ queryKey: ["accounts", user.id] });
    } else {
      await createTransaction.mutateAsync({
        account_id: data.account_id,
        category_id: data.category_id!,
        amount: data.amount,
        type: data.type,
        date: data.date,
        notes: data.notes,
      });
    }
  };

  return (
    <TransactionFormDialog
      open={showForm}
      onOpenChange={(open) => {
        setShowForm(open);
        if (!open) setTimeout(() => setEditingTransaction(undefined), 300);
      }}
      transaction={editingTransaction}
      defaultDate={format(selectedDate, "yyyy-MM-dd")}
      accounts={accounts}
      categories={categories}
      onSuccess={handleTransactionSubmit}
    />
  );
}
