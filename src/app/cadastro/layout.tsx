import type { Metadata } from 'next';
import './cadastro.css';

export const metadata: Metadata = {
  title: 'Criar Conta · NeuroAcervo',
};

export default function CadastroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="cad-root">{children}</div>;
}
