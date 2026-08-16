import type { Metadata } from 'next';
import { DashboardPage } from '@/views/DashboardPage';

export const metadata: Metadata = {
  title: 'Overview',
  description: 'Ringkasan posisi keuangan, sisa budget, arus kas, dan rekening aktif Anda.',
};

export default function Page() {
  return <DashboardPage />;
}
