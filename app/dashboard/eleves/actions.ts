'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createStudent(formData: FormData) {
  const supabase = createClient()

  const first_name = formData.get('first_name') as string
  const last_name = formData.get('last_name') as string
  const birth_date = (formData.get('birth_date') as string) || null
  const class_id = (formData.get('class_id') as string) || null

  const { error } = await supabase.from('students').insert({
    first_name,
    last_name,
    birth_date,
    class_id,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/eleves')
  redirect('/dashboard/eleves')
}

export async function updateStudent(id: string, formData: FormData) {
  const supabase = createClient()

  const first_name = formData.get('first_name') as string
  const last_name = formData.get('last_name') as string
  const birth_date = (formData.get('birth_date') as string) || null
  const class_id = (formData.get('class_id') as string) || null

  const { error } = await supabase
    .from('students')
    .update({ first_name, last_name, birth_date, class_id })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/eleves')
  redirect('/dashboard/eleves')
}

export async function deleteStudent(formData: FormData) {
  const supabase = createClient()
  const id = formData.get('id') as string

  const { error } = await supabase.from('students').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/eleves')
}

type ImportRow = {
  first_name: string
  last_name: string
  birth_date?: string
  class_name?: string
}

export async function bulkImportStudents(rows: ImportRow[]) {
  const supabase = createClient()

  // Récupère les classes existantes pour faire correspondre le nom -> id
  const { data: classes } = await supabase.from('classes').select('id, name')
  const classMap = new Map((classes ?? []).map((c) => [c.name.toLowerCase(), c.id]))

  const toInsert = rows
    .filter((r) => r.first_name && r.last_name)
    .map((r) => ({
      first_name: r.first_name.trim(),
      last_name: r.last_name.trim(),
      birth_date: r.birth_date || null,
      class_id: r.class_name ? classMap.get(r.class_name.trim().toLowerCase()) ?? null : null,
    }))

  if (toInsert.length === 0) {
    return { error: 'Aucune ligne valide trouvée dans le fichier', imported: 0 }
  }

  const { error, count } = await supabase.from('students').insert(toInsert, { count: 'exact' })

  if (error) {
    return { error: error.message, imported: 0 }
  }

  revalidatePath('/dashboard/eleves')
  return { error: null, imported: count ?? toInsert.length }
}
