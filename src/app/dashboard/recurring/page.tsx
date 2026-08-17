import type { Metadata } from "next";
import { RecurringPage } from "@/views/RecurringPage";

export const metadata: Metadata = {
  title: "Transaksi Rutin & Langganan",
  description:
    "Jadwalkan transaksi rutin, langganan bulanan, tagihan berkala, dan cicilan otomatis.",
};

export default function Page() {
  return <RecurringPage />;
}
