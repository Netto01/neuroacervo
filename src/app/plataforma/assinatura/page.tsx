'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { useNeuro } from '@/context/NeuroContext';
import { resolveUserPlan } from '@/utils/userPlan';
import { 
  Check, 
  Lock, 
  ExternalLink, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import styles from './assinatura.module.css';

export default function AssinaturaPage() {
  const { currentUser } = useNeuro();
  const planInfo = resolveUserPlan(currentUser);

  const [loadingPortal, setLoadingPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const isAnual = currentUser?.billingCycle === 'anual';
  const isAdmin = currentUser?.role === 'admin';
  const isPratica = planInfo.tipo === 'pratica';
  const isEstudo = planInfo.tipo === 'estudo';

  async function handleOpenPortal() {
    if (!currentUser?.email) return;

    setLoadingPortal(true);
    setPortalError(null);

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userEmail: currentUser.email,
          stripeCustomerId: currentUser.stripeCustomerId
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        if (data.error === 'no_stripe_customer') {
          setPortalError(
            'Sua conta possui acesso administrativo ou liberação manual direta. Para alterações cadastrais, fale diretamente com o suporte.'
          );
        } else {
          setPortalError(data.message || data.error || 'Não foi possível conectar ao portal da Stripe.');
        }
        setLoadingPortal(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Erro ao abrir portal da Stripe:', err);
      setPortalError('Falha temporária ao comunicar com o Stripe. Tente novamente em alguns instantes.');
      setLoadingPortal(false);
    }
  }

  return (
    <PlatformShell activePage="assinatura" searchPlaceholder="Buscar materiais ou recursos...">
      <div className={styles.wrap}>
        {/* Cabeçalho */}
        <header className={styles.header}>
          <span className={styles.kicker}>Minha Conta &amp; Faturamento</span>
          <h1 className={styles.title}>
            Gerenciamento da <em>sua assinatura</em>
          </h1>
          <p className={styles.subtitle}>
            Acompanhe os detalhes do seu plano ativo, forma de pagamento, notas fiscais e tenha total controle sobre sua assinatura.
          </p>
        </header>

        {/* Grid de Conteúdo */}
        <div className={styles.grid}>
          {/* Card 1: Assinatura Atual e Stripe Portal */}
          <div className={styles.cardDestaque}>
            <div className={styles.cardHead}>
              <div>
                <span className={styles.cardLabel}>Plano Atual</span>
                <div className={styles.cardNomePlano}>Plano {planInfo.nome}</div>
              </div>
              <span className={`${styles.badgeStatus} ${isAdmin ? '' : ''}`}>
                {isAdmin ? 'Admin' : 'Ativa'}
              </span>
            </div>

            <div className={styles.precoRow}>
              <span className={styles.precoValor}>{planInfo.preco}</span>
              <span className={styles.precoCiclo}>
                · {isAnual ? 'Cobrança anual' : 'Cobrança mensal'}
              </span>
            </div>

            <ul className={styles.infoLista}>
              <li className={styles.infoItem}>
                <span className={styles.infoChave}>E-mail de cobrança</span>
                <span className={styles.infoValor}>{currentUser?.email || '—'}</span>
              </li>
              <li className={styles.infoItem}>
                <span className={styles.infoChave}>Forma de pagamento</span>
                <span className={styles.infoValor}>
                  <CreditCard className="w-4 h-4 text-lime-300 inline" /> Cartão de crédito
                </span>
              </li>
              <li className={styles.infoItem}>
                <span className={styles.infoChave}>Processadora segura</span>
                <span className={styles.infoValor}>
                  <ShieldCheck className="w-4 h-4 text-lime-300 inline" /> Stripe Brasil
                </span>
              </li>
            </ul>

            {portalError ? (
              <div className={styles.avisoManual} style={{ color: '#fff', background: 'rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-300" />
                  <span>Aviso de Conta</span>
                </div>
                <p style={{ margin: 0, fontSize: 13 }}>{portalError}</p>
                <div style={{ marginTop: 12 }}>
                  <a
                    href="mailto:suporte@neuroacervo.com.br?subject=Gerenciar%20Assinatura%20Manual"
                    className={styles.btnSecundario}
                    style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                  >
                    Contatar Suporte
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  className={styles.btnStripe}
                  onClick={handleOpenPortal}
                  disabled={loadingPortal}
                >
                  {loadingPortal ? (
                    <span>Conectando ao Stripe...</span>
                  ) : (
                    <>
                      <span>Gerenciar no Portal Stripe</span>
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className={styles.notaStripe}>
                  Altere cartão, baixe recibos/faturas ou pause sua assinatura com 1 clique diretamente no portal seguro da Stripe.
                </p>
              </div>
            )}
          </div>

          {/* Card 2: Benefícios do Plano e Upgrade */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <span className={styles.cardLabel}>Recursos da Plataforma</span>
                <div className={styles.cardNomePlano} style={{ fontSize: 20 }}>
                  O que está liberado
                </div>
              </div>
            </div>

            <ul className={styles.recursosList}>
              <li className={styles.recursoItem}>
                <span className={styles.recursoIcone}>
                  <Check className="w-3.5 h-3.5" />
                </span>
                <div className={styles.recursoTxt}>
                  <b>Acervo de Avaliação e Testes</b>
                  <small>Protocolos, modelos de laudo, manuais e compêndios em PDF/DOCX</small>
                </div>
              </li>

              <li className={styles.recursoItem}>
                <span className={styles.recursoIcone}>
                  <Check className="w-3.5 h-3.5" />
                </span>
                <div className={styles.recursoTxt}>
                  <b>Roteiros de Anamnese &amp; Guias</b>
                  <small>Passo a passo clínico para aplicação com segurança técnica</small>
                </div>
              </li>

              <li className={styles.recursoItem}>
                <span className={`${styles.recursoIcone} ${planInfo.hasAulas ? '' : styles.bloq}`}>
                  {planInfo.hasAulas ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                </span>
                <div className={styles.recursoTxt}>
                  <b>Videoaulas &amp; Discussão de Casos</b>
                  <small>
                    {planInfo.hasAulas
                      ? 'Módulos formativos e raciocínio diagnóstico liberados'
                      : 'Exclusivo para os planos Estudo e Prática'}
                  </small>
                </div>
              </li>

              <li className={styles.recursoItem}>
                <span className={`${styles.recursoIcone} ${planInfo.hasRecursos ? '' : styles.bloq}`}>
                  {planInfo.hasRecursos ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                </span>
                <div className={styles.recursoTxt}>
                  <b>Recursos Interativos em Sessão</b>
                  <small>
                    {planInfo.hasRecursos
                      ? 'Cronômetro com erros, Baralho Executivo e Histórias liberados'
                      : 'Exclusivo do plano Prática'}
                  </small>
                </div>
              </li>
            </ul>

            {/* Chamada para Upgrade se não for Prática */}
            {!isPratica && (
              <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
                <Link href="/plataforma/upgrade" className={styles.btnUpgrade}>
                  <span>Fazer upgrade de plano</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--mute)', textAlign: 'center' }}>
                  A diferença de valor é ajustada automaticamente no seu cartão.
                </p>
              </div>
            )}

            {isPratica && (
              <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <div style={{ 
                  padding: '12px 14px', 
                  borderRadius: 12, 
                  background: 'var(--bone)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10 
                }}>
                  <Sparkles className="w-4 h-4 text-emerald-700 flex-none" />
                  <span style={{ fontSize: 13, color: 'var(--ink)' }}>
                    Você tem <b>acesso total</b> a todas as ferramentas e novos materiais mensais.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé de Dúvidas e Garantias */}
        <div className={styles.footerSec}>
          <div className={styles.footerTxt}>
            <h4>Transparência total na cobrança</h4>
            <p>
              Sem fidelidade ou burocracia. Cancele ou mude de plano a qualquer momento pelo portal do Stripe ou pelo nosso canal de atendimento ao psicólogo.
            </p>
          </div>
          <div>
            <a
              href="mailto:suporte@neuroacervo.com.br?subject=Duvida%20sobre%20Assinatura"
              className={styles.btnSecundario}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Falar com o suporte</span>
            </a>
          </div>
        </div>
      </div>
    </PlatformShell>
  );
}
