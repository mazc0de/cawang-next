import type { Metadata } from "next";
import { CategoriesReportPage } from "@/views/CategoriesReportPage";

export const metadata: Metadata = {
  title: "Laporan Kategori",
  description: "Laporan pengeluaran berdasarkan kategori.",
};

export default function Page() {
  return <CategoriesReportPage />;
}
