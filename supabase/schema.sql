-- ==============================================================================
-- Schema do Banco de Dados - Wishlist Compartilhada (Supabase PostgreSQL)
-- ==============================================================================

-- 1. Criação da tabela de Perfis de Usuário
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilita RLS para profiles
alter table public.profiles enable row level security;

-- Políticas de RLS para profiles:
-- Qualquer usuário autenticado pode ler os perfis (para saber os nomes das duas listas)
create policy "Perfis podem ser visualizados por usuários autenticados"
  on public.profiles for select
  to authenticated
  using (true);

-- Cada usuário só pode atualizar seu próprio perfil
create policy "Usuários podem atualizar seus próprios perfis"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- 2. Tabela de Produtos / Itens da Wishlist
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text, -- opcional
  image_url text,
  price numeric(10, 2),
  store_name text,
  notes text, -- comentários / recadinho para quem vai presentear
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Caso a tabela já tenha sido criada anteriormente:
alter table public.products alter column url drop not null;
alter table public.products add column if not exists notes text;

-- Índices para performance
create index if not exists products_user_id_idx on public.products(user_id);
create index if not exists products_created_at_idx on public.products(created_at desc);

-- Habilita RLS para products
alter table public.products enable row level security;

-- Políticas de RLS para products:
-- Ambos os usuários autenticados podem ver todos os produtos (wishlist compartilhada)
create policy "Usuários autenticados podem visualizar todos os produtos"
  on public.products for select
  to authenticated
  using (true);

-- Apenas o proprietário pode adicionar produtos para si mesmo
create policy "Usuário pode adicionar produtos apenas para si mesmo"
  on public.products for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Apenas o proprietário pode atualizar seus próprios produtos
create policy "Usuário pode atualizar apenas seus próprios produtos"
  on public.products for update
  to authenticated
  using (auth.uid() = user_id);

-- Apenas o proprietário pode excluir seus próprios produtos
create policy "Usuário pode excluir apenas seus próprios produtos"
  on public.products for delete
  to authenticated
  using (auth.uid() = user_id);

-- 3. Trigger para criar perfil automaticamente no login/cadastro
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Remove o trigger se já existir e recria
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Função auxiliar para atualização automática de updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger set_products_updated_at
  before update on public.products
  for each row execute procedure public.handle_updated_at();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();
