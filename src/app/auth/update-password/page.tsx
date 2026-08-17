import type { Metadata } from "next";
import { UpdatePasswordPage } from "@/views/UpdatePasswordPage";

export const metadata: Metadata = {
  title: "Perbarui Password",
  description: "Atur ulang dan perbarui kata sandi akun CAWANG Anda.",
};

export default function Page() {
  return <UpdatePasswordPage />;
}
