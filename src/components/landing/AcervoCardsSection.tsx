import React from 'react';

export function AcervoCardsSection() {
  return (
    <section className="block" id="acervo" aria-labelledby="h-acervo">
      <div className="container">
        <div className="sec-rule">
          <span className="roman">I.</span>
          <span className="meta-grp">
            <span>O acervo</span>
            <span className="dot-mark">•</span>
            <span>Sete tipos de material</span>
          </span>
          <span>001 / 006</span>
        </div>
        <div className="head-split">
          <h2 className="display" id="h-acervo">
            Tudo o que a avaliação <em>pede</em>, do <em>primeiro contato</em> ao laudo<span className="dot">.</span>
          </h2>
          <div className="right">
            <span className="plus" aria-hidden="true">+</span>
            <p>
              Cada material mostra categoria, população, formato e tamanho antes de abrir. Você encontra o que precisa pela busca ou pelos filtros, e volta a ele quando quiser.
            </p>
          </div>
        </div>
        <div className="cards">
          <a className="card feature" href="#guia">
            <div className="num">01<span className="tag">Destaque</span></div>
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>
            <h3>Guias rápidos <span>de aplicação e interpretação</span></h3>
            <p>O passo a passo de cada teste em poucas páginas: material necessário, instruções, critérios de interrupção, correção e leitura das faixas de desempenho.</p>
            <span className="arrow-mark" aria-hidden="true">→</span>
          </a>
          <a className="card" href="#planos">
            <div className="num">02<span className="tag">DOCX · PDF</span></div>
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"/><path d="M14 3v5h5v3M9 9h2M9 13h4"/><path d="m14 21 1-3 4.5-4.5a1.4 1.4 0 0 1 2 2L17 20z"/></svg>
            <h3>Modelos <span>de laudo</span></h3>
            <p>Estruturas editáveis por faixa etária e queixa, com exemplos de redação.</p>
            <span className="arrow-mark" aria-hidden="true">→</span>
          </a>
          <a className="card" href="#planos">
            <div className="num">03<span className="tag">Entrevista</span></div>
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9l-4 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M19 9h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1v3l-4-3h-3"/></svg>
            <h3>Roteiros <span>de anamnese</span></h3>
            <p>Entrevistas semiestruturadas para paciente, família e escola.</p>
            <span className="arrow-mark" aria-hidden="true">→</span>
          </a>
          <a className="card" href="#planos">
            <div className="num">04<span className="tag">Estudo</span></div>
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5C5.5 4 8.5 4 12 6c3.5-2 6.5-2 9-.5V19c-2.5-1.5-5.5-1.5-9 .5-3.5-2-6.5-2-9-.5z"/><path d="M12 6v13.5"/></svg>
            <h3>Compêndios <span>de estudo</span></h3>
            <p>Sínteses aprofundadas por função cognitiva e por quadro clínico.</p>
            <span className="arrow-mark" aria-hidden="true">→</span>
          </a>
          <a className="card" href="#planos">
            <div className="num">05<span className="tag">Vídeo</span></div>
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/></svg>
            <h3>Aulas <span>em módulos</span></h3>
            <p>Com progresso salvo, para assistir no seu ritmo.</p>
            <span className="arrow-mark" aria-hidden="true">→</span>
          </a>
          <a className="card" href="#planos">
            <div className="num">06<span className="tag">Fichas</span></div>
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/></svg>
            <h3>Instrumentos <span>e protocolos</span></h3>
            <p>Folhas de registro e protocolos para o dia a dia.</p>
            <span className="arrow-mark" aria-hidden="true">→</span>
          </a>
          <a className="card" href="#planos">
            <div className="num">07<span className="tag">Referência</span></div>
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>
            <h3>PDFs <span>e artigos</span></h3>
            <p>Materiais de referência selecionados e organizados por tema.</p>
            <span className="arrow-mark" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
