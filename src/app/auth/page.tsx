import type { Metadata } from "next";
import { AuthPage } from "@/views/AuthPage";

export const metadata: Metadata = {
  title: "Masuk & Daftar Akun",
  description:
    "Masuk atau buat akun baru di CAWANG untuk mulai mencatat keuangan pribadi Anda.",
};

export default function Page() {
  return <AuthPage />;
}
