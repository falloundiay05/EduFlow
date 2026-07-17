import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateStudent } from '../../actions'
import type { ClassRoom, Student } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ModifierElevePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const [{ data: student }, { data: classes }] = await Promise.all([
    supabase.from('students').select('*').eq('id', params.id).single(),
    supabase.from('classes').select('*').order('level', { ascending: true }),
  ])

  if (!student) {
    notFound()
  }

  const s = student as Student
  const updateWithId = updateStudent.bind(null, s.id)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-lg">
        <Link href="/dashboard/eleves" className="text-sm text-gray-500 hover:underline">
          ← Retour à la liste
        </Link>

        <h1 className="text-xl font-medium mt-2 mb-1">Modifier l&apos;élève</h1>
        <p className="text-xs text-gray-400 mb-6 font-mono">{s.matricule}</p>

        <form action={updateWithId} className="space-y-4 bg-white border rounded-lg p-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Prénom</label>
            <input
              name="first_name"
              required
              defaultValue={s.first_name}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Nom</label>
            <input
              name="last_name"
              required
              defaultValue={s.last_name}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Date de naissance</label>
            <input
              type="date"
              name="birth_date"
              defaultValue={s.birth_date ?? ''}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Classe</label>
            <select
              name="class_id"
              defaultValue={s.class_id ?? ''}
              className="w-full rounded border px-3 py-2 text-sm"
            >
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
            Mettre à jour
          </button>
        </form>
      </div>
    </div>
  )
}
