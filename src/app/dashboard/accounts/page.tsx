import type { Metadata } from "next";
import { AccountsPage } from "@/views/AccountsPage";

export const metadata: Metadata = {
  title: "Daftar Akun & Rekening",
  description:
    "Kelola saldo rekening bank, dompet digital (e-wallet), kartu kredit, dan lakukan rekonsiliasi saldo.",
};

export default function Page() {
  return <AccountsPage />;
}
