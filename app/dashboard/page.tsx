import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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
        Ceci est une page temporaire. Le vrai dashboard par rôle arrive au module suivant.
      </p>
    </div>
  )
}
