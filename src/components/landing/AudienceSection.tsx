import React from 'react';

export function AudienceSection() {
  return (
    <section className="block" id="para-quem" aria-labelledby="h-quem">
      <div className="container">
        <div className="sec-rule">
          <span className="roman">IV.</span>
          <span className="meta-grp">
            <span>Para quem é</span>
            <span className="dot-mark">•</span>
            <span>Três momentos da carreira</span>
          </span>
          <span>004 / 006</span>
        </div>
        <div className="head-split">
          <h2 className="display" id="h-quem">Feito para <em>quem avalia</em><span className="dot">.</span></h2>
          <div className="right">
            <span className="plus" aria-hidden="true">+</span>
            <p>Psicólogos e estudantes de psicologia em formação ou já na clínica.</p>
          </div>
        </div>
        <div className="labs-grid">
          <div className="lab">
            <div className="lab-img">
              <span className="badge">Formação</span>
              <svg className="lab-art" viewBox="0 0 200 140" aria-hidden="true">
                <path className="f" d="M40 110 Q100 20 160 110 Z"/>
                <path className="s" d="M20 110h160M40 110 Q100 20 160 110"/>
                <path className="a" d="M70 110V72"/>
              </svg>
            </div>
            <div className="num-row"><b>i.</b><span>Começando</span></div>
            <h4>Quem está começando</h4>
            <p>Um caminho organizado para aprender a aplicar, interpretar e redigir com segurança.</p>
          </div>
          <div className="lab">
            <div className="lab-img">
              <span className="badge">Clínica</span>
              <svg className="lab-art" viewBox="0 0 200 140" aria-hidden="true">
                <rect className="f" x="56" y="22" width="88" height="104" rx="6"/>
                <path className="s" d="M56 28a6 6 0 0 1 6-6h76a6 6 0 0 1 6 6v92a6 6 0 0 1-6 6H62a6 6 0 0 1-6-6zM72 50h56M72 66h56M72 82h36"/>
                <path className="a" d="m110 104 8 8 16-18"/>
              </svg>
            </div>
            <div className="num-row"><b>ii.</b><span>Atendendo</span></div>
            <h4>Quem já atende</h4>
            <p>Consulta rápida no consultório e modelos que economizam horas na escrita do laudo.</p>
          </div>
          <div className="lab">
            <div className="lab-img">
              <span className="badge">Supervisão</span>
              <svg className="lab-art" viewBox="0 0 200 140" aria-hidden="true">
                <circle className="f" cx="100" cy="70" r="40"/>
                <circle className="s" cx="76" cy="70" r="30"/>
                <circle className="s" cx="124" cy="70" r="30"/>
                <path className="a" d="M100 46v48"/>
              </svg>
            </div>
            <div className="num-row"><b>iii.</b><span>Orientando</span></div>
            <h4>Quem supervisiona</h4>
            <p>Material padronizado para orientar estagiários e equipes.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
