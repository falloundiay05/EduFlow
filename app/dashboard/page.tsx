import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/dist/client/link'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-xl font-medium mb-2">Tableau de bord</h1>
      <p className="text-sm text-gray-600">
        Connecté en tant que {profile?.first_name} {profile?.last_name} ({profile?.role})
      </p>
      <p className="text-xs text-gray-400 mt-4">
        import Link from 'next/link'
        <Link
          href="/dashboard/eleves"
          className="inline-block mt-4 rounded bg-black text-white px-4 py-2 text-sm"
        >
          Gérer les élèves
        </Link>
      </p>
    </div>
  )
}
