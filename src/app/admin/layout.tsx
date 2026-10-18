import type { Metadata } from 'next';
import { AdminGuard } from '@/components/admin/AdminGuard';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin · NeuroAcervo',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminGuard>{children}</AdminGuard>;
}
