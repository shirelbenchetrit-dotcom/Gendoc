-- Profils utilisateurs (liés à auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nom text not null,
  prenom text not null,
  email text not null,
  date_naissance date,
  nationalite text default 'Française',
  formation text,
  classe text,
  annee_scolaire text default '2025/2026',
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamp with time zone default now()
);

-- Activer RLS
alter table public.profiles enable row level security;

-- Policies profiles
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

create policy "Les utilisateurs modifient leur propre profil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Insertion lors de l'inscription"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Demandes de documents
create table public.demandes (
  id uuid default gen_random_uuid() primary key,
  etudiant_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('certificat_scolarite', 'bulletin_annuel', 'convention_stage')),
  statut text not null default 'en_attente' check (statut in ('en_attente', 'validee', 'refusee')),
  message_etudiant text,
  message_admin text,
  -- Champs spécifiques convention de stage
  organisme_nom text,
  organisme_siret text,
  organisme_adresse text,
  organisme_representant text,
  organisme_type text,
  organisme_telephone text,
  organisme_email text,
  stage_debut date,
  stage_fin date,
  -- Champs spécifiques bulletin
  annee_scolaire text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.demandes enable row level security;

create policy "Les étudiants voient leurs propres demandes"
  on public.demandes for select
  using (auth.uid() = etudiant_id);

create policy "Les admins voient toutes les demandes"
  on public.demandes for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Les étudiants créent des demandes"
  on public.demandes for insert
  with check (auth.uid() = etudiant_id);

create policy "Les admins modifient les demandes"
  on public.demandes for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Notes pour les bulletins
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  demande_id uuid references public.demandes(id) on delete cascade not null,
  matiere text not null,
  enseignant text,
  moyenne_eleve numeric(4,1),
  moyenne_classe numeric(4,1),
  note_min numeric(4,1),
  note_max numeric(4,1),
  appreciation text,
  ordre integer default 0
);

alter table public.notes enable row level security;

create policy "Accès aux notes via la demande"
  on public.notes for all
  using (
    exists (
      select 1 from public.demandes d
      where d.id = demande_id
      and (d.etudiant_id = auth.uid() or
        exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      )
    )
  );

-- Trigger pour updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger demandes_updated_at
  before update on public.demandes
  for each row execute function update_updated_at();
