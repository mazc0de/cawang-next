import type { Metadata } from 'next';
import { CategoriesPage } from '@/views/CategoriesPage';

export const metadata: Metadata = {
  title: 'Manajemen Kategori',
  description: 'Kelola label dan ikon kategori transaksi pemasukan dan pengeluaran.',
};

export default function Page() {
  return <CategoriesPage />;
}
