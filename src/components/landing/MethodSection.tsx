import React from 'react';

export function MethodSection() {
  return (
    <section className="block" id="metodo" aria-labelledby="h-metodo">
      <div className="container">
        <div className="sec-rule">
          <span className="roman">II.</span>
          <span className="meta-grp">
            <span>Como funciona</span>
            <span className="dot-mark">•</span>
            <span>Quatro etapas</span>
          </span>
          <span>002 / 006</span>
        </div>
        <div className="head-split">
          <h2 className="display" id="h-metodo">
            Do caso ao laudo, <em>com o material certo</em> em mãos<span className="dot">.</span>
          </h2>
          <div className="right">
            <span className="plus" aria-hidden="true">+</span>
            <p>
              O acervo acompanha a sequência real de uma avaliação, para você consultar exatamente o que a etapa pede.
            </p>
          </div>
        </div>
        <div className="method-grid">
          <div className="method-step">
            <span className="num">01</span>
            <h4>Entrar <span className="arrow-r">→</span></h4>
            <p>Acesso individual com login, no computador ou no celular, a qualquer hora.</p>
          </div>
          <div className="method-step">
            <span className="num">02</span>
            <h4>Encontrar <span className="arrow-r">→</span></h4>
            <p>Busque pelo teste, pela função cognitiva ou pelo tema e filtre por tipo de material.</p>
          </div>
          <div className="method-step">
            <span className="num">03</span>
            <h4>Aplicar e interpretar <span className="arrow-r">→</span></h4>
            <p>Consulte o guia durante a aplicação e use o roteiro na entrevista.</p>
          </div>
          <div className="method-step">
            <span className="num">04</span>
            <h4>Redigir</h4>
            <p>Adapte o modelo de laudo ao seu caso, com a estrutura e a linguagem já resolvidas.</p>
          </div>
        </div>
        <div className="method-foot">
          <span className="left">
            <span className="ring" aria-hidden="true"></span>
            Etapas da avaliação neuropsicológica
          </span>
          <span>Anamnese → testagem → integração → devolutiva</span>
        </div>
      </div>
    </section>
  );
}
