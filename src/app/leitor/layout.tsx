import type { Metadata } from 'next';
import './leitor.css';

export const metadata: Metadata = {
  title: 'Leitor de Documento · NeuroAcervo',
};

export default function LeitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
