# EduFlow — MVP

ERP scolaire pour écoles privées. Phase pilote : élèves, enseignants, paiements, notes, bulletins, authentification par rôle.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind — déployé sur Netlify
- Supabase (Postgres + Auth + Storage) — sécurité gérée via Row Level Security

## Installation

1. Installer les dépendances :
   ```bash
   npm install
   ```

2. Créer un projet sur [supabase.com](https://supabase.com) (gratuit).

3. Dans Supabase, aller dans **SQL Editor** et exécuter le contenu de
   `supabase/migrations/0001_init.sql`. Ça crée toutes les tables et les
   règles de sécurité (RLS).

4. Copier `.env.example` vers `.env.local` :
   ```bash
   cp .env.example .env.local
   ```
   Puis remplir avec les valeurs trouvées dans Supabase > Settings > API.

5. Créer un premier utilisateur de test :
   - Dans Supabase > Authentication > Users > Add user
   - Copier l'UUID généré
   - Dans SQL Editor, exécuter :
     ```sql
     insert into profiles (id, role, first_name, last_name)
     values ('UUID_COPIE_ICI', 'directeur', 'Amadou', 'Diop');
     ```

6. Lancer le projet :
   ```bash
   npm run dev
   ```
   Ouvrir http://localhost:3000 — ça redirige vers /login. Se connecter avec
   l'utilisateur créé à l'étape 5. Si ça redirige vers /dashboard, tout
   fonctionne.

## Déploiement sur Netlify

1. Pousser ce dossier sur un repo GitHub.
2. Sur [netlify.com](https://netlify.com), "Add new site" > "Import from
   Git", choisir le repo.
3. Netlify détecte Next.js automatiquement.
4. Dans Site settings > Environment variables, ajouter les mêmes variables
   que dans `.env.local`.
5. Déployer.

## Structure du projet

```
app/
  login/          page de connexion
  dashboard/       page protégée (temporaire, un vrai dashboard par rôle arrive au module suivant)
lib/supabase/
  client.ts        client Supabase côté navigateur
  server.ts        client Supabase côté serveur (Server Components)
middleware.ts      protège /dashboard, redirige si non connecté
supabase/migrations/
  0001_init.sql    schéma complet + Row Level Security
```

## Prochain module

Gestion des élèves : CRUD, import Excel, génération automatique du matricule.
