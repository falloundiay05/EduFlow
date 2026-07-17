-- ============================
-- GÉNÉRATION AUTOMATIQUE DU MATRICULE
-- ============================

-- Séquence globale (remise à zéro manuelle possible chaque année si besoin)
create sequence if not exists student_matricule_seq;

create or replace function generate_matricule() returns trigger as $$
begin
  if new.matricule is null then
    new.matricule := 'ELV-' || to_char(now(), 'YYYY') || '-' ||
                      lpad(nextval('student_matricule_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_generate_matricule on students;

create trigger trg_generate_matricule
  before insert on students
  for each row
  execute function generate_matricule();

-- ============================
-- QUELQUES CLASSES DE TEST (à adapter ou compléter dans Supabase directement)
-- ============================
insert into classes (level, name, school_year)
values
  ('CI', 'CI A', '2025-2026'),
  ('CP', 'CP A', '2025-2026'),
  ('CE1', 'CE1 A', '2025-2026'),
  ('CE2', 'CE2 A', '2025-2026'),
  ('CM1', 'CM1 A', '2025-2026'),
  ('CM2', 'CM2 A', '2025-2026')
on conflict do nothing;
