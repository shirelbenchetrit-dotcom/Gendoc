import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { Student, ConventionData } from '@/lib/types'

const NAVY = '#1e3a5f'
const SKY = '#4db8e8'
const GOLD = '#b8962e'
const GRAY_BG = '#efefef'
const DOTS = '.................................................................................................'

const styles = StyleSheet.create({
  // ── Cover ───────────────────────────────────────────────────────────────
  coverPage: { backgroundColor: NAVY, padding: 60 },
  coverTop: { alignItems: 'flex-end' },
  coverLogoRow: { flexDirection: 'row', alignItems: 'baseline' },
  coverLogoWhite: { fontSize: 30, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  coverLogoBlue: { fontSize: 30, fontFamily: 'Helvetica-Bold', color: SKY },
  coverSubtitle: { fontSize: 10, color: '#94b8d4', marginTop: 4, textAlign: 'right' },
  coverSpacer: { flex: 1 },
  coverBox: {
    backgroundColor: SKY,
    borderRadius: 10,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignSelf: 'flex-end',
    width: 240,
  },
  coverBoxText: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 1.3,
  },

  // ── Content pages ────────────────────────────────────────────────────────
  page: { backgroundColor: '#ffffff', paddingBottom: 52 },

  pageHeader: {
    backgroundColor: NAVY,
    paddingVertical: 18,
    paddingHorizontal: 40,
  },
  pageHeaderText: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  dashedSep: {
    marginHorizontal: 40,
    borderBottomWidth: 1,
    borderBottomStyle: 'dashed',
    borderBottomColor: GOLD,
    marginBottom: 20,
  },

  content: { paddingHorizontal: 40 },

  // Date intro
  dateTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#222222',
    textAlign: 'center',
    marginBottom: 8,
  },
  introText: {
    fontSize: 9,
    color: '#555555',
    lineHeight: 1.5,
    marginBottom: 18,
  },

  // Section pill + box
  pill: {
    backgroundColor: GOLD,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  pillText: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  box: {
    backgroundColor: GRAY_BG,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  fieldRow: { flexDirection: 'row', marginBottom: 7, alignItems: 'flex-end' },
  fieldLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    width: 130,
  },
  fieldValue: {
    flex: 1,
    fontSize: 9,
    color: '#222222',
    borderBottomWidth: 1,
    borderBottomColor: '#bbbbbb',
    paddingBottom: 1,
  },

  noteText: {
    fontSize: 9,
    color: '#444444',
    textAlign: 'center',
    textDecoration: 'underline',
    marginTop: 4,
  },

  // ── Articles ─────────────────────────────────────────────────────────────
  articleWrap: { marginBottom: 12 },
  articleHeader: {
    backgroundColor: GRAY_BG,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    marginBottom: 5,
  },
  articleNum: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: SKY },
  articleTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#222222' },
  articleText: { fontSize: 9, lineHeight: 1.6, color: '#444444', paddingHorizontal: 2 },

  // ── Signatures ───────────────────────────────────────────────────────────
  sigIntro: {
    fontSize: 9,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 1.5,
    marginBottom: 24,
  },
  sigRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  sigBox: {
    width: '47%',
    backgroundColor: GRAY_BG,
    borderRadius: 8,
    padding: 14,
  },
  sigBoxBottom: {
    width: '47%',
    backgroundColor: GRAY_BG,
    borderRadius: 8,
    padding: 14,
  },
  sigPill: {
    backgroundColor: GOLD,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sigPillNavy: {
    backgroundColor: NAVY,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sigPillText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#ffffff', textAlign: 'center' },
  sigField: {
    fontSize: 9,
    color: '#333333',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 2,
  },
  sigLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#333333', marginTop: 12, marginBottom: 2 },
  sigSpace: { height: 48 },
  stampBox: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: NAVY,
    padding: 10,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  stampTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: NAVY, textAlign: 'center', marginBottom: 3 },
  stampText: { fontSize: 8, color: '#444444', textAlign: 'center', lineHeight: 1.4 },

  // ── Footer ───────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: { fontSize: 8, color: '#888888' },
  footerBold: { fontFamily: 'Helvetica-Bold', color: NAVY },
  footerPill: {
    backgroundColor: SKY,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  footerPillText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
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

interface Signatures {
  admin?: string | null
  organisme?: string | null
  student?: string | null
}
interface SignedAt {
  admin?: string | null
  organisme?: string | null
  student?: string | null
}
interface Props {
  student: Student
  convention: ConventionData
  signatures?: Signatures
  signedAt?: SignedAt
}

function SigImage({ src }: { src?: string | null }) {
  if (!src) return <View style={{ height: 50 }} />
  // react-pdf v4 accepte les data URLs directement
  return <Image src={src} style={{ width: 140, height: 50 }} />
}

function PageHeader() {
  return (
    <>
      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderText}>Convention de Stage</Text>
      </View>
      <View style={styles.dashedSep} />
    </>
  )
}

function Footer({ page, total }: { page: number; total: number }) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        <Text style={styles.footerBold}>Diploma Santé</Text>
        {' '}— Dossier d&apos;inscription
      </Text>
      <View style={styles.footerPill}>
        <Text style={styles.footerPillText}>{page}/{total}</Text>
      </View>
    </View>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || DOTS}</Text>
    </View>
  )
}

