# ✨ MIMO — Documentação Completa

> Aplicação privada para gerenciamento de listas de desejos e presentes.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológica](#stack-tecnológica)
3. [Arquitetura da Aplicação](#arquitetura-da-aplicação)
4. [Estrutura de Arquivos](#estrutura-de-arquivos)
5. [Banco de Dados (Supabase)](#banco-de-dados-supabase)
6. [Fluxo de Autenticação e Segurança](#fluxo-de-autenticação-e-segurança)
7. [Funcionamento dos Itens e Imagens](#funcionamento-dos-itens-e-imagens)
8. [Componentes e Interface](#componentes-e-interface)
9. [API Interna](#api-interna)
10. [Passo a Passo: Deploy no Vercel](#passo-a-passo-deploy-no-vercel)

---

## Visão Geral

**MIMO** é uma aplicação web privada e moderna desenvolvida para organizar listas de presentes:

- **Adição direta e manual**: Nome do produto é o único campo obrigatório.
- **Imagem automática em tempo real**: O sistema busca a melhor foto do item na web via DuckDuckGo Images sem precisar colar URLs de imagem.
- **Observações / Recado para quem vai presentear**: Campo específico para observações como tamanho, cor, preferências de modelo ou prioridade.
- **Preço e link opcionais**: Se preenchidos, o preço é formatado em R$ e o botão "Ver na loja" é exibido.
- **Privacidade total**: Apenas as duas contas autorizadas em `ALLOWED_EMAILS` conseguem se cadastrar ou entrar no sistema.
- **Abas**: Alternância rápida entre as duas listas com contagem de itens em tempo real.

```
Login
  ↓
Dashboard (MIMO):
  [ Lista de Gustavo (Qtd) ]   [ Lista de Kaylane (Qtd) ]
  ↓
  - Adicionar item desejado (Nome obrigatório, foto automática, notas opcionais)
  - Editar ou excluir itens da própria lista
  - Visualizar e abrir links da lista da outra pessoa
```

---

## Stack Tecnológica

| Camada | Tecnologia | Descrição |
|--------|-----------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) | React Server & Client Components |
| Linguagem | TypeScript 5 | Tipagem estática em toda a aplicação |
| Estilização | Tailwind CSS 3 | Design com paleta Rose/Pink/Zinc e acabamento refinado |
| Ícones | Lucide React | Ícones modernos e consistentes |
| Backend / Auth | [Supabase](https://supabase.com/) | PostgreSQL com Row Level Security (RLS) e Auth JWT |
| Busca de imagens | DuckDuckGo Images | Busca automática da primeira foto por query, sem necessidade de API key paga |
| Deploy | [Vercel](https://vercel.com/) | Edge & Serverless Functions |

---

## Arquitetura da Aplicação

```
                        ┌────────────────────────────────────────┐
  Navegador ────────────▶      Next.js 15 (Hospedado no Vercel)  │
                        │                                        │
                        │  ┌──────────────┐  ┌────────────────┐  │
                        │  │  Middleware  │  │   App Pages    │  │
                        │  │ (Auth check  │  │ /login         │  │
                        │  │  + ALLOWED_  │  │ /dashboard     │  │
                        │  │  EMAILS)     │  │ /              │  │
                        │  └──────────────┘  └────────────────┘  │
                        │                                        │
                        │  ┌──────────────────────────────────┐  │
                        │  │  POST /api/search-image          │  │
                        │  │  (Busca imagem automática)       │  │
                        │  └──────────────────────────────────┘  │
                        └───────────────────┬────────────────────┘
                                            │
                                            ▼
                                  ┌──────────────────┐
                                  │    Supabase       │
                                  │  ┌────────────┐  │
                                  │  │ Auth (JWT) │  │
                                  │  ├────────────┤  │
                                  │  │ profiles   │  │
                                  │  │ products   │  │
                                  │  │  (RLS ON)  │  │
                                  │  └────────────┘  │
                                  └──────────────────┘
```

---

## Estrutura de Arquivos

```
c:\WishListAPP\
├── .env.example                    # Modelo das variáveis de ambiente
├── .env.local                      # Variáveis locais de desenvolvimento
├── next.config.ts                  # Configuração do Next.js
├── tailwind.config.ts              # Configuração do Tailwind CSS
├── tsconfig.json                   # Configurações TypeScript
├── DOCUMENTACAO.md                 # Esta documentação
│
├── supabase/
│   └── schema.sql                  # Schema completo do banco de dados PostgreSQL
│
└── src/
    ├── middleware.ts               # Ponto de entrada do middleware global
    │
    ├── app/
    │   ├── layout.tsx              # Shell HTML comum com fontes e tema
    │   ├── page.tsx                # Rota inicial: redireciona para /dashboard ou /login
    │   ├── globals.css             # Estilos utilitários globais
    │   │
    │   ├── login/
    │   │   └── page.tsx            # Tela de autenticação com visual personalizado
    │   │
    │   ├── dashboard/
    │   │   └── page.tsx            # Dashboard principal com as abas Gustavo & Kaylane
    │   │
    │   └── api/
    │       └── search-image/
    │           └── route.ts        # Endpoint que busca fotos de produtos automaticamente
    │
    ├── components/
    │   ├── Navbar.tsx              # Barra superior com logo e perfil
    │   ├── ProductCard.tsx         # Card de produto (com badge Novo, preço e link opcional)
    │   ├── AddProductModal.tsx     # Modal de adição manual com busca de imagem ao digitar
    │   ├── EditProductModal.tsx    # Modal de edição de produtos existentes
    │   ├── DeleteConfirmModal.tsx  # Confirmação antes de excluir
    │   ├── EmptyState.tsx          # Estado amigável para quando uma lista estiver vazia
    │   └── SkeletonCard.tsx        # Placeholder animado durante o carregamento
    │
    ├── lib/
    │   ├── utils.ts                # Formatadores (moeda BRL, data BR, etc.)
    │   ├── scraper/
    │   │   └── extractor.ts        # Função searchProductImage via DuckDuckGo
    │   └── supabase/
    │       ├── client.ts           # Cliente Supabase para o navegador (Browser Client)
    │       ├── server.ts           # Cliente Supabase para Server Components
    │       ├── middleware.ts       # Gestão de sessão e lista de e-mails no Middleware
    │       └── helpers.ts          # Sanitizador da URL do Supabase
    │
    └── types/
        └── index.ts                # Interfaces Profile e Product (url e price opcionais)
```

---

## Banco de Dados (Supabase)

O arquivo [`supabase/schema.sql`](./supabase/schema.sql) contém toda a estrutura.

### Tabela `profiles`

Criada e preenchida automaticamente via Trigger quando um usuário se cadastra.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid (PK) | Sim | ID do usuário em `auth.users` |
| `email` | text | Sim | E-mail da conta |
| `display_name` | text | Não | Nome de exibição (ex: Gustavo ou Kaylane) |
| `avatar_url` | text | Não | Imagem de avatar opcional |
| `created_at` | timestamptz | Sim | Data de cadastro |
| `updated_at` | timestamptz | Sim | Última atualização |

### Tabela `products`

Itens salvos na lista de desejos.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid (PK) | Sim | Identificador único do produto |
| `user_id` | uuid (FK) | Sim | ID do dono do item em `auth.users` |
| `title` | text | **Sim** | Nome do produto |
| `url` | text | **Não** | Link para a loja (opcional) |
| `image_url` | text | Não | URL da imagem correspondente |
| `price` | numeric(10,2) | Não | Valor aproximado em R$ (opcional) |
| `store_name` | text | Não | Nome da loja ou marca (opcional) |
| `notes` | text | Não | Comentário / recadinho para quem vai presentear (opcional) |
| `created_at` | timestamptz | Sim | Data em que foi adicionado |
| `updated_at` | timestamptz | Sim | Data da última alteração |

> [!IMPORTANT]
> **Atenção para quem já rodou o schema anteriormente:**
> Execute os seguintes comandos no **SQL Editor** do Supabase para atualizar a tabela existente:
> ```sql
> alter table public.products alter column url drop not null;
> alter table public.products add column if not exists notes text;
> ```

### Políticas de Segurança (Row Level Security - RLS)

- **SELECT**: Qualquer usuário autenticado pode ver todos os produtos e perfis (permite que Gustavo veja a lista de Kaylane e vice-versa).
- **INSERT**: O usuário só pode inserir itens onde `user_id = auth.uid()` (ninguém insere itens na lista do outro sem permissão).
- **UPDATE**: O usuário só pode alterar seus próprios itens.
- **DELETE**: O usuário só pode excluir seus próprios itens.

---

## Fluxo de Autenticação e Segurança

### Whitelist de Acesso (`ALLOWED_EMAILS`)

No arquivo de ambiente (`.env.local` e Vercel), defina os dois e-mails exatos autorizados:

```env
ALLOWED_EMAILS=gustavo@email.com,kaylane@email.com
```

O `middleware.ts`:
1. Verifica se há uma sessão Supabase ativa.
2. Compara o e-mail autenticado com a lista em `ALLOWED_EMAILS`.
3. Se o e-mail não estiver na lista, desloga a conta na hora e redireciona para `/login?error=unauthorized`.
4. Garante que ninguém de fora acesse as telas `/dashboard` ou as rotas `/api/*`.

---

## Funcionamento dos Desejos e Imagens

Ao invés de depender de scrapers que quebram com CAPTCHAs e bloqueios de lojas como Shopee e Mercado Livre, o app adota um fluxo direto:

1. **Digitação do Nome**: Ao abrir o modal "Adicionar produto", o usuário digita o nome (ex: `AirPods Pro 2`, `Tênis Vans Old Skool Preto 39`, `Kindle Paperwhite`).
2. **Busca Automática**: Com um debounce inteligente de 900ms, o sistema chama `/api/search-image`, que busca a foto no DuckDuckGo Images e a exibe em um preview no modal.
3. **Buscar Outra**: Se a primeira foto não agradar, um clique no botão "Buscar outra" faz uma nova requisição.
4. **Campos Opcionais Recolhidos**: Preço, loja e link ficam sob uma seção recolhível, deixando o formulário limpo e rápido de preencher.

---

## Componentes e Interface

- **Navbar**: Cabeçalho limpo com logo rose degradê, identificador do usuário e botão sair.
- **Banner Pessoal**: Mensagem de boas-vindas com o nome do usuário ativo e selo "Gustavo & Kaylane".
- **Abas Inteligentes**:
  - `Wishlist Gustavo` e `Wishlist Kaylane`.
  - Destacam a contagem de produtos de cada um.
  - O botão de adicionar só aparece na aba do próprio usuário ativo.
- **ProductCard**:
  - Exibição de foto em proporção equilibrada (4:3) com fundo suave.
  - Badge "novo" para itens cadastrados nos últimos 7 dias.
  - Badge em caixa alta para o nome da loja.
  - Preço formatado em R$ com destaque em rose-600.
  - Botão "Ver anúncio" exibido apenas se o link foi preenchido.
  - Botões de editar e excluir visíveis no hover (ou sempre em mobile) para o dono do item.
- **EmptyState**: Mensagem acolhedora quando a lista não possui produtos cadastrados.

---

## API Interna

### `POST /api/search-image`

Endpoint protegido por autenticação.

**Request Body:**
```json
{
  "query": "Perfume Libre Yves Saint Laurent"
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://..."
}
```

---

## Passo a Passo: Deploy no Vercel

### 1. Configurar o Supabase

1. Crie um projeto no [supabase.com](https://supabase.com).
2. Abra o **SQL Editor** e execute o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql).
3. Se já havia executado antes, execute também:
   ```sql
   alter table public.products alter column url drop not null;
   alter table public.products add column if not exists notes text;
   ```
4. Em **Authentication** → **Providers** → **Email**:
   - Recomendado para uso particular: desative **"Confirm email"** para acesso imediato.
5. Em **Project Settings** → **API**, copie:
   - `Project URL`
   - `anon public` key

### 2. Configurar o Repositório no GitHub

Suba as alterações para o seu repositório:

```bash
git add .
git commit -m "feat: manual wishlist with auto image search"
git push origin main
```

### 3. Criar o Projeto no Vercel

1. Acesse [vercel.com/new](https://vercel.com/new) e selecione o seu repositório.
2. Em **Environment Variables**, adicione as 3 variáveis:

| Nome da Variável | Valor de Exemplo |
|------------------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xyzproject.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` |
| `ALLOWED_EMAILS` | `gustavo@gmail.com,kaylane@gmail.com` |

3. Clique em **Deploy**.

### 4. Ajustar URLs de Redirecionamento

Após o Vercel gerar o domínio do projeto (ex: `https://sua-wishlist.vercel.app`):
1. Volte ao **Supabase** → **Authentication** → **URL Configuration**.
2. Defina **Site URL** como `https://sua-wishlist.vercel.app`.
3. Adicione `https://sua-wishlist.vercel.app/**` em **Redirect URLs**.

### 5. Primeiro Acesso

1. Gustavo e Kaylane acessam a URL da Vercel.
2. Cada um clica em "Criar conta" usando seus respectivos e-mails cadastrados em `ALLOWED_EMAILS`.
3. Pronto! O app está 100% ativo e exclusivo para o casal.
