'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNeuro } from '@/context/NeuroContext';
import './planos.css';

type PlanoKey = 'consulta' | 'estudo' | 'pratica';
type CicloKey = 'mensal' | 'anual';

const PRECOS = {
  consulta: { mensal: { valor: '19,90', per: '/mês', priceKey: 'price_consulta_mensal' } },
  estudo:   { mensal: { valor: '39,90', per: '/mês', priceKey: 'price_estudo_mensal' } },
  pratica:  { mensal: { valor: '49,90', per: '/mês', priceKey: 'price_pratica_mensal' },
              anual:  { valor: '399',   per: '/ano', priceKey: 'price_pratica_anual' } }
};

const NOMES: Record<PlanoKey, string> = {
  consulta: 'Consulta',
  estudo: 'Estudo',
  pratica: 'Prática'
};

function PlanosInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isLoadingUser, logout } = useNeuro();

  const paramPlano = (searchParams.get('plano') || '').toLowerCase();
  const paramCiclo = (searchParams.get('ciclo') || '').toLowerCase();

  const [plano, setPlano] = useState<PlanoKey>('consulta');
  const [ciclo, setCiclo] = useState<CicloKey>('mensal');
  const [loading, setLoading] = useState(false);
  const [popAnim, setPopAnim] = useState(false);

  // Inicializa com plano vindo da rota ou perfil
  useEffect(() => {
    if (paramPlano.includes('pratica')) setPlano('pratica');
    else if (paramPlano.includes('estudo')) setPlano('estudo');
    else if (paramPlano.includes('consulta')) setPlano('consulta');
    else if (currentUser?.plan) {
      const p = currentUser.plan.toLowerCase();
      if (p.includes('pratica')) setPlano('pratica');
      else if (p.includes('estudo')) setPlano('estudo');
      else if (p.includes('consulta')) setPlano('consulta');
    }

    if (paramCiclo === 'anual') {
      setCiclo('anual');
      setPlano('pratica');
    }
  }, [paramPlano, paramCiclo, currentUser]);

  // Se não estiver logado, redireciona para entrar. Se já for ativo ou admin, vai para plataforma.
  useEffect(() => {
    if (!isLoadingUser) {
      if (!currentUser) {
        router.push('/entrar');
      } else if (currentUser.role === 'admin' || currentUser.subscriptionStatus === 'active') {
        router.push('/plataforma');
      }
    }
  }, [isLoadingUser, currentUser, router]);

  const handleSelectPlano = (p: PlanoKey) => {
    setPlano(p);
    setPopAnim(true);
    setTimeout(() => setPopAnim(false), 350);
  };

  const handleSelectCiclo = (c: CicloKey) => {
    setCiclo(c);
    if (c === 'anual') {
      setPlano('pratica');
    }
    setPopAnim(true);
    setTimeout(() => setPopAnim(false), 350);
  };

  const handleCheckout = async () => {
    if (!currentUser || loading) return;

    setLoading(true);

    try {
      // Ciclo efetivo: somente Prática possui plano anual
      const cicloEfetivo = ciclo === 'anual' && plano === 'pratica' ? 'anual' : 'mensal';

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userEmail: currentUser.email,
          planKey: plano,
          billingCycle: cicloEfetivo
        })
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      alert(data?.error || 'Não foi possível iniciar o checkout.');
    } catch (err: unknown) {
      console.error('Erro ao redirecionar para o Stripe:', err);
      alert('Erro de conexão ao abrir a Stripe. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSair = async () => {
    await logout();
    router.push('/entrar');
  };

  const isAnual = ciclo === 'anual';
  const emailExibido = currentUser?.email || 'carregando...';
  const inicial = (currentUser?.name?.[0] || currentUser?.email?.[0] || 'A').toUpperCase();

  // Dados de preço do plano atual para o resumo
  const cicloAtual = isAnual && plano === 'pratica' ? 'anual' : 'mensal';
  const dadosPrecoAtual = cicloAtual === 'anual' && plano === 'pratica' 
    ? PRECOS.pratica.anual 
    : PRECOS[plano].mensal;

  return (
    <div className="planos-body-wrap">
      {/* Símbolo do logotipo SVG */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <symbol id="logo" viewBox="0 0 1344 1728">
          <path
            fill="currentColor"
            d="M713 1704C707 1702 696 1697 685 1690C682 1688 678 1685 674 1683C671 1681 665 1678 662 1675C658 1672 653 1670 651 1668C649 1668 644 1664 640 1662C635 1659 627 1654 622 1650C616 1647 608 1642 602 1638C598 1635 591 1631 588 1629C570 1619 563 1614 558 1612C553 1608 530 1593 515 1584C486 1567 479 1563 478 1562C477 1561 474 1559 470 1557C467 1555 461 1552 458 1549C454 1546 449 1544 447 1542C445 1542 440 1538 436 1536C431 1533 423 1528 418 1524C412 1521 403 1516 398 1512C394 1509 387 1505 384 1503C367 1493 359 1488 354 1486C348 1481 335 1473 318 1462C309 1458 296 1450 289 1445C282 1440 271 1434 265 1430C260 1427 253 1423 251 1421C248 1420 245 1418 243 1416C241 1416 236 1412 232 1410C227 1407 219 1402 214 1398C208 1395 199 1390 194 1386C190 1383 183 1379 180 1377C162 1367 155 1362 150 1360C144 1355 122 1342 111 1335C102 1330 85 1319 74 1312C71 1310 65 1306 62 1305C51 1299 40 1290 35 1284C33 1281 30 1275 28 1271L24 1264L24 666C24 123 24 69 26 64C30 49 40 37 54 30C59 28 65 26 68 25C75 23 87 24 94 27C100 30 117 39 129 47C134 50 139 54 141 54C143 55 150 60 156 64C162 68 170 73 173 74C184 82 228 110 240 117C247 121 257 128 264 132C270 136 281 143 288 147C294 151 301 156 304 157C306 158 313 163 320 167C326 171 332 175 334 176C345 183 363 194 372 200C378 204 386 209 390 212C395 214 400 218 402 219C404 220 408 223 412 225C415 227 422 231 428 235C453 251 462 257 466 259C468 260 475 265 481 269C507 285 511 288 518 290C527 294 533 294 544 289C553 285 559 279 562 272L564 266L565 168L566 68L568 61C572 51 574 47 583 38C589 33 592 31 599 28C607 25 608 24 619 25C632 25 638 26 648 33C651 35 657 39 661 41C672 48 687 57 698 64C703 68 709 72 711 72C713 73 720 78 726 82C732 86 740 91 743 92C763 105 799 128 805 132C809 134 816 139 820 142C831 148 842 155 858 165C864 169 871 174 873 174C875 175 882 180 888 184C894 188 902 193 904 194C910 198 929 210 940 216C944 219 951 224 956 226C960 229 966 233 970 236C985 245 1000 255 1008 259C1013 262 1018 266 1020 267C1022 268 1027 272 1031 274C1035 276 1044 282 1050 286C1057 290 1066 296 1071 299C1076 302 1088 310 1096 315C1105 321 1114 326 1117 328C1133 338 1139 342 1150 349C1156 353 1165 358 1170 361C1175 364 1180 367 1182 369C1183 370 1189 374 1195 377C1207 384 1219 392 1233 401C1238 404 1249 411 1257 416C1265 421 1274 427 1276 428C1279 430 1284 433 1288 435C1303 445 1310 453 1316 466L1320 474L1320 1069L1320 1664L1316 1672C1306 1695 1285 1707 1260 1704C1252 1704 1242 1699 1225 1689C1218 1684 1207 1678 1201 1674C1196 1670 1187 1665 1182 1662C1177 1659 1169 1654 1165 1652C1160 1649 1153 1644 1148 1641C1143 1638 1137 1634 1134 1633C1126 1628 1114 1620 1103 1613C1098 1610 1089 1605 1084 1602C1079 1598 1069 1592 1063 1588C1056 1584 1046 1578 1041 1575C1035 1572 1028 1567 1025 1565C1022 1563 1017 1560 1014 1558C1010 1556 1006 1553 1003 1552C1000 1550 996 1547 992 1545C989 1543 983 1540 980 1537C976 1534 971 1532 969 1530C967 1530 962 1526 958 1524C953 1521 945 1516 940 1512C934 1509 926 1504 920 1500C916 1497 909 1493 906 1491C888 1481 881 1476 876 1474C870 1470 850 1457 840 1451C828 1444 820 1441 813 1441C805 1442 794 1448 788 1454C779 1463 780 1454 779 1564L778 1660L776 1668C766 1695 742 1709 713 1704Z"
          />
        </symbol>
      </svg>

      {/* Topo */}
      <header className="top">
        <div className="in">
          <Link className="marca" href="/">
            <svg aria-hidden="true">
              <use href="#logo" />
            </svg>
            NeuroAcervo
          </Link>
          <div className="user">
            <div className="who" title="Logado como">
              <i id="ini">{inicial}</i>
              <span id="email">{emailExibido}</span>
            </div>
            <button className="sair" type="button" onClick={handleSair} id="sair">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="planos-main-content">
        <div className="hd">
          <div className="kick">Escolha seu plano</div>
          <h1>
            Monte o seu <em>acervo</em>.
          </h1>
          <p>
            Guias práticos de aplicação, modelos de laudo, roteiros de anamnese e aulas fundamentadas para a sua rotina em avaliação.
          </p>
        </div>

        {/* Alternador de Ciclo */}
        <div className="ciclo-wrap">
          <div className="ciclo" id="ciclo" data-ciclo={ciclo} role="group" aria-label="Ciclo de cobrança">
            <span className="thumb"></span>
            <button
              type="button"
              data-v="mensal"
              aria-pressed={ciclo === 'mensal'}
              onClick={() => handleSelectCiclo('mensal')}
            >
              Mensal
            </button>
            <button
              type="button"
              data-v="anual"
              aria-pressed={ciclo === 'anual'}
              onClick={() => handleSelectCiclo('anual')}
            >
              Anual <span className="eco">Prática −33%</span>
            </button>
          </div>
        </div>

        {/* Cards dos Planos */}
        <div className="planos" role="radiogroup" aria-label="Planos">
          {/* CONSULTA */}
          <div
            className="plano"
            tabIndex={0}
            role="radio"
            aria-checked={plano === 'consulta'}
            data-plano="consulta"
            onClick={() => handleSelectPlano('consulta')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectPlano('consulta');
              }
            }}
          >
            <span className="ic" style={{ background: '#9c3f33' }}>
              <svg viewBox="0 0 24 24">
                <path d="M7 3h7l5 5v13H7z" />
                <path d="M14 3v5h5M10 13h6M10 17h4" />
              </svg>
            </span>
            <span className="nome">Consulta</span>
            <span className="desc">Para quem quer os materiais de consulta para baixar e usar.</span>
            <span className="preco">
              <span className="valor">
                <small>R$</small>
                <b>19,90</b>
                <span>/mês</span>
              </span>
              <span className="nota">
                {isAnual ? 'Disponível apenas no plano mensal.' : ''}
              </span>
            </span>
            <ul className="inc">
              <li>Guias rápidos de aplicação e interpretação</li>
              <li>Modelos de laudo e roteiros de anamnese</li>
              <li>Compêndios de estudo e instrumentos</li>
            </ul>
            <span className="escolha">
              <span className="radio"></span>
              <span className="lbl">{plano === 'consulta' ? 'Plano selecionado' : 'Selecionar'}</span>
            </span>
          </div>

          {/* ESTUDO */}
          <div
            className="plano"
            tabIndex={0}
            role="radio"
            aria-checked={plano === 'estudo'}
            data-plano="estudo"
            onClick={() => handleSelectPlano('estudo')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectPlano('estudo');
              }
            }}
          >
            <span className="ic" style={{ background: '#2f6b31' }}>
              <svg viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="13" rx="2" />
                <path d="m10 9 5 2.5-5 2.5z" />
                <path d="M8 21h8" />
              </svg>
            </span>
            <span className="nome">Estudo</span>
            <span className="desc">Para quem quer os materiais e as aulas gravadas em módulos.</span>
            <span className="preco">
              <span className="valor">
                <small>R$</small>
                <b>39,90</b>
                <span>/mês</span>
              </span>
              <span className="nota">
                {isAnual ? 'Disponível apenas no plano mensal.' : ''}
              </span>
            </span>
            <ul className="inc">
              <li className="base">Tudo do Consulta, mais:</li>
              <li>Aulas gravadas em módulos, com progresso salvo</li>
            </ul>
            <span className="escolha">
              <span className="radio"></span>
              <span className="lbl">{plano === 'estudo' ? 'Plano selecionado' : 'Selecionar'}</span>
            </span>
          </div>

          {/* PRÁTICA */}
          <div
            className="plano escuro"
            tabIndex={0}
            role="radio"
            aria-checked={plano === 'pratica'}
            data-plano="pratica"
            onClick={() => handleSelectPlano('pratica')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectPlano('pratica');
              }
            }}
          >
            <span className="tape"></span>
            <span className="selo">
              <span>
                Mais<br />completo
              </span>
            </span>
            <span className="ic">
              <svg viewBox="0 0 24 24">
                <rect x="4" y="4" width="11" height="15" rx="2" />
                <path d="M9 8h10a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9" />
              </svg>
            </span>
            <span className="nome">Prática</span>
            <span className="desc">Para quem avalia e quer, além do estudo, ferramentas para usar na sessão.</span>
            <span className="preco">
              <span className="valor">
                <small>R$</small>
                <b id="pPratica">{isAnual ? '399' : '49,90'}</b>
                <span id="pPer">{isAnual ? '/ano' : '/mês'}</span>
              </span>
              <span className="nota" id="nPratica">
                {isAnual ? (
                  <>Equivale a R$ 33,25/mês · <s>R$ 598,80</s> no mensal</>
                ) : (
                  'Ou R$ 399/ano no plano anual.'
                )}
              </span>
            </span>
            <ul className="inc">
              <li className="base">Tudo do Estudo, mais:</li>
              <li>Baralhos interativos para usar online</li>
              <li>Histórias temáticas e demais recursos online</li>
              <li>Novos recursos interativos todo mês</li>
              <li>Acesso antecipado a lançamentos</li>
            </ul>
            <span className="escolha">
              <span className="radio"></span>
              <span className="lbl">{plano === 'pratica' ? 'Plano selecionado' : 'Selecionar'}</span>
            </span>
          </div>
        </div>

        {/* Garantias */}
        <div className="garantias">
          <div className="g">
            <i>
              <svg viewBox="0 0 24 24">
                <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </i>
            <div>
              <b>Pagamento seguro</b>
              <span>Processado pela Stripe, com criptografia.</span>
            </div>
          </div>
          <div className="g">
            <i>
              <svg viewBox="0 0 24 24">
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </i>
            <div>
              <b>7 dias para desistir</b>
              <span>Reembolso integral, conforme o Código de Defesa do Consumidor.</span>
            </div>
          </div>
          <div className="g">
            <i>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            </i>
            <div>
              <b>Cancele quando quiser</b>
              <span>Sem multa. O acesso segue até o fim do período pago.</span>
            </div>
          </div>
        </div>

        <p className="pub">Para estudantes, psicólogos e neuropsicólogos</p>
        <p className="leg">
          Ao assinar, você concorda com os <Link href="/termos">Termos de Uso</Link> e a{' '}
          <Link href="/termos#privacidade">Política de Privacidade</Link>.
        </p>
      </main>

      {/* Barra de Checkout Fixa */}
      <div className="bar">
        <div className="in">
          <div className="resumo">
            <small>Seu plano</small>
            <b id="resumo" className={popAnim ? 'pop' : ''}>
              {NOMES[plano]} · <em>R$ {dadosPrecoAtual.valor}{dadosPrecoAtual.per}</em>
              {cicloAtual === 'anual' ? ' · anual' : ''}
            </b>
          </div>
          <button
            className="assinar"
            type="button"
            id="assinar"
            onClick={handleCheckout}
            disabled={loading}
          >
            <span>
              {loading ? (
                'Abrindo Stripe...'
              ) : (
                <>
                  Assinar<span className="txt-l"> agora</span>
                </>
              )}
            </span>
            <i>→</i>
          </button>
        </div>
        <div className="lock">
          <svg viewBox="0 0 24 24">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          Pagamento 100% seguro via Stripe
        </div>
      </div>
    </div>
  );
}

export default function PlanosPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#efe7d2' }}>
          <p style={{ color: '#5a5448', fontSize: '15px' }}>Carregando opções de planos...</p>
        </div>
      }
    >
      <PlanosInner />
    </Suspense>
  );
}
