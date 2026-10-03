'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, resetPasswordForEmail, isSupabaseConfigured } from '@/lib/supabase';
import './login.css';

export default function LoginPage() {
  const router = useRouter();

  // View state: 'login' | 'reset'
  const [view, setView] = useState<'login' | 'reset'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [lembrar, setLembrar] = useState(true);

  // Reset form states
  const [emailReset, setEmailReset] = useState('');
  const [resetOk, setResetOk] = useState(false);

  // Errors & UI flags
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [senhaInvalid, setSenhaInvalid] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [resetEmailInvalid, setResetEmailInvalid] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eOk = isValidEmail(email);
    const sOk = senha.trim().length > 0;

    setEmailInvalid(!eOk);
    setSenhaInvalid(!sOk);
    setLoginError(false);

    if (!eOk || !sOk) {
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await signIn(email.trim(), senha);
        if (error) {
          setLoginError(true);
          setLoading(false);
          return;
        }
      } else {
        // Fallback demo: se digitar 'erro@...' aciona o alerta de erro
        await new Promise(r => setTimeout(r, 450));
        if (email.toLowerCase().includes('erro')) {
          setLoginError(true);
          setLoading(false);
          return;
        }
      }

      // Redireciona para a plataforma logada
      router.push('/plataforma');
    } catch {
      setLoginError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = isValidEmail(emailReset);
    setResetEmailInvalid(!ok);
    if (!ok) return;

    if (isSupabaseConfigured) {
      await resetPasswordForEmail(emailReset.trim());
    }
    setResetOk(true);
  };

  return (
    <div className="page">

      {/* ── painel escuro ── */}
      <aside className="panel" aria-label="NeuroAcervo">
        <img className="mark-big" src="/brand/isologo-branco.svg" alt="" aria-hidden="true" />
        <div className="panel-top">
          <Link className="brand" href="/">
            <img src="/brand/isologo-branco.svg" width="26" height="34" alt="NeuroAcervo" />
            <span>NeuroAcervo</span>
          </Link>
          <span className="panel-meta"><span className="roman">I.</span>Área do assinante</span>
        </div>

        <h1>Seu acervo <em>está</em> onde você <em>parou</em><span className="dot">.</span></h1>
        <p className="panel-lead">Guias rápidos, modelos de laudo, roteiros de anamnese, compêndios e aulas, prontos para a próxima avaliação.</p>

        <div className="plate" aria-hidden="true">
          <svg viewBox="0 0 520 150">
            <path className="area" d="M60,126 C150,126 190,18 260,18 C330,18 370,126 460,126 Z"/>
            <path className="curve" d="M10,126 C150,126 190,18 260,18 C330,18 370,126 510,126"/>
            <line className="base" x1="10" y1="126" x2="510" y2="126"/>
            <line className="sd" x1="160" y1="30" x2="160" y2="126"/>
            <line className="sd" x1="210" y1="30" x2="210" y2="126"/>
            <line className="sd" x1="260" y1="8" x2="260" y2="126"/>
            <line className="sd" x1="310" y1="30" x2="310" y2="126"/>
            <line className="sd" x1="360" y1="30" x2="360" y2="126"/>
            <text x="150" y="144">70</text>
            <text x="200" y="144">85</text>
            <text x="248" y="144">100</text>
            <text x="298" y="144">115</text>
            <text x="348" y="144">130</text>
          </svg>
          <div className="plate-foot"><span>Prancha 01 · Distribuição normal</span><span>M 100 · DP 15</span></div>
        </div>
      </aside>

      {/* ── formulário ── */}
      <main className="side">
        <div className="side-top">
          <span>NA / 2026 · Acesso restrito</span>
          <Link className="back" href="/">← Página inicial</Link>
        </div>

        <div className="form-wrap">

          {/* entrar */}
          <section className="card" id="view-login" aria-labelledby="t-login" hidden={view !== 'login'}>
            <span className="label">Área do assinante</span>
            <h2 id="t-login"><em>Entrar</em><span className="dot">.</span></h2>
            <p className="sub">Use o e-mail cadastrado na compra.</p>

            <form id="form-login" noValidate onSubmit={handleLoginSubmit}>
              <div className="alert error" id="login-error" role="alert" hidden={!loginError}>
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg>
                <span><b>E-mail ou senha incorretos.</b> Confira e tente de novo, ou redefina sua senha.</span>
              </div>

              <div className={`field ${emailInvalid ? 'invalid' : ''}`} id="f-email">
                <label htmlFor="email">E-mail</label>
                <div className="input">
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
                      setEmailInvalid(false);
                      setLoginError(false);
                    }}
                    required 
                    aria-describedby="email-err"
                    aria-invalid={emailInvalid}
                  />
                </div>
                <span className="err" id="email-err" hidden={!emailInvalid}>
                  <svg viewBox="0 0 24 24"><path d="M12 8v5M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>
                  <span>Informe um e-mail válido.</span>
                </span>
              </div>

              <div className={`field ${senhaInvalid ? 'invalid' : ''}`} id="f-senha">
                <div className="field-row">
                  <label htmlFor="senha">Senha</label>
                  <button 
                    type="button" 
                    className="link" 
                    onClick={() => {
                      setEmailReset(email);
                      setView('reset');
                    }}
                  >
                    Esqueci a senha
                  </button>
                </div>
                <div className="input has-toggle">
                  <input 
                    id="senha" 
                    name="senha" 
                    type={showPassword ? 'text' : 'password'} 
                    autoComplete="current-password" 
                    placeholder="Sua senha" 
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      setSenhaInvalid(false);
                      setLoginError(false);
                    }}
                    required 
                    aria-describedby="senha-err"
                    aria-invalid={senhaInvalid}
                  />
                  <button 
                    type="button" 
                    className="toggle" 
                    id="toggle-senha" 
                    aria-controls="senha" 
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <span className="err" id="senha-err" hidden={!senhaInvalid}>
                  <svg viewBox="0 0 24 24"><path d="M12 8v5M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>
                  <span>Digite sua senha.</span>
                </span>
              </div>

              <label className="check">
                <input 
                  type="checkbox" 
                  name="lembrar" 
                  checked={lembrar} 
                  onChange={(e) => setLembrar(e.target.checked)} 
                /> 
                Manter conectado neste dispositivo
              </label>

              <button 
                className="btn" 
                type="submit" 
                id="btn-login"
                aria-busy={loading}
                disabled={loading}
              >
                <span>{loading ? 'Entrando...' : 'Entrar'}</span>
                <span className="arrow">
                  <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
              </button>

              <div className="divider">ou</div>
              <p className="alt">Ainda não tem acesso? <Link className="link" href="/cadastro">Criar nova conta</Link></p>
            </form>
          </section>

          {/* redefinir */}
          <section className="card" id="view-reset" aria-labelledby="t-reset" hidden={view !== 'reset'}>
            <span className="label">Redefinir senha</span>
            <h2 id="t-reset">Esqueceu a <em>senha</em><span className="dot">?</span></h2>
            <p className="sub">Informe o e-mail cadastrado. Enviaremos um link para você criar uma nova senha.</p>

            <form id="form-reset" noValidate onSubmit={handleResetSubmit}>
              <div className="alert ok" id="reset-ok" role="status" hidden={!resetOk}>
                <svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg>
                <span><b>Link enviado.</b> Se o e-mail estiver cadastrado, você recebe as instruções em alguns minutos. Confira também o spam.</span>
              </div>

              <div className={`field ${resetEmailInvalid ? 'invalid' : ''}`} id="f-reset">
                <label htmlFor="email-reset">E-mail</label>
                <div className="input">
                  <input 
                    id="email-reset" 
                    type="email" 
                    autoComplete="email" 
                    inputMode="email" 
                    placeholder="voce@clinica.com.br" 
                    value={emailReset}
                    onChange={(e) => {
                      setEmailReset(e.target.value);
                      setResetEmailInvalid(false);
                    }}
                    required 
                    aria-describedby="reset-err"
                    aria-invalid={resetEmailInvalid}
                  />
                </div>
                <span className="err" id="reset-err" hidden={!resetEmailInvalid}>
                  <svg viewBox="0 0 24 24"><path d="M12 8v5M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>
                  <span>Informe um e-mail válido.</span>
                </span>
              </div>

              <button className="btn" type="submit">
                <span>Enviar link</span>
                <span className="arrow">
                  <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
              </button>

              <p className="alt">
                <button 
                  type="button" 
                  className="link" 
                  onClick={() => setView('login')}
                >
                  ← Voltar para o login
                </button>
              </p>
            </form>
          </section>

        </div>

        <div className="side-foot">
          <span>© 2026 NeuroAcervo · Uso profissional</span>
          <nav aria-label="Ajuda">
            <a href="#">Suporte</a>
            <a href="#">Termos</a>
            <a href="#">Privacidade</a>
          </nav>
        </div>
      </main>

    </div>
  );
}
