'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  signIn,
  resetPasswordForEmail,
  updateUserPassword,
  getUserProfile,
  isSupabaseConfigured,
  supabase
} from '@/lib/supabase';
import './login.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isConfirmed = searchParams.get('confirmed') === 'true';

  // View state: 'login' | 'reset' | 'new-password'
  const [view, setView] = useState<'login' | 'reset' | 'new-password'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [lembrar, setLembrar] = useState(true);

  // Reset form states
  const [emailReset, setEmailReset] = useState('');
  const [resetOk, setResetOk] = useState(false);

  // New password states
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmaSenha, setShowConfirmaSenha] = useState(false);
  const [newPasswordLoading, setNewPasswordLoading] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState('');
  const [newPasswordSuccess, setNewPasswordSuccess] = useState(false);

  // Errors & UI flags
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [senhaInvalid, setSenhaInvalid] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [resetEmailInvalid, setResetEmailInvalid] = useState(false);
  const [loading, setLoading] = useState(false);

  // Detect recovery flow from URL or Supabase Auth Event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isResetParam = searchParams.get('reset') === 'true';
    const isRecoveryType = searchParams.get('type') === 'recovery';
    const hashHasRecovery = window.location.hash.includes('type=recovery');

    if (isResetParam || isRecoveryType || hashHasRecovery) {
      setView('new-password');
    }

    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setView('new-password');
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, [searchParams]);

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
        const { data, error } = await signIn(email.trim(), senha);
        if (error) {
          setLoginError(true);
          setLoading(false);
          return;
        }

        // Verifica o perfil e status da assinatura do usuário
        if (data?.user?.id) {
          const profile = await getUserProfile(data.user.id);
          const isAdmin = profile?.role === 'admin';
          const isActive = profile?.subscriptionStatus === 'active';

          if (isAdmin || isActive) {
            router.push('/plataforma');
          } else {
            router.push('/planos');
          }
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

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewPasswordError('');

    if (novaSenha.length < 6) {
      setNewPasswordError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmaSenha) {
      setNewPasswordError('As senhas não coincidem. Confira a digitação.');
      return;
    }

    setNewPasswordLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await updateUserPassword(novaSenha);
        if (error) {
          setNewPasswordError(error.message || 'Erro ao redefinir a senha. Tente novamente.');
          setNewPasswordLoading(false);
          return;
        }
      } else {
        await new Promise((r) => setTimeout(r, 600));
      }

      setNewPasswordSuccess(true);
      setTimeout(() => {
        router.push('/plataforma');
      }, 1600);
    } catch {
      setNewPasswordError('Ocorreu um erro ao atualizar a senha. Tente novamente.');
    } finally {
      setNewPasswordLoading(false);
    }
  };

  return (
    <div className="login-root">
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
                {isConfirmed && (
                  <div className="alert ok" role="status" style={{ marginBottom: '16px' }}>
                    <svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg>
                    <span><b>E-mail confirmado com sucesso!</b> Sua conta está ativa. Faça login para acessar o acervo.</span>
                  </div>
                )}

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

            {/* nova senha (após clicar no link de recuperação) */}
            <section className="card" id="view-new-password" aria-labelledby="t-new-pwd" hidden={view !== 'new-password'}>
              <span className="label">Recuperação de conta</span>
              <h2 id="t-new-pwd">Criar nova <em>senha</em><span className="dot">.</span></h2>
              <p className="sub">Digite sua nova senha para restabelecer o acesso à sua conta.</p>

              <form id="form-new-password" noValidate onSubmit={handleNewPasswordSubmit}>
                {newPasswordSuccess && (
                  <div className="alert ok" role="status">
                    <svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg>
                    <span><b>Senha atualizada com sucesso!</b> Redirecionando para a plataforma...</span>
                  </div>
                )}

                {Boolean(newPasswordError) && (
                  <div className="alert error" role="alert">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg>
                    <span>{newPasswordError}</span>
                  </div>
                )}

                <div className="field">
                  <label htmlFor="nova-senha">Nova Senha</label>
                  <div className="input has-toggle">
                    <input 
                      id="nova-senha" 
                      type={showNovaSenha ? 'text' : 'password'} 
                      autoComplete="new-password" 
                      placeholder="Mínimo de 6 caracteres" 
                      value={novaSenha}
                      onChange={(e) => {
                        setNovaSenha(e.target.value);
                        setNewPasswordError('');
                      }}
                      required 
                    />
                    <button 
                      type="button" 
                      className="toggle" 
                      aria-pressed={showNovaSenha}
                      onClick={() => setShowNovaSenha(prev => !prev)}
                    >
                      {showNovaSenha ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="confirma-senha">Confirmar Nova Senha</label>
                  <div className="input has-toggle">
                    <input 
                      id="confirma-senha" 
                      type={showConfirmaSenha ? 'text' : 'password'} 
                      autoComplete="new-password" 
                      placeholder="Repita a nova senha" 
                      value={confirmaSenha}
                      onChange={(e) => {
                        setConfirmaSenha(e.target.value);
                        setNewPasswordError('');
                      }}
                      required 
                    />
                    <button 
                      type="button" 
                      className="toggle" 
                      aria-pressed={showConfirmaSenha}
                      onClick={() => setShowConfirmaSenha(prev => !prev)}
                    >
                      {showConfirmaSenha ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                </div>

                <button 
                  className="btn" 
                  type="submit" 
                  disabled={newPasswordLoading || newPasswordSuccess}
                  aria-busy={newPasswordLoading}
                >
                  <span>{newPasswordLoading ? 'Salvando...' : 'Salvar nova senha e entrar'}</span>
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
              <a href="mailto:nao-responda@neuroacervo.com.br">Suporte</a>
              <Link href="/termos">Termos</Link>
              <Link href="/privacidade">Privacidade</Link>
            </nav>
          </div>
        </main>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
