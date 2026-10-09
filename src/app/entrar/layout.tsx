import type { Metadata } from 'next';
import './login.css';

export const metadata: Metadata = {
  title: 'Entrar · NeuroAcervo',
};

export default function EntrarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="login-root">{children}</div>;
}
