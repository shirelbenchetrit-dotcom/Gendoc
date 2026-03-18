import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

const NAVY = '#1e3a5f'
const SKY = '#38bdf8'
const GOLD = '#b8962e'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 50,
    color: '#1a1a1a',
  },
  header: {
    backgroundColor: NAVY,
    margin: -50,
    marginBottom: 30,
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
  },
  logoSky: { color: SKY },
  headerRight: {
    backgroundColor: SKY,
    borderRadius: 4,
    padding: 10,
    width: 130,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    textAlign: 'center',
  },
  pageTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: NAVY,
    marginBottom: 20,
  },
  datesRow: {
    textAlign: 'center',
    fontSize: 10,
    marginBottom: 12,
    color: '#444',
  },
  intro: {
    fontSize: 9,
    color: '#555',
    marginBottom: 12,
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    backgroundColor: GOLD,
    borderRadius: 4,
    padding: '6 10',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
  },
  sectionBody: {
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
    padding: '8 12',
  },
  field: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  fieldLabel: {
    width: '40%',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#444',
  },
  fieldValue: {
    width: '60%',
    fontSize: 9,
    color: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 1,
  },
  articleSection: {
    marginBottom: 8,
  },
  articleTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: SKY,
    marginBottom: 3,
  },
  articleText: {
    fontSize: 8,
    lineHeight: 1.5,
    color: '#333',
  },
  signaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  signatureBox: {
    width: '45%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  signatureHeader: {
    backgroundColor: GOLD,
    borderRadius: 3,
    padding: '4 8',
    marginBottom: 8,
  },
  signatureHeaderText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
    textAlign: 'center',
  },
  signatureField: {
    fontSize: 8,
    marginBottom: 4,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 2,
    minHeight: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
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
  pageNumber: {
    fontSize: 8,
    color: SKY,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
})

