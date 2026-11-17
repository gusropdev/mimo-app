# 🎁 Wishlist Compartilhada a Dois

Aplicação web moderna, minimalista e segura de wishlist compartilhada entre duas pessoas. Cada usuário tem sua própria lista de desejos, pode visualizar a lista do outro com contadores e ordenação, adicionar produtos com extração automática de dados (imagem, preço, nome da loja) e abrir o anúncio original.

---

## 🚀 Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth)
- **Extração de Dados:** Cheerio (Open Graph, Twitter Cards, JSON-LD, seletores específicos de e-commerce)
- **Segurança:** Proteção contra SSRF com validação de hosts, IPs privados e DNS lookup
- **Ícones:** [Lucide React](https://lucide.dev/)

---

## 📁 Estrutura do Projeto

```text
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── extract-product/  # Endpoint seguro para extração de metadados
│   │   ├── dashboard/            # Visualização das wishlists, contadores e modais
│   │   ├── login/                # Autenticação minimalista dos 2 usuários
│   │   ├── globals.css           # Estilização global com Tailwind
│   │   ├── layout.tsx            # Layout raiz
│   │   └── page.tsx              # Redirecionamento inteligente
│   ├── components/
│   │   ├── AddProductModal.tsx   # Modal de adição com auto-extração e edição manual
│   │   ├── DeleteConfirmModal.tsx# Confirmação de exclusão
│   │   ├── EditProductModal.tsx  # Edição de produto existente
│   │   ├── EmptyState.tsx        # Estado visual quando a lista estiver vazia
│   │   ├── Navbar.tsx            # Barra de navegação e logout
│   │   ├── ProductCard.tsx       # Card de produto com imagem, preço em R$ e badge
│   │   └── SkeletonCard.tsx      # Skeleton loading animado
│   ├── lib/
│   │   ├── scraper/
│   │   │   └── extractor.ts      # Extração de dados (JSON-LD, OG, Shopee, ML, Amazon)
│   │   ├── security/
│   │   │   └── ssrf.ts           # Validação de URLs e bloqueio de IPs privados / SSRF
│   │   ├── supabase/
│   │   │   ├── client.ts         # Supabase Client para o Browser
│   │   │   ├── server.ts         # Supabase Client para Server Components / Rotas
│   │   │   └── middleware.ts     # Gerenciamento de sessão e proteção de rotas
│   │   └── utils.ts              # Utilitários de formatação (moeda BRL, datas, lojas)
│   ├── types/
│   │   └── index.ts              # Interfaces TypeScript (Product, Profile, etc.)
│   └── middleware.ts             # Middleware de proteção de rotas
├── supabase/
│   └── schema.sql                # Script SQL completo (tabelas, triggers e RLS)
├── .env.example                  # Modelo de variáveis de ambiente
└── package.json
```

---

## ⚙️ Configuração do Supabase

1. Crie um projeto gratuito em [supabase.com](https://supabase.com/).
2. No painel do seu projeto Supabase, acesse **SQL Editor**.
3. Copie e cole todo o conteúdo do arquivo `supabase/schema.sql` e execute o script. Ele criará:
   - A tabela `profiles` com RLS (leitura pública para usuários autenticados, atualização apenas do próprio perfil).
   - A tabela `products` com RLS (ambos podem consultar todos os produtos; inserção, alteração e exclusão permitidas apenas ao dono do item).
   - Triggers automáticos para criação de perfil e timestamps.
4. (Opcional, recomendado): No painel do Supabase em **Authentication > Providers > Email**, você pode desmarcar **"Allow new users to sign up"** depois que ambos criarem suas contas, garantindo que ninguém mais possa se registrar.

---

## 🔑 Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha os valores:

```env
# URL do projeto e chave anônima (disponíveis em Project Settings > API no Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica

# E-mails das duas únicas contas permitidas no sistema (separados por vírgula)
ALLOWED_EMAILS=seu_email@exemplo.com,email_da_namorada@exemplo.com
```

---

## 💻 Executando Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Acesse no navegador:
   ```text
   http://localhost:3000
   ```

---

## ☁️ Deploy na Vercel

1. Suba o repositório para o seu GitHub (ou GitLab / Bitbucket).
2. Acesse [vercel.com](https://vercel.com/) e clique em **Add New Project**.
3. Importe o repositório do projeto.
4. Na seção **Environment Variables**, adicione as mesmas variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ALLOWED_EMAILS`
5. Clique em **Deploy**. A Vercel detectará automaticamente o Next.js e disponibilizará o site em segundos com HTTPS gratuito.