export function ConventionPDF({ student, convention, signatures, signedAt }: Props) {
  return (
    <Document>

      {/* ── Page 1 : Couverture ── */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverTop}>
          <View style={styles.coverLogoRow}>
            <Text style={styles.coverLogoWhite}>Diploma </Text>
            <Text style={styles.coverLogoBlue}>Santé</Text>
          </View>
          <Text style={styles.coverSubtitle}>la prépa médecine</Text>
        </View>
        <View style={styles.coverSpacer} />
        <View style={styles.coverBox}>
          <Text style={styles.coverBoxText}>CONVENTION{'\n'}DE STAGE</Text>
        </View>
      </Page>

      {/* ── Page 2 : Les parties ── */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <View style={styles.content}>

          <Text style={styles.dateTitle}>
            Dates du stage : {fmtDate(convention.dateDebut)} — {fmtDate(convention.dateFin)}
          </Text>
          <Text style={styles.introText}>
            Tout stage en entreprise suppose la rédaction et la signature de la convention de stage ci-contre en trois exemplaires entre :
          </Text>

          {/* 1. Établissement */}
          <View style={styles.pill}>
            <Text style={styles.pillText}>1.  L'ÉTABLISSEMENT SUPÉRIEUR : DIPLOMA SANTE</Text>
          </View>
          <View style={styles.box}>
            <Field label="Représentée par :" value="Benchetrit Shirel" />
            <Field label="Adresse :" value="85 Avenue Ledru Rollin, 75012 Paris" />
            <Field label="Numéro :" value="01 76 41 01 73" />
            <Field label="Courriel :" value="contact@diploma-sante.fr" />
          </View>

          {/* 2. Organisme */}
          <View style={styles.pill}>
            <Text style={styles.pillText}>2.  L'ORGANISME D'ACCUEIL</Text>
          </View>
          <View style={styles.box}>
            <Field label="Raison sociale :" value={convention.organisme} />
            <Field label="N° Siret ou Siren :" value={convention.siret} />
            <Field label="Adresse :" value={convention.adresseOrganisme} />
            <Field label="Représenté par :" value={convention.representant} />
            <Field label="Type et lieu d'exercice :" value={convention.typeExercice} />
            <Field label="Tél. Mobile :" value={convention.telephone} />
            <Field label="Email :" value={convention.emailOrganisme} />
          </View>

          {/* 3. Étudiant */}
          <View style={styles.pill}>
            <Text style={styles.pillText}>3.  L'ÉTUDIANT STAGIAIRE</Text>
          </View>
          <View style={styles.box}>
            <Field label="Nom :" value={student.last_name} />
            <Field label="Prénom :" value={student.first_name} />
            <Field label="Courriel :" value={student.email || ''} />
            <Field label="Date de naissance :" value={student.date_naissance ? fmtDate(student.date_naissance) : ''} />
            <Field label="Formation suivie :" value={student.formation} />
            <Field label="Université :" value={student.universite || ''} />
          </View>

          <Text style={styles.noteText}>
            Si le stagiaire est mineur, la convention de stage doit être signée par son représentant légal.
          </Text>
        </View>
        <Footer page={2} total={4} />
      </Page>

      {/* ── Page 3 : Articles ── */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <View style={styles.content}>
          {[
            {
              num: 'Article 1', title: ' : OBJECTIF DE LA CONVENTION',
              text: "L'organisme d'accueil mentionné ci-dessus accepte d'accueillir en stage, dans les conditions définies ci-après, un(e) étudiant(e). La finalité et les modalités du stage sont définies dans le présent document.",
            },
            {
              num: 'Article 2', title: " : OBJECTIF DU STAGE",
              text: "Le stage a pour objectif de faire découvrir au futur étudiant l'application pratique de son futur métier. Il sera formateur tout en étant utile à la structure d'accueil.\nLe but du stage est la découverte du corps de métier médical et de l'organisation d'une structure de soin.\nLes activités confiées au stagiaire sont à fixer en fonction des objectifs de la formation et de l'observation : aide à la vie courante, communication aux patients.",
            },
            {
              num: 'Article 3', title: ' : CONDITIONS DU STAGE',
              text: "Le stage se déroulera du lundi au vendredi (horaires variables, matin et après-midi, week-ends ou jours fériés suivant les structures).",
            },
            {
              num: 'Article 4', title: ' : GRATIFICATION',
              text: "Le stage étant d'une durée inférieure à 2 mois, aucune rémunération n'est obligatoire. Toutefois, l'employeur peut offrir une gratification en cas de stage satisfaisant.\nLes frais de formation et de mission entraînés par le stage restent à la charge de l'organisme d'accueil.",
            },
            {
              num: 'Article 5', title: ' : STATUT DU STAGIAIRE',
              text: "L'étudiant s'engage durant le stage, à observer le règlement interne ou les règles définies par l'organisme d'accueil ou le professionnel de santé accueillant. En cas de faute grave, le responsable du stagiaire se réserve le droit de mettre fin au stage après avoir prévenu la Prépa Diploma.\nL'étudiant est tenu au respect du secret professionnel.\nLes résultats des travaux des stagiaires restent la propriété de l'organisme d'accueil ou du professionnel de santé accueillant.",
            },
            {
              num: 'Article 6', title: ' : PROTECTION SOCIALE',
              text: "Pendant la durée du stage, le stagiaire reste affilié à son régime de Sécurité Sociale antérieur qui couvre les accidents du travail.\nEn cas d'accident sur le lieu du stage ou le lieu de trajet, le responsable de l'organisme d'accueil envoie immédiatement une déclaration d'accident au représentant de la prépa Diploma qui le transmettra à la Caisse d'Assurance Maladie.",
            },
            {
              num: 'Article 7', title: " : FIN DE STAGE, RAPPORT D'ÉVALUATION",
              text: "L'étudiant(e) est tenu(e), à la fin du stage, de rédiger un rapport qu'il doit présenter à Diploma Santé. La convention de stage doit être signée par l'employeur et retournée à Diploma Santé.",
            },
          ].map(({ num, title, text }) => (
            <View key={num} style={styles.articleWrap}>
              <View style={styles.articleHeader}>
                <Text style={styles.articleNum}>{num}</Text>
                <Text style={styles.articleTitle}>{title}</Text>
              </View>
              <Text style={styles.articleText}>{text}</Text>
            </View>
          ))}
        </View>
        <Footer page={3} total={4} />
      </Page>

      {/* ── Page 4 : Signatures ── */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <View style={styles.content}>
          <Text style={styles.sigIntro}>
            La signature du présent document par les 3 parties concernées,{'\n'}
            implique un consentement exprès aux clauses de cette convention.
          </Text>

          {/* Ligne 1 : Étudiant + Organisme */}
          <View style={styles.sigRow}>

            <View style={styles.sigBox}>
              <View style={styles.sigPill}>
                <Text style={styles.sigPillText}>L'étudiant(e)</Text>
              </View>
              <Text style={styles.sigField}>Nom : {student.last_name}</Text>
              <Text style={styles.sigField}>Prénom : {student.first_name}</Text>
              <Text style={styles.sigField}>Le : {signedAt?.student ? fmtDate(signedAt.student) : ''}</Text>
              <Text style={styles.sigLabel}>Signature :</Text>
              <SigImage src={signatures?.student} />
            </View>

            <View style={styles.sigBox}>
              <View style={styles.sigPill}>
                <Text style={styles.sigPillText}>L'organisme d'accueil</Text>
              </View>
              <Text style={styles.sigField}>Représentant : {convention.representant}</Text>
              <Text style={styles.sigField}>Structure : {convention.organisme}</Text>
              <Text style={styles.sigField}>Le : {signedAt?.organisme ? fmtDate(signedAt.organisme) : ''}</Text>
              <Text style={styles.sigLabel}>Cachet et signature :</Text>
              <SigImage src={signatures?.organisme} />
            </View>

          </View>

          {/* Ligne 2 : Diploma Santé */}
          <View style={styles.sigBoxBottom}>
            <View style={styles.sigPillNavy}>
              <Text style={styles.sigPillText}>Diploma Santé</Text>
            </View>
            <Text style={styles.sigField}>Nom : Benchetrit</Text>
            <Text style={styles.sigField}>Prénom : Shirel</Text>
            <Text style={styles.sigField}>Le : {signedAt?.admin ? fmtDate(signedAt.admin) : ''}</Text>
            <Text style={styles.sigLabel}>Cachet :</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginTop: 6 }}>
              <View style={styles.stampBox}>
                <Text style={styles.stampTitle}>DIPLOMA SANTE</Text>
                <Text style={styles.stampText}>85 Avenue Ledru Rollin</Text>
                <Text style={styles.stampText}>75012 Paris</Text>
                <Text style={styles.stampText}>RCS Paris 878 200 534</Text>
              </View>
              <SigImage src={signatures?.admin} />
            </View>
          </View>

        </View>
        <Footer page={4} total={4} />
      </Page>

    </Document>
  )
}
