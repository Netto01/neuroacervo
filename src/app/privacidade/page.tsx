'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import '../termos/termos.css';

const SECTIONS = [
  { id: 'quem', title: 'Quem somos e escopo' },
  { id: 'dados-coletados', title: 'Dados que coletamos' },
  { id: 'dados-pacientes', title: 'Dados de pacientes e sigilo clínico' },
  { id: 'finalidades', title: 'Finalidades e bases legais (LGPD)' },
  { id: 'compartilhamento', title: 'Compartilhamento com terceiros' },
  { id: 'seguranca', title: 'Segurança da informação' },
  { id: 'retencao', title: 'Retenção e exclusão' },
  { id: 'direitos', title: 'Seus direitos como titular' },
  { id: 'cookies', title: 'Cookies e preferências' },
  { id: 'contato', title: 'Contato e Encarregado (DPO)' }
];

export default function PrivacidadePage() {
  const [activeId, setActiveId] = useState<string>('quem');
  const [showTopo, setShowTopo] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopo(window.scrollY > 600);

      let current = SECTIONS[0].id;
      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el && el.getBoundingClientRect().top <= 160) {
          current = sec.id;
        }
      }
      setActiveId(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="termos-root">
      {/* ── Topbar ── */}
      <header className="termos-top">
        <div className="in">
          <Link className="termos-marca" href="/">
            <img src="/brand/isologo-preto.svg" width="22" height="28" alt="NeuroAcervo" />
            <span>NeuroAcervo</span>
          </Link>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link className="termos-voltar" href="/termos">
              Termos de Uso
            </Link>
            <Link className="termos-voltar" href="/">
              ← Voltar ao site
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="termos-hero">
        <div className="termos-kick">Privacidade & Dados · LGPD</div>
        <h1>
          Política de <em>Privacidade</em>
        </h1>
        <div className="termos-meta">Última atualização: 23/10/2026 · Em conformidade com a Lei nº 13.709/2018 (LGPD)</div>
      </div>

      {/* ── Layout & TOC ── */}
      <div className="termos-layout">
        <nav className="termos-toc" aria-label="Sumário">
          <p>Sumário</p>
          <ol>
            {SECTIONS.map((sec) => (
              <li key={sec.id}>
                <a
                  href={`#${sec.id}`}
                  className={activeId === sec.id ? 'on' : ''}
                >
                  {sec.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="termos-article">
          <div className="termos-resumo">
            <div className="termos-tape" aria-hidden="true"></div>
            <h2>
              Compromisso em <em>linguagem clara</em>
            </h2>
            <ul>
              <li>
                <strong style={{ color: 'var(--lime)' }}>Não vendemos seus dados:</strong> Seus dados pessoais e profissionais nunca serão comercializados para terceiros.
              </li>
              <li>
                <strong style={{ color: 'var(--lime)' }}>Sigilo no Dossiê Clínico:</strong> O sistema incentiva o uso de identificadores anônimos/códigos para pacientes, respeitando as normas éticas do CFP/CRM.
              </li>
              <li>
                <strong style={{ color: 'var(--lime)' }}>Segurança por isolamento:</strong> Seus registros clínicos e anotações são protegidos por Row Level Security (RLS) — nenhum outro assinante tem acesso ao seu conteúdo.
              </li>
              <li>
                <strong style={{ color: 'var(--lime)' }}>Pagamentos blindados:</strong> Dados de cartão de crédito são processados diretamente pela Stripe sob certificação PCI-DSS Nível 1. Não armazenamos números de cartão.
              </li>
              <li>
                <strong style={{ color: 'var(--lime)' }}>Você no controle:</strong> Você pode exportar seus dados, retificar informações ou solicitar a exclusão de sua conta a qualquer momento.
              </li>
            </ul>
            <small>Este resumo sintetiza os principais pontos, mas recomendamos a leitura integral das cláusulas abaixo.</small>
          </div>

          <section id="quem" className="termos-section">
            <h2><span>01</span>Quem somos e escopo</h2>
            <p>
              Esta Política de Privacidade aplica-se à plataforma <strong>NeuroAcervo</strong>, mantida pela empresa <strong>Neurotestes</strong>, inscrita no CNPJ sob o nº 69.339.738/0001-84, doravante denominada <strong>“NeuroAcervo”</strong>, <strong>“nós”</strong> ou <strong>“Controlador”</strong>.
            </p>
            <p>
              Ao se cadastrar ou navegar na plataforma, você confia a nós determinadas informações. Este documento explica com transparência como tratamos, armazenamos e protegemos esses dados, em estrita consonância com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD), o Marco Civil da Internet (Lei nº 12.965/2014) e as diretrizes éticas dos conselhos profissionais de saúde.
            </p>
          </section>

          <section id="dados-coletados" className="termos-section">
            <h2><span>02</span>Dados que coletamos</h2>
            <p>Coletamos apenas as informações necessárias para a execução do contrato de assinatura e disponibilização das ferramentas:</p>
            <ul>
              <li><strong>Dados Cadastrais do Assinante:</strong> Nome completo, endereço de e-mail, telefone, CPF e registro profissional (CRP, CRM ou similar, quando informado voluntariamente).</li>
              <li><strong>Dados de Autenticação:</strong> Identificador único de usuário (UID), credenciais criptografadas via Supabase Auth e logs de acesso com data/hora e endereço IP.</li>
              <li><strong>Dados de Pagamento e Faturamento:</strong> Histórico de transações, status da assinatura e endereço de cobrança. Os números completos de cartão de crédito são tokenizados e processados exclusivamente pela Stripe.</li>
              <li><strong>Dados de Uso e Navegação:</strong> Materiais favoritados na &ldquo;Minha Pasta&rdquo;, progresso de leitura, histórico de sessões em ferramentas interativas e anotações clínicas inseridas pelo próprio profissional.</li>
            </ul>
          </section>

          <section id="dados-pacientes" className="termos-section">
            <h2><span>03</span>Dados de pacientes e sigilo clínico</h2>
            <p>
              O NeuroAcervo fornece ferramentas de apoio clínico (como o Dossiê Clínico, Dramatização Cognitiva e Histórias Clínicas). Em relação a esses dados:
            </p>
            <ul>
              <li><strong>Pseudonimização e Anonimização:</strong> Recomendamos expressamente que os pacientes sejam registrados por códigos (ex.: <em>PAC-402</em> ou iniciais), sem inserção desnecessária de CPF, RG ou dados identificadores diretos de terceiros.</li>
              <li><strong>Papel do Assinante:</strong> O psicólogo/médico assinante atua como o <em>Controlador</em> dos dados de seus pacientes, cabendo a ele zelar pelo sigilo profissional exigido pelo Código de Ética Profissional (CFP/CFM). O NeuroAcervo atua como <em>Operador</em> da infraestrutura tecnológica.</li>
              <li><strong>Isolamento Criptográfico:</strong> As anotações clínicas contam com políticas estritas de <em>Row Level Security (RLS)</em> no banco de dados, impedindo que qualquer outro assinante ou usuário acesse seus registros.</li>
            </ul>
          </section>

          <section id="finalidades" className="termos-section">
            <h2><span>04</span>Finalidades e bases legais (LGPD)</h2>
            <p>Todo tratamento de dados pessoais é fundamentado nas bases legais previstas no Artigo 7º da LGPD:</p>
            <ul>
              <li><strong>Execução de Contrato (Art. 7º, V):</strong> Para liberar acesso ao acervo, autenticar sua sessão, processar pagamentos e viabilizar o uso das ferramentas interativas.</li>
              <li><strong>Cumprimento de Obrigação Legal ou Regulatória (Art. 7º, II):</strong> Para guarda de registros de conexão conforme exigido pelo Marco Civil da Internet e emissão de notas fiscais.</li>
              <li><strong>Legítimo Interesse (Art. 7º, IX):</strong> Para aprimoramento da plataforma, prevenção a fraudes e segurança dos sistemas contra acessos indevidos.</li>
              <li><strong>Consentimento (Art. 7º, I):</strong> Quando aplicável, para o envio opcional de informativos ou newsletters, com opção de descadastramento a qualquer momento.</li>
            </ul>
          </section>

          <section id="compartilhamento" className="termos-section">
            <h2><span>05</span>Compartilhamento com terceiros</h2>
            <p>
              Não comercializamos, alugamos nem cedemos dados pessoais a terceiros para fins de marketing. O compartilhamento ocorre única e exclusivamente com operadores tecnológicos essenciais para a prestação dos serviços:
            </p>
            <ul>
              <li><strong>Supabase Inc.:</strong> Provedor de infraestrutura de autenticação e banco de dados PostgreSQL seguro com criptografia em repouso.</li>
              <li><strong>Stripe Payments:</strong> Gateway de pagamentos internacionais e nacionais, com conformidade PCI-DSS de nível bancário.</li>
              <li><strong>Cloudflare Inc.:</strong> Rede de distribuição de conteúdo (CDN), proteção contra ataques DDoS e armazenamento em nuvem (R2) para os arquivos de biblioteca.</li>
            </ul>
          </section>

          <section id="seguranca" className="termos-section">
            <h2><span>06</span>Segurança da informação</h2>
            <p>
              Adotamos práticas modernas de segurança da informação, incluindo tráfego 100% criptografado sob protocolo HTTPS (TLS 1.3), hashing criptográfico de senhas, controle de acesso baseado em funções e salvaguardas contra injeção de código e vazamentos.
            </p>
            <p>
              Embora nenhum sistema conectado à internet seja infalível, mantemos monitoramento proativo para mitigar riscos e nos comprometemos a comunicar à ANPD (Autoridade Nacional de Proteção de Dados) e aos titulares afetados em caso de qualquer incidente relevante de segurança.
            </p>
          </section>

          <section id="retencao" className="termos-section">
            <h2><span>07</span>Retenção e exclusão de dados</h2>
            <p>
              Os dados pessoais serão conservados enquanto durar a relação contratual do assinante com o NeuroAcervo.
            </p>
            <p>
              Após o cancelamento ou solicitação de encerramento da conta, os dados do usuário serão mantidos apenas pelo período estritamente necessário para cumprimento de obrigações legais (como prazos tributários e guarda de logs do Marco Civil da Internet) ou defesa em processos judiciais, sendo eliminados de forma segura após o decurso desses prazos.
            </p>
          </section>

          <section id="direitos" className="termos-section">
            <h2><span>08</span>Seus direitos como titular</h2>
            <p>Em conformidade com o Artigo 18 da LGPD, você pode exercer os seguintes direitos a qualquer momento:</p>
            <ul>
              <li>Confirmação da existência de tratamento e acesso aos seus dados;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
              <li>Portabilidade dos dados a outro fornecedor de serviço;</li>
              <li>Revogação do consentimento para comunicações opcionais.</li>
            </ul>
          </section>

          <section id="cookies" className="termos-section">
            <h2><span>09</span>Cookies e preferências</h2>
            <p>
              Utilizamos cookies estritamente necessários para manter sua sessão autenticada e memorizar preferências de visualização (como modo de exibição da biblioteca). Não utilizamos cookies intrusivos de redes de rastreamento de terceiros para publicidade comportamental.
            </p>
          </section>

          <section id="contato" className="termos-section">
            <h2><span>10</span>Contato e Encarregado de Dados (DPO)</h2>
            <p>
              Para esclarecer dúvidas sobre esta Política, exercer seus direitos como titular de dados ou contatar nosso Encarregado pelo Tratamento de Dados Pessoais (DPO), envie uma mensagem para:
            </p>
            <p>
              E-mail: <a href="mailto:nao-responda@neuroacervo.com.br">nao-responda@neuroacervo.com.br</a><br />
              Assunto: <em>Privacidade de Dados — LGPD</em>
            </p>
          </section>

          {/* ── Rodapé interno do artigo ── */}
          <div className="termos-fim">
            <p>
              <Link href="/termos">Termos de Uso</Link> · <Link href="/privacidade">Política de Privacidade</Link>
            </p>
            <p>© {new Date().getFullYear()} NeuroAcervo · Plataforma profissional para avaliação neuropsicológica e psicológica.</p>
          </div>
        </article>
      </div>

      {/* ── Botão voltar ao topo flutuante ── */}
      <button
        type="button"
        className={`termos-topo ${showTopo ? 'vis' : ''}`}
        onClick={scrollToTop}
        aria-label="Voltar ao topo"
      >
        ↑
      </button>
    </div>
  );
}
