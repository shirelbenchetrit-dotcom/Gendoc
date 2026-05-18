// Mapping prof (= nom de la tab Google Sheet) → infos affichées dans le mail
// Le nom de tab peut avoir des espaces en fin → on trim avant lookup.

export type Matiere = 'SVT' | 'Physique-Chimie' | 'Mathématiques'

export interface ProfInfo {
  /** Nom exact tel qu'écrit dans le mail, ex: "Mme Meryeme Benramdane" */
  displayName: string
  matiere: Matiere
}

const PROFS: Record<string, ProfInfo> = {
  'Meryeme Benramdane': { displayName: 'Mme Meryeme Benramdane', matiere: 'SVT' },
  'Mohammed Keskas': { displayName: 'Mr Mohammed Keskas', matiere: 'SVT' },
  'Elie Haddad': { displayName: 'Mr Elie Haddad', matiere: 'Physique-Chimie' },
  'Gabriel Boccara': { displayName: 'Mr Gabriel Boccara', matiere: 'Physique-Chimie' },
  'Mathieu Bach': { displayName: 'Mr Mathieu Bach', matiere: 'Physique-Chimie' },
  'Hamdy Diaw': { displayName: 'Mr Hamdy Diaw', matiere: 'Physique-Chimie' },
  'Dounia Yazidi': { displayName: 'Mme Dounia Yazidi', matiere: 'Physique-Chimie' },
  'Vanessa Cohen': { displayName: 'Mme Vanessa Cohen', matiere: 'Mathématiques' },
}

export function getProfInfo(tabName: string): ProfInfo | null {
  return PROFS[tabName.trim()] ?? null
}

export function allTabs(): string[] {
  return Object.keys(PROFS)
}
