import type { Metadata } from "next";
import { TransactionsPage } from "@/views/TransactionsPage";

export const metadata: Metadata = {
  title: "Transaksi",
  description:
    "Catat dan kelola seluruh riwayat transaksi pemasukan, pengeluaran, dan transfer rekening.",
};

export default function Page() {
  return <TransactionsPage />;
}
