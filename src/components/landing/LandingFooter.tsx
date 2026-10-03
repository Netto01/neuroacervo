import React from 'react';
import Link from 'next/link';

interface LandingFooterProps {
  logoSrc?: string;
}

export function LandingFooter({ logoSrc = '/brand/isologo-preto.svg' }: LandingFooterProps) {
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link className="brand" href="/">
              <img className="brand-mark" src={logoSrc} width="26" height="34" alt="NeuroAcervo" />
              <span className="brand-name">NeuroAcervo</span>
            </Link>
            <p>
              Acervo de avaliação neuropsicológica para a prática clínica. Materiais de apoio destinados a profissionais habilitados.
            </p>
          </div>
          <div className="foot-col">
            <h5>Acervo</h5>
            <ul>
              <li><a href="#acervo">Guias rápidos</a></li>
              <li><a href="#acervo">Modelos de laudo</a></li>
              <li><a href="#acervo">Anamnese</a></li>
              <li><a href="#acervo">Aulas</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>Conta</h5>
            <ul>
              <li><Link href="/entrar">Entrar</Link></li>
              <li><a href="#planos">Planos</a></li>
              <li><Link href="/cadastro">Criar conta</Link></li>
              <li><Link href="/entrar">Esqueci a senha</Link></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>Ajuda</h5>
            <ul>
              <li><a href="#duvidas">Dúvidas</a></li>
              <li><a href="#">Suporte</a></li>
              <li><a href="#">Termos de uso</a></li>
              <li><a href="#">Privacidade</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span><span className="pulse"></span>Acervo em atualização</span>
          <span>© 2026 NeuroAcervo</span>
        </div>
      </div>
      <div className="foot-mega" aria-hidden="true">
        <div className="container">
          <div className="word">Neuro<span>Acervo</span>.</div>
        </div>
      </div>
    </footer>
  );
}
