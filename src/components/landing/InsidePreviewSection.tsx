import React from 'react';

export function InsidePreviewSection() {
  return (
    <section className="work" id="guia" aria-labelledby="h-guia">
      <div className="work-rule">
        <span className="roman">III.</span>
        <span>Por dentro do acervo • Amostras</span>
        <span>003 / 006</span>
      </div>
      <div className="work-grid">
        <div className="work-copy">
          <h2 id="h-guia">Rigor técnico <em>em formato</em> de <em>consulta</em><span className="dot">.</span></h2>
          <p>Cada guia cabe numa leitura rápida entre um atendimento e outro, sem perder a precisão.</p>
          <ul className="work-list">
            <li><b>01</b>Aplicação passo a passo, com critérios de início e interrupção.</li>
            <li><b>02</b>Correção e conversão de escores explicadas sem rodeios.</li>
            <li><b>03</b>Leitura das faixas de desempenho e cuidados na interpretação.</li>
            <li><b>04</b>Fonte e edição do manual citadas em cada material.</li>
          </ul>
        </div>
        <div className="work-card" role="img" aria-label="Amostra de guia rápido com régua de percentis">
          <div className="label-row"><b>Guia rápido</b><span>Adulto e idoso · 6 p.</span></div>
          <h3>Span <em>de dígitos</em></h3>
          <p>Aplicação, critérios de interrupção e leitura dos escores por faixa etária.</p>
          <div className="scale">
            <div className="bar">
              <i className="e"></i><i className="m"></i><i className="h"></i><i className="c"></i><i className="m"></i><i className="m"></i><i className="e"></i>
            </div>
          </div>
          <div className="scale-rows">
            <span>Baixo</span><span className="v">Pc 3–8</span>
            <span className="hl">Médio inferior</span><span className="v hl">Pc 9–24</span>
            <span>Médio</span><span className="v">Pc 25–74</span>
          </div>
          <div className="note">Material de apoio para profissionais habilitados. Não substitui o manual oficial do instrumento.</div>
        </div>
        <div className="work-card alt" role="img" aria-label="Amostra de modelo de laudo com seções">
          <div className="label-row"><b>Modelo de laudo</b><span>DOCX · PDF</span></div>
          <h3>Laudo <em>infantil</em></h3>
          <div className="laudo-lines">
            <div><span>I.</span><div>Identificação<i style={{ width: '70%' }}></i></div></div>
            <div><span>II.</span><div>Demanda e anamnese<i style={{ width: '88%' }}></i></div></div>
            <div><span>III.</span><div>Procedimentos<i style={{ width: '60%' }}></i></div></div>
            <div><span>IV.</span><div>Resultados<i style={{ width: '92%' }}></i></div></div>
            <div><span>V.</span><div>Conclusão<i style={{ width: '76%' }}></i></div></div>
          </div>
          <div className="meta-row"><span>Seções editáveis</span><span>Ex. de redação</span></div>
        </div>
      </div>
    </section>
  );
}
