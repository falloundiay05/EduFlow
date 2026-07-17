import Link from 'next/link'
import ImportForm from './ImportForm'

export default function ImportPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl">
        <Link href="/dashboard/eleves" className="text-sm text-gray-500 hover:underline">
          ← Retour à la liste
        </Link>

        <h1 className="text-xl font-medium mt-2 mb-6">Importer des élèves depuis Excel</h1>

        <ImportForm />
      </div>
    </div>
  )
}
