import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { Student } from '@/lib/types'

const NAVY = '#1e3a5f'
const SKY = '#38bdf8'

const styles = StyleSheet.create({
  page: { backgroundColor: '#ffffff', padding: 40, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', marginBottom: 30 },
  logoBlack: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: NAVY },
  logoBlue: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: SKY },
  title: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    textDecoration: 'underline',
    marginBottom: 30,
    marginTop: 20,
    color: '#000000',
  },
  body: { fontSize: 11, lineHeight: 1.6, color: '#333333', marginBottom: 12 },
  bold: { fontFamily: 'Helvetica-Bold' },
  salutation: { fontSize: 11, lineHeight: 1.6, color: '#333333', marginBottom: 16 },
  closing: { fontSize: 11, lineHeight: 1.6, color: '#333333', marginBottom: 40 },
  stamp: {
    marginTop: 20,
    alignSelf: 'flex-end',
    textAlign: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: NAVY,
    padding: 10,
    width: 180,
  },
  stampTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: NAVY, textAlign: 'center' },
  stampText: { fontSize: 9, color: '#333333', textAlign: 'center', marginTop: 2 },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#888888',
  },
})

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  const parts = d.split('T')[0].split('-')
  if (parts.length === 3) {
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface Props { student: Student }

export function LettreRecoFR({ student }: Props) {
  const today = fmtDate(new Date().toISOString())
  const prenomNom = `${student.first_name} ${student.last_name.toUpperCase()}`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.logoBlack}>Diploma </Text>
          <Text style={styles.logoBlue}>Santé</Text>
        </View>

        {/* Titre */}
        <Text style={styles.title}>LETTRE DE RECOMMANDATION</Text>

        <Text style={[styles.body, { marginBottom: 20 }]}>Paris, le {today}</Text>

        <Text style={styles.salutation}>À qui de droit,</Text>

        <Text style={styles.body}>
          Je soussignée, Benchetrit Shirel, responsable des formations de la prépa
          DIPLOMA SANTÉ, ai le plaisir de recommander{' '}
          <Text style={styles.bold}>{prenomNom}</Text>
          {' '}qui a suivi avec sérieux et engagement la formation{' '}
          <Text style={styles.bold}>{student.formation}</Text>
          {' '}au sein de Diploma Santé.
        </Text>

        <Text style={styles.body}>
          Cet étudiant a fait preuve de rigueur, de motivation et d&apos;un réel investissement tout au long de son parcours.
        </Text>

        <Text style={styles.body}>
          Je le/la recommande vivement pour tout projet d&apos;études supérieures ou toute candidature professionnelle.
        </Text>

        <Text style={styles.closing}>
          Veuillez agréer, Madame, Monsieur, l&apos;expression de mes salutations distinguées.
        </Text>

        <Text style={[styles.body, { marginBottom: 4 }]}>
          Fait à Paris,{'\n'}Le {today}
        </Text>

        <Text style={[styles.body, { marginBottom: 4 }]}>Tampon et signature de la direction :</Text>

        {/* Tampon */}
        <View style={styles.stamp}>
          <Text style={styles.stampTitle}>DIPLOMA SANTE</Text>
          <Text style={styles.stampText}>85 Avenue Ledru Rollin</Text>
          <Text style={styles.stampText}>75012 Paris</Text>
          <Text style={styles.stampText}>RCS Paris 878 200 534</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>www.diploma-sante.fr</Text>
      </Page>
    </Document>
  )
}
