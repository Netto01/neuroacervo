'use client';

/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useNeuro } from '@/context/NeuroContext';
import { 
  trackPresenteModalAberto, 
  trackPresenteModalFechado, 
  trackPresenteLeadEnviado,
  PresenteOrigem
} from '@/utils/presenteAnalytics';
import './presenteModal.css';

interface PresenteModalProps {
  isOpen: boolean;
  onClose: () => void;
  origem: PresenteOrigem;
  triggerElement?: HTMLElement | null;
}

export function PresenteModal({
  isOpen,
  onClose,
  origem,
  triggerElement
}: PresenteModalProps) {
  const { currentUser } = useNeuro();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [consentimento, setConsentimento] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Não renderiza para usuários autenticados
  const isLogged = Boolean(currentUser);

  const handleClose = useCallback(() => {
    trackPresenteModalFechado();

    // Registra no localStorage que o modal foi fechado para não reabrir automaticamente por 7 dias
    try {
      localStorage.setItem('na_presente_fechado_em', Date.now().toString());
    } catch {}

    onClose();

    // Devolve o foco para quem disparou o modal
    setTimeout(() => {
      previousActiveElement.current?.focus?.();
    }, 50);
  }, [onClose]);

  // Guarda elemento ativo para restaurar o foco ao fechar
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = triggerElement || (document.activeElement as HTMLElement | null);
      trackPresenteModalAberto(origem);

      // Trava o scroll do body
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Foco vai direto para o campo de e-mail após pequena espera da montagem
      const timer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 50);

      return () => {
        document.body.style.overflow = originalOverflow;
        clearTimeout(timer);
      };
    }
  }, [isOpen, origem, triggerElement]);

  // Focus trap e tecla ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (!first || !last) return;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validações básicas no cliente
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      emailInputRef.current?.focus();
      return;
    }

    if (!consentimento) {
      setErrorMessage('É necessário aceitar os termos para receber o presente.');
      return;
    }

    setIsLoading(true);

    try {
      // Captura UTMs da URL
      let utms = {
        utm_source: '',
        utm_medium: '',
        utm_campaign: '',
        utm_content: ''
      };

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        utms = {
          utm_source: params.get('utm_source') || '',
          utm_medium: params.get('utm_medium') || '',
          utm_campaign: params.get('utm_campaign') || '',
          utm_content: params.get('utm_content') || ''
        };
      }

      const res = await fetch('/api/presente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          email: cleanEmail,
          consentimento: true,
          honeypot,
          ...utms
        })
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok) {
        // Marca que o usuário já resgatou o presente
        try {
          localStorage.setItem('na_presente_resgatado', 'true');
          localStorage.setItem('na_presente_email', cleanEmail);
        } catch {}

        trackPresenteLeadEnviado(cleanEmail);
        setIsSuccess(true);
      } else {
        setErrorMessage(data?.error || 'Não foi possível enviar o presente agora. Tente novamente em instantes.');
      }
    } catch (err) {
      console.error('[Presente] Erro na requisição:', err);
      setErrorMessage('Erro de conexão ao enviar. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || isLogged) {
    return null;
  }

  return (
    <div 
      className="npm-overlay" 
      id="npm-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        ref={modalRef}
        className={`npm ${isSuccess ? 'is-success' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="npm-title"
        id="npm"
      >
        {/* Painel esquerdo */}
        <aside className="npm-art" aria-hidden="true">
          <img 
            className="npm-art-img" 
            src="/presente-escalas.webp" 
            alt="" 
            width="1000" 
            height="1241" 
          />
          <div className="npm-art-shade" />
          <div className="npm-brand">
            <svg viewBox="0 0 1344 1728">
              <path fill="currentColor" d="M713 1704C707 1702 696 1697 685 1690C682 1688 678 1685 674 1683C671 1681 665 1678 662 1675C658 1672 653 1670 651 1668C649 1668 644 1664 640 1662C635 1659 627 1654 622 1650C616 1647 608 1642 602 1638C598 1635 591 1631 588 1629C570 1619 563 1614 558 1612C553 1608 530 1593 515 1584C486 1567 479 1563 478 1562C477 1561 474 1559 470 1557C467 1555 461 1552 458 1549C454 1546 449 1544 447 1542C445 1542 440 1538 436 1536C431 1533 423 1528 418 1524C412 1521 403 1516 398 1512C394 1509 387 1505 384 1503C367 1493 359 1488 354 1486C348 1481 335 1473 318 1462C309 1458 296 1450 289 1445C282 1440 271 1434 265 1430C260 1427 253 1423 251 1421C248 1420 245 1418 243 1416C241 1416 236 1412 232 1410C227 1407 219 1402 214 1398C208 1395 199 1390 194 1386C190 1383 183 1379 180 1377C162 1367 155 1362 150 1360C144 1355 122 1342 111 1335C102 1330 85 1319 74 1312C71 1310 65 1306 62 1305C51 1299 40 1290 35 1284C33 1281 30 1275 28 1271L24 1264L24 666C24 123 24 69 26 64C30 49 40 37 54 30C59 28 65 26 68 25C75 23 87 24 94 27C100 30 117 39 129 47C134 50 139 54 141 54C143 55 150 60 156 64C162 68 170 73 173 74C184 82 228 110 240 117C247 121 257 128 264 132C270 136 281 143 288 147C294 151 301 156 304 157C306 158 313 163 320 167C326 171 332 175 334 176C345 183 363 194 372 200C378 204 386 209 390 212C395 214 400 218 402 219C404 220 408 223 412 225C415 227 422 231 428 235C453 251 462 257 466 259C468 260 475 265 481 269C507 285 511 288 518 290C527 294 533 294 544 289C553 285 559 279 562 272L564 266L565 168L566 68L568 61C572 51 574 47 583 38C589 33 592 31 599 28C607 25 608 24 619 25C632 25 638 26 648 33C651 35 657 39 661 41C672 48 687 57 698 64C703 68 709 72 711 72C713 73 720 78 726 82C732 86 740 91 743 92C763 105 799 128 805 132C809 134 816 139 820 142C831 148 842 155 858 165C864 169 871 174 873 174C875 175 882 180 888 184C894 188 902 193 904 194C910 198 929 210 940 216C944 219 951 224 956 226C960 229 966 233 970 236C985 245 1000 255 1008 259C1013 262 1018 266 1020 267C1022 268 1027 272 1031 274C1035 276 1044 282 1050 286C1057 290 1066 296 1071 299C1076 302 1088 310 1096 315C1105 321 1114 326 1117 328C1133 338 1139 342 1150 349C1156 353 1165 358 1170 361C1175 364 1180 367 1182 369C1183 370 1189 374 1195 377C1207 384 1219 392 1233 401C1238 404 1249 411 1257 416C1265 421 1274 427 1276 428C1279 430 1284 433 1288 435C1303 445 1310 453 1316 466L1320 474L1320 1069L1320 1664L1316 1672C1306 1695 1285 1707 1260 1704C1252 1704 1242 1699 1225 1689C1218 1684 1207 1678 1201 1674C1196 1670 1187 1665 1182 1662C1177 1659 1169 1654 1165 1652C1160 1649 1153 1644 1148 1641C1143 1638 1137 1634 1134 1633C1126 1628 1114 1620 1103 1613C1098 1610 1089 1605 1084 1602C1079 1598 1069 1592 1063 1588C1056 1584 1046 1578 1041 1575C1035 1572 1028 1567 1025 1565C1022 1563 1017 1560 1014 1558C1010 1556 1006 1553 1003 1552C1000 1550 996 1547 992 1545C989 1543 983 1540 980 1537C976 1534 971 1532 969 1530C967 1530 962 1526 958 1524C953 1521 945 1516 940 1512C934 1509 926 1504 920 1500C916 1497 909 1493 906 1491C888 1481 881 1476 876 1474C870 1470 850 1457 840 1451C828 1444 820 1441 813 1441C805 1442 794 1448 788 1454C779 1463 780 1454 779 1564L778 1660L776 1668C766 1695 742 1709 713 1704Z" />
            </svg>
            NeuroAcervo
          </div>
          <p className="npm-art-kick">Para quem faz avaliação</p>
          <p className="npm-art-title">Cansou de caçar <em>escalas</em> na internet?</p>
          <ul className="npm-pains">
            <li><i>×</i><s>Versões incompletas</s></li>
            <li><i>×</i><s>Arquivos sem fonte</s></li>
            <li><i>×</i><s>Links quebrados</s></li>
          </ul>
          <div className="npm-art-foot">
            <b>Separei as escalas imprescindíveis.</b>
            <em>E são um presente pra você.</em>
          </div>
        </aside>

        {/* Painel direito */}
        <div className="npm-body">
          <button 
            className="npm-close" 
            type="button" 
            aria-label="Fechar" 
            onClick={handleClose}
            data-npm-close
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18"/>
            </svg>
          </button>

          <p className="npm-kick">5 escalas · grátis</p>
          <h2 className="npm-title" id="npm-title">
            Receba as escalas no seu <em>e-mail</em>.
          </h2>
          <p className="npm-lead">
            Folhas de aplicação em PDF, prontas para imprimir. Deixe seu e-mail e eu envio agora.
          </p>

          <ul className="npm-list">
            <li><b>AQ-10</b><span>Autismo · adultos</span></li>
            <li><b>ASRS-18</b><span>TDAH · adultos</span></li>
            <li><b>GAD-7</b><span>Ansiedade · adultos</span></li>
            <li><b>SCARED</b><span>Ansiedade · <em className="k">crianças</em></span></li>
            <li><b>SCARED</b><span>Ansiedade · <em className="k">pais</em></span></li>
          </ul>

          <form className="npm-form" id="npm-form" onSubmit={handleSubmit} noValidate>
            {errorMessage && (
              <div className="npm-error" role="alert">
                {errorMessage}
              </div>
            )}

            <div className="npm-field">
              <label className="npm-label" htmlFor="npm-nome">
                Nome <span>(opcional)</span>
              </label>
              <input 
                className="npm-input" 
                id="npm-nome" 
                name="nome" 
                type="text" 
                autoComplete="given-name" 
                placeholder="Como posso te chamar?"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="npm-field">
              <label className="npm-label" htmlFor="npm-email">E-mail</label>
              <input 
                ref={emailInputRef}
                className="npm-input" 
                id="npm-email" 
                name="email" 
                type="email" 
                autoComplete="email" 
                inputMode="email" 
                required 
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <label className="npm-consent">
              <input 
                type="checkbox" 
                name="consentimento" 
                checked={consentimento}
                onChange={(e) => setConsentimento(e.target.checked)}
                required 
              />
              <span>
                Aceito receber o presente e conteúdos da NeuroAcervo por e-mail. Posso cancelar quando quiser.{' '}
                <Link href="/termos" target="_blank" rel="noopener noreferrer">Termos</Link> e{' '}
                <Link href="/privacidade" target="_blank" rel="noopener noreferrer">privacidade</Link>.
              </span>
            </label>

            <div className="npm-hp" aria-hidden="true">
              <input 
                tabIndex={-1} 
                autoComplete="off" 
                name="empresa" 
                value={honeypot} 
                onChange={(e) => setHoneypot(e.target.value)} 
              />
            </div>

            <button className="npm-btn" type="submit" disabled={isLoading}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="8" width="18" height="13" rx="2"/>
                <path d="M12 8v13M3 12h18M12 8c-1.5-3-5-4-5-1.5S10 8 12 8zm0 0c1.5-3 5-4 5-1.5S14 8 12 8z"/>
              </svg>
              {isLoading ? 'Enviando…' : 'Enviar meu presente'}
            </button>
          </form>

          {/* ===== Sucesso ===== */}
          <div className="npm-success" role="status">
            <div className="npm-ok">
              <svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg>
            </div>
            <h2>Presente a <em>caminho</em>.</h2>
            <p>
              Enviei as 5 escalas para <strong id="npm-sent">{email}</strong>. Se não aparecer em alguns minutos, confira o spam ou a aba promoções.
            </p>
            <a 
              className="npm-ghost" 
              href="#planos" 
              data-npm-close
              onClick={() => {
                handleClose();
                const el = document.getElementById('planos');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Conhecer o acervo completo →
            </a>
          </div>

          <p className="npm-foot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="10" rx="2"/>
              <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
            </svg>
            <span>Correção e interpretação no acervo completo, <b style={{ whiteSpace: 'nowrap' }}>a partir de R$ 24,90/mês</b>.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
