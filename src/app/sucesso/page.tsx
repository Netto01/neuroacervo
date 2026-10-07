'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

function SucessoContent() {
  const searchParams = useSearchParams();
  const plano = searchParams.get('plano') || 'Prática';
  const ciclo = searchParams.get('ciclo') || 'mensal';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#efe7d2',
      color: '#15140f',
      fontFamily: '"Inter", system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        backgroundColor: '#f7f1de',
        border: '1px solid rgba(21, 20, 15, 0.16)',
        borderRadius: '24px',
        padding: 'clamp(28px, 5vw, 44px)',
        boxShadow: '0 30px 60px -30px rgba(21, 20, 15, 0.18)',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Brand isologo */}
        <div style={{ marginBottom: '20px' }}>
          <img 
            src="/brand/isologo-preto.svg" 
            width="32" 
            height="42" 
            alt="NeuroAcervo" 
            style={{ margin: '0 auto', display: 'block' }} 
          />
        </div>

        {/* Ícone de Sucesso */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#dafeaa',
          color: '#2f6b31',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 0 0 8px rgba(218, 254, 170, 0.4)'
        }}>
          <CheckCircle2 size={36} strokeWidth={2.4} />
        </div>

        <span style={{
          display: 'inline-block',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#2f6b31',
          marginBottom: '8px'
        }}>
          Pagamento Aprovado
        </span>

        <h1 style={{
          fontFamily: '"Inter Tight", sans-serif',
          fontSize: 'clamp(26px, 4vw, 34px)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          margin: '0 0 12px'
        }}>
          Bem-vindo ao NeuroAcervo!
        </h1>

        <p style={{
          fontSize: '15px',
          lineHeight: 1.6,
          color: '#5a5448',
          margin: '0 0 28px'
        }}>
          Sua assinatura do plano <b>{plano}</b> ({ciclo}) foi processada com sucesso via Stripe. Seu acesso completo já está ativo.
        </p>

        {/* Detalhes da Liberação */}
        <div style={{
          backgroundColor: 'rgba(21, 20, 15, 0.04)',
          border: '1px solid rgba(21, 20, 15, 0.08)',
          borderRadius: '16px',
          padding: '16px 20px',
          textAlign: 'left',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={20} color="#2f6b31" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '13.5px', color: '#2a2620' }}>
              Marca d&apos;água pessoal configurada para os seus laudos e consultas.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles size={20} color="#8a5317" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '13.5px', color: '#2a2620' }}>
              Recibo e comprovante oficial enviados para o seu e-mail.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen size={20} color="#2e4c78" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '13.5px', color: '#2a2620' }}>
              Todos os materiais liberados sem limites no leitor técnico.
            </span>
          </div>
        </div>

        {/* Botão de Ação Principal */}
        <Link 
          href="/plataforma"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            height: '52px',
            backgroundColor: '#15140f',
            color: '#efe7d2',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '15px',
            letterSpacing: '0.02em',
            transition: 'background-color 0.2s',
            boxSizing: 'border-box'
          }}
        >
          <span>Acessar Minha Plataforma</span>
          <ArrowRight size={18} />
        </Link>

        {/* Link Secundário */}
        <div style={{ marginTop: '16px' }}>
          <Link 
            href="/biblioteca"
            style={{
              fontSize: '13.5px',
              color: '#5a5448',
              textDecoration: 'underline',
              textUnderlineOffset: '3px'
            }}
          >
            Ou explorar a biblioteca de materiais
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SucessoPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: '#efe7d2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#15140f', fontFamily: 'sans-serif' }}>Carregando confirmação...</p>
      </div>
    }>
      <SucessoContent />
    </Suspense>
  );
}
