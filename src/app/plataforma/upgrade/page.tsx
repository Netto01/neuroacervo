'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNeuro } from '@/context/NeuroContext';
import { resolveUserPlan } from '@/utils/userPlan';
import s from './upgrade.module.css';

const cx = (...names: (string | false | null | undefined)[]) =>
  names.filter(Boolean).map(n => s[n as string] || '').join(' ');

type PlanoKey = 'consulta' | 'estudo' | 'pratica';
type CicloKey = 'mensal' | 'anual';

interface PlanoItem {
  id: PlanoKey;
  nome: string;
  tipo: string;
  cor: string;
  mensal: number;
  anual?: number;
  icone: React.ReactNode;
  desc: string;
  base: string | null;
  itens: string[];
}

const PLANOS: PlanoItem[] = [
  {
    id: 'consulta',
    nome: 'Consulta',
    tipo: 'Leitura',
    cor: '#9c3f33',
    mensal: 19.9,
    icone: (
      <>
        <path d="M7 3h7l5 5v13H7z" />
        <path d="M14 3v5h5M10 13h6M10 17h4" />
      </>
    ),
    desc: 'Para quem quer os materiais clínicos de consulta para baixar e usar no dia a dia.',
    base: null,
    itens: [
      '<b>Guias rápidos</b> de aplicação e interpretação',
      '<b>Modelos de laudo</b> e roteiros de anamnese',
      '<b>Compêndios</b> de estudo e instrumentos'
    ]
  },
  {
    id: 'estudo',
    nome: 'Estudo',
    tipo: 'Aulas',
    cor: '#2f6b31',
    mensal: 39.9,
    icone: (
      <>
        <rect x="3" y="5" width="18" height="13" rx="2" />
        <path d="m10 9 5 2.5-5 2.5z" />
        <path d="M8 21h8" />
      </>
    ),
    desc: 'Para quem quer os materiais e as aulas gravadas em módulos, com raciocínio clínico.',
    base: 'Tudo do Consulta, mais:',
    itens: [
      '<b>Aulas gravadas em módulos</b> com raciocínio diagnóstico',
      'Progresso salvo e <b>estudos de caso</b> clínicos'
    ]
  },
  {
    id: 'pratica',
    nome: 'Prática',
    tipo: 'Clínico',
    cor: '#15140f',
    mensal: 49.9,
    anual: 399,
    icone: (
      <>
        <rect x="4" y="4" width="11" height="15" rx="2" />
        <path d="M9 8h10a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9" />
      </>
    ),
    desc: 'Para quem avalia e quer ferramentas digitais para usar em sessão com o paciente.',
    base: 'Tudo do Estudo, mais:',
    itens: [
      '<b>Baralho de Funções Executivas</b> interativo',
      '<b>Histórias Temáticas</b> ilustradas (infantil e adulto)',
      '<b>Cronômetro Clínico</b> com contagem de erros',
      'Novas ferramentas práticas <b>todo mês</b>'
    ]
  }
];

const COMP: [string, number, number, number][] = [
  ['Guias rápidos de aplicação e interpretação', 1, 1, 1],
  ['Modelos de laudo e roteiros de anamnese', 1, 1, 1],
  ['Compêndios de estudo e instrumentos', 1, 1, 1],
  ['Aulas gravadas em módulos', 0, 1, 1],
  ['Estudos de caso clínicos', 0, 1, 1],
  ['Baralho de Funções Executivas', 0, 0, 1],
  ['Histórias Temáticas ilustradas', 0, 0, 1],
  ['Cronômetro Clínico', 0, 0, 1],
  ['Novas ferramentas todo mês', 0, 0, 1]
];

function brl(v: number): string {
  return v.toFixed(2).replace('.', ',');
}

function UpgradeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isLoadingUser, logout, materials, modules, favorites } = useNeuro();

  const paramCiclo = (searchParams.get('ciclo') || '').toLowerCase();
  const [ciclo, setCiclo] = useState<CicloKey>(paramCiclo === 'anual' ? 'anual' : 'mensal');
  const [loadingPlan, setLoadingPlan] = useState<PlanoKey | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hoje, setHoje] = useState('');

  // Identificação do plano atual
  const planInfo = resolveUserPlan(currentUser);

  const planoAtualId: PlanoKey = useMemo(() => {
    if (planInfo.nivel >= 3) return 'pratica';
    if (planInfo.nivel === 2) return 'estudo';
    return 'consulta';
  }, [planInfo.nivel]);

  const idxAtual = useMemo(() => {
    return PLANOS.findIndex(p => p.id === planoAtualId);
  }, [planoAtualId]);

  const planoAtualObj = PLANOS[idxAtual] || PLANOS[0];

  useEffect(() => {
    try {
      setHoje(new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }));
    } catch {
      setHoje('');
    }
  }, []);

  // Proteção de rota para usuário deslogado
  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      router.push('/entrar');
    }
  }, [isLoadingUser, currentUser, router]);

  const handleUpgrade = async (targetPlanKey: PlanoKey, targetCiclo: CicloKey) => {
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
          billingCycle: targetPlanKey === 'pratica' ? targetCiclo : 'mensal'
        })
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg(data?.error || 'Não foi possível gerar a sessão de checkout. Tente novamente.');
        setLoadingPlan(null);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e?.message || 'Falha de comunicação com o Stripe. Tente novamente em instantes.');
      setLoadingPlan(null);
    }
  };

  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  return (
    <div className={cx('upgrade-body')}>
      {/* Símbolo do Logo NeuroAcervo */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <symbol id="logo" viewBox="0 0 1344 1728">
          <path
            fill="currentColor"
            d="M713 1704C707 1702 696 1697 685 1690C682 1688 678 1685 674 1683C671 1681 665 1678 662 1675C658 1672 653 1670 651 1668C649 1668 644 1664 640 1662C635 1659 627 1654 622 1650C616 1647 608 1642 602 1638C598 1635 591 1631 588 1629C570 1619 563 1614 558 1612C553 1608 530 1593 515 1584C486 1567 479 1563 478 1562C477 1561 474 1559 470 1557C467 1555 461 1552 458 1549C454 1546 449 1544 447 1542C445 1542 440 1538 436 1536C431 1533 423 1528 418 1524C412 1521 403 1516 398 1512C394 1509 387 1505 384 1503C367 1493 359 1488 354 1486C348 1481 335 1473 318 1462C309 1458 296 1450 289 1445C282 1440 271 1434 265 1430C260 1427 253 1423 251 1421C248 1420 245 1418 243 1416C241 1416 236 1412 232 1410C227 1407 219 1402 214 1398C208 1395 199 1390 194 1386C190 1383 183 1379 180 1377C162 1367 155 1362 150 1360C144 1355 122 1342 111 1335C102 1330 85 1319 74 1312C71 1310 65 1306 62 1305C51 1299 40 1290 35 1284C33 1281 30 1275 28 1271L24 1264L24 666C24 123 24 69 26 64C30 49 40 37 54 30C59 28 65 26 68 25C75 23 87 24 94 27C100 30 117 39 129 47C134 50 139 54 141 54C143 55 150 60 156 64C162 68 170 73 173 74C184 82 228 110 240 117C247 121 257 128 264 132C270 136 281 143 288 147C294 151 301 156 304 157C306 158 313 163 320 167C326 171 332 175 334 176C345 183 363 194 372 200C378 204 386 209 390 212C395 214 400 218 402 219C404 220 408 223 412 225C415 227 422 231 428 235C453 251 462 257 466 259C468 260 475 265 481 269C507 285 511 288 518 290C527 294 533 294 544 289C553 285 559 279 562 272L564 266L565 168L566 68L568 61C572 51 574 47 583 38C589 33 592 31 599 28C607 25 608 24 619 25C632 25 638 26 648 33C651 35 657 39 661 41C672 48 687 57 698 64C703 68 709 72 711 72C713 73 720 78 726 82C732 86 740 91 743 92C763 105 799 128 805 132C809 134 816 139 820 142C831 148 842 155 858 165C864 169 871 174 873 174C875 175 882 180 888 184C894 188 902 193 904 194C910 198 929 210 940 216C944 219 951 224 956 226C960 229 966 233 970 236C985 245 1000 255 1008 259C1013 262 1018 266 1020 267C1022 268 1027 272 1031 274C1035 276 1044 282 1050 286C1057 290 1066 296 1071 299C1076 302 1088 310 1096 315C1105 321 1114 326 1117 328C1133 338 1139 342 1150 349C1156 353 1165 358 1170 361C1175 364 1180 367 1182 369C1183 370 1189 374 1195 377C1207 384 1219 392 1233 401C1238 404 1249 411 1257 416C1265 421 1274 427 1276 428C1279 430 1284 433 1288 435C1303 445 1310 453 1316 466L1320 474L1320 1069L1320 1664L1316 1672C1306 1695 1285 1707 1260 1704C1252 1704 1242 1699 1225 1689C1218 1684 1207 1678 1201 1674C1196 1670 1187 1665 1182 1662C1177 1659 1169 1654 1165 1652C1160 1649 1153 1644 1148 1641C1143 1638 1137 1634 1134 1633C1126 1628 1114 1620 1103 1613C1098 1610 1089 1605 1084 1602C1079 1598 1069 1592 1063 1588C1056 1584 1046 1578 1041 1575C1035 1572 1028 1567 1025 1565C1022 1563 1017 1560 1014 1558C1010 1556 1006 1553 1003 1552C1000 1550 996 1547 992 1545C989 1543 983 1540 980 1537C976 1534 971 1532 969 1530C967 1530 962 1526 958 1524C953 1521 945 1516 940 1512C934 1509 926 1504 920 1500C916 1497 909 1493 906 1491C888 1481 881 1476 876 1474C870 1470 850 1457 840 1451C828 1444 820 1441 813 1441C805 1442 794 1448 788 1454C779 1463 780 1454 779 1564L778 1660L776 1668C766 1695 742 1709 713 1704Z"
          />
        </symbol>
      </svg>

      <div className={cx('app')}>
        {/* ===== BARRA LATERAL ===== */}
        <aside>
          <Link className={cx('marca')} href="/plataforma">
            <svg aria-hidden="true"><use href="#logo" /></svg>
            NeuroAcervo
          </Link>

          <div className={cx('grp')}>Acervo</div>
          <nav className={cx('nav')}>
            <Link href="/plataforma">
              <svg viewBox="0 0 24 24"><path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>
              Início
            </Link>
            <Link href="/biblioteca">
              <svg viewBox="0 0 24 24"><path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" /></svg>
              Biblioteca
              <span className={cx('ct')}>{materials.length}</span>
            </Link>
            <Link href="/aulas" className={planInfo.hasAulas ? '' : s.lock}>
              {planInfo.hasAulas ? (
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M10 8.5v7l6-3.5z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
              )}
              Aulas
              {!planInfo.hasAulas ? (
                <span className={cx('tag')}>Estudo</span>
              ) : (
                <span className={cx('ct')}>{totalLessons}</span>
              )}
            </Link>
            <Link href="/recursos-interativos" className={planInfo.hasRecursos ? '' : s.lock}>
              {planInfo.hasRecursos ? (
                <svg viewBox="0 0 24 24"><rect x="7" y="4" width="13" height="16" rx="2" /><path d="M4 7v11a2 2 0 0 0 2 2" /></svg>
              ) : (
                <svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
              )}
              Recursos interativos
              {!planInfo.hasRecursos ? (
                <span className={cx('tag')}>Prática</span>
              ) : (
                <span className={cx('tag')}>Novo</span>
              )}
            </Link>
            <Link href="/minha-pasta">
              <svg viewBox="0 0 24 24"><path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /></svg>
              Minha pasta
              <span className={cx('ct')}>{favorites.length}</span>
            </Link>
          </nav>

          <div className={cx('grp')}>Atalhos clínicos</div>
          <nav className={cx('nav')}>
            <Link href="/guias">
              <svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>
              Guias rápidos
            </Link>
            <Link href="/laudos">
              <svg viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h4" /></svg>
              Modelos de laudo
            </Link>
            <Link href="/anamnese">
              <svg viewBox="0 0 24 24"><path d="M4 5h12v9H8l-4 3z" /><path d="M16 9h4v9l-3-2h-6v-2" /></svg>
              Anamnese
            </Link>
            <Link href="/compendios">
              <svg viewBox="0 0 24 24"><path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" /></svg>
              Compêndios
            </Link>
          </nav>

          <div className={cx('side-plano')}>
            <small>Seu plano</small>
            <b id="sideNome">
              {planoAtualObj.nome} <em>· R$ {brl(planoAtualObj.mensal)}/mês</em>
            </b>
            <div className={cx('bar')}>
              <i style={{ width: `${((idxAtual + 1) / 3) * 100}%` }}></i>
            </div>
            <p>{idxAtual + 1} de 3 níveis do acervo liberados</p>
          </div>

          <div className={cx('eu')}>
            <span className={cx('av')}>
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
            </span>
            <div>
              <b title={currentUser?.name || currentUser?.email || 'Assinante'}>
                {currentUser?.name || currentUser?.email || 'Assinante'}
              </b>
              <span>
                {currentUser?.crp
                  ? currentUser.crp.toUpperCase().startsWith('CRP')
                    ? currentUser.crp
                    : `CRP ${currentUser.crp}`
                  : currentUser?.email || ''}
              </span>
            </div>
            <button
              type="button"
              aria-label="Sair"
              onClick={async () => {
                await logout();
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </aside>

        {/* ===== CONTEÚDO PRINCIPAL ===== */}
        <div className={cx('main')}>
          {/* TOPO */}
          <div className={cx('topbar')}>
            <div className={cx('busca')}>
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
              <span>Buscar teste, função ou tema</span>
              <kbd>/</kbd>
            </div>
            <span className={cx('data')}>{hoje}</span>
            <span className={cx('sino')}>
              <svg viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0" /></svg>
            </span>
          </div>

          <div className={cx('wrap')}>
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

            {/* HEADER */}
            <div className={cx('hd')}>
              <div>
                <div className={cx('kick')}>Assinatura</div>
                <h1>
                  {idxAtual === 2 ? (
                    <>Você está no <em>Prática</em>.<br />O acervo completo é seu.</>
                  ) : (
                    <>Você está no <em>{planoAtualObj.nome}</em>.<br />Vá além quando quiser.</>
                  )}
                </h1>
                <p>
                  Faça upgrade a qualquer momento para liberar aulas gravadas, recursos interativos e ferramentas para usar em sessão.
                </p>
              </div>

              {/* Alternador de Ciclo */}
              <div className={cx('ciclo')} data-ciclo={ciclo} role="group" aria-label="Ciclo de cobrança">
                <span className={cx('thumb')}></span>
                <button
                  type="button"
                  data-v="mensal"
                  aria-pressed={ciclo === 'mensal'}
                  onClick={() => setCiclo('mensal')}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  data-v="anual"
                  aria-pressed={ciclo === 'anual'}
                  onClick={() => setCiclo('anual')}
                >
                  Anual <span className={cx('eco')}>Prática −33%</span>
                </button>
              </div>
            </div>

            {/* TRILHA */}
            <div className={cx('trilha')} aria-label="Seu nível no acervo">
              {PLANOS.map((p, i) => {
                const feito = i <= idxAtual;
                const aqui = i === idxAtual;

                return (
                  <React.Fragment key={p.id}>
                    <div className={cx('etapa', feito && 'feito', aqui && 'aqui')}>
                      <i>{feito ? '✓' : i + 1}</i>
                      <div>
                        {p.nome}
                        <small>{aqui ? 'Você está aqui' : i < idxAtual ? 'Incluído' : 'Bloqueado'}</small>
                      </div>
                    </div>
                    {i < PLANOS.length - 1 && (
                      <span className={cx('linha', i < idxAtual && 'feito')}></span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* CARTÕES DE PLANOS */}
            <div className={cx('planos')}>
              {PLANOS.map((p, i) => {
                const escuro = p.id === 'pratica';
                const eAtual = i === idxAtual;
                const inferior = i < idxAtual;
                const usaAnual = ciclo === 'anual' && Boolean(p.anual) && !eAtual;
                const valor = usaAnual ? String(p.anual) : brl(p.mensal);
                const per = usaAnual ? '/ano' : '/mês';

                let dif = '';
                if (i > idxAtual) {
                  dif = usaAnual
                    ? `Equivale a R$ ${brl((p.anual || 0) / 12)}/mês`
                    : `+ R$ ${brl(p.mensal - planoAtualObj.mensal)}/mês em relação ao seu plano`;
                }
                if (ciclo === 'anual' && !p.anual && i > idxAtual) {
                  dif += (dif ? ' · ' : '') + 'só mensal';
                }

                let cardCls = 'plano';
                if (escuro) cardCls += ' escuro';
                if (eAtual) cardCls += ' atual';

                return (
                  <div key={p.id} className={cx(...cardCls.split(' '))}>
                    {eAtual && <span className={cx('carimbo')}>Seu plano atual</span>}
                    {escuro && !eAtual && (
                      <>
                        <span className={cx('tape')}></span>
                        <span className={cx('selo')}>
                          <span>Mais<br />completo</span>
                        </span>
                      </>
                    )}

                    <div className={cx('cab')}>
                      <span className={cx('ic')} style={{ background: p.cor }}>
                        <svg viewBox="0 0 24 24">{p.icone}</svg>
                      </span>
                      <div>
                        <span className={cx('nome')}>{p.nome}</span>
                        <span className={cx('tipo')}>{p.tipo}</span>
                      </div>
                    </div>

                    <p className={cx('desc')}>{p.desc}</p>

                    <div className={cx('preco')}>
                      <div className={cx('valor')}>
                        <small>R$</small>
                        <b>{valor}</b>
                        <span>{per}</span>
                      </div>
                      <span className={cx('dif')}>{dif}</span>
                    </div>

                    <ul className={cx('inc')}>
                      {p.base && <li className={cx('base')}>{p.base}</li>}
                      {p.itens.map((it, idx) => (
                        <li
                          key={idx}
                          className={i > idxAtual ? s.novo : ''}
                          dangerouslySetInnerHTML={{ __html: `<span>${it}</span>` }}
                        />
                      ))}
                    </ul>

                    {eAtual ? (
                      <button className={cx('cta', 'inativo')} type="button" disabled>
                        Plano ativo
                      </button>
                    ) : inferior ? (
                      <button className={cx('cta', 'inativo')} type="button" disabled>
                        Incluído no seu plano
                      </button>
                    ) : (
                      <button
                        className={cx('cta')}
                        type="button"
                        disabled={Boolean(loadingPlan)}
                        onClick={() => handleUpgrade(p.id, usaAnual ? 'anual' : 'mensal')}
                      >
                        {loadingPlan === p.id ? (
                          <span>Iniciando checkout...</span>
                        ) : (
                          <>
                            <span>Fazer upgrade para o {p.nome}</span>
                            <i>→</i>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* TABELA COMPARATIVA */}
            <div className={cx('comp')}>
              <h2>Compare os planos</h2>
              <table>
                <thead>
                  <tr>
                    <th>Recurso</th>
                    <th className={planoAtualId === 'consulta' ? s.sel : ''}>Consulta</th>
                    <th className={planoAtualId === 'estudo' ? s.sel : ''}>Estudo</th>
                    <th className={planoAtualId === 'pratica' ? s.sel : ''}>Prática</th>
                  </tr>
                </thead>
                <tbody>
                  {COMP.map((r, rowIdx) => (
                    <tr key={rowIdx}>
                      <td>{r[0]}</td>
                      {[1, 2, 3].map(colIdx => (
                        <td
                          key={colIdx}
                          className={colIdx - 1 === idxAtual ? s.sel : ''}
                        >
                          {r[colIdx] ? (
                            <span className={cx('sim')}>✓</span>
                          ) : (
                            <span className={cx('nao')}>—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BLOCO DE INFORMAÇÕES / GARANTIAS */}
            <div className={cx('info')}>
              <div className={cx('g')}>
                <i>
                  <svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>
                </i>
                <div>
                  <b>Liberação imediata</b>
                  <span>Os novos recursos aparecem assim que o pagamento é confirmado.</span>
                </div>
              </div>
              <div className={cx('g')}>
                <i>
                  <svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></svg>
                </i>
                <div>
                  <b>Pagamento seguro</b>
                  <span>Processado pela Stripe, com criptografia.</span>
                </div>
              </div>
              <div className={cx('g')}>
                <i>
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
                </i>
                <div>
                  <b>Cancele quando quiser</b>
                  <span>Sem multa. O acesso segue até o fim do período pago.</span>
                </div>
              </div>
            </div>

            <Link className={cx('voltar')} href="/plataforma">
              ← Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense
      fallback={
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#efe7d2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif'
        }}>
          <p style={{ color: '#15140f' }}>Carregando opções de assinatura...</p>
        </div>
      }
    >
      <UpgradeInner />
    </Suspense>
  );
}
