-- =============================================
-- Gendoc — Diploma Santé — Schéma Supabase
-- =============================================

-- Profiles (liés à auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text not null default 'admin',
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Les utilisateurs voient leur propre profil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Les admins voient tous les profils"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Insertion du profil lors de l'inscription"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Modification du propre profil"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger : créer un profil automatiquement lors de l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'admin');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Étudiants
create table public.students (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text,
  formation text not null,
  universite text,
  date_inscription date,
  created_at timestamp with time zone default now()
);

alter table public.students enable row level security;

create policy "Les admins voient tous les étudiants"
  on public.students for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Les admins créent des étudiants"
  on public.students for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Les admins modifient les étudiants"
  on public.students for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Les admins suppriment les étudiants"
  on public.students for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- Documents générés
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  type text not null,
  generated_at timestamp with time zone default now(),
  generated_by uuid references public.profiles(id)
);

alter table public.documents enable row level security;

create policy "Les admins voient tous les documents"
  on public.documents for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Les admins insèrent des documents"
  on public.documents for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
