'use client';

import React, { useState } from 'react';
import { useNeuro } from '@/context/NeuroContext';
import { AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { STRIPE_PLANS } from '@/config/plans';

export function PendingSubscriptionBanner() {
  const { currentUser } = useNeuro();
  const [loading, setLoading] = useState(false);

  if (!currentUser || currentUser.subscriptionStatus !== 'pending') {
    return null;
  }

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Identifica o plano do usuário ou usa padrão
      const planNameLower = (currentUser.plan || '').toLowerCase();
      const planKey: 'consulta' | 'estudo' | 'pratica' = 
        planNameLower.includes('pratica') || planNameLower.includes('completo') ? 'pratica' :
        planNameLower.includes('estudo') || planNameLower.includes('aula') ? 'estudo' : 'consulta';

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userEmail: currentUser.email,
          planKey,
          billingCycle: currentUser.billingCycle || 'mensal'
        })
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (err) {
      console.error('Erro ao redirecionar para checkout pendente:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#fef3c7',
      borderBottom: '1px solid #fde68a',
      color: '#92400e',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      fontSize: '13px',
      lineHeight: 1.4,
      position: 'relative',
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0 }} />
        <span>
          <b>Assinatura pendente:</b> Conclua o pagamento do plano <b>{currentUser.plan}</b> para liberar acesso aos materiais.
        </span>
      </div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#2f6b31',
          color: '#ffffff',
          border: 'none',
          borderRadius: '999px',
          padding: '6px 14px',
          fontSize: '12px',
          fontWeight: 700,
          cursor: loading ? 'wait' : 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          transition: 'background-color 0.2s'
        }}
      >
        {loading ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            <span>Abrindo Stripe...</span>
          </>
        ) : (
          <>
            <CreditCard size={13} />
            <span>Concluir Pagamento</span>
          </>
        )}
      </button>
    </div>
  );
}
