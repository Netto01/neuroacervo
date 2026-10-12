'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useNeuro } from '@/context/NeuroContext';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { resolveUserPlan } from '@/utils/userPlan';
import { STRIPE_PLANS, PlanDefinition } from '@/config/plans';
import { Check, Sparkles, ArrowRight, Lock, ShieldCheck, Loader2 } from 'lucide-react';

type PlanoKey = 'consulta' | 'estudo' | 'pratica';
type CicloKey = 'mensal' | 'anual';

function UpgradeContent() {
  const searchParams = useSearchParams();
  const { currentUser } = useNeuro();
  const planInfo = resolveUserPlan(currentUser);

  const initialPlanParam = (searchParams.get('plano') || '').toLowerCase();
  const initialCicloParam = (searchParams.get('ciclo') || '').toLowerCase();

  const [ciclo, setCiclo] = useState<CicloKey>(initialCicloParam === 'anual' ? 'anual' : 'mensal');
  const [loadingPlan, setLoadingPlan] = useState<PlanoKey | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const nivelAtual = planInfo.nivel;

  const handleUpgrade = async (targetPlanKey: PlanoKey) => {
    if (!currentUser) return;
    setErrorMsg(null);
    setLoadingPlan(targetPlanKey);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userEmail: currentUser.email,
          planKey: targetPlanKey,
          billingCycle: targetPlanKey === 'pratica' ? ciclo : 'mensal'
        })
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg(data?.error || 'Não foi possível gerar a sessão de pagamento. Tente novamente.');
        setLoadingPlan(null);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e?.message || 'Falha de conexão com o Stripe. Tente novamente em alguns instantes.');
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (planKey: PlanoKey) => {
    if (planKey === 'consulta' && nivelAtual === 1) return true;
    if (planKey === 'estudo' && nivelAtual === 2) return true;
    if (planKey === 'pratica' && nivelAtual === 3) return true;
    return false;
  };

  const isUpgradeAvailable = (planKey: PlanoKey) => {
    if (planKey === 'consulta') return false;
    if (planKey === 'estudo') return nivelAtual < 2;
    if (planKey === 'pratica') return nivelAtual < 3;
    return false;
  };

  return (
    <PlatformShell activePage="upgrade">
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 8px 64px' }}>
        {/* Cabeçalho da Página */}
        <header style={{ marginBottom: '36px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            backgroundColor: 'rgba(72, 139, 73, 0.12)',
            color: '#2f6b31',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '14px'
          }}>
            <Sparkles size={14} />
            <span>Assinatura &amp; Upgrade Clínico</span>
          </div>

          <h1 style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 'clamp(28px, 4.5vw, 42px)',
            fontWeight: 600,
            color: '#15140f',
            margin: '0 0 12px',
            letterSpacing: '-0.02em',
            lineHeight: 1.15
          }}>
            Evolua seu acervo e ferramentas clínicas
          </h1>

          <p style={{
            fontSize: '15.5px',
            color: '#5a5448',
            maxWidth: '680px',
            margin: '0 auto 24px',
            lineHeight: 1.6
          }}>
            Você está atualmente no <b>Plano {planInfo.nome}</b>. Faça upgrade a qualquer momento para desbloquear novas ferramentas, videoaulas e materiais especializados.
          </p>

          {/* Toggle Mensal / Anual */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#efe7d2',
            border: '1px solid rgba(21, 20, 15, 0.12)',
            borderRadius: '999px',
            padding: '4px',
            boxShadow: 'inset 0 1px 3px rgba(21, 20, 15, 0.05)'
          }}>
            <button
              type="button"
              onClick={() => setCiclo('mensal')}
              style={{
                border: 'none',
                background: ciclo === 'mensal' ? '#15140f' : 'transparent',
                color: ciclo === 'mensal' ? '#efe7d2' : '#5a5448',
                padding: '8px 18px',
                borderRadius: '999px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Faturamento Mensal
            </button>
            <button
              type="button"
              onClick={() => setCiclo('anual')}
              style={{
                border: 'none',
                background: ciclo === 'anual' ? '#15140f' : 'transparent',
                color: ciclo === 'anual' ? '#efe7d2' : '#5a5448',
                padding: '8px 18px',
                borderRadius: '999px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Faturamento Anual</span>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                backgroundColor: '#dafeaa',
                color: '#2f6b31',
                padding: '2px 7px',
                borderRadius: '999px',
                textTransform: 'uppercase'
              }}>
                Economize 20%
              </span>
            </button>
          </div>
        </header>

        {errorMsg && (
          <div style={{
            backgroundColor: '#ffebeb',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '24px',
            textAlign: 'center',
            fontSize: '14px'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Grade de Cards dos Planos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {/* 1. PLANO CONSULTA */}
          <div style={{
            backgroundColor: isCurrentPlan('consulta') ? '#fdfbf7' : '#f7f1de',
            border: isCurrentPlan('consulta') 
              ? '2px solid rgba(47, 107, 49, 0.4)' 
              : '1px solid rgba(21, 20, 15, 0.12)',
            borderRadius: '20px',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            opacity: nivelAtual > 1 ? 0.75 : 1
          }}>
            {isCurrentPlan('consulta') && (
              <span style={{
                position: 'absolute',
                top: '-12px',
                left: '20px',
                backgroundColor: '#2f6b31',
                color: '#dafeaa',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '3px 10px',
                borderRadius: '999px'
              }}>
                Seu Plano Atual
              </span>
            )}

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#15140f', margin: 0 }}>Consulta</h2>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#7c7768', textTransform: 'uppercase' }}>Leitura</span>
              </div>
              <p style={{ fontSize: '13.5px', color: '#5a5448', lineHeight: 1.5, margin: '0 0 20px' }}>
                Para quem quer os materiais clínicos de consulta para baixar e consultar no dia a dia.
              </p>

              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: '#15140f' }}>R$ 19,90</span>
                <span style={{ fontSize: '14px', color: '#7c7768' }}>/mês</span>
              </div>

              <div style={{ borderTop: '1px solid rgba(21, 20, 15, 0.08)', paddingTop: '18px', marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7c7768', marginBottom: '12px' }}>
                  Recursos incluídos:
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: '#2a2620' }}>
                    <Check size={16} style={{ color: '#2f6b31', flexShrink: 0, marginTop: '2px' }} />
                    <span>Guias rápidos de aplicação e interpretação</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: '#2a2620' }}>
                    <Check size={16} style={{ color: '#2f6b31', flexShrink: 0, marginTop: '2px' }} />
                    <span>Modelos de laudo e roteiros de anamnese</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: '#2a2620' }}>
                    <Check size={16} style={{ color: '#2f6b31', flexShrink: 0, marginTop: '2px' }} />
                    <span>Compêndios de estudo e instrumentos</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              {isCurrentPlan('consulta') ? (
                <div style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(47, 107, 49, 0.08)',
                  textAlign: 'center',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#2f6b31'
                }}>
                  Plano Ativo
                </div>
              ) : (
                <div style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(21, 20, 15, 0.04)',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#7c7768'
                }}>
                  Incluso no seu plano
                </div>
              )}
            </div>
          </div>

          {/* 2. PLANO ESTUDO */}
          <div style={{
            backgroundColor: isCurrentPlan('estudo') ? '#fdfbf7' : '#f7f1de',
            border: isCurrentPlan('estudo') 
              ? '2px solid rgba(47, 107, 49, 0.4)' 
              : initialPlanParam === 'estudo' 
                ? '2px solid #2f6b31' 
                : '1px solid rgba(21, 20, 15, 0.12)',
            borderRadius: '20px',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            {isCurrentPlan('estudo') ? (
              <span style={{
                position: 'absolute',
                top: '-12px',
                left: '20px',
                backgroundColor: '#2f6b31',
                color: '#dafeaa',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '3px 10px',
                borderRadius: '999px'
              }}>
                Seu Plano Atual
              </span>
            ) : initialPlanParam === 'estudo' && (
              <span style={{
                position: 'absolute',
                top: '-12px',
                left: '20px',
                backgroundColor: '#dafeaa',
                color: '#2f6b31',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '3px 10px',
                borderRadius: '999px'
              }}>
                Selecionado para Desbloqueio
              </span>
            )}

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#15140f', margin: 0 }}>Estudo</h2>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#7c7768', textTransform: 'uppercase' }}>Aulas</span>
              </div>
              <p style={{ fontSize: '13.5px', color: '#5a5448', lineHeight: 1.5, margin: '0 0 20px' }}>
                Para quem quer todos os materiais mais as aulas gravadas em módulos com raciocínio clínico.
              </p>

              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: '#15140f' }}>R$ 39,90</span>
                <span style={{ fontSize: '14px', color: '#7c7768' }}>/mês</span>
              </div>

              <div style={{ borderTop: '1px solid rgba(21, 20, 15, 0.08)', paddingTop: '18px', marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7c7768', marginBottom: '12px' }}>
                  Tudo do Consulta mais:
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: '#2a2620' }}>
                    <Check size={16} style={{ color: '#2f6b31', flexShrink: 0, marginTop: '2px' }} />
                    <span><b>Todos os PDFs</b> do plano Consulta</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: '#2a2620' }}>
                    <Check size={16} style={{ color: '#2f6b31', flexShrink: 0, marginTop: '2px' }} />
                    <span><b>Aulas gravadas em módulos</b> com raciocínio diagnóstico</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: '#2a2620' }}>
                    <Check size={16} style={{ color: '#2f6b31', flexShrink: 0, marginTop: '2px' }} />
                    <span>Progresso de aulas e estudos de caso clínicos</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              {isCurrentPlan('estudo') ? (
                <div style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(47, 107, 49, 0.08)',
                  textAlign: 'center',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#2f6b31'
                }}>
                  Plano Ativo
                </div>
              ) : isUpgradeAvailable('estudo') ? (
                <button
                  type="button"
                  onClick={() => handleUpgrade('estudo')}
                  disabled={Boolean(loadingPlan)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: '#15140f',
                    color: '#efe7d2',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: loadingPlan ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(21, 20, 15, 0.12)'
                  }}
                >
                  {loadingPlan === 'estudo' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Iniciando checkout...</span>
                    </>
                  ) : (
                    <>
                      <span>Fazer Upgrade para o Estudo</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              ) : (
                <div style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(21, 20, 15, 0.04)',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#7c7768'
                }}>
                  Incluso no seu plano
                </div>
              )}
            </div>
          </div>

          {/* 3. PLANO PRÁTICA (RECOMENDADO / MAIOR DESTAQUE) */}
          <div style={{
            backgroundColor: isCurrentPlan('pratica') ? '#fdfbf7' : '#ffffff',
            border: '2px solid #2f6b31',
            borderRadius: '20px',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            boxShadow: '0 12px 30px -10px rgba(47, 107, 49, 0.18)'
          }}>
            <span style={{
              position: 'absolute',
              top: '-12px',
              left: '20px',
              backgroundColor: isCurrentPlan('pratica') ? '#2f6b31' : '#dafeaa',
              color: isCurrentPlan('pratica') ? '#dafeaa' : '#2f6b31',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '3px 12px',
              borderRadius: '999px'
            }}>
              {isCurrentPlan('pratica') ? 'Seu Plano Atual · Acesso Completo' : 'Mais Completo · Recomendado'}
            </span>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#15140f', margin: 0 }}>Prática</h2>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#2f6b31', textTransform: 'uppercase' }}>Clínico</span>
              </div>
              <p style={{ fontSize: '13.5px', color: '#5a5448', lineHeight: 1.5, margin: '0 0 20px' }}>
                Para quem avalia e quer ferramentas digitais para usar em sessão com o paciente.
              </p>

              <div style={{ marginBottom: '24px' }}>
                {ciclo === 'anual' ? (
                  <div>
                    <span style={{ fontSize: '32px', fontWeight: 800, color: '#15140f' }}>R$ 33,25</span>
                    <span style={{ fontSize: '14px', color: '#7c7768' }}>/mês</span>
                    <div style={{ fontSize: '12px', color: '#2f6b31', fontWeight: 600, marginTop: '2px' }}>
                      R$ 399,00 cobrado anualmente (2 meses grátis)
                    </div>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: '32px', fontWeight: 800, color: '#15140f' }}>R$ 49,90</span>
                    <span style={{ fontSize: '14px', color: '#7c7768' }}>/mês</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid rgba(21, 20, 15, 0.08)', paddingTop: '18px', marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2f6b31', marginBottom: '12px' }}>
                  Tudo do Consulta + Estudo mais:
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: '#2a2620' }}>
                    <Check size={16} style={{ color: '#2f6b31', flexShrink: 0, marginTop: '2px' }} />
                    <span><b>Baralho de Funções Executivas</b> interativo para sessão</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: '#2a2620' }}>
                    <Check size={16} style={{ color: '#2f6b31', flexShrink: 0, marginTop: '2px' }} />
                    <span><b>Histórias Temáticas ilustradas</b> (infantil &amp; adulto)</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: '#2a2620' }}>
                    <Check size={16} style={{ color: '#2f6b31', flexShrink: 0, marginTop: '2px' }} />
                    <span><b>Cronômetro Clínico</b> com contagem de erros em tempo real</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: '#2a2620' }}>
                    <Check size={16} style={{ color: '#2f6b31', flexShrink: 0, marginTop: '2px' }} />
                    <span>Novas ferramentas práticas todo mês</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              {isCurrentPlan('pratica') ? (
                <div style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: '#dafeaa',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#2f6b31',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <ShieldCheck size={18} />
                  <span>Seu plano atual é o mais completo</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleUpgrade('pratica')}
                  disabled={Boolean(loadingPlan)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: '#2f6b31',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: loadingPlan ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(47, 107, 49, 0.25)'
                  }}
                >
                  {loadingPlan === 'pratica' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Iniciando checkout...</span>
                    </>
                  ) : (
                    <>
                      <span>Fazer Upgrade para o Prática</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Rodapé explicativo */}
        <div style={{
          marginTop: '44px',
          padding: '24px',
          backgroundColor: '#f7f1de',
          borderRadius: '16px',
          border: '1px solid rgba(21, 20, 15, 0.1)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div>
            <b style={{ display: 'block', fontSize: '15px', color: '#15140f', marginBottom: '4px' }}>
              Transição instantânea e segura via Stripe
            </b>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#5a5448' }}>
              Ao confirmar o upgrade, sua nova assinatura é atualizada e os novos recursos são liberados imediatamente na sua conta.
            </p>
          </div>
          <Link
            href="/plataforma"
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#15140f',
              textDecoration: 'underline',
              textUnderlineOffset: '3px'
            }}
          >
            ← Voltar para o Início da Plataforma
          </Link>
        </div>
      </div>
    </PlatformShell>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: '#efe7d2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#15140f', fontFamily: 'sans-serif' }}>Carregando opções de upgrade...</p>
      </div>
    }>
      <UpgradeContent />
    </Suspense>
  );
}
