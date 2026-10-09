import type { Metadata } from 'next';
import './dashboard.css';

export const metadata: Metadata = {
  title: 'Plataforma · NeuroAcervo',
};

export default function PlataformaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="dash-root">{children}</div>;
}
