import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
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
  stamp: {
    marginTop: 40,
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
  // Éviter le décalage UTC pour les dates YYYY-MM-DD
  const parts = d.split('T')[0].split('-')
  if (parts.length === 3) {
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function dateFinFormation(formation: string): string {
  const f = formation.toUpperCase()
  if (f.includes('PASS') || f.includes('LAS') || f.includes('PAES')) {
    return '15 juin 2027'
  }
  return '15 juin 2027'
}

interface Props { student: Student; adminSignature?: string | null; adminStamp?: string | null }

export function CertificatPDF({ student, adminSignature, adminStamp }: Props) {
  const today = fmtDate(new Date().toISOString())
  const annee = new Date().getFullYear()

  const nationalite = student.nationalite || 'France'
  const dateNaissance = student.date_naissance
    ? fmtDate(student.date_naissance)
    : 'Non renseignée'
  const prixFormation = student.prix_formation || 'Nous contacter'
  const dateDebut = '15 septembre ' + annee
  const dateFin = dateFinFormation(student.formation)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.logoBlack}>Diploma </Text>
          <Text style={styles.logoBlue}>Santé</Text>
        </View>

        {/* Titre */}
        <Text style={styles.title}>CERTIFICAT DE SCOLARITÉ</Text>

        {/* Corps */}
        <Text style={styles.body}>
          Je soussignée, Allouche Jennifer, responsable administrative et opérationnelle de la prépa
          DIPLOMA SANTÉ, atteste que l&apos;étudiant(e) de nationalité : {nationalite}
        </Text>

        <Text style={styles.body}>
          Nom/Prénom :{' '}
          <Text style={styles.bold}>
            {student.last_name.toUpperCase()} {student.first_name}
          </Text>
        </Text>

        <Text style={styles.body}>
          Né(e) le {dateNaissance}, est inscrit(e) pour l&apos;année {annee}/{annee + 1} au sein de notre institut
          d&apos;enseignement dans le cadre de la formation :
        </Text>

        <Text style={styles.body}>
          -{' '}
          <Text style={styles.bold}>{student.formation}</Text>
        </Text>

        <Text style={styles.body}>
          Le prix total de la formation est de :{' '}
          <Text style={styles.bold}>{prixFormation}</Text>
        </Text>

        <Text style={styles.body}>
          Début de la formation :{' '}
          <Text style={styles.bold}>{dateDebut}</Text>
        </Text>

        <Text style={styles.body}>
          Fin de la formation :{' '}
          <Text style={styles.bold}>{dateFin}</Text>
        </Text>

        <Text style={[styles.body, { marginTop: 20 }]}>
          Fait à Paris,{'\n'}Le {today}
        </Text>

        <Text style={[styles.body, { marginTop: 8 }]}>
          Tampon et signature de la direction :
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 8 }}>
          {adminSignature
            ? <Image src={adminSignature} style={{ width: 130, height: 55 }} />
            : <View style={{ width: 130, height: 55 }} />
          }
          {adminStamp
            ? <Image src={adminStamp} style={{ width: 80, height: 80 }} />
            : (
              <View style={styles.stamp}>
                <Text style={styles.stampTitle}>DIPLOMA SANTE</Text>
                <Text style={styles.stampText}>85 Avenue Ledru Rollin</Text>
                <Text style={styles.stampText}>75012 Paris</Text>
                <Text style={styles.stampText}>RCS Paris 878 200 534</Text>
              </View>
            )
          }
        </View>

        {/* Footer */}
        <Text style={styles.footer}>www.diploma-sante.fr</Text>
      </Page>
    </Document>
  )
}
