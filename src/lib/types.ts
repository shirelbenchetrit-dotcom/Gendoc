export type Role = 'student' | 'admin'

export type TypeDocument = 'certificat_scolarite' | 'bulletin_annuel' | 'convention_stage'

export type StatutDemande = 'en_attente' | 'validee' | 'refusee'

export interface Profile {
  id: string
  nom: string
  prenom: string
  email: string
  date_naissance: string | null
  nationalite: string
  formation: string | null
  classe: string | null
  annee_scolaire: string
  role: Role
  created_at: string
}

export interface Note {
  id: string
  demande_id: string
  matiere: string
  enseignant: string | null
  moyenne_eleve: number | null
  moyenne_classe: number | null
  note_min: number | null
  note_max: number | null
  appreciation: string | null
  ordre: number
}

export interface Demande {
  id: string
  etudiant_id: string
  type: TypeDocument
  statut: StatutDemande
  message_etudiant: string | null
  message_admin: string | null
  organisme_nom: string | null
  organisme_siret: string | null
  organisme_adresse: string | null
  organisme_representant: string | null
  organisme_type: string | null
  organisme_telephone: string | null
  organisme_email: string | null
  stage_debut: string | null
  stage_fin: string | null
  annee_scolaire: string | null
  created_at: string
  updated_at: string
  profiles?: Profile
  notes?: Note[]
}

export const TYPE_LABELS: Record<TypeDocument, string> = {
  certificat_scolarite: 'Certificat de scolarité',
  bulletin_annuel: 'Bulletin annuel',
  convention_stage: 'Convention de stage',
}

export const STATUT_LABELS: Record<StatutDemande, string> = {
  en_attente: 'En attente',
  validee: 'Validée',
  refusee: 'Refusée',
}
