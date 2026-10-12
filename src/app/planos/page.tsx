'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNeuro } from '@/context/NeuroContext';
import { STRIPE_PLANS, PlanDefinition } from '@/config/plans';
import { Check, ShieldCheck, ArrowRight, Loader2, AlertCircle, LogOut } from 'lucide-react';
import './planos.css';

function PlanosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isLoadingUser, logout } = useNeuro();

  const isCancelado = searchParams.get('cancelado') === 'true';
  const paramPlano = (searchParams.get('plano') || '').toLowerCase();
  const paramCiclo = (searchParams.get('ciclo') || '').toLowerCase();

  // Ciclo de cobrança: Mensal ou Anual
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>(
    paramCiclo === 'anual' ? 'anual' : 'mensal'
  );

  // Plano selecionado
  const [selectedPlanKey, setSelectedPlanKey] = useState<'consulta' | 'estudo' | 'pratica'>('pratica');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Determina a pré-seleção inicial baseada no perfil ou parâmetro
  useEffect(() => {
    if (paramPlano) {
      if (paramPlano.includes('consulta')) setSelectedPlanKey('consulta');
      else if (paramPlano.includes('estudo')) setSelectedPlanKey('estudo');
      else setSelectedPlanKey('pratica');
    } else if (currentUser?.plan) {
      const p = currentUser.plan.toLowerCase();
      if (p.includes('consulta')) setSelectedPlanKey('consulta');
      else if (p.includes('estudo')) setSelectedPlanKey('estudo');
      else setSelectedPlanKey('pratica');
    }
  }, [paramPlano, currentUser]);

  // Se o usuário não estiver logado, redireciona para login.
  // Se já tiver assinatura ativa ou for admin, vai direto para a plataforma.
  useEffect(() => {
    if (!isLoadingUser) {
      if (!currentUser) {
        router.push('/entrar');
      } else if (currentUser.role === 'admin' || currentUser.subscriptionStatus === 'active') {
        router.push('/plataforma');
      }
    }
  }, [isLoadingUser, currentUser, router]);

  const handleCheckout = async () => {
    if (!currentUser) {
      router.push('/entrar');
      return;
    }

    setCheckoutLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userEmail: currentUser.email,
          planKey: selectedPlanKey,
          billingCycle
        })
      });

      const data = await res.json();

      if (!res.ok || data?.error) {
        throw new Error(data?.error || 'Não foi possível iniciar o checkout.');
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error('URL de pagamento não retornada pela Stripe.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na comunicação com o Stripe.';
      setErrorMsg(msg);
      setCheckoutLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/entrar');
  };

  if (isLoadingUser) {
    return (
      <div className="planos-root" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent-strong)' }} />
          <p style={{ color: 'var(--ink-mute)', fontSize: '15px' }}>Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  const selectedPlanDef = STRIPE_PLANS[selectedPlanKey];

  return (
    <div className="planos-root">
      {/* ── Topbar / Header ── */}
      <header className="planos-header">
        <div className="planos-header-inner">
          <Link href="/" className="planos-brand">
            <img src="/brand/isologo-preto.svg" width="24" height="32" alt="NeuroAcervo" />
            <span className="planos-brand-name">
              NEURO<span>ACERVO</span>
            </span>
          </Link>

          <div className="planos-user-area">
            {currentUser && (
              <div className="planos-user-badge">
                <span>Logado como:</span>
                <b>{currentUser.email}</b>
              </div>
            )}
            <button onClick={handleLogout} className="planos-btn-sair" title="Desconectar da conta">
              <LogOut size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* ── Conteúdo Central ── */}
      <main className="planos-main">
        {isCancelado && (
          <div className="planos-alert-cancel">
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>
              O pagamento anterior não foi concluído. Escolha um plano abaixo para iniciar sua assinatura e liberar o acesso completo ao acervo clínico.
            </span>
          </div>
        )}

        <div className="planos-hero">
          <span className="planos-pill">Acesso Imediato</span>
          <h1>Escolha seu plano de acesso ao acervo</h1>
          <p>
            Guias práticos de aplicação, modelos de laudo clínico, protocolos de anamnese e aulas fundamentadas para a sua rotina profissional.
          </p>
        </div>

        {/* ── Toggle Mensal / Anual ── */}
        <div className="planos-billing-toggle">
          <button
            type="button"
            className={`planos-toggle-btn ${billingCycle === 'mensal' ? 'active' : ''}`}
            onClick={() => setBillingCycle('mensal')}
          >
            Cobrança Mensal
          </button>
          <button
            type="button"
            className={`planos-toggle-btn ${billingCycle === 'anual' ? 'active' : ''}`}
            onClick={() => setBillingCycle('anual')}
          >
            Cobrança Anual
            <span className="planos-discount-badge">Economize no Prática</span>
          </button>
        </div>

        {/* ── Grid dos 3 Planos ── */}
        <div className="planos-grid">
          {(Object.keys(STRIPE_PLANS) as Array<'consulta' | 'estudo' | 'pratica'>).map((key) => {
            const plan = STRIPE_PLANS[key];
            const isSelected = selectedPlanKey === key;
            const isDestaque = Boolean(plan.destaque);

            // Preço exibido
            let precoDisplay = plan.precoMensal;
            let precoPeriodo = '/mês';
            let precoSub = null;

            if (billingCycle === 'anual' && plan.precoAnual && plan.equivalenteMensalAnual) {
              precoDisplay = plan.equivalenteMensalAnual.replace('/mês', '');
              precoSub = `${plan.precoAnual} cobrado anualmente`;
            } else {
              precoDisplay = precoDisplay.replace('/mês', '');
            }

            return (
              <div
                key={key}
                className={`plano-card ${isDestaque ? 'destaque' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedPlanKey(key)}
              >
                {isDestaque && (
                  <span className="plano-badge-destaque">Recomendado</span>
                )}

                <div className="plano-header">
                  <div className="plano-nome-row">
                    <h3 className="plano-nome">{plan.nome}</h3>
                    <span className="plano-tag">{plan.tag}</span>
                  </div>
                  <p className="plano-desc">{plan.descricaoCurta}</p>
                </div>

                <div className="plano-preco-box">
                  <div className="plano-preco-principal">
                    {precoDisplay}
                    <span className="plano-preco-periodo">{precoPeriodo}</span>
                  </div>
                  {precoSub && <div className="plano-preco-sub">{precoSub}</div>}
                </div>

                <div className="plano-beneficios-title">O que está incluído:</div>
                <ul className="plano-beneficios-list">
                  {plan.beneficios.map((beneficio, i) => (
                    <li key={i} className="plano-beneficio-item">
                      <Check size={16} className="plano-check-icon" />
                      <span>{beneficio}</span>
                    </li>
                  ))}
                </ul>

                <div className="plano-card-select-indicator">
                  {isSelected ? '✓ Plano Selecionado' : 'Clique para selecionar'}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Barra de Checkout Stripe ── */}
        <div className="planos-checkout-bar">
          {errorMsg && (
            <div className="planos-error-msg">
              {errorMsg}
            </div>
          )}

          <button
            type="button"
            className="planos-btn-submit"
            onClick={handleCheckout}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Abrindo Stripe seguro...</span>
              </>
            ) : (
              <>
                <span>
                  Assinar plano <b>{selectedPlanDef.nome}</b> ({billingCycle})
                </span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="planos-security-note">
            <ShieldCheck size={16} style={{ color: 'var(--accent-strong)' }} />
            Pagamento 100% criptografado e seguro via Stripe · Cancele quando quiser sem multas
          </p>
        </div>
      </main>
    </div>
  );
}

export default function PlanosPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#efe7d2' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#2f6b31' }} />
        </div>
      }
    >
      <PlanosContent />
    </Suspense>
  );
}