interface ConventionPDFProps {
  demande: {
    organisme_nom?: string | null
    organisme_siret?: string | null
    organisme_adresse?: string | null
    organisme_representant?: string | null
    organisme_type?: string | null
    organisme_telephone?: string | null
    organisme_email?: string | null
    stage_debut?: string | null
    stage_fin?: string | null
    profiles?: {
      nom: string
      prenom: string
      date_naissance: string | null
      email: string
      formation: string | null
    }
    created_at: string
  }
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '............................................'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function val(v: string | null | undefined): string {
  return v || '............................................'
}

export function ConventionPDF({ demande }: ConventionPDFProps) {
  const p = demande.profiles

  return (
    <Document>
      {/* Page 1 - Parties */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>
            Diploma <Text style={styles.logoSky}>Santé</Text>
          </Text>
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>CONVENTION{'\n'}DE STAGE</Text>
          </View>
        </View>

        <Text style={styles.pageTitle}>Convention de Stage</Text>

        <Text style={styles.datesRow}>
          Dates du stage : {formatDate(demande.stage_debut)} → {formatDate(demande.stage_fin)}
        </Text>

        <Text style={styles.intro}>
          Tout stage en entreprise suppose la rédaction et la signature de la convention de stage ci-contre en trois exemplaires entre :
        </Text>

        {/* Établissement */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>1. L'ÉTABLISSEMENT SUPÉRIEUR : DIPLOMA SANTE</Text>
          </View>
          <View style={styles.sectionBody}>
            {[
              { label: 'Représentée par :', value: 'Shirel Benchetrit' },
              { label: 'Adresse :', value: '85 Avenue Ledru Rollin 75012 Paris' },
              { label: 'Numéro :', value: '01 76 41 01 73' },
              { label: 'Courriel :', value: 'contact@diploma-sante.fr' },
            ].map(({ label, value }) => (
              <View key={label} style={styles.field}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <Text style={styles.fieldValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Organisme */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>2. L'ORGANISME D'ACCUEIL</Text>
          </View>
          <View style={styles.sectionBody}>
            {[
              { label: 'Raison sociale :', value: val(demande.organisme_nom) },
              { label: 'N° Siret ou Siren :', value: val(demande.organisme_siret) },
              { label: 'Adresse :', value: val(demande.organisme_adresse) },
              { label: 'Représenté par :', value: val(demande.organisme_representant) },
              { label: 'Type et lieu d\'exercice :', value: val(demande.organisme_type) },
              { label: 'Tél. Mobile :', value: val(demande.organisme_telephone) },
              { label: 'Email :', value: val(demande.organisme_email) },
            ].map(({ label, value }) => (
              <View key={label} style={styles.field}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <Text style={styles.fieldValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Étudiant */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>3. L'ÉTUDIANT STAGIAIRE</Text>
          </View>
          <View style={styles.sectionBody}>
            {[
              { label: 'Nom :', value: val(p?.nom) },
              { label: 'Prénom :', value: val(p?.prenom) },
              { label: 'Date de naissance :', value: formatDate(p?.date_naissance) },
              { label: 'Courriel :', value: val(p?.email) },
              { label: 'Formation suivie :', value: val(p?.formation) },
            ].map(({ label, value }) => (
              <View key={label} style={styles.field}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <Text style={styles.fieldValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={{ fontSize: 8, textAlign: 'center', color: '#888', fontStyle: 'italic', marginTop: 8 }}>
          Si le stagiaire est mineur, la convention de stage doit être signée par son représentant légal.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Diploma Santé · Dossier d'inscription</Text>
          <Text style={styles.pageNumber}>1/2</Text>
        </View>
      </Page>

      {/* Page 2 - Articles et signatures */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>Convention de Stage</Text>

        {[
          {
            title: 'Article 1 : OBJECTIF DE LA CONVENTION',
            text: "L'organisme d'accueil mentionné ci-dessus accepte d'accueillir en stage, dans les conditions définies ci-après, un(e) étudiant(e). La finalité et les modalités du stage sont définies dans le présent document.",
          },
          {
            title: 'Article 2 : OBJECTIF DU STAGE',
            text: "Le stage a pour objectif de faire découvrir au futur étudiant l'application pratique de son futur métier. Il sera formateur tout en étant utile à la structure d'accueil. Le but du stage est la découverte du corps de métier médical et de l'organisation d'une structure de soin.",
          },
          {
            title: 'Article 3 : CONDITIONS DU STAGE',
            text: 'Le stage se déroulera du lundi au vendredi (horaires variables, matin et après-midi, week-ends ou jours fériés suivant les structures).',
          },
          {
            title: 'Article 4 : GRATIFICATION',
            text: "Le stage étant d'une durée inférieure à 2 mois, aucune rémunération n'est obligatoire. Toutefois, l'employeur peut offrir une gratification en cas de stage satisfaisant.",
          },
          {
            title: 'Article 5 : STATUT DU STAGIAIRE',
            text: "L'étudiant s'engage durant le stage, à observer le règlement interne ou les règles définies par l'organisme d'accueil. L'étudiant est tenu au respect du secret professionnel.",
          },
          {
            title: 'Article 6 : PROTECTION SOCIALE',
            text: "Pendant la durée du stage, le stagiaire reste affilié à son régime de Sécurité Sociale antérieur qui couvre les accidents du travail.",
          },
          {
            title: 'Article 7 : FIN DE STAGE',
            text: "L'étudiant(e) est tenu(e), à la fin du stage, de rédiger un rapport qu'il doit présenter à Diploma Santé. La convention de stage doit être signée par l'employeur et retournée à Diploma Santé.",
          },
        ].map(({ title, text }) => (
          <View key={title} style={styles.articleSection}>
            <Text style={styles.articleTitle}>{title}</Text>
            <Text style={styles.articleText}>{text}</Text>
          </View>
        ))}

        <Text style={{ fontSize: 8, textAlign: 'center', color: '#555', marginTop: 10, marginBottom: 8 }}>
          La signature du présent document par les 3 parties concernées implique un consentement exprès aux clauses de cette convention.
        </Text>

        {/* Signatures */}
        <View style={styles.signaturesRow}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureHeader}>
              <Text style={styles.signatureHeaderText}>L'étudiant</Text>
            </View>
            <Text style={styles.signatureField}>Nom : {p?.nom || ''}</Text>
            <Text style={styles.signatureField}>Prénom : {p?.prenom || ''}</Text>
            <Text style={styles.signatureField}>Le :</Text>
            <Text style={{ fontSize: 8, color: '#555', marginTop: 4 }}>Signature :</Text>
            <View style={{ height: 30 }} />
          </View>

          <View style={styles.signatureBox}>
            <View style={styles.signatureHeader}>
              <Text style={styles.signatureHeaderText}>Diploma Santé</Text>
            </View>
            <Text style={styles.signatureField}>Nom : Benchetrit</Text>
            <Text style={styles.signatureField}>Prénom : Shirel</Text>
            <Text style={styles.signatureField}>Le :</Text>
            <Text style={{ fontSize: 8, color: '#555', marginTop: 4 }}>Cachet :</Text>
            <View style={{ height: 30, borderWidth: 1, borderColor: '#1e3a5f', borderRadius: 2, marginTop: 4, padding: 4 }}>
              <Text style={{ fontSize: 7, color: '#1e3a5f', fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>DIPLOMA SANTE</Text>
              <Text style={{ fontSize: 6, color: '#1e3a5f', textAlign: 'center' }}>RCS Paris 878 200 534</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Diploma Santé · Dossier d'inscription</Text>
          <Text style={styles.pageNumber}>2/2</Text>
        </View>
      </Page>
    </Document>
  )
}
