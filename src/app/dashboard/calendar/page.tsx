import type { Metadata } from 'next';
import { CalendarPage } from '@/views/CalendarPage';

export const metadata: Metadata = {
  title: 'Kalender Arus Kas',
  description: 'Visualisasi kalender arus kas harian serta proyeksi pengeluaran dan pemasukan rutin.',
};

export default function Page() {
  return <CalendarPage />;
}
