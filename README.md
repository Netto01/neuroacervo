# NeuroHub / NeuroAcervo

Plataforma completa de avaliação neuropsicológica com método clínico, instrumentos de rastreio, modelos de laudo, roteiros de anamnese, compêndios e aulas.

## 🚀 Tecnologias

- **Next.js 16** (App Router & Turbopack)
- **React 19 & TypeScript**
- **Supabase** (Autenticação, PostgreSQL, Row Level Security)
- **Design Editorial & Temas Customizados**

## 📦 Como rodar localmente

1. Clone o repositório:
```bash
git clone https://github.com/Netto01/NeuroHub.git
cd NeuroHub
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://zvobmczvkbsugiiaehvz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.
