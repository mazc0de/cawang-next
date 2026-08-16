import type { Metadata } from 'next';
import { SettingsPage } from '@/views/SettingsPage';

export const metadata: Metadata = {
  title: 'Pengaturan',
  description: 'Kelola profil akun pengguna dan konfigurasi tanggal mulai siklus finansial (financial cycle).',
};

export default function Page() {
  return <SettingsPage />;
}
