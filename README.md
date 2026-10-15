# NeuroAcervo

> Plataforma completa de recursos clínicos, instrumentos neuropsicológicos, formação continuada e ferramentas interativas para psicólogos, neuropsicólogos e acadêmicos.

---

## 🧭 Visão Geral

O **NeuroAcervo** foi desenvolvido para centralizar o fluxo de trabalho do profissional de saúde mental e neuropsicologia em um único ambiente refinado e seguro. A plataforma combina um vasto acervo de testes e instrumentos com ferramentas dinâmicas para aplicação clínica durante as sessões e módulos de formação continuada.

---

## ✨ Principais Módulos da Plataforma

### 1. Acervo & Biblioteca Clínica (`/biblioteca`)
* Catálogo completo de instrumentos psicométricos, testes de rastreio, baterias e materiais de apoio.
* Busca inteligente por nome do teste, função cognitiva avaliada, população-alvo (infantil, adultos, idosos) e formato (PDF, DOCX, etc.).
* Leitor de PDF integrado e protegido (`/leitor`) com download controlado para assinantes.

### 2. Recursos Interativos (`/recursos-interativos`)
* **Histórias Clínicas & Regulação Emocional (`/recursos-interativos/historias`)**:
  * 50 histórias temáticas organizadas em **5 faixas etárias** (Infantil I, Infantil II, Transição, Adolescência e Jovem Adulto).
  * Ilustrações exclusivas em alta resolução (proporção 16:9 widescreen) geradas especialmente para o contexto clínico.
  * Sessão guiada em **3 etapas estruturadas**: *Observar* (pistas corporais e Termômetro da Emoção), *Pensar* (pensamentos automáticos e Escala de Crença de 0% a 100%) e *Agir* (alternativas funcionais e escolha de conduta).
  * **Modo Paciente**: Visualização em tela cheia responsiva (mobile, tablet e desktop) com navegação fluida por slides para apresentação direta na sessão.
  * Síntese de voz (*Text-to-Speech*) para leitura acessível da história.
* **Baralho de Funções Executivas (`/recursos-interativos/baralho`)**:
  * Cartas interativas divididas por domínios cognitivos (Controle Inibitório, Memória Operacional, Flexibilidade Cognitiva, Planejamento e Atenção).
  * Missões práticas, regras lúdicas e reflexões diagnósticas direto ao ponto.
* **Cronômetro Clínico & Contador de Erros**:
  * Ferramenta de precisão para cronometragem de testes de tempo e registro imediato de erros e omissões.

### 3. Formação Clínica & Aulas (`/aulas`)
* Aulas em vídeo com estudos de caso reais e raciocínio diagnóstico de consultório.
* Organização modular por competências com acompanhamento automático de aulas concluídas e progresso individual.

### 4. Laudos, Guias & Anamnese
* **Modelos de Laudos (`/laudos`)**: Textos padronizados com fundamentação normativa, hipóteses e descrições técnicas ecológicas.
* **Guias de Cabeceira (`/guias`)**: Tabelas rápidas de escores, pontos de corte e instruções práticas para consulta rápida.
* **Roteiro de Anamnese (`/anamnese`)**: Protocolo semiestruturado para levantamento de histórico de desenvolvimento e investigação de marcos neurobiológicos.
* **Minha Pasta (`/minha-pasta`)**: Espaço pessoal do assinante para favoritar e organizar seus materiais mais utilizados.

### 5. Painel Administrativo (`/admin`)
* **Gestão de Materiais**: Upload individual ou em lote de arquivos para Cloudflare R2 com geração de URLs pré-assinadas.
* **Gestão de Assinantes (`/admin/assinantes`)**: Controle de membros, planos de acesso (Consulta vs. Prática), status de assinatura e histórico de acessos.
* **Métricas Stripe**: Faturamento, receita mensal (MRR) e estatísticas em tempo real via API oficial do Stripe.

---

## 🛠️ Tecnologias Utilizadas

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack e Server Actions)
* **Frontend**: React 19, TypeScript 5, Lucide Icons
* **Estilização**: CSS Vanilla com arquitetura de tokens HSL, design editorial sofisticado, paleta acolhedora e responsividade mobile-first
* **Banco de Dados & Autenticação**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security rigoroso, Triggers e Políticas)
* **Armazenamento de Arquivos**: [Cloudflare R2](https://www.cloudflare.com/products/r2/) (compatível com S3, pré-assinaturas seguras para uploads e downloads rápidos)
* **Pagamentos & Assinaturas**: [Stripe](https://stripe.com/) (Checkout Sessions, Customer Portal e Webhooks autenticados)

---

## 📁 Estrutura do Projeto

```
Pessoal_Netto/
├── docs/                                  # Documentações e prompts mestres
│   └── PROMPTS_HISTORIAS_CLINICAS_GEMINI.md
├── imagens_historias/                     # Pasta de entrada para novas imagens
├── public/
│   ├── assets/
│   │   └── cards/                         # 50 ilustrações das histórias clínicas (f1_h1.jpg a f5_h10.jpg)
│   └── brand/                             # Logotipos e identidades visuais
├── src/
│   ├── app/                               # Rotas do Next.js App Router
│   │   ├── admin/                         # Painel administrativo e controle de assinantes
│   │   ├── api/                           # API Routes (Stripe webhooks, upload R2, presigned URLs)
│   │   ├── aulas/                         # Player de formação clínica
│   │   ├── biblioteca/                    # Catálogo geral de materiais
│   │   ├── plataforma/                    # Dashboard inicial do usuário
│   │   ├── recursos-interativos/          # Histórias clínicas, baralho e ferramentas
│   │   └── ...
│   ├── components/                        # Componentes reutilizáveis
│   │   ├── common/                        # Gates de planos, cabeçalhos, banners
│   │   ├── layout/                        # PlatformShell, navegação e menus
│   │   └── views/                         # Views dos módulos de conteúdo
│   ├── context/                           # NeuroContext (estado global, favoritos, progresso)
│   ├── data/                              # Dados locais tipados (historiasClinicas.ts, etc.)
│   └── lib/                               # Clientes Supabase, Stripe e Cloudflare R2
└── supabase_schema.sql                    # Script completo do banco de dados e políticas RLS
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
* **Node.js** 20.x ou superior
* **npm** ou **yarn**

### 1. Clonar o repositório
```bash
git clone https://github.com/Netto01/neuroacervo.git
cd neuroacervo
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto com as chaves necessárias:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sua-url-supabase.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=seu-account-id
R2_ACCESS_KEY_ID=seu-access-key-id
R2_SECRET_ACCESS_KEY=sua-secret-key
R2_BUCKET_NAME=neuroacervo-materiais
R2_PUBLIC_DOMAIN=https://seu-dominio-r2.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador para acessar a plataforma.

### 5. Build de Produção
Para validar e gerar o bundle otimizado:
```bash
npm run build
npm run start
```

---

## 🔒 Segurança & Boas Práticas

* **Row Level Security (RLS)**: Todas as tabelas no Supabase possuem políticas ativas que garantem que usuários acessem apenas dados autorizados para seu respectivo plano.
* **Upload Pré-Assinado**: Uploads de arquivos no Cloudflare R2 passam por rotas de backend autenticadas que emitem presigned URLs com tempo de expiração curto.
* **Webhooks com Verificação de Assinatura**: O endpoint de pagamentos do Stripe valida a assinatura criptográfica de cada evento antes de atualizar o plano do usuário.

---

## 📄 Licença

Este projeto é de propriedade privada do **NeuroAcervo**. Todos os direitos reservados.
