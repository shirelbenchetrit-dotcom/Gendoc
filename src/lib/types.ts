export interface Profile {
  id: string
  email: string
  role: string
  created_at: string
}

export interface Student {
  id: string
  first_name: string
  last_name: string
  email: string | null
  formation: string
  universite: string | null
  date_inscription: string | null
  created_at: string
  date_naissance?: string
  nationalite?: string
  prix_formation?: string
}

export interface DocumentRecord {
  id: string
  student_id: string
  type: DocumentType
  generated_at: string
  generated_by: string
}

export type DocumentType =
  | 'certificat_scolarite'
  | 'convention_stage'
  | 'attestation_presence'
  | 'lettre_recommandation_fr'
  | 'lettre_recommandation_en'

export interface ConventionData {
  organisme: string
  siret: string
  adresseOrganisme: string
  representant: string
  typeExercice: string
  telephone: string
  emailOrganisme: string
  dateDebut: string
  dateFin: string
  // Infos étudiant dénormalisées pour la page publique de signature
  studentFirstName?: string
  studentLastName?: string
  studentFormation?: string
  studentEmail?: string
  adminStamp?: string
}

export type ConventionStatus = 'draft' | 'admin_signed' | 'organisme_signed' | 'completed'

export interface Convention {
  id: string
  student_id: string
  convention_data: ConventionData
  status: ConventionStatus
  admin_signature: string | null
  admin_signed_at: string | null
  organisme_signature: string | null
  organisme_signed_at: string | null
  organisme_token: string
  student_signature: string | null
  student_signed_at: string | null
  student_token: string
  created_at: string
  created_by: string
}

export const STATUS_LABELS: Record<ConventionStatus, string> = {
  draft: 'Brouillon',
  admin_signed: 'Signé par Diploma Santé — en attente organisme',
  organisme_signed: 'Signé par l\'organisme — en attente étudiant',
  completed: 'Signé par toutes les parties ✓',
}

export const STATUS_COLORS: Record<ConventionStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  admin_signed: 'bg-yellow-50 text-yellow-700',
  organisme_signed: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
}

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  certificat_scolarite: 'Certificat de scolarité',
  convention_stage: 'Convention de stage',
  attestation_presence: 'Attestation de présence',
  lettre_recommandation_fr: 'Lettre de recommandation (FR)',
  lettre_recommandation_en: 'Letter of Recommendation (EN)',
}
