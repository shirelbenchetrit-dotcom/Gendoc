import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Utiliser les polices standard
Font.register({
  family: 'Helvetica',
  fonts: [],
})

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 60,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 50,
  },
  logo: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  logoBlue: {
    color: '#1e3a5f',
  },
  logoSky: {
    color: '#38bdf8',
  },
  subtitle: {
    fontSize: 9,
    color: '#888',
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    textDecoration: 'underline',
    marginBottom: 50,
    color: '#1a1a1a',
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.8,
    marginBottom: 14,
    textAlign: 'justify',
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  spacer: {
    marginTop: 30,
  },
  signatureSection: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLeft: {
    width: '50%',
  },
  signatureRight: {
    width: '40%',
    alignItems: 'flex-end',
  },
  signatureLabel: {
    fontSize: 10,
    color: '#555',
    marginBottom: 4,
  },
  signatureDate: {
    fontSize: 11,
    marginBottom: 30,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 60,
    right: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#888',
  },
  stampBox: {
    borderWidth: 1,
    borderColor: '#1e3a5f',
    borderRadius: 4,
    padding: 8,
    width: 160,
  },
  stampTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
    marginBottom: 2,
  },
  stampText: {
    fontSize: 8,
    color: '#1e3a5f',
  },
})

interface CertificatPDFProps {
  demande: {
    profiles?: {
      nom: string
      prenom: string
      date_naissance: string | null
      nationalite: string
      formation: string | null
      annee_scolaire: string
    }
    created_at: string
  }
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function CertificatPDF({ demande }: CertificatPDFProps) {
  const p = demande.profiles
  const today = formatDate(demande.created_at)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>
            <Text style={styles.logoBlue}>Diploma </Text>
            <Text style={styles.logoSky}>Santé</Text>
          </Text>
          <Text style={styles.subtitle}>la prépa médecine</Text>
          <Text style={styles.subtitle}>85 Avenue Ledru Rollin, 75012 Paris</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>CERTIFICAT DE SCOLARITÉ</Text>

        {/* Body */}
        <Text style={styles.paragraph}>
          Je soussignée, Shirel Benchetrit, responsable de formation de la prépa DIPLOMA SANTÉ, atteste que l'étudiant(e) de nationalité{' '}
          <Text style={styles.bold}>{p?.nationalite || 'Française'}</Text> :
        </Text>

        <Text style={styles.paragraph}>
          Nom/Prénom :{' '}
          <Text style={styles.bold}>{p?.prenom} {p?.nom}</Text>
        </Text>

        {p?.date_naissance && (
          <Text style={styles.paragraph}>
            Né(e) le{' '}
            <Text style={styles.bold}>{formatDate(p.date_naissance)}</Text>
            , est inscrit(e) pour l'année{' '}
            <Text style={styles.bold}>{p?.annee_scolaire || '2025/2026'}</Text>
            {' '}au sein de notre institut d'enseignement dans le cadre de la formation :
          </Text>
        )}

        {!p?.date_naissance && (
          <Text style={styles.paragraph}>
            Est inscrit(e) pour l'année{' '}
            <Text style={styles.bold}>{p?.annee_scolaire || '2025/2026'}</Text>
            {' '}au sein de notre institut d'enseignement dans le cadre de la formation :
          </Text>
        )}

        <Text style={styles.paragraph}>
          -{' '}
          <Text style={styles.bold}>{p?.formation || 'PAES - Préparation à l\'Admission en Études de Santé'}</Text>
        </Text>

        <View style={styles.spacer} />

        {/* Signature */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureLeft}>
            <Text style={styles.signatureLabel}>Fait à Paris,</Text>
            <Text style={styles.signatureDate}>Le {today}</Text>
            <Text style={styles.signatureLabel}>Tampon et signature de la direction :</Text>
          </View>
          <View style={styles.signatureRight}>
            <View style={styles.stampBox}>
              <Text style={styles.stampTitle}>DIPLOMA SANTE</Text>
              <Text style={styles.stampText}>N° de siret : 87820053400013</Text>
              <Text style={styles.stampText}>www.diploma-sante.fr</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>DIPLOMA SANTE · 17, rue de la Plaine · 75020 Paris</Text>
          <Text style={styles.footerText}>RCS Paris 878 200 534</Text>
        </View>
      </Page>
    </Document>
  )
}
