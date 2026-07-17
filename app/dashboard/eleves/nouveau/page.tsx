import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createStudent } from '../actions'
import type { ClassRoom } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function NouvelElevePage() {
  const supabase = createClient()
  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .order('level', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-lg">
        <Link href="/dashboard/eleves" className="text-sm text-gray-500 hover:underline">
          ← Retour à la liste
        </Link>

        <h1 className="text-xl font-medium mt-2 mb-6">Ajouter un élève</h1>

        <form action={createStudent} className="space-y-4 bg-white border rounded-lg p-6">
          <p className="text-xs text-gray-400 -mt-2 mb-2">
            Le matricule sera généré automatiquement à l&apos;enregistrement.
          </p>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Prénom</label>
            <input
              name="first_name"
              required
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Nom</label>
            <input
              name="last_name"
              required
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Date de naissance</label>
            <input
              type="date"
              name="birth_date"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Classe</label>
            <select name="class_id" className="w-full rounded border px-3 py-2 text-sm">
              <option value="">— Aucune classe —</option>
              {(classes as ClassRoom[] | null)?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.level})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-black text-white py-2 text-sm"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  )
}
