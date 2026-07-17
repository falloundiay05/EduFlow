'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { bulkImportStudents } from '../actions'

type ParsedRow = {
  first_name: string
  last_name: string
  birth_date?: string
  class_name?: string
}

export default function ImportForm() {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccess(null)
    setFileName(file.name)

    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet)

      const parsed: ParsedRow[] = json.map((row) => ({
        first_name: row['Prénom'] || row['prenom'] || row['first_name'] || '',
        last_name: row['Nom'] || row['nom'] || row['last_name'] || '',
        birth_date: row['Date de naissance'] || row['birth_date'] || undefined,
        class_name: row['Classe'] || row['classe'] || row['class_name'] || undefined,
      }))

      setRows(parsed)
    } catch (err) {
      setError("Impossible de lire ce fichier. Vérifie qu'il s'agit bien d'un .xlsx ou .csv.")
    }
  }

  async function handleImport() {
    setLoading(true)
    setError(null)

    const result = await bulkImportStudents(rows)

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSuccess(`${result.imported} élève(s) importé(s) avec succès.`)
    setRows([])
    setTimeout(() => router.push('/dashboard/eleves'), 1500)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <p className="text-sm text-gray-600 mb-4">
          Le fichier Excel (.xlsx) ou CSV doit contenir des colonnes nommées :{' '}
          <code className="bg-gray-100 px-1 rounded">Prénom</code>,{' '}
          <code className="bg-gray-100 px-1 rounded">Nom</code>, et
          optionnellement <code className="bg-gray-100 px-1 rounded">Classe</code>{' '}
          et <code className="bg-gray-100 px-1 rounded">Date de naissance</code>.
          Le matricule est généré automatiquement, ne pas l&apos;inclure.
        </p>

        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFile}
          className="text-sm"
        />

        {fileName && (
          <p className="text-xs text-gray-400 mt-2">Fichier sélectionné : {fileName}</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
          {success}
        </p>
      )}

      {rows.length > 0 && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <p className="text-sm font-medium">
              Aperçu — {rows.length} ligne(s) détectée(s)
            </p>
            <button
              onClick={handleImport}
              disabled={loading}
              className="rounded bg-black text-white px-4 py-2 text-sm disabled:opacity-50"
            >
              {loading ? 'Import en cours...' : 'Confirmer l\'import'}
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Prénom</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Nom</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Classe</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Naissance</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 20).map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-2">{row.first_name || '—'}</td>
                  <td className="px-4 py-2">{row.last_name || '—'}</td>
                  <td className="px-4 py-2">{row.class_name || '—'}</td>
                  <td className="px-4 py-2">{row.birth_date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 20 && (
            <p className="text-xs text-gray-400 px-4 py-2">
              ... et {rows.length - 20} ligne(s) supplémentaire(s)
            </p>
          )}
        </div>
      )}
    </div>
  )
}
