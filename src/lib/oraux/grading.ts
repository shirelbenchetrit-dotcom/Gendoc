// Convertit une note /20 en label coloré + détermine le ton du mail

export interface NoteAppraisal {
  /** Texte affiché sous la note, ex: "Excellent ⭐" */
  label: string
  /** Couleur HEX du label */
  color: string
  /** Phrase d'encouragement en fin de mail */
  closing: string
}

export function appraisalForNote(note: number): NoteAppraisal {
  if (note >= 18) return {
    label: 'Excellent ⭐',
    color: '#16a34a',
    closing: 'Félicitations et bon courage pour la suite,',
  }
  if (note >= 16) return {
    label: 'Très bien',
    color: '#16a34a',
    closing: 'Félicitations et bon courage pour la suite,',
  }
  if (note >= 14) return {
    label: 'Bien',
    color: '#0284c7',
    closing: 'Bon travail, continue sur cette lancée. Bon courage pour la suite,',
  }
  if (note >= 12) return {
    label: 'Assez bien',
    color: '#0284c7',
    closing: 'Bon courage pour la suite,',
  }
  if (note >= 10) return {
    label: 'Passable',
    color: '#ea580c',
    closing: 'Continue tes efforts, tu vas progresser. Bon courage pour la suite,',
  }
  return {
    label: 'À retravailler',
    color: '#dc2626',
    closing: 'Ne te décourage pas, accroche-toi. Bon courage pour la suite,',
  }
}

/** Convertit le code de compétence (TI/I/S/TS) en couleur pour l'affichage */
export function competenceColor(code: string): string {
  const c = code?.trim().toUpperCase()
  if (c === 'TS') return '#16a34a'    // vert foncé
  if (c === 'S') return '#0284c7'     // bleu
  if (c === 'I') return '#ea580c'     // orange
  if (c === 'TI') return '#dc2626'    // rouge
  return '#64748b'                     // gris fallback
}
