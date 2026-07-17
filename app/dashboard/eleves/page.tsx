import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deleteStudent } from './actions'
import type { StudentWithClass } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ElevesPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = createClient()
  const query = searchParams.q ?? ''

  let request = supabase
    .from('students')
    .select('*, classes(name, level)')
    .order('last_name', { ascending: true })

  if (query) {
    request = request.or(
      `first_name.ilike.%${query}%,last_name.ilike.%${query}%,matricule.ilike.%${query}%`
    )
  }

  const { data: students, error } = await request

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium">Élèves</h1>
          <p className="text-sm text-gray-500 mt-1">
            {students?.length ?? 0} élève(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/eleves/import"
            className="rounded border px-4 py-2 text-sm bg-white hover:bg-gray-50"
          >
            Importer Excel
          </Link>
          <Link
            href="/dashboard/eleves/nouveau"
            className="rounded bg-black text-white px-4 py-2 text-sm"
          >
            + Ajouter un élève
          </Link>
        </div>
      </div>

      <form className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Rechercher par nom ou matricule..."
          className="w-full max-w-sm rounded border px-3 py-2 text-sm bg-white"
        />
      </form>

      {error && (
        <p className="text-sm text-red-600 mb-4">
          Erreur de chargement : {error.message}
        </p>
      )}

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Matricule</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nom</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Classe</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Naissance</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(students as StudentWithClass[] | null)?.map((student) => (
              <tr key={student.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{student.matricule}</td>
                <td className="px-4 py-3">
                  {student.last_name} {student.first_name}
                </td>
                <td className="px-4 py-3">
                  {student.classes ? `${student.classes.name}` : '—'}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {student.birth_date ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/dashboard/eleves/${student.id}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      Modifier
                    </Link>
                    <form action={deleteStudent}>
                      <input type="hidden" name="id" value={student.id} />
                      <button
                        type="submit"
                        className="text-red-600 hover:underline"
                      >
                        Supprimer
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {students?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Aucun élève trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
