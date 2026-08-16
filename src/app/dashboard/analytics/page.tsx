import type { Metadata } from 'next';
import { AnalyticsPage } from '@/views/AnalyticsPage';

export const metadata: Metadata = {
  title: 'Analytics & Laporan',
  description: 'Laporan visual mendalam pengeluaran per kategori, tren pemasukan vs pengeluaran, net worth, dan budget vs aktual.',
};

export default function Page() {
  return <AnalyticsPage />;
}
