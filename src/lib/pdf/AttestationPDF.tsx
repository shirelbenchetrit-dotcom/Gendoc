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
  const parts = d.split('T')[0].split('-')
  if (parts.length === 3) {
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface Props { student: Student; adminSignature?: string | null; adminStamp?: string | null }

export function AttestationPDF({ student, adminSignature, adminStamp }: Props) {
  const today = fmtDate(new Date().toISOString())
  const annee = new Date().getFullYear()

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.logoBlack}>Diploma </Text>
          <Text style={styles.logoBlue}>Santé</Text>
        </View>

        {/* Titre */}
        <Text style={styles.title}>ATTESTATION DE PRÉSENCE</Text>

        {/* Corps */}
        <Text style={styles.body}>
          Je soussignée, Benchetrit Shirel, responsable des formations de la prépa
          DIPLOMA SANTÉ, atteste que l&apos;étudiant(e) :
        </Text>

        <Text style={styles.body}>
          Nom/Prénom :{' '}
          <Text style={styles.bold}>
            {student.last_name.toUpperCase()} {student.first_name}
          </Text>
        </Text>

        <Text style={styles.body}>
          A suivi assidûment les cours dispensés par Diploma Santé durant l&apos;année scolaire{' '}
          <Text style={styles.bold}>{annee}/{annee + 1}</Text>{' '}
          dans le cadre de la formation :
        </Text>

        <Text style={styles.body}>
          -{' '}
          <Text style={styles.bold}>{student.formation}</Text>
          {student.universite ? <Text> — {student.universite}</Text> : null}
        </Text>

        <Text style={styles.body}>
          Cette attestation est délivrée à la demande de l&apos;intéressé(e) pour servir et valoir ce que de droit.
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
