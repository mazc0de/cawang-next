import type { Metadata } from "next";
import { BudgetPage } from "@/views/BudgetPage";

export const metadata: Metadata = {
  title: "Anggaran & Alokasi",
  description:
    "Rencanakan batas pengeluaran kategori dan gunakan Budgeting Wizard 50/30/20 untuk siklus finansial Anda.",
};

export default function Page() {
  return <BudgetPage />;
}
