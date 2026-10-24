'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import './termos.css';

const SECTIONS = [
  { id: 'quem', title: 'Quem somos' },
  { id: 'aceite', title: 'Aceite dos termos' },
  { id: 'servico', title: 'O que é o NeuroAcervo' },
  { id: 'quem-usa', title: 'Quem pode usar' },
  { id: 'conta', title: 'Conta e acesso' },
  { id: 'planos', title: 'Planos, pagamento e renovação' },
  { id: 'cancelamento', title: 'Arrependimento e cancelamento' },
  { id: 'propriedade', title: 'Propriedade intelectual' },
  { id: 'testes', title: 'Testes psicológicos e materiais de terceiros' },
  { id: 'responsabilidade', title: 'Responsabilidades e limites' },
  { id: 'proibido', title: 'Condutas proibidas' },
  { id: 'suspensao', title: 'Suspensão e encerramento' },
  { id: 'privacidade', title: 'Privacidade e dados' },
  { id: 'alteracoes', title: 'Alterações destes termos' },
  { id: 'lei', title: 'Lei aplicável e foro' },
  { id: 'contato', title: 'Contato' }
];

export default function TermosPage() {
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
          <Link className="termos-voltar" href="/">
            ← Voltar ao site
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="termos-hero">
        <div className="termos-kick">Documento legal</div>
        <h1>
          Termos de <em>Uso</em>
        </h1>
        <div className="termos-meta">Última atualização: 12/10/2026 · Versão 1.0</div>
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
              Resumo em <em>linguagem simples</em>
            </h2>
            <ul>
              <li>
                O NeuroAcervo é <strong style={{ color: 'var(--lime)' }}>material de apoio</strong> para estudo e prática em avaliação. Não substitui manuais oficiais, formação nem supervisão.
              </li>
              <li>
                Sua conta é <strong style={{ color: 'var(--lime)' }}>pessoal e intransferível</strong>. Não compartilhe login nem redistribua os materiais.
              </li>
              <li>
                A assinatura renova automaticamente. Você pode <strong style={{ color: 'var(--lime)' }}>cancelar quando quiser</strong>, e tem 7 dias para desistir com reembolso integral.
              </li>
              <li>
                O acervo <strong style={{ color: 'var(--lime)' }}>não reproduz</strong> itens, folhas de registro, tabelas normativas ou manuais de testes protegidos.
              </li>
              <li>
                As decisões clínicas e os documentos que você emite são de <strong style={{ color: 'var(--lime)' }}>sua responsabilidade profissional</strong>.
              </li>
            </ul>
            <small>Este resumo ajuda na leitura, mas não substitui o texto completo abaixo.</small>
          </div>

          <section id="quem" className="termos-section">
            <h2><span>01</span>Quem somos</h2>
            <p>
              O NeuroAcervo é uma plataforma digital por assinatura, mantida pela empresa <strong>Neurotestes</strong>, inscrita no CNPJ nº 69.339.738/0001-84, tendo como responsável Arlindo Gonçalves de Araújo Neto, doravante chamado(a) de <strong>“NeuroAcervo”</strong>, <strong>“nós”</strong> ou <strong>“nosso”</strong>.
            </p>
            <p>
              Contato oficial: <a href="mailto:nao-responda@neuroacervo.com.br">nao-responda@neuroacervo.com.br</a>.
            </p>
          </section>

          <section id="aceite" className="termos-section">
            <h2><span>02</span>Aceite dos termos</h2>
            <p>
              Ao criar uma conta, assinar um plano ou usar qualquer parte da plataforma, você declara que leu, entendeu e concorda com estes Termos de Uso e com a nossa <Link href="/privacidade">Política de Privacidade</Link>. Se não concordar com algum ponto, não utilize a plataforma.
            </p>
          </section>

          <section id="servico" className="termos-section">
            <h2><span>03</span>O que é o NeuroAcervo</h2>
            <p>O NeuroAcervo reúne conteúdo educacional e de apoio à prática em avaliação psicológica e neuropsicológica, como:</p>
            <ul className="termos-l">
              <li>guias rápidos de aplicação e interpretação;</li>
              <li>modelos de laudo e roteiros de anamnese;</li>
              <li>escalas de uso livre, com ficha técnica e orientação de correção;</li>
              <li>compêndios de estudo, PDFs e artigos;</li>
              <li>aulas gravadas e recursos interativos.</li>
            </ul>
            <div className="termos-box alerta">
              <strong>Importante:</strong> todo o conteúdo é <strong>material de apoio</strong>. Ele não substitui os manuais oficiais dos instrumentos, a formação acadêmica, a supervisão profissional nem o julgamento clínico de quem conduz a avaliação. O NeuroAcervo <strong>não presta atendimento psicológico</strong> e não realiza avaliações.
            </div>
            <p>
              O catálogo pode ser ampliado, atualizado ou reorganizado ao longo do tempo. Podemos retirar um material específico, por exemplo por revisão técnica ou por questões de licença, sem que isso altere a essência do serviço contratado.
            </p>
          </section>

          <section id="quem-usa" className="termos-section">
            <h2><span>04</span>Quem pode usar</h2>
            <p>A plataforma é destinada a <strong>estudantes de Psicologia, psicólogos e neuropsicólogos</strong> maiores de 18 anos.</p>
            <ul className="termos-l">
              <li><strong>Psicólogos(as):</strong> são responsáveis por usar os materiais de acordo com o Código de Ética Profissional do Psicólogo e com as resoluções do Conselho Federal de Psicologia.</li>
              <li><strong>Estudantes:</strong> podem usar o conteúdo para estudo. Qualquer uso em situação de prática deve ocorrer sob supervisão de profissional habilitado, conforme as regras da sua instituição de ensino.</li>
            </ul>
            <p>Podemos solicitar a confirmação de informações profissionais, como o número de inscrição no Conselho Regional de Psicologia, para liberar determinados conteúdos.</p>
          </section>

          <section id="conta" className="termos-section">
            <h2><span>05</span>Conta e acesso</h2>
            <ul className="termos-l">
              <li>Você deve informar dados verdadeiros e mantê-los atualizados.</li>
              <li>A conta é <strong>pessoal e intransferível</strong>. Você é responsável por guardar sua senha e por toda atividade realizada com o seu login.</li>
              <li>É proibido compartilhar a conta com outras pessoas, inclusive colegas, clínicas ou turmas. Podemos limitar o número de acessos simultâneos e de dispositivos.</li>
              <li>Se suspeitar de uso indevido da sua conta, avise-nos imediatamente pelo contato oficial.</li>
            </ul>
          </section>

          <section id="planos" className="termos-section">
            <h2><span>06</span>Planos, pagamento e renovação</h2>
            <p>Os planos disponíveis, com valores vigentes na data desta versão, são:</p>
            <table className="termos-table">
              <thead>
                <tr>
                  <th>Plano</th>
                  <th>O que inclui</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><strong>Consulta</strong></td><td>PDFs do acervo</td><td>R$ 24,90/mês</td></tr>
                <tr><td><strong>Estudo</strong></td><td>PDFs e aulas gravadas</td><td>R$ 44,90/mês</td></tr>
                <tr><td><strong>Prática</strong></td><td>Todo o acervo, aulas, prontuário e recursos interativos</td><td>R$ 69,90/mês ou R$ 699/ano</td></tr>
              </tbody>
            </table>
            <ul className="termos-l">
              <li>Os pagamentos são processados por empresa parceira de pagamentos (como a Stripe). Não armazenamos os dados completos do seu cartão.</li>
              <li>A assinatura é <strong>renovada automaticamente</strong> ao fim de cada período (mensal ou anual), com cobrança no mesmo meio de pagamento, até que você cancele.</li>
              <li>Se o pagamento não for aprovado, o acesso poderá ser suspenso até a regularização.</li>
              <li>Eventuais reajustes de preço serão comunicados por e-mail com pelo menos <strong>30 dias de antecedência</strong> e só valerão a partir do período seguinte.</li>
            </ul>
          </section>

          <section id="cancelamento" className="termos-section">
            <h2><span>07</span>Arrependimento e cancelamento</h2>
            <h3>Direito de arrependimento</h3>
            <p>
              Conforme o artigo 49 do Código de Defesa do Consumidor (Lei nº 8.078/1990), você pode desistir da contratação em até <strong>7 dias</strong> a partir da assinatura, com <strong>reembolso integral</strong> do valor pago.
            </p>
            <h3>Cancelamento</h3>
            <ul className="termos-l">
              <li>Você pode cancelar a renovação a qualquer momento, pela área da conta ou pelo contato oficial.</li>
              <li>Após o cancelamento, o acesso continua até o fim do período já pago e não haverá novas cobranças.</li>
              <li>Fora do prazo de arrependimento, não há reembolso proporcional do período em curso, salvo quando a lei determinar o contrário.</li>
            </ul>
          </section>

          <section id="propriedade" className="termos-section">
            <h2><span>08</span>Propriedade intelectual e uso permitido</h2>
            <p>
              Os textos, aulas, guias, modelos, compêndios, a identidade visual e a organização do acervo são protegidos pela Lei de Direitos Autorais (Lei nº 9.610/1998) e pertencem ao NeuroAcervo ou a seus autores e licenciantes.
            </p>
            <h3>Você pode</h3>
            <ul className="termos-l">
              <li>acessar e estudar os materiais durante a vigência da assinatura;</li>
              <li>usar guias e roteiros como apoio na sua prática profissional;</li>
              <li>adaptar os modelos para redigir os seus próprios documentos, com o seu raciocínio clínico e sob a sua responsabilidade.</li>
            </ul>
            <h3>Você não pode</h3>
            <ul className="termos-l">
              <li>copiar, revender, distribuir, publicar ou compartilhar os materiais, em qualquer formato ou canal (grupos, redes sociais, drives, sites);</li>
              <li>remover marcas d’água, créditos ou avisos de autoria;</li>
              <li>usar os materiais para criar produtos ou cursos concorrentes;</li>
              <li>extrair conteúdo de forma automatizada ou usá-lo para treinar sistemas de inteligência artificial.</li>
            </ul>
            <p>Os materiais podem conter marca d’água com dados da sua conta, para proteção contra distribuição indevida.</p>
          </section>

          <section id="testes" className="termos-section">
            <h2><span>09</span>Testes psicológicos e materiais de terceiros</h2>
            <p>O NeuroAcervo respeita os direitos dos autores e editoras de instrumentos psicológicos. Por isso:</p>
            <ul className="termos-l">
              <li><strong>não reproduzimos</strong> itens, folhas de registro, tabelas normativas ou trechos de manuais de testes protegidos;</li>
              <li>as escalas disponibilizadas são de uso livre ou utilizadas conforme suas licenças, sempre com os devidos créditos e referências;</li>
              <li>o uso de testes psicológicos exige o material original, adquirido junto à editora, e a consulta à situação do instrumento no Sistema de Avaliação de Testes Psicológicos (Satepsi), do Conselho Federal de Psicologia.</li>
            </ul>
            <p>
              Se você é titular de direitos sobre algum conteúdo e entende que ele foi utilizado de forma indevida, escreva para <a href="mailto:nao-responda@neuroacervo.com.br">nao-responda@neuroacervo.com.br</a>. Analisaremos o pedido e, se for o caso, retiraremos o material.
            </p>
          </section>

          <section id="responsabilidade" className="termos-section">
            <h2><span>10</span>Responsabilidades e limites</h2>
            <ul className="termos-l">
              <li>O conteúdo tem finalidade <strong>educacional e informativa</strong>. Buscamos precisão e atualização, mas a ciência e as normas mudam, e cabe a você conferir as fontes e normativas vigentes.</li>
              <li>As decisões clínicas, as avaliações realizadas e os documentos emitidos são de <strong>responsabilidade exclusiva do profissional</strong> que os assina.</li>
              <li>Não nos responsabilizamos por danos decorrentes do uso inadequado dos materiais, do uso fora das orientações da ficha técnica ou do uso por pessoa não habilitada.</li>
              <li>Trabalhamos para manter a plataforma disponível, mas podem ocorrer interrupções para manutenção, atualizações ou por falhas de terceiros (como provedores de hospedagem e pagamento). Sempre que possível, avisaremos com antecedência.</li>
            </ul>
            <p>Nada nestes termos limita direitos que a legislação de defesa do consumidor garante a você.</p>
          </section>

          <section id="proibido" className="termos-section">
            <h2><span>11</span>Condutas proibidas</h2>
            <p>Além do previsto na seção 8, é proibido:</p>
            <ul className="termos-l">
              <li>usar a plataforma para fins ilícitos ou contrários à ética profissional;</li>
              <li>tentar acessar áreas restritas, contas de terceiros ou sistemas sem autorização;</li>
              <li>interferir no funcionamento da plataforma, inclusive com robôs, scripts ou sobrecarga intencional;</li>
              <li>inserir, nas anotações ou em qualquer campo da plataforma, <strong>dados que identifiquem pacientes</strong>.</li>
            </ul>
          </section>

          <section id="suspensao" className="termos-section">
            <h2><span>12</span>Suspensão e encerramento</h2>
            <p>
              Podemos suspender ou encerrar contas que violem estes termos, especialmente em casos de compartilhamento de acesso ou distribuição de materiais. Sempre que possível, você será avisado(a) por e-mail e poderá apresentar esclarecimentos. Em caso de violação grave, a suspensão pode ser imediata, sem prejuízo das medidas legais cabíveis.
            </p>
            <p>Você pode encerrar sua conta a qualquer momento. O tratamento dos seus dados após o encerramento segue a Política de Privacidade.</p>
          </section>

          <section id="privacidade" className="termos-section">
            <h2><span>13</span>Privacidade e dados</h2>
            <p>
              Tratamos seus dados pessoais de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e com o Marco Civil da Internet (Lei nº 12.965/2014). Os detalhes sobre quais dados coletamos, para que, por quanto tempo e quais são os seus direitos estão na nossa <Link href="/privacidade">Política de Privacidade</Link>.
            </p>
          </section>

          <section id="alteracoes" className="termos-section">
            <h2><span>14</span>Alterações destes termos</h2>
            <p>
              Podemos atualizar estes termos para refletir mudanças no serviço ou na legislação. Alterações relevantes serão comunicadas por e-mail e na plataforma com pelo menos <strong>15 dias de antecedência</strong>. Se não concordar com a nova versão, você pode cancelar a assinatura antes de ela entrar em vigor.
            </p>
          </section>

          <section id="lei" className="termos-section">
            <h2><span>15</span>Lei aplicável e foro</h2>
            <p>
              Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro do domicílio do(a) consumidor(a) para resolver eventuais conflitos, conforme o Código de Defesa do Consumidor. Antes de qualquer medida, convidamos você a entrar em contato conosco para buscarmos uma solução amigável.
            </p>
          </section>

          <section id="contato" className="termos-section">
            <h2><span>16</span>Contato</h2>
            <p>Dúvidas, solicitações ou reclamações sobre estes termos:</p>
            <div className="termos-box">
              <strong>NeuroAcervo</strong><br />
              E-mail: <a href="mailto:nao-responda@neuroacervo.com.br">nao-responda@neuroacervo.com.br</a><br />
              Neurotestes · CNPJ 69.339.738/0001-84<br />
              Responsável: Arlindo Gonçalves de Araújo Neto
            </div>
          </section>
        </article>
      </div>

      {/* ── Footer ── */}
      <footer className="termos-footer">
        <div className="in">
          <span>
            © {new Date().getFullYear()} NeuroAcervo, uma empresa Neurotestes · CNPJ 69.339.738/0001-84 · Para estudantes, psicólogos e neuropsicólogos
          </span>
          <span>
            <Link href="/termos">Termos de Uso</Link> · <Link href="/privacidade">Política de Privacidade</Link>
          </span>
        </div>
      </footer>

      {/* ── Botão Voltar ao Topo ── */}
      <button
        onClick={scrollToTop}
        className={`termos-topo ${showTopo ? 'on' : ''}`}
        aria-label="Voltar ao topo"
      >
        ↑
      </button>
    </div>
  );
}
