'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');
  const isAnual = billingCycle === 'anual';

  return (
    <section className="block" id="planos" aria-labelledby="h-planos">
      <div className="container">
        <div className="sec-rule">
          <span className="roman">V.</span>
          <span className="meta-grp">
            <span>Planos</span>
            <span className="dot-mark">•</span>
            <span>Assinatura flexível</span>
          </span>
          <span>005 / 006</span>
        </div>

        <div className="plans-head">
          <h2 className="display" id="h-planos">Escolha o <em>seu</em> acervo<span className="dot">.</span></h2>
          <div className="right">
            <p>Três planos, um acervo que cresce todo mês. Comece por onde fizer sentido e mude de plano quando quiser.</p>
            <div className="billing" role="group" aria-label="Forma de cobrança do plano Prática">
              <button
                type="button"
                aria-pressed={!isAnual}
                onClick={() => setBillingCycle('mensal')}
              >
                Mensal
              </button>
              <button
                type="button"
                aria-pressed={isAnual}
                onClick={() => setBillingCycle('anual')}
              >
                Anual <b>−33%</b>
              </button>
            </div>
            <span className="billing-note">O pagamento anual está disponível no plano Prática.</span>
          </div>
        </div>

        <div className="plans">
          {/* Plano 01 */}
          <article className="plan" aria-labelledby="p1">
            <div className="num">01<span className="tag">Leitura</span></div>
            <h3 id="p1">Consulta <span>PDFs</span></h3>
            <p className="for">Para quem quer os materiais de consulta para baixar e usar.</p>
            <div className="price">
              <span className="cur">R$</span>
              <span className="val">19<small>,90</small></span>
              <span className="per">/mês</span>
            </div>
            <div className="price-note">Cobrança mensal</div>
            <ul className="feat">
              <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span>Guias rápidos de aplicação e interpretação</span></li>
              <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span>Modelos de laudo e roteiros de anamnese</span></li>
              <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span>Compêndios de estudo e instrumentos</span></li>
              <li className="off"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg><span>Aulas gravadas</span></li>
              <li className="off"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg><span>Recursos interativos</span></li>
            </ul>
            <Link className="btn btn-ghost" href="/cadastro?plano=consulta&ciclo=mensal">
              <span>Assinar o Consulta</span>
              <span className="arrow"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
            </Link>
          </article>

          {/* Plano 02 */}
          <article className="plan" aria-labelledby="p2">
            <div className="num">02<span className="tag">Estudo</span></div>
            <h3 id="p2">Estudo <span>+ Aulas</span></h3>
            <p className="for">Para quem quer os materiais e as aulas gravadas em módulos.</p>
            <div className="price">
              <span className="cur">R$</span>
              <span className="val">39<small>,90</small></span>
              <span className="per">/mês</span>
            </div>
            <div className="price-note">Cobrança mensal</div>
            <ul className="feat">
              <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span>Todos os PDFs do plano Consulta</span></li>
              <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span><b>Aulas gravadas</b> em módulos, com progresso salvo</span></li>
              <li className="off"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg><span>Baralhos interativos</span></li>
              <li className="off"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg><span>Histórias temáticas</span></li>
              <li className="off"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg><span>Novos recursos interativos todo mês</span></li>
            </ul>
            <Link className="btn btn-ghost" href="/cadastro?plano=estudo&ciclo=mensal">
              <span>Assinar o Estudo</span>
              <span className="arrow"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
            </Link>
          </article>

          {/* Plano 03 (destaque) */}
          <article className="plan featured" aria-labelledby="p3">
            <div className="num">03<span className="tag">Recomendado</span></div>
            <h3 id="p3">Prática <span>tudo + sessão</span></h3>
            <p className="for">Para quem avalia e quer, além do estudo, ferramentas para usar na sessão.</p>
            <div className="price">
              <span className="cur">R$</span>
              <span className="val">
                {isAnual ? '399' : <>49<small>,90</small></>}
              </span>
              <span className="per">{isAnual ? '/ano' : '/mês'}</span>
            </div>
            <div className="price-note">
              {isAnual ? 'Equivale a R$ 33,25 por mês' : 'Só R$ 10 a mais que o plano Estudo'}
            </div>
            <ul className="feat">
              <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span>Todos os PDFs e todas as aulas</span></li>
              <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span><b>Baralhos interativos</b> para usar online</span></li>
              <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span><b>Histórias temáticas</b> e demais recursos online</span></li>
              <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span>Novos recursos interativos todo mês</span></li>
              <li><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg><span>Acesso antecipado a lançamentos</span></li>
            </ul>
            {isAnual && (
              <p className="upsell">
                No anual você paga R$ 399 de uma vez, o equivalente a R$ 33,25 por mês.
              </p>
            )}
            <Link
              className="btn btn-primary"
              href={`/cadastro?plano=pratica&ciclo=${billingCycle}`}
            >
              <span>Assinar o Prática</span>
              <span className="arrow"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
            </Link>
          </article>
        </div>

        <div className="compare-wrap">
          <div className="compare-header-row">
            <span className="compare-caption-text">Compare os recursos de cada plano</span>
          </div>
          <table className="compare">
            <caption className="sr">Compare os planos do NeuroAcervo</caption>
            <thead>
              <tr>
                <th scope="col" className="col-resource">O que está incluído</th>
                <th scope="col" className="col-plan">
                  <div className="th-plan">
                    <span className="th-title">Consulta</span>
                    <small className="th-price">R$ 19,90<span className="th-period">/mês</span></small>
                    <Link href="/cadastro?plano=consulta&ciclo=mensal" className="btn-table-cta">Assinar</Link>
                  </div>
                </th>
                <th scope="col" className="col-plan">
                  <div className="th-plan">
                    <span className="th-title">Estudo</span>
                    <small className="th-price">R$ 39,90<span className="th-period">/mês</span></small>
                    <Link href="/cadastro?plano=estudo&ciclo=mensal" className="btn-table-cta">Assinar</Link>
                  </div>
                </th>
                <th scope="col" className="col-plan col-feat">
                  <div className="th-plan">
                    <span className="th-tag">Recomendado</span>
                    <span className="th-title">Prática</span>
                    {billingCycle === 'anual' ? (
                      <small className="th-price th-price-promo">
                        <span className="th-val">R$ 33,25</span><span className="th-period">/mês</span>
                        <span className="th-subtext">R$ 399/ano</span>
                      </small>
                    ) : (
                      <small className="th-price">R$ 49,90<span className="th-period">/mês</span></small>
                    )}
                    <Link href={`/cadastro?plano=pratica&ciclo=${billingCycle}`} className="btn-table-cta btn-table-feat">Assinar</Link>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Guias rápidos de aplicação e interpretação</th>
                <td className="yes"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                <td className="yes"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                <td className="yes col-feat"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
              </tr>
              <tr>
                <th scope="row">Modelos de laudo e roteiros de anamnese</th>
                <td className="yes"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                <td className="yes"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                <td className="yes col-feat"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
              </tr>
              <tr>
                <th scope="row">Compêndios de estudo e instrumentos</th>
                <td className="yes"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                <td className="yes"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                <td className="yes col-feat"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
              </tr>
              <tr>
                <th scope="row">Aulas gravadas em módulos</th>
                <td className="no"><span className="dash-icon" aria-label="Não incluído">—</span></td>
                <td className="yes"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
                <td className="yes col-feat"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
              </tr>
              <tr>
                <th scope="row">Baralhos interativos online</th>
                <td className="no"><span className="dash-icon" aria-label="Não incluído">—</span></td>
                <td className="no"><span className="dash-icon" aria-label="Não incluído">—</span></td>
                <td className="yes col-feat"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
              </tr>
              <tr>
                <th scope="row">Histórias temáticas de aplicação</th>
                <td className="no"><span className="dash-icon" aria-label="Não incluído">—</span></td>
                <td className="no"><span className="dash-icon" aria-label="Não incluído">—</span></td>
                <td className="yes col-feat"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
              </tr>
              <tr>
                <th scope="row">Novos recursos interativos todo mês</th>
                <td className="no"><span className="dash-icon" aria-label="Não incluído">—</span></td>
                <td className="no"><span className="dash-icon" aria-label="Não incluído">—</span></td>
                <td className="yes col-feat"><svg viewBox="0 0 24 24" aria-label="Incluído"><path d="m5 12 4.5 4.5L19 7"/></svg></td>
              </tr>
              <tr>
                <th scope="row">Opção de desconto no plano anual</th>
                <td className="no"><span className="dash-icon" aria-label="Não disponível">—</span></td>
                <td className="no"><span className="dash-icon" aria-label="Não disponível">—</span></td>
                <td className="col-feat">
                  {billingCycle === 'anual' ? (
                    <span className="anual-highlight">R$ 399/ano <em>(-33%)</em></span>
                  ) : (
                    <span>R$ 399/ano</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="plans-foot">
          <span>
            <svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
            Pagamento seguro no cartão, processado pela Stripe
          </span>
          <span>
            <svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"/></svg>
            Troque de plano ou cancele quando quiser
          </span>
        </div>
      </div>
    </section>
  );
}
