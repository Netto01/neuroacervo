import React from 'react';

export function FaqSection() {
  return (
    <section className="block" id="duvidas" aria-labelledby="h-faq">
      <div className="container">
        <div className="sec-rule">
          <span className="roman">VI.</span>
          <span className="meta-grp">
            <span>Dúvidas</span>
            <span className="dot-mark">•</span>
            <span>Perguntas frequentes</span>
          </span>
          <span>006 / 006</span>
        </div>
        <div className="faq-grid">
          <div className="faq-head">
            <h2 id="h-faq">Perguntas <em>antes</em> de <em>entrar</em><span className="dot">.</span></h2>
            <p>Não encontrou o que procurava? Fale com o suporte pelo link no rodapé.</p>
          </div>
          <div className="faq-list">
            <details className="faq-item">
              <summary>
                <span className="faq-index">01</span>
                <span className="faq-q">Quem pode acessar o acervo?</span>
                <span className="faq-toggle" aria-hidden="true">+</span>
              </summary>
              <p className="faq-a">
                Psicólogos e estudantes de psicologia. Os guias são material de apoio e não substituem o manual oficial dos instrumentos, que segue necessário para a aplicação.
              </p>
            </details>
            <details className="faq-item">
              <summary>
                <span className="faq-index">02</span>
                <span className="faq-q">Posso editar os modelos de laudo?</span>
                <span className="faq-toggle" aria-hidden="true">+</span>
              </summary>
              <p className="faq-a">
                Sim. Os modelos estão em formatos editáveis para você adaptar à sua prática e a cada caso.
              </p>
            </details>
            <details className="faq-item">
              <summary>
                <span className="faq-index">03</span>
                <span className="faq-q">Consigo acessar pelo celular?</span>
                <span className="faq-toggle" aria-hidden="true">+</span>
              </summary>
              <p className="faq-a">
                Sim. A plataforma funciona no navegador do computador, do tablet e do celular, com o progresso das aulas salvo na sua conta.
              </p>
            </details>
            <details className="faq-item">
              <summary>
                <span className="faq-index">04</span>
                <span className="faq-q">O acervo recebe novos materiais?</span>
                <span className="faq-toggle" aria-hidden="true">+</span>
              </summary>
              <p className="faq-a">
                Sim. Materiais novos e revisados aparecem com os selos &ldquo;Novo&rdquo; e &ldquo;Atualizado&rdquo; na biblioteca.
              </p>
            </details>
            <details className="faq-item">
              <summary>
                <span className="faq-index">05</span>
                <span className="faq-q">Esqueci minha senha. E agora?</span>
                <span className="faq-toggle" aria-hidden="true">+</span>
              </summary>
              <p className="faq-a">
                Na tela de login, use &ldquo;Esqueci a senha&rdquo; para receber um link de redefinição no e-mail cadastrado.
              </p>
            </details>
            <details className="faq-item">
              <summary>
                <span className="faq-index">06</span>
                <span className="faq-q">Posso trocar de plano depois?</span>
                <span className="faq-toggle" aria-hidden="true">+</span>
              </summary>
              <p className="faq-a">
                Sim. Você pode subir ou descer de plano a qualquer momento pela sua conta. A diferença de valor é ajustada automaticamente na próxima cobrança.
              </p>
            </details>
            <details className="faq-item">
              <summary>
                <span className="faq-index">07</span>
                <span className="faq-q">Como faço para cancelar?</span>
                <span className="faq-toggle" aria-hidden="true">+</span>
              </summary>
              <p className="faq-a">
                Pela sua conta, em poucos cliques e sem multa. O acesso continua até o fim do período que você já pagou.
              </p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
