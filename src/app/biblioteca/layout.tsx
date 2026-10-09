import type { Metadata } from 'next';
import '../plataforma/dashboard.css';

export const metadata: Metadata = {
  title: 'Biblioteca · NeuroAcervo',
};

export default function BibliotecaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="dash-root">{children}</div>;
}
