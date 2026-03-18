import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
  },
  logoBlue: { color: '#1e3a5f' },
  logoSky: { color: '#38bdf8' },
  logoSub: { fontSize: 8, color: '#888' },
  addressBlock: {
    fontSize: 9,
    color: '#444',
    lineHeight: 1.5,
  },
  studentBlock: {
    textAlign: 'right',
    fontSize: 9,
  },
  pageTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: '#1e3a5f',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
    fontSize: 9,
  },
  infoLabel: { color: '#666' },
  infoBold: { fontFamily: 'Helvetica-Bold', color: '#1e3a5f' },
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e3a5f',
    color: 'white',
    padding: 6,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableRowEven: {
    backgroundColor: '#f8f9fa',
  },
  colMatiere: { width: '22%', fontFamily: 'Helvetica-Bold' },
  colEnseignant: { width: '18%' },
  colNote: { width: '9%', textAlign: 'center' },
  colAppreciation: { width: '33%', color: '#555' },
  colHeader: { color: 'white', fontFamily: 'Helvetica-Bold', fontSize: 8 },
  averageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#1e3a5f',
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
  },
  averageText: {
    color: 'white',
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  absenteRow: {
    flexDirection: 'row',
    marginTop: 8,
    fontSize: 9,
    color: '#555',
  },
  appreciationBox: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 10,
    marginTop: 12,
  },
  appreciationTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginBottom: 6,
    color: '#1e3a5f',
  },
  appreciationText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#333',
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  stampBox: {
    borderWidth: 1,
    borderColor: '#1e3a5f',
    borderRadius: 4,
    padding: 8,
    width: 150,
    alignItems: 'center',
  },
  stampTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
    marginBottom: 2,
  },
  stampText: {
    fontSize: 7,
    color: '#1e3a5f',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: '#aaa',
  },
})

interface Note {
  matiere: string
  enseignant: string | null
  moyenne_eleve: number | null
  moyenne_classe: number | null
  note_min: number | null
  note_max: number | null
  appreciation: string | null
  ordre: number
}

interface BulletinPDFProps {
  demande: {
    annee_scolaire?: string | null
    profiles?: {
      nom: string
      prenom: string
      date_naissance: string | null
      classe: string | null
      annee_scolaire: string
    }
    notes?: Note[]
    created_at: string
  }
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatNote(n: number | null): string {
  if (n === null || n === undefined) return '—'
  return n.toFixed(1)
}

export function BulletinPDF({ demande }: BulletinPDFProps) {
  const p = demande.profiles
  const notes = (demande.notes || []).sort((a, b) => a.ordre - b.ordre)
  const annee = demande.annee_scolaire || p?.annee_scolaire || '2025/2026'

  const moyenneEleve = notes.length > 0 && notes.some(n => n.moyenne_eleve !== null)
    ? (notes.reduce((sum, n) => sum + (n.moyenne_eleve || 0), 0) / notes.filter(n => n.moyenne_eleve !== null).length).toFixed(1)
    : null

  const moyenneClasse = notes.length > 0 && notes.some(n => n.moyenne_classe !== null)
    ? (notes.reduce((sum, n) => sum + (n.moyenne_classe || 0), 0) / notes.filter(n => n.moyenne_classe !== null).length).toFixed(1)
    : null

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>
              <Text style={styles.logoBlue}>Diploma </Text>
              <Text style={styles.logoSky}>Santé</Text>
            </Text>
            <Text style={styles.logoSub}>la prépa médecine</Text>
            <View style={{ marginTop: 4 }}>
              <Text style={styles.addressBlock}>85 Avenue Ledru Rollin</Text>
              <Text style={styles.addressBlock}>75012 Paris</Text>
            </View>
          </View>
          <View>
            <Text style={styles.pageTitle}>Bulletin Annuel</Text>
          </View>
          <View style={styles.studentBlock}>
            <Text>Élève : <Text style={{ fontFamily: 'Helvetica-Bold' }}>{p?.prenom} {p?.nom}</Text></Text>
            {p?.date_naissance && (
              <Text>Né le : <Text style={{ fontFamily: 'Helvetica-Bold' }}>{formatDate(p.date_naissance)}</Text></Text>
            )}
          </View>
        </View>

        {/* Info row */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Année scolaire : <Text style={styles.infoBold}>{annee}</Text>
          </Text>
          <Text style={styles.infoLabel}>
            Classe : <Text style={styles.infoBold}>{p?.classe || '—'}</Text>
          </Text>
          <Text style={styles.infoLabel}>
            Chargée d'études : <Text style={styles.infoBold}>Shirel Benchetrit</Text>
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colMatiere, styles.colHeader]}>Matière</Text>
            <Text style={[styles.colEnseignant, styles.colHeader]}>Enseignant</Text>
            <Text style={[styles.colNote, styles.colHeader]}>Moy. Élève</Text>
            <Text style={[styles.colNote, styles.colHeader]}>Moy. Classe</Text>
            <Text style={[styles.colNote, styles.colHeader]}>Note +</Text>
            <Text style={[styles.colNote, styles.colHeader]}>Note -</Text>
            <Text style={[styles.colAppreciation, styles.colHeader]}>Appréciation</Text>
          </View>
          {notes.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={{ color: '#aaa', fontSize: 9, padding: 8 }}>Aucune note renseignée</Text>
            </View>
          ) : (
            notes.map((note, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowEven : {}]}>
                <Text style={styles.colMatiere}>{note.matiere}</Text>
                <Text style={styles.colEnseignant}>{note.enseignant || '—'}</Text>
                <Text style={styles.colNote}>{formatNote(note.moyenne_eleve)}</Text>
                <Text style={styles.colNote}>{formatNote(note.moyenne_classe)}</Text>
                <Text style={styles.colNote}>{formatNote(note.note_max)}</Text>
                <Text style={styles.colNote}>{formatNote(note.note_min)}</Text>
                <Text style={styles.colAppreciation}>{note.appreciation || ''}</Text>
              </View>
            ))
          )}
        </View>

        {/* Moyennes générales */}
        {(moyenneEleve || moyenneClasse) && (
          <View style={styles.averageRow}>
            <Text style={styles.averageText}>
              Moyennes générales : Élève {moyenneEleve}{'   '}Classe {moyenneClasse}
            </Text>
          </View>
        )}

        {/* Absences */}
        <View style={styles.absenteRow}>
          <Text>Absences, vie scolaire : RAS</Text>
          <Text style={{ marginLeft: 'auto', color: '#888', fontStyle: 'italic' }}>
            Visa du chef d'établissement ou de son délégué
          </Text>
        </View>

        {/* Tampon */}
        <View style={styles.signatureSection}>
          <View style={styles.stampBox}>
            <Text style={styles.stampTitle}>DIPLOMA SANTE</Text>
            <Text style={styles.stampText}>17, rue de la Plaine</Text>
            <Text style={styles.stampText}>75020 Paris</Text>
            <Text style={styles.stampText}>RCS Paris 878 200 534</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Diploma Santé · Bulletin Annuel · {annee}</Text>
          <Text style={styles.footerText}>www.diploma-sante.fr</Text>
        </View>
      </Page>
    </Document>
  )
}
