-- Extension pour UUID
create extension if not exists "uuid-ossp";

-- Rôles disponibles
create type user_role as enum (
  'admin', 'directeur', 'comptable', 'scolarite',
  'surveillant', 'enseignant', 'parent', 'eleve'
);

-- Profils utilisateurs (lié à auth.users de Supabase)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  first_name text not null,
  last_name text not null,
  phone text,
  created_at timestamptz default now()
);

-- Classes
create table classes (
  id uuid primary key default uuid_generate_v4(),
  level text not null,
  name text not null,
  school_year text not null,
  main_teacher_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- Élèves
create table students (
  id uuid primary key default uuid_generate_v4(),
  matricule text unique not null,
  first_name text not null,
  last_name text not null,
  birth_date date,
  class_id uuid references classes(id),
  parent_id uuid references profiles(id),
  photo_url text,
  created_at timestamptz default now()
);

-- Paiements
create table payments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) not null,
  amount numeric(10,2) not null,
  method text check (method in ('wave', 'orange_money', 'carte', 'especes')) not null,
  status text check (status in ('paye', 'en_attente', 'echoue')) default 'en_attente',
  paid_at timestamptz,
  receipt_url text,
  created_at timestamptz default now()
);

-- Notes
create table grades (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) not null,
  teacher_id uuid references profiles(id) not null,
  subject text not null,
  value numeric(4,2) not null,
  term text not null,
  created_at timestamptz default now()
);

-- Bulletins
create table bulletins (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) not null,
  term text not null,
  average numeric(4,2),
  ranking text,
  pdf_url text,
  generated_at timestamptz default now()
);

-- ============================
-- ROW LEVEL SECURITY
-- ============================
alter table profiles enable row level security;
alter table classes enable row level security;
alter table students enable row level security;
alter table payments enable row level security;
alter table grades enable row level security;
alter table bulletins enable row level security;

-- Fonction utilitaire : récupère le rôle de l'utilisateur connecté
create or replace function auth_role() returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

-- Profiles : chacun voit le sien, admin/directeur voient tout
create policy "profiles_select" on profiles for select
  using (id = auth.uid() or auth_role() in ('admin', 'directeur'));

-- Students : parent voit ses enfants, staff voit tout
create policy "students_select" on students for select
  using (
    parent_id = auth.uid()
    or auth_role() in ('admin', 'directeur', 'comptable', 'scolarite', 'surveillant', 'enseignant')
  );

create policy "students_write" on students for insert with check (
  auth_role() in ('admin', 'directeur', 'scolarite')
);
create policy "students_update" on students for update using (
  auth_role() in ('admin', 'directeur', 'scolarite')
);

-- Payments : parent voit les paiements de ses enfants, comptable voit tout
create policy "payments_select" on payments for select using (
  exists (select 1 from students s where s.id = student_id and s.parent_id = auth.uid())
  or auth_role() in ('admin', 'directeur', 'comptable')
);
create policy "payments_write" on payments for insert with check (
  auth_role() in ('admin', 'directeur', 'comptable')
);

-- Grades : parent/élève voit ses notes, enseignant écrit ses notes
create policy "grades_select" on grades for select using (
  exists (select 1 from students s where s.id = student_id and s.parent_id = auth.uid())
  or auth_role() in ('admin', 'directeur', 'enseignant', 'scolarite')
);
create policy "grades_write" on grades for insert with check (
  auth_role() in ('admin', 'directeur', 'enseignant')
);
