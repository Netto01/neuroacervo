'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { useNeuro } from '@/context/NeuroContext';
import { resolveUserPlan } from '@/utils/userPlan';
import s from './assinatura.module.css';

interface StripeSubscriptionDetails {
  hasStripe: boolean;
  hasSubscription?: boolean;
  customerId?: string;
  subscriptionId?: string;
  status?: string;
  rawStatus?: string;
  cancelAtPeriodEnd?: boolean;
  renovacao?: string;
  currentPeriodEnd?: number;
  valor?: string;
  unitAmount?: number;
  ciclo?: 'mensal' | 'anual';
  planoId?: 'consulta' | 'estudo' | 'pratica';
  planoNome?: string;
  cartao?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    textoValidade: string;
  } | null;
  message?: string;
}

export default function AssinaturaPage() {
  const { currentUser } = useNeuro();
  const planInfo = resolveUserPlan(currentUser);

  const [loadingPortal, setLoadingPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const [stripeDetails, setStripeDetails] = useState<StripeSubscriptionDetails | null>(null);
  const [loadingStripe, setLoadingStripe] = useState(true);

  const isAdmin = currentUser?.role === 'admin';
  const isAnualFallback = currentUser?.billingCycle === 'anual' || (currentUser?.plan || '').toLowerCase().includes('anual');

  // Consulta as informações reais na API do Stripe
  useEffect(() => {
    let isMounted = true;
    async function carregarDadosReaisStripe() {
      if (!currentUser?.email) return;

      try {
        setLoadingStripe(true);
        const res = await fetch('/api/stripe/subscription-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            userEmail: currentUser.email,
            stripeCustomerId: currentUser.stripeCustomerId
          })
        });

        const data: StripeSubscriptionDetails = await res.json();
        if (isMounted && res.ok && data.hasStripe) {
          setStripeDetails(data);
        }
      } catch (err) {
        console.warn('Erro ao carregar dados reais da Stripe:', err);
      } finally {
        if (isMounted) setLoadingStripe(false);
      }
    }

    carregarDadosReaisStripe();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.email, currentUser?.id, currentUser?.stripeCustomerId]);

  // Plano padrão do sistema caso Stripe não esteja disponível
  const planoFallback = useMemo(() => {
    const raw = planInfo.tipo;
    if (raw === 'pratica' || isAdmin) {
      return { id: 'pratica', nome: isAdmin ? 'Admin' : 'Prática', n: 3, mensal: '49,90', anual: '399' };
    }
    if (raw === 'estudo') {
      return { id: 'estudo', nome: 'Estudo', n: 2, mensal: '39,90', anual: '319' };
    }
    return { id: 'consulta', nome: 'Consulta', n: 1, mensal: '19,90', anual: '159' };
  }, [planInfo.tipo, isAdmin]);

  // Dados consolidados (prioriza o que vem real do Stripe)
  const planoId = stripeDetails?.planoId || planoFallback.id;
  const planoNome = stripeDetails?.planoNome || (isAdmin ? 'Admin' : planoFallback.nome);
  const nivel = planoId === 'pratica' || isAdmin ? 3 : planoId === 'estudo' ? 2 : 1;

  const cicloFinal = stripeDetails?.ciclo || (isAnualFallback ? 'anual' : 'mensal');
  const isAnual = cicloFinal === 'anual';
  const cicloTexto = isAnual ? 'Anual' : 'Mensal';
  const cicloUnidade = isAnual ? '/ano' : '/mês';

  const valorFinal = stripeDetails?.valor || (isAnual ? planoFallback.anual : planoFallback.mensal);
  const statusFinal = stripeDetails?.status || (isAdmin ? 'Admin' : 'Ativa');
  const cancelamentoAgendado = stripeDetails?.cancelAtPeriodEnd || false;

  // Data de renovação real ou estimada
  const renovacaoFinal = useMemo(() => {
    if (stripeDetails?.renovacao) return stripeDetails.renovacao;
    try {
      const d = new Date();
      if (isAnual) d.setFullYear(d.getFullYear() + 1);
      else d.setMonth(d.getMonth() + 1);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return 'Renovação automática';
    }
  }, [stripeDetails?.renovacao, isAnual]);

  // Cartão real da Stripe
  const cartaoReal = stripeDetails?.cartao;

  async function handleOpenPortal(e?: React.MouseEvent) {
    if (e) e.preventDefault();
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
          stripeCustomerId: stripeDetails?.customerId || currentUser.stripeCustomerId
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        if (data.error === 'no_stripe_customer') {
          setPortalError(
            'Sua conta possui acesso administrativo ou liberação manual direta. Para alterações cadastrais, fale com nosso suporte.'
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

  const nivelTexto =
    nivel === 3
      ? 'Acervo completo liberado. Aproveite!'
      : nivel +
        ' de 3 níveis liberados.' +
        (nivel === 1
          ? ' Aulas e recursos interativos ficam nos planos Estudo e Prática.'
          : ' Os recursos interativos ficam no plano Prática.');

  return (
    <PlatformShell activePage="assinatura" searchPlaceholder="Buscar teste, função ou tema...">
      <div className={s.wrap}>
        <div className={s.hd2}>
          <div className={s.kick}>Minha conta</div>
          <h1 className={s.title}>
            Sua <em>assinatura</em>
          </h1>
          <p className={s.subtitle}>
            Acompanhe seu plano, a forma de pagamento e os recibos. Tudo o que envolve cobrança é feito com segurança pela Stripe.
          </p>
        </div>

        {portalError && (
          <div
            style={{
              marginTop: '20px',
              padding: '14px 18px',
              borderRadius: '16px',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              color: '#92400e',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <span>{portalError}</span>
            <a
              href="mailto:contato@neuroacervo.com.br"
              style={{ fontWeight: 700, textDecoration: 'underline', color: '#78350f' }}
            >
              Falar com suporte
            </a>
          </div>
        )}

        <div className={s.g2}>
          {/* Card Principal Escuro */}
          <div className={`${s.card} ${s.escuro}`}>
            <span className={s.tape} />
            <div className={s.ptop}>
              <div>
                <span className={s.lbl}>Plano atual</span>
                <div className={s.pnome}>
                  <span className={s.ic}>
                    <svg viewBox="0 0 24 24">
                      <path d="M7 3h7l5 5v13H7z" />
                      <path d="M14 3v5h5M10 13h6M10 17h4" />
                    </svg>
                  </span>
                  <b>{planoNome}</b>
                </div>
              </div>
              <span className={s.status} style={cancelamentoAgendado ? { background: '#fef3c7', color: '#92400e' } : {}}>
                <i style={cancelamentoAgendado ? { background: '#d97706' } : {}} />
                <span>{cancelamentoAgendado ? 'Cancelamento agendado' : statusFinal}</span>
              </span>
            </div>

            <div className={s.nums}>
              <div>
                <span className={s.lbl}>Valor</span>
                <b className={s.lime}>
                  R$ {valorFinal} <small>{cicloUnidade}</small>
                </b>
              </div>
              <div>
                <span className={s.lbl}>Cobrança</span>
                <b>{cicloTexto}</b>
              </div>
              <div>
                <span className={s.lbl}>{cancelamentoAgendado ? 'Acesso ativo até' : 'Próxima renovação'}</span>
                <b>{renovacaoFinal}</b>
              </div>
            </div>

            <div className={s.nivel}>
              <span className={s.lbl}>Seu nível no acervo</span>
              <div className={s.bar}>
                <i style={{ width: `${(nivel / 3) * 100}%` }} />
              </div>
              <p>{nivelTexto}</p>
            </div>

            <div className={s.acoes}>
              {nivel < 3 && (
                <Link className={`${s.btn} ${s.lime}`} href="/plataforma/upgrade">
                  Fazer upgrade de plano <span>→</span>
                </Link>
              )}
              <button
                type="button"
                className={`${s.btn} ${s.out}`}
                onClick={handleOpenPortal}
                disabled={loadingPortal}
              >
                <span>{loadingPortal ? 'Conectando ao Stripe...' : 'Gerenciar no portal Stripe'}</span>
                <svg viewBox="0 0 24 24">
                  <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Card de Pagamento */}
          <div className={`${s.card} ${s.pag}`}>
            <span className={s.lbl}>Pagamento</span>
            <h3>Forma de pagamento</h3>
            <div className={s.cartao}>
              <div className={s.chip} />
              <div className={s.num}>
                {cartaoReal ? `•••• •••• •••• ${cartaoReal.last4}` : loadingStripe ? 'Consultando Stripe...' : '•••• •••• •••• Stripe'}
              </div>
              <div className={s.row}>
                <span>
                  {cartaoReal?.brand ? `Cartão ${cartaoReal.brand.toUpperCase()}` : 'Cartão de crédito'}
                </span>
                <span>
                  {cartaoReal?.textoValidade || (loadingStripe ? 'Carregando...' : 'Ativo no Stripe')}
                </span>
              </div>
            </div>
            <div className={s.linhas}>
              <div>
                <span>E-mail de cobrança</span>
                <b title={currentUser?.email || ''}>{currentUser?.email || '—'}</b>
              </div>
              <div>
                <span>Processamento</span>
                <b>Stripe Brasil</b>
              </div>
            </div>
            <button
              type="button"
              className={`${s.btn} ${s.ghost}`}
              onClick={handleOpenPortal}
              disabled={loadingPortal}
            >
              <span>{loadingPortal ? 'Abrindo Stripe...' : 'Atualizar cartão'}</span>
              <svg viewBox="0 0 24 24">
                <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Seção: O que está liberado */}
        <section className={s.sec}>
          <div className={s.shd}>
            <div>
              <span className={s.lbl}>Seu acesso</span>
              <h2>O que está liberado</h2>
            </div>
          </div>
          <div className={s.lib}>
            <div className={s.item}>
              <span className={s.st}>
                <svg viewBox="0 0 24 24">
                  <path d="m5 12 4.5 4.5L19 7" />
                </svg>
              </span>
              <b>Acervo de consulta</b>
              <small>Protocolos, modelos de laudo e compêndios em PDF</small>
            </div>

            <div className={s.item}>
              <span className={s.st}>
                <svg viewBox="0 0 24 24">
                  <path d="m5 12 4.5 4.5L19 7" />
                </svg>
              </span>
              <b>Anamnese e guias</b>
              <small>Roteiros e guias rápidos de aplicação</small>
            </div>

            <div className={`${s.item} ${nivel >= 2 ? '' : s.off}`}>
              <span className={s.st}>
                {nivel >= 2 ? (
                  <svg viewBox="0 0 24 24">
                    <path d="m5 12 4.5 4.5L19 7" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                )}
              </span>
              <b>Aulas e casos clínicos</b>
              <small>Videoaulas em módulos e discussão de casos</small>
              {nivel < 2 && <span className={s.need}>Estudo ou Prática</span>}
            </div>

            <div className={`${s.item} ${nivel >= 3 ? '' : s.off}`}>
              <span className={s.st}>
                {nivel >= 3 ? (
                  <svg viewBox="0 0 24 24">
                    <path d="m5 12 4.5 4.5L19 7" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                )}
              </span>
              <b>Recursos interativos</b>
              <small>Baralho de Funções Executivas e Histórias Temáticas</small>
              {nivel < 3 && <span className={s.need}>Prática</span>}
            </div>
          </div>
        </section>

        {/* Seção: Recibos e faturas */}
        <section className={s.sec}>
          <div className={s.shd}>
            <div>
              <span className={s.lbl}>Histórico</span>
              <h2>Recibos e faturas</h2>
            </div>
          </div>
          <div className={s.recibos}>
            <span className={s.ri}>
              <svg viewBox="0 0 24 24">
                <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
                <path d="M9 8h6M9 12h6" />
              </svg>
            </span>
            <div>
              <b>Seus recibos ficam no portal da Stripe</b>
              <span>Lá você vê o histórico de pagamentos e baixa cada recibo em PDF.</span>
            </div>
            <button
              type="button"
              className={`${s.btn} ${s.ink}`}
              onClick={handleOpenPortal}
              disabled={loadingPortal}
            >
              <span>{loadingPortal ? 'Abrindo...' : 'Ver recibos'}</span>
              <svg viewBox="0 0 24 24">
                <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
              </svg>
            </button>
          </div>
        </section>

        {/* Seção: Dúvidas sobre a cobrança */}
        <section className={s.sec}>
          <div className={s.shd}>
            <div>
              <span className={s.lbl}>Ajuda</span>
              <h2>Dúvidas sobre a cobrança</h2>
            </div>
          </div>
          <div className={s.ajuda}>
            <div className={s.aj}>
              <b>Fale com a gente</b>
              <p>Problema com pagamento, cobrança ou acesso? Nossa equipe responde por e-mail.</p>
              <a className={`${s.btn} ${s.ghost}`} href="mailto:contato@neuroacervo.com.br">
                Falar com o suporte
              </a>
            </div>
            <div className={s.aj}>
              <b>Cancelar assinatura</b>
              <p>
                Sem multa. O acesso continua até o fim do período já pago. Nos primeiros 7 dias, o reembolso é integral.
              </p>
              <button
                type="button"
                className={s.txt}
                onClick={handleOpenPortal}
                disabled={loadingPortal}
              >
                Cancelar pelo portal Stripe
              </button>
            </div>
          </div>
        </section>

        <Link className={s.voltar} href="/plataforma">
          ← Voltar para o início
        </Link>
      </div>
    </PlatformShell>
  );
}
