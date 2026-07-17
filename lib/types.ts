export type ClassRoom = {
  id: string
  level: string
  name: string
  school_year: string
}

export type Student = {
  id: string
  matricule: string
  first_name: string
  last_name: string
  birth_date: string | null
  class_id: string | null
  parent_id: string | null
  photo_url: string | null
  created_at: string
}

export type StudentWithClass = Student & {
  classes: { name: string; level: string } | null
}
