'use client';

import React, { useState, useEffect } from 'react';

interface PatientDiaryShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientCode: string;
  patientName?: string;
}

export function PatientDiaryShareModal({
  isOpen,
  onClose,
  patientCode,
  patientName
}: PatientDiaryShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  if (!isOpen) return null;

  const displayName = patientName || patientCode || 'Paciente';
  const diaryUrl = `${origin}/recursos-interativos/pacientes/diario?paciente=${encodeURIComponent(
    patientCode
  )}`;

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(diaryUrl);
      } else {
        const input = document.createElement('textarea');
        input.value = diaryUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Olá, ${displayName}! Segue seu link exclusivo para acessar o Diário da Ansiedade e registrar seus episódios no dia a dia:\n\n${diaryUrl}\n\nVocê pode abrir diretamente no celular. Qualquer dúvida, conversamos na próxima sessão!`
  );

  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    diaryUrl
  )}&bgcolor=fffdf6&color=15140f&margin=1`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(21, 20, 15, 0.65)',
        backdropFilter: 'blur(5px)',
        animation: 'naFadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          background: 'var(--surface, #f7f1de)',
          border: '1px solid var(--line, rgba(21, 20, 15, 0.15))',
          borderRadius: '20px',
          boxShadow: '0 20px 45px rgba(21, 20, 15, 0.22)',
          color: 'var(--ink, #15140f)',
          fontFamily: "var(--f-t, 'Inter', system-ui, sans-serif)",
          overflow: 'hidden'
        }}
      >
        {/* Cabeçalho do Modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--line, rgba(21, 20, 15, 0.1))',
            background: 'var(--paper, #fffdf6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                background: 'var(--ink, #15140f)',
                color: 'var(--pop, #dafeaa)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </span>
            <div>
              <span
                style={{
                  fontFamily: "var(--f-m, 'JetBrains Mono', monospace)",
                  fontSize: '10.5px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--accent, #2f6b31)',
                  display: 'block'
                }}
              >
                Compartilhamento
              </span>
              <h3
                style={{
                  margin: '2px 0 0',
                  fontSize: '18px',
                  fontWeight: 800,
                  fontFamily: "var(--f-d, 'Inter Tight', system-ui, sans-serif)",
                  letterSpacing: '-0.02em',
                  color: 'var(--ink, #15140f)'
                }}
              >
                Diário da Ansiedade · {displayName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              border: 'none',
              background: 'transparent',
              color: 'var(--mute, #5a5448)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(21, 20, 15, 0.08)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Corpo do Modal */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: '1.5',
              color: 'var(--mute, #5a5448)'
            }}
          >
            Envie este link direto para o paciente salvar no celular. Ele não precisará de login e
            poderá registrar episódios de ansiedade entre as sessões. Os registros compartilhados
            aparecerão automaticamente no seu painel.
          </p>

          {/* Campo com Link e Botão Copiar */}
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: "var(--f-m, 'JetBrains Mono', monospace)",
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--soft, #8a8270)',
                marginBottom: '6px'
              }}
            >
              Link exclusivo do paciente
            </label>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}
            >
              <input
                type="text"
                readOnly
                value={diaryUrl}
                style={{
                  flex: 1,
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--line, rgba(21, 20, 15, 0.15))',
                  background: 'var(--paper, #fffdf6)',
                  color: 'var(--ink, #15140f)',
                  fontFamily: "var(--f-m, 'JetBrains Mono', monospace)",
                  fontSize: '12.5px',
                  outline: 'none'
                }}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  height: '42px',
                  padding: '0 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: copied ? 'var(--accent, #2f6b31)' : 'var(--ink, #15140f)',
                  color: copied ? '#ffffff' : 'var(--pop, #dafeaa)',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background 0.2s ease, transform 0.1s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {copied ? (
                  <>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copiado!
                  </>
                ) : (
                  <>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Seção com QR Code e Ações */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
              padding: '16px',
              borderRadius: '14px',
              background: 'var(--paper, #fffdf6)',
              border: '1px solid var(--line, rgba(21, 20, 15, 0.1))'
            }}
          >
            {/* Imagem do QR Code */}
            <div
              style={{
                width: '108px',
                height: '108px',
                borderRadius: '10px',
                border: '1px solid var(--line, rgba(21, 20, 15, 0.15))',
                background: '#fffdf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden'
              }}
            >
              <img
                src={qrCodeUrl}
                alt="QR Code do Diário"
                width={100}
                height={100}
                style={{ display: 'block', borderRadius: '6px' }}
              />
            </div>

            {/* Ações Rápidas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink, #15140f)' }}>
                Escanear na sessão ou enviar agora:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 14px',
                    borderRadius: '9px',
                    background: '#25d366',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '12.5px',
                    textDecoration: 'none',
                    boxShadow: '0 2px 4px rgba(37, 211, 102, 0.25)',
                    transition: 'opacity 0.15s ease'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.79 14.07c-.24.68-1.39 1.33-1.92 1.38-.49.05-1.12.07-3.23-.79-2.7-1.1-4.44-3.83-4.57-4.01-.13-.18-1.08-1.44-1.08-2.75 0-1.31.69-1.95.93-2.22.25-.26.54-.33.72-.33.18 0 .36 0 .52.01.16.01.39-.06.6.46.23.54.77 1.88.84 2.01.07.14.11.3.02.48-.09.18-.14.29-.28.45-.14.16-.29.35-.42.47-.14.14-.29.29-.12.58.17.29.74 1.22 1.59 1.98 1.09.98 2.01 1.28 2.3 1.42.29.14.45.12.62-.07.17-.19.74-.86.93-1.16.2-.29.39-.24.66-.14.27.1 1.72.81 2.02.96.29.15.49.23.56.35.07.13.07.74-.17 1.42z" />
                  </svg>
                  WhatsApp
                </a>

                <a
                  href={diaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '9px',
                    background: 'var(--paper, #ffffff)',
                    border: '1.5px solid var(--line, rgba(21, 20, 15, 0.2))',
                    color: 'var(--ink, #15140f)',
                    fontWeight: 600,
                    fontSize: '12.5px',
                    textDecoration: 'none'
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Abrir Diário
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div
          style={{
            padding: '14px 24px',
            background: 'var(--bg, #efe7d2)',
            borderTop: '1px solid var(--line, rgba(21, 20, 15, 0.1))',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '9px',
              border: '1px solid var(--line, rgba(21, 20, 15, 0.2))',
              background: 'var(--paper, #fffdf6)',
              color: 'var(--ink, #15140f)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
