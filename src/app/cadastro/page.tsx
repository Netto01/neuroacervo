'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signUp } from '@/lib/supabase';
import './cadastro.css';

type PerfilType = 'psicologo' | 'estudante' | 'outro' | '';

export default function CadastroPage() {
  // Step state: 1 = Seus dados, 2 = Acesso, 3 = Sucesso
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 Form fields
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState<PerfilType>('');
  const [crp, setCrp] = useState('');
  const [area, setArea] = useState('');
  const [instituicao, setInstituicao] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [profissao, setProfissao] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Step 2 Form fields
  const [senha, setSenha] = useState('');
  const [confSenha, setConfSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [termos, setTermos] = useState(false);
  const [novidades, setNovidades] = useState(true);

  // Validation & Error states
  const [nomeErr, setNomeErr] = useState(false);
  const [emailErr, setEmailErr] = useState(false);
  const [perfilErr, setPerfilErr] = useState(false);
  const [crpErr, setCrpErr] = useState(false);
  const [instErr, setInstErr] = useState(false);
  const [senhaErr, setSenhaErr] = useState(false);
  const [confErr, setConfErr] = useState(false);
  const [termosErr, setTermosErr] = useState(false);
  const [cadError, setCadError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Masks
  const handleCrpChange = (val: string) => {
    const d = val.replace(/\D/g, '').slice(0, 7);
    const masked = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
    setCrp(masked);
    setCrpErr(false);
  };

  const handleTelChange = (val: string) => {
    const d = val.replace(/\D/g, '').slice(0, 11);
    let masked = d;
    if (d.length > 6) {
      masked = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    } else if (d.length > 2) {
      masked = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    }
    setWhatsapp(masked);
  };

  // Password rules validation
  const rules = {
    len: senha.length >= 8,
    up: /[A-Z]/.test(senha),
    num: /\d/.test(senha),
    sym: /[^A-Za-z0-9]/.test(senha)
  };

  const score = Object.values(rules).filter(Boolean).length;
  const meterScore = senha ? Math.max(1, score) : 0;

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  // Step 1 -> Step 2 validation
  const handleGoStep2 = () => {
    const isNomeOk = nome.trim().split(/\s+/).length >= 2;
    const isEmailOk = isValidEmail(email);
    const isPerfilOk = Boolean(perfil);
    let isCrpOk = true;
    let isInstOk = true;

    setNomeErr(!isNomeOk);
    setEmailErr(!isEmailOk);
    setPerfilErr(!isPerfilOk);

    if (perfil === 'psicologo') {
      isCrpOk = /^\d{2}\/\d{4,5}$/.test(crp);
      setCrpErr(!isCrpOk);
    } else if (perfil === 'estudante') {
      isInstOk = instituicao.trim().length > 0;
      setInstErr(!isInstOk);
    }

    if (!isNomeOk || !isEmailOk || !isPerfilOk || !isCrpOk || !isInstOk) {
      return;
    }

    setStep(2);
  };

  // Submit Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      handleGoStep2();
      return;
    }

    const isSenhaOk = rules.len && rules.up && rules.num;
    const isConfOk = Boolean(confSenha) && confSenha === senha;
    const isTermosOk = termos;

    setSenhaErr(!isSenhaOk);
    setConfErr(!isConfOk);
    setTermosErr(!isTermosOk);
    setCadError(false);

    if (!isSenhaOk || !isConfOk || !isTermosOk) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email.trim(), senha, {
        full_name: nome.trim(),
        role: perfil,
        crp: perfil === 'psicologo' ? crp : undefined,
        clinical_area: perfil === 'psicologo' ? area : undefined,
        institution: perfil === 'estudante' ? instituicao : undefined,
        period: perfil === 'estudante' ? periodo : undefined,
        profession: perfil === 'outro' ? profissao : undefined,
        whatsapp: whatsapp || undefined,
        newsletter: novidades
      });

      if (error) {
        setCadError(true);
        setLoading(false);
        return;
      }

      setLoading(false);
      setStep(3);
    } catch {
      setCadError(true);
      setLoading(false);
    }
  };

  return (
    <div className="cad-body">
      <div className="cad-page">

        {/* ── Painel Editorial Escuro ── */}
        <aside className="cad-panel" aria-label="NeuroAcervo">
          <img
            className="cad-mark-big"
            src="/brand/isologo-branco.svg"
            alt=""
            aria-hidden="true"
          />
          <div className="cad-panel-top">
            <Link className="cad-brand" href="/">
              <img src="/brand/isologo-branco.svg" width="26" height="34" alt="NeuroAcervo" />
              <span>NeuroAcervo</span>
            </Link>
            <span className="cad-panel-meta">
              <span className="roman">II.</span>Nova conta
            </span>
          </div>

          <h1>Comece o seu <em>acervo</em> hoje<span className="dot">.</span></h1>
          <p className="cad-panel-lead">Crie sua conta em dois passos e tenha à mão o material de cada etapa da avaliação.</p>

          <ul className="cad-perks">
            <li><b>01</b>Guias rápidos de aplicação e interpretação de testes</li>
            <li><b>02</b>Modelos de laudo editáveis e roteiros de anamnese</li>
            <li><b>03</b>Compêndios de estudo, instrumentos e aulas em módulos</li>
            <li><b>04</b>Acesso no computador e no celular, com o progresso salvo</li>
          </ul>

          <div className="cad-plate" aria-hidden="true">
            <svg viewBox="0 0 520 150">
              <path className="area" d="M60,126 C150,126 190,18 260,18 C330,18 370,126 460,126 Z" />
              <path className="curve" d="M10,126 C150,126 190,18 260,18 C330,18 370,126 510,126" />
              <line className="base" x1="10" y1="126" x2="510" y2="126" />
              <line className="sd" x1="160" y1="30" x2="160" y2="126" />
              <line className="sd" x1="210" y1="30" x2="210" y2="126" />
              <line className="sd" x1="260" y1="8" x2="260" y2="126" />
              <line className="sd" x1="310" y1="30" x2="310" y2="126" />
              <line className="sd" x1="360" y1="30" x2="360" y2="126" />
              <text x="150" y="144">70</text>
              <text x="200" y="144">85</text>
              <text x="248" y="144">100</text>
              <text x="298" y="144">115</text>
              <text x="348" y="144">130</text>
            </svg>
            <div className="cad-plate-foot">
              <span>Prancha 02 · Distribuição normal</span>
              <span>M 100 · DP 15</span>
            </div>
          </div>
        </aside>

        {/* ── Formulário Lateral ── */}
        <main className="cad-side">
          <div className="cad-side-top">
            <span>NA / 2026 · Cadastro</span>
            <Link className="cad-back" href="/entrar">Já tenho conta · Entrar</Link>
          </div>

          <div className="cad-form-wrap">
            {step !== 3 ? (
              <section className="cad-card" aria-labelledby="t-cad">
                <span className="cad-label">Nova conta</span>
                <h2 id="t-cad">Criar <em>conta</em><span className="dot">.</span></h2>
                <p className="sub">
                  {step === 1
                    ? 'Conte quem você é. O acervo é destinado a profissionais e estudantes de psicologia.'
                    : 'Agora crie a senha que você vai usar para entrar.'}
                </p>

                <ol className="cad-steps" aria-label="Etapas do cadastro">
                  <li className={step === 1 ? 'on' : 'done'} aria-current={step === 1 ? 'step' : undefined}>
                    <span className="n">01</span>Seus dados
                  </li>
                  <li className={step === 2 ? 'on' : ''} aria-current={step === 2 ? 'step' : undefined}>
                    <span className="n">02</span>Acesso
                  </li>
                  <li className="">
                    <span className="n">03</span>Pronto
                  </li>
                </ol>

                <form onSubmit={handleSubmit} noValidate>

                  {/* ── Passo 1 ── */}
                  {step === 1 && (
                    <div style={{ display: 'grid', gap: '18px' }}>
                      <div className={`cad-field ${nomeErr ? 'invalid' : ''}`} id="f-nome">
                        <label htmlFor="nome">Nome completo</label>
                        <div className="cad-input">
                          <input
                            id="nome"
                            name="nome"
                            autoComplete="name"
                            placeholder="Como aparece no seu registro profissional"
                            value={nome}
                            onChange={(e) => {
                              setNome(e.target.value);
                              setNomeErr(false);
                            }}
                            required
                          />
                        </div>
                        {nomeErr && (
                          <span className="cad-err" id="nome-err">
                            <svg viewBox="0 0 24 24"><path d="M12 8v5M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>
                            <span>Informe seu nome completo (pelo menos dois nomes).</span>
                          </span>
                        )}
                      </div>

                      <div className={`cad-field ${emailErr ? 'invalid' : ''}`} id="f-email">
                        <label htmlFor="email">E-mail</label>
                        <div className="cad-input">
                          <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            inputMode="email"
                            placeholder="voce@clinica.com.br"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setEmailErr(false);
                            }}
                            required
                          />
                        </div>
                        <span className="cad-hint">Use o mesmo e-mail da compra, se você já comprou.</span>
                        {emailErr && (
                          <span className="cad-err" id="email-err">
                            <svg viewBox="0 0 24 24"><path d="M12 8v5M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>
                            <span>Informe um e-mail válido.</span>
                          </span>
                        )}
                      </div>

                      <fieldset className={`cad-fieldset ${perfilErr ? 'fieldset-invalid' : ''}`} id="f-perfil">
                        <legend className="cad-legend">Você é</legend>
                        <div className="cad-roles">
                          <label className="cad-role">
                            <input
                              type="radio"
                              name="perfil"
                              value="psicologo"
                              checked={perfil === 'psicologo'}
                              onChange={() => {
                                setPerfil('psicologo');
                                setPerfilErr(false);
                              }}
                            />
                            <span><i>i.</i>Psicólogo(a)<small>Com registro no CRP</small></span>
                          </label>
                          <label className="cad-role">
                            <input
                              type="radio"
                              name="perfil"
                              value="estudante"
                              checked={perfil === 'estudante'}
                              onChange={() => {
                                setPerfil('estudante');
                                setPerfilErr(false);
                              }}
                            />
                            <span><i>ii.</i>Estudante<small>Graduação em psicologia</small></span>
                          </label>
                          <label className="cad-role">
                            <input
                              type="radio"
                              name="perfil"
                              value="outro"
                              checked={perfil === 'outro'}
                              onChange={() => {
                                setPerfil('outro');
                                setPerfilErr(false);
                              }}
                            />
                            <span><i>iii.</i>Outro<small>Profissional da saúde/educação</small></span>
                          </label>
                        </div>
                        {perfilErr && (
                          <span className="cad-err" style={{ marginTop: '8px' }}>
                            <svg viewBox="0 0 24 24"><path d="M12 8v5M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>
                            <span>Escolha uma opção de perfil.</span>
                          </span>
                        )}
                      </fieldset>

                      {/* Campos extras: Psicólogo */}
                      {perfil === 'psicologo' && (
                        <div className="cad-grid2">
                          <div className={`cad-field ${crpErr ? 'invalid' : ''}`} id="f-crp">
                            <label htmlFor="crp">CRP</label>
                            <div className="cad-input">
                              <input
                                id="crp"
                                name="crp"
                                placeholder="00/00000"
                                inputMode="numeric"
                                value={crp}
                                onChange={(e) => handleCrpChange(e.target.value)}
                              />
                            </div>
                            {crpErr && (
                              <span className="cad-err">
                                <svg viewBox="0 0 24 24"><path d="M12 8v5M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>
                                <span>Formato obrigatório: 00/00000.</span>
                              </span>
                            )}
                          </div>
                          <div className="cad-field">
                            <label htmlFor="area">Área de atuação <span className="cad-opt">opcional</span></label>
                            <div className="cad-input">
                              <input
                                id="area"
                                name="area"
                                placeholder="Ex.: clínica infantil"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Campos extras: Estudante */}
                      {perfil === 'estudante' && (
                        <div className="cad-grid2">
                          <div className={`cad-field ${instErr ? 'invalid' : ''}`} id="f-inst">
                            <label htmlFor="inst">Instituição</label>
                            <div className="cad-input">
                              <input
                                id="inst"
                                name="instituicao"
                                placeholder="Sua faculdade"
                                value={instituicao}
                                onChange={(e) => {
                                  setInstituicao(e.target.value);
                                  setInstErr(false);
                                }}
                              />
                            </div>
                            {instErr && (
                              <span className="cad-err">
                                <svg viewBox="0 0 24 24"><path d="M12 8v5M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>
                                <span>Informe sua faculdade/universidade.</span>
                              </span>
                            )}
                          </div>
                          <div className="cad-field">
                            <label htmlFor="sem">Período <span className="cad-opt">opcional</span></label>
                            <div className="cad-input">
                              <input
                                id="sem"
                                name="periodo"
                                placeholder="Ex.: 7º período"
                                value={periodo}
                                onChange={(e) => setPeriodo(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Campos extras: Outro */}
                      {perfil === 'outro' && (
                        <div className="cad-field">
                          <label htmlFor="prof">Profissão <span className="cad-opt">opcional</span></label>
                          <div className="cad-input">
                            <input
                              id="prof"
                              name="profissao"
                              placeholder="Ex.: psicopedagoga, neurologista"
                              value={profissao}
                              onChange={(e) => setProfissao(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      <div className="cad-field">
                        <label htmlFor="tel">WhatsApp <span className="cad-opt">opcional</span></label>
                        <div className="cad-input">
                          <input
                            id="tel"
                            name="whatsapp"
                            type="tel"
                            autoComplete="tel"
                            inputMode="tel"
                            placeholder="(00) 00000-0000"
                            value={whatsapp}
                            onChange={(e) => handleTelChange(e.target.value)}
                          />
                        </div>
                        <span className="cad-hint">Só para avisos de suporte e de novos materiais.</span>
                      </div>

                      <button className="cad-btn" type="button" onClick={handleGoStep2}>
                        <span>Continuar</span>
                        <span className="arrow">
                          <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                        </span>
                      </button>
                    </div>
                  )}

                  {/* ── Passo 2 ── */}
                  {step === 2 && (
                    <div style={{ display: 'grid', gap: '18px' }}>
                      {cadError && (
                        <div className="cad-alert error" role="alert">
                          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg>
                          <span><b>Não foi possível criar a conta.</b> Verifique se o e-mail já está cadastrado ou tente de novo.</span>
                        </div>
                      )}

                      <div className={`cad-field ${senhaErr ? 'invalid' : ''}`} id="f-senha">
                        <label htmlFor="senha">Crie uma senha</label>
                        <div className="cad-input has-toggle">
                          <input
                            id="senha"
                            name="senha"
                            type={showSenha ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Mínimo de 8 caracteres"
                            value={senha}
                            onChange={(e) => {
                              setSenha(e.target.value);
                              setSenhaErr(false);
                            }}
                          />
                          <button
                            type="button"
                            className="cad-toggle"
                            onClick={() => setShowSenha((prev) => !prev)}
                          >
                            {showSenha ? 'Ocultar' : 'Mostrar'}
                          </button>
                        </div>
                        <div className="cad-meter" data-s={meterScore} aria-hidden="true">
                          <i></i><i></i><i></i><i></i>
                        </div>
                        <ul className="cad-rules">
                          <li className={rules.len ? 'ok' : ''}>8 caracteres</li>
                          <li className={rules.up ? 'ok' : ''}>Uma maiúscula</li>
                          <li className={rules.num ? 'ok' : ''}>Um número</li>
                          <li className={rules.sym ? 'ok' : ''}>Um símbolo</li>
                        </ul>
                        {senhaErr && (
                          <span className="cad-err">
                            <svg viewBox="0 0 24 24"><path d="M12 8v5M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>
                            <span>Use pelo menos 8 caracteres, com letra maiúscula e número.</span>
                          </span>
                        )}
                      </div>

                      <div className={`cad-field ${confErr ? 'invalid' : ''}`} id="f-conf">
                        <label htmlFor="conf">Confirme a senha</label>
                        <div className="cad-input has-toggle">
                          <input
                            id="conf"
                            name="confirmacao"
                            type={showConf ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Repita a senha"
                            value={confSenha}
                            onChange={(e) => {
                              setConfSenha(e.target.value);
                              setConfErr(false);
                            }}
                          />
                          <button
                            type="button"
                            className="cad-toggle"
                            onClick={() => setShowConf((prev) => !prev)}
                          >
                            {showConf ? 'Ocultar' : 'Mostrar'}
                          </button>
                        </div>
                        {confErr && (
                          <span className="cad-err">
                            <svg viewBox="0 0 24 24"><path d="M12 8v5M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>
                            <span>As senhas digitadas não coincidem.</span>
                          </span>
                        )}
                      </div>

                      <label className={`cad-check top ${termosErr ? 'invalid' : ''}`}>
                        <input
                          type="checkbox"
                          checked={termos}
                          onChange={(e) => {
                            setTermos(e.target.checked);
                            setTermosErr(false);
                          }}
                        />
                        <span>
                          Li e aceito os <Link className="cad-link" href="#">Termos de uso</Link> e a{' '}
                          <Link className="cad-link" href="#">Política de privacidade</Link>, e entendo que os materiais são de apoio e não substituem os manuais oficiais dos instrumentos.
                        </span>
                      </label>
                      {termosErr && (
                        <span className="cad-err" style={{ marginTop: '-8px' }}>
                          <svg viewBox="0 0 24 24"><path d="M12 8v5M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>
                          <span>É preciso aceitar os termos para continuar.</span>
                        </span>
                      )}

                      <label className="cad-check top">
                        <input
                          type="checkbox"
                          checked={novidades}
                          onChange={(e) => setNovidades(e.target.checked)}
                        />
                        <span>Quero receber por e-mail os avisos de novos materiais e atualizações.</span>
                      </label>

                      <div className="cad-actions">
                        <button
                          className="cad-btn-ghost"
                          type="button"
                          onClick={() => setStep(1)}
                        >
                          ← Voltar
                        </button>
                        <button
                          className="cad-btn"
                          type="submit"
                          disabled={loading}
                          aria-busy={loading}
                        >
                          <span>{loading ? 'Criando conta...' : 'Criar conta'}</span>
                          <span className="arrow">
                            <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="cad-divider">ou</div>
                  <p className="cad-alt">
                    Já tem conta? <Link className="cad-link" href="/entrar">Entrar</Link>
                  </p>
                </form>
              </section>
            ) : (
              /* ── Passo 3: Sucesso ── */
              <section className="cad-card" aria-labelledby="t-done">
                <div className="cad-done-mark" aria-hidden="true">
                  <span>
                    <svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg>
                  </span>
                </div>
                <span className="cad-label">Conta criada</span>
                <h2 id="t-done">Bem-vindo(a) ao <em>acervo</em><span className="dot">.</span></h2>
                <p className="sub">
                  Enviamos uma confirmação para <b>{email}</b>.
                </p>
                <ol className="cad-next">
                  <li>
                    <b>01</b>Confirme seu e-mail pelo link que enviamos (confira também o spam).
                  </li>
                  <li>
                    <b>02</b>Entre com seu e-mail e a senha que você criou.
                  </li>
                  <li>
                    <b>03</b>Comece pela Biblioteca: use a busca ou os filtros por tipo de material.
                  </li>
                </ol>
                <Link className="cad-btn" href="/entrar">
                  <span>Ir para o login</span>
                  <span className="arrow">
                    <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                  </span>
                </Link>
              </section>
            )}
          </div>

          <div className="cad-side-foot">
            <span>© 2026 NeuroAcervo · Uso profissional</span>
            <nav aria-label="Ajuda">
              <Link href="#">Suporte</Link>
              <Link href="#">Termos</Link>
              <Link href="#">Privacidade</Link>
            </nav>
          </div>
        </main>
      </div>
    </div>
  );
}
