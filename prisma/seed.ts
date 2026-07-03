// prisma/seed.ts — VERSIÓN FINAL (usa createMany, no loops de upsert)
import { PrismaClient, DegreeType, SubjectType, PrerequisiteType, ExamType } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed final iniciando...')

  // ── Universidad ──────────────────────────────
  await prisma.university.upsert({
    where: { id: 'unmdp' }, update: {},
    create: { id:'unmdp', name:'Universidad Nacional de Mar del Plata', shortName:'UNMDP', country:'Argentina', city:'Mar del Plata', websiteUrl:'https://www.mdp.edu.ar', isActive:true }
  })

  await prisma.faculty.createMany({ skipDuplicates:true, data:[
    { id:'fceys', universityId:'unmdp', name:'Facultad de Ciencias Económicas y Sociales', shortName:'FCEyS', code:'FCEyS', websiteUrl:'https://eco.mdp.edu.ar', isActive:true },
    { id:'fi',    universityId:'unmdp', name:'Facultad de Ingeniería', shortName:'FI', code:'FI', websiteUrl:'https://www.fi.mdp.edu.ar', isActive:true },
    { id:'fceyn', universityId:'unmdp', name:'Facultad de Ciencias Exactas y Naturales', shortName:'FCEyN', code:'FCEyN', isActive:true },
    { id:'fh',    universityId:'unmdp', name:'Facultad de Humanidades', shortName:'FH', code:'FH', isActive:true },
    { id:'fd',    universityId:'unmdp', name:'Facultad de Derecho', shortName:'FD', code:'FD', isActive:true },
    { id:'fcds',  universityId:'unmdp', name:'Facultad de Ciencias de la Salud y Trabajo Social', shortName:'FCdS', code:'FCdS', isActive:true },
    { id:'fayd',  universityId:'unmdp', name:'Facultad de Arquitectura, Urbanismo y Diseño', shortName:'FAyD', code:'FAyD', isActive:true },
    { id:'fca',   universityId:'unmdp', name:'Facultad de Ciencias Agrarias', shortName:'FCA', code:'FCA', isActive:true },
  ]})

  await prisma.career.createMany({ skipDuplicates:true, data:[
    // FCEyS
    { id:'lic-adm-fceys',   facultyId:'fceys', name:'Licenciatura en Administración', shortName:'Lic. en Administración', degreeType:DegreeType.licenciatura, totalYears:5, planCode:'Plan C', planYear:2005, resolution:'OCA 881/04', isActive:true },
    { id:'contador-fceys',  facultyId:'fceys', name:'Contador Público', shortName:'Contador Público', degreeType:DegreeType.licenciatura, totalYears:5, isActive:true },
    { id:'lic-eco-fceys',   facultyId:'fceys', name:'Licenciatura en Economía', shortName:'Lic. en Economía', degreeType:DegreeType.licenciatura, totalYears:5, isActive:true },
    { id:'lic-tur-fceys',   facultyId:'fceys', name:'Licenciatura en Turismo', shortName:'Lic. en Turismo', degreeType:DegreeType.licenciatura, totalYears:4, isActive:true },
    { id:'lic-rrll-fceys',  facultyId:'fceys', name:'Licenciatura en Relaciones Laborales', shortName:'Lic. en Relaciones Laborales', degreeType:DegreeType.licenciatura, totalYears:4, isActive:true },
    // FI
    { id:'ing-info-fi',     facultyId:'fi',    name:'Ingeniería Informática', shortName:'Ing. Informática', degreeType:DegreeType.ingenieria, totalYears:5, totalCredits:226, planCode:'Plan 2024', planYear:2024, isActive:true },
    { id:'ing-quim-fi',     facultyId:'fi',    name:'Ingeniería Química', shortName:'Ing. Química', degreeType:DegreeType.ingenieria, totalYears:5, totalCredits:238, planCode:'Plan 2024', planYear:2024, isActive:true },
    { id:'ing-civil-fi',    facultyId:'fi',    name:'Ingeniería Civil', shortName:'Ing. Civil', degreeType:DegreeType.ingenieria, totalYears:5, isActive:true },
    { id:'ing-electro-fi',  facultyId:'fi',    name:'Ingeniería Electromecánica', shortName:'Ing. Electromecánica', degreeType:DegreeType.ingenieria, totalYears:5, isActive:true },
    { id:'ing-alim-fi',     facultyId:'fi',    name:'Ingeniería en Alimentos', shortName:'Ing. en Alimentos', degreeType:DegreeType.ingenieria, totalYears:5, isActive:true },
    { id:'ing-mat-fi',      facultyId:'fi',    name:'Ingeniería en Materiales', shortName:'Ing. en Materiales', degreeType:DegreeType.ingenieria, totalYears:5, isActive:true },
    // FCEyN
    { id:'lic-mat-fceyn',   facultyId:'fceyn', name:'Licenciatura en Matemática', shortName:'Lic. en Matemática', degreeType:DegreeType.licenciatura, totalYears:5, isActive:true },
    { id:'lic-fis-fceyn',   facultyId:'fceyn', name:'Licenciatura en Física', shortName:'Lic. en Física', degreeType:DegreeType.licenciatura, totalYears:5, isActive:true },
    { id:'lic-quim-fceyn',  facultyId:'fceyn', name:'Licenciatura en Química', shortName:'Lic. en Química', degreeType:DegreeType.licenciatura, totalYears:5, isActive:true },
    { id:'lic-bio-fceyn',   facultyId:'fceyn', name:'Licenciatura en Biología', shortName:'Lic. en Biología', degreeType:DegreeType.licenciatura, totalYears:5, isActive:true },
    { id:'lic-cc-fceyn',    facultyId:'fceyn', name:'Licenciatura en Ciencias de la Computación', shortName:'Lic. en Cs. de la Computación', degreeType:DegreeType.licenciatura, totalYears:5, isActive:true },
    { id:'prof-mat-fceyn',  facultyId:'fceyn', name:'Profesorado en Matemática', shortName:'Prof. en Matemática', degreeType:DegreeType.profesorado, totalYears:4, isActive:true },
    { id:'prof-fis-fceyn',  facultyId:'fceyn', name:'Profesorado en Física', shortName:'Prof. en Física', degreeType:DegreeType.profesorado, totalYears:4, isActive:true },
    { id:'prof-quim-fceyn', facultyId:'fceyn', name:'Profesorado en Química', shortName:'Prof. en Química', degreeType:DegreeType.profesorado, totalYears:4, isActive:true },
    { id:'prof-bio-fceyn',  facultyId:'fceyn', name:'Profesorado en Biología', shortName:'Prof. en Biología', degreeType:DegreeType.profesorado, totalYears:4, isActive:true },
    // FH
    { id:'lic-letras-fh',   facultyId:'fh', name:'Licenciatura en Letras', shortName:'Lic. en Letras', degreeType:DegreeType.licenciatura, totalYears:5, isActive:true },
    { id:'lic-hist-fh',     facultyId:'fh', name:'Licenciatura en Historia', shortName:'Lic. en Historia', degreeType:DegreeType.licenciatura, totalYears:5, isActive:true },
    { id:'lic-filo-fh',     facultyId:'fh', name:'Licenciatura en Filosofía', shortName:'Lic. en Filosofía', degreeType:DegreeType.licenciatura, totalYears:5, isActive:true },
    { id:'lic-biblio-fh',   facultyId:'fh', name:'Licenciatura en Bibliotecología', shortName:'Lic. en Bibliotecología', degreeType:DegreeType.licenciatura, totalYears:4, isActive:true },
    { id:'lic-cpol-fh',     facultyId:'fh', name:'Licenciatura en Ciencia Política', shortName:'Lic. en Ciencia Política', degreeType:DegreeType.licenciatura, totalYears:5, isActive:true },
    { id:'lic-socio-fh',    facultyId:'fh', name:'Licenciatura en Sociología', shortName:'Lic. en Sociología', degreeType:DegreeType.licenciatura, totalYears:5, isActive:true },
    { id:'lic-tsoc-fh',     facultyId:'fh', name:'Licenciatura en Trabajo Social', shortName:'Lic. en Trabajo Social', degreeType:DegreeType.licenciatura, totalYears:4, isActive:true },
    { id:'lic-comso-fh',    facultyId:'fh', name:'Licenciatura en Comunicación Social', shortName:'Lic. en Comunicación Social', degreeType:DegreeType.licenciatura, totalYears:4, isActive:true },
    // FD
    { id:'abogacia-fd',     facultyId:'fd', name:'Abogacía', shortName:'Abogacía', degreeType:DegreeType.licenciatura, totalYears:5, isActive:true },
    { id:'escribania-fd',   facultyId:'fd', name:'Escribanía', shortName:'Escribanía', degreeType:DegreeType.licenciatura, totalYears:5, isActive:true },
    // FCdS
    { id:'medicina-fcds',   facultyId:'fcds', name:'Medicina', shortName:'Medicina', degreeType:DegreeType.licenciatura, totalYears:6, isActive:true },
    { id:'enfermeria-fcds', facultyId:'fcds', name:'Enfermería Universitaria', shortName:'Enfermería', degreeType:DegreeType.licenciatura, totalYears:4, isActive:true },
    { id:'lic-nutri-fcds',  facultyId:'fcds', name:'Licenciatura en Nutrición', shortName:'Lic. en Nutrición', degreeType:DegreeType.licenciatura, totalYears:5, isActive:true },
    { id:'lic-psico-fcds',  facultyId:'fcds', name:'Licenciatura en Psicología', shortName:'Lic. en Psicología', degreeType:DegreeType.licenciatura, totalYears:5, isActive:true },
    { id:'lic-fono-fcds',   facultyId:'fcds', name:'Licenciatura en Fonoaudiología', shortName:'Lic. en Fonoaudiología', degreeType:DegreeType.licenciatura, totalYears:4, isActive:true },
    { id:'lic-to-fcds',     facultyId:'fcds', name:'Licenciatura en Terapia Ocupacional', shortName:'Lic. en Terapia Ocupacional', degreeType:DegreeType.licenciatura, totalYears:4, isActive:true },
    // FAyD
    { id:'arq-fayd',        facultyId:'fayd', name:'Arquitectura', shortName:'Arquitectura', degreeType:DegreeType.licenciatura, totalYears:6, isActive:true },
    { id:'lic-di-fayd',     facultyId:'fayd', name:'Licenciatura en Diseño Industrial', shortName:'Lic. en Diseño Industrial', degreeType:DegreeType.licenciatura, totalYears:5, isActive:true },
    { id:'lic-dg-fayd',     facultyId:'fayd', name:'Licenciatura en Diseño Gráfico', shortName:'Lic. en Diseño Gráfico', degreeType:DegreeType.licenciatura, totalYears:4, isActive:true },
    // FCA
    { id:'ing-agro-fca',    facultyId:'fca', name:'Ingeniería Agronómica', shortName:'Ing. Agronómica', degreeType:DegreeType.ingenieria, totalYears:5, isActive:true },
    { id:'lic-prod-fca',    facultyId:'fca', name:'Licenciatura en Producción Vegetal', shortName:'Lic. en Producción Vegetal', degreeType:DegreeType.licenciatura, totalYears:4, isActive:true },
  ]})
  console.log('✅ Universidad, facultades y carreras')

  // ════════════════════════════════════════════
  // LIC. ADMINISTRACIÓN
  // ════════════════════════════════════════════
  await prisma.subject.createMany({ skipDuplicates:true, data:[
    {id:'adm-cg1',  name:'Contabilidad General I',        code:'CG1',   isActive:true},
    {id:'adm-eco',  name:'Economía General',              code:'ECO',   isActive:true},
    {id:'adm-mat1', name:'Matemática I',                  code:'MAT1',  isActive:true},
    {id:'adm-soc',  name:'Sociología',                    code:'SOC',   isActive:true},
    {id:'adm-cg2',  name:'Contabilidad General II',       code:'CG2',   isActive:true},
    {id:'adm-mat2', name:'Matemática II',                 code:'MAT2',  isActive:true},
    {id:'adm-adm1', name:'Administración I',              code:'ADM1',  isActive:true},
    {id:'adm-der1', name:'Derecho Privado I',             code:'DER1',  isActive:true},
    {id:'adm-micro',name:'Microeconomía',                 code:'MICRO', isActive:true},
    {id:'adm-est',  name:'Estadística',                   code:'EST',   isActive:true},
    {id:'adm-cca',  name:'Contabilidad de Costos A',      code:'CCA',   isActive:true},
    {id:'adm-der2', name:'Derecho Privado II',            code:'DER2',  isActive:true},
    {id:'adm-macro',name:'Macroeconomía',                 code:'MACRO', isActive:true},
    {id:'adm-adm2', name:'Administración II',             code:'ADM2',  isActive:true},
    {id:'adm-rrhh', name:'Recursos Humanos',              code:'RRHH',  isActive:true},
    {id:'adm-der3', name:'Derecho Comercial',             code:'DER3',  isActive:true},
    {id:'adm-io',   name:'Investigación Operativa',       code:'IO',    isActive:true},
    {id:'adm-mkt1', name:'Marketing I',                   code:'MKT1',  isActive:true},
    {id:'adm-ccb',  name:'Contabilidad de Costos B',      code:'CCB',   isActive:true},
    {id:'adm-eea',  name:'Estructura Económica Arg.',     code:'EEA',   isActive:true},
    {id:'adm-mkt2', name:'Marketing II',                  code:'MKT2',  isActive:true},
    {id:'adm-fin1', name:'Finanzas I',                    code:'FIN1',  isActive:true},
    {id:'adm-meto', name:'Metodología de la Inv.',        code:'METO',  isActive:true},
    {id:'adm-sist', name:'Sistemas de Información',       code:'SIST',  isActive:true},
    {id:'adm-fin2', name:'Finanzas II',                   code:'FIN2',  isActive:true},
    {id:'adm-tti1', name:'Teoría y Téc. Impositiva I',    code:'TTI1',  isActive:true},
    {id:'adm-dg',   name:'Dirección General',             code:'DG',    isActive:true},
    {id:'adm-der4', name:'Derecho Civil',                 code:'DER4',  isActive:true},
    {id:'adm-aep',  name:'Análisis y Eval. Proyectos',    code:'AEP',   isActive:true},
    {id:'adm-tti2', name:'Teoría y Téc. Impositiva II',   code:'TTI2',  isActive:true},
    {id:'adm-audi', name:'Auditoría',                     code:'AUDI',  isActive:true},
    {id:'adm-tica', name:'Técnicas de Negociación',       code:'TICA',  isActive:true},
    {id:'adm-adm3', name:'Administración Financiera',     code:'ADM3',  isActive:true},
    {id:'adm-pla',  name:'Planeamiento y Eval. Proy.',    code:'PLA',   isActive:true},
    {id:'adm-ele1', name:'Electiva I',                    code:'ELE1',  isActive:true},
    {id:'adm-pp',   name:'Práctica Profesional',          code:'PP',    isActive:true},
    {id:'adm-ele2', name:'Electiva II',                   code:'ELE2',  isActive:true},
    {id:'adm-ele3', name:'Electiva III',                  code:'ELE3',  isActive:true},
  ]})

  await prisma.careerSubject.createMany({ skipDuplicates:true, data:[
    {careerId:'lic-adm-fceys', subjectId:'adm-cg1',  yearNumber:1, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'lic-adm-fceys', subjectId:'adm-eco',  yearNumber:1, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'lic-adm-fceys', subjectId:'adm-mat1', yearNumber:1, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3},
    {careerId:'lic-adm-fceys', subjectId:'adm-soc',  yearNumber:1, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4},
    {careerId:'lic-adm-fceys', subjectId:'adm-cg2',  yearNumber:1, semester:2, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'lic-adm-fceys', subjectId:'adm-mat2', yearNumber:1, semester:2, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'lic-adm-fceys', subjectId:'adm-adm1', yearNumber:1, semester:2, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3},
    {careerId:'lic-adm-fceys', subjectId:'adm-der1', yearNumber:1, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4},
    {careerId:'lic-adm-fceys', subjectId:'adm-micro',yearNumber:2, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'lic-adm-fceys', subjectId:'adm-est',  yearNumber:2, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'lic-adm-fceys', subjectId:'adm-cca',  yearNumber:2, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3},
    {careerId:'lic-adm-fceys', subjectId:'adm-der2', yearNumber:2, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4},
    {careerId:'lic-adm-fceys', subjectId:'adm-macro',yearNumber:2, semester:2, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'lic-adm-fceys', subjectId:'adm-adm2', yearNumber:2, semester:2, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'lic-adm-fceys', subjectId:'adm-rrhh', yearNumber:2, semester:2, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3},
    {careerId:'lic-adm-fceys', subjectId:'adm-der3', yearNumber:2, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4},
    {careerId:'lic-adm-fceys', subjectId:'adm-io',   yearNumber:3, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'lic-adm-fceys', subjectId:'adm-mkt1', yearNumber:3, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'lic-adm-fceys', subjectId:'adm-ccb',  yearNumber:3, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3},
    {careerId:'lic-adm-fceys', subjectId:'adm-eea',  yearNumber:3, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4},
    {careerId:'lic-adm-fceys', subjectId:'adm-mkt2', yearNumber:3, semester:2, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'lic-adm-fceys', subjectId:'adm-fin1', yearNumber:3, semester:2, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'lic-adm-fceys', subjectId:'adm-meto', yearNumber:3, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3},
    {careerId:'lic-adm-fceys', subjectId:'adm-sist', yearNumber:3, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4},
    {careerId:'lic-adm-fceys', subjectId:'adm-fin2', yearNumber:4, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'lic-adm-fceys', subjectId:'adm-tti1', yearNumber:4, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'lic-adm-fceys', subjectId:'adm-dg',   yearNumber:4, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3},
    {careerId:'lic-adm-fceys', subjectId:'adm-der4', yearNumber:4, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4},
    {careerId:'lic-adm-fceys', subjectId:'adm-aep',  yearNumber:4, semester:2, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'lic-adm-fceys', subjectId:'adm-tti2', yearNumber:4, semester:2, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'lic-adm-fceys', subjectId:'adm-audi', yearNumber:4, semester:2, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3},
    {careerId:'lic-adm-fceys', subjectId:'adm-tica', yearNumber:4, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4},
    {careerId:'lic-adm-fceys', subjectId:'adm-adm3', yearNumber:5, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'lic-adm-fceys', subjectId:'adm-pla',  yearNumber:5, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'lic-adm-fceys', subjectId:'adm-ele1', yearNumber:5, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.electiva,    isFinalThesis:false, displayOrder:3},
    {careerId:'lic-adm-fceys', subjectId:'adm-pp',   yearNumber:5, semester:2, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:true,  displayOrder:1},
    {careerId:'lic-adm-fceys', subjectId:'adm-ele2', yearNumber:5, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.electiva,    isFinalThesis:false, displayOrder:2},
    {careerId:'lic-adm-fceys', subjectId:'adm-ele3', yearNumber:5, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.electiva,    isFinalThesis:false, displayOrder:3},
  ]})

  await prisma.prerequisite.createMany({ skipDuplicates:true, data:[
    {careerId:'lic-adm-fceys', subjectId:'adm-cg2',  requiredSubjectId:'adm-cg1',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-mat2', requiredSubjectId:'adm-mat1', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-adm1', requiredSubjectId:'adm-eco',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-micro',requiredSubjectId:'adm-eco',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-micro',requiredSubjectId:'adm-mat2', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-est',  requiredSubjectId:'adm-mat2', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-cca',  requiredSubjectId:'adm-cg2',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-der2', requiredSubjectId:'adm-der1', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-macro',requiredSubjectId:'adm-micro',prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-adm2', requiredSubjectId:'adm-adm1', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-rrhh', requiredSubjectId:'adm-adm1', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-der3', requiredSubjectId:'adm-der2', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-io',   requiredSubjectId:'adm-est',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-io',   requiredSubjectId:'adm-mat2', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-mkt1', requiredSubjectId:'adm-adm2', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-ccb',  requiredSubjectId:'adm-cca',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-eea',  requiredSubjectId:'adm-macro',prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-mkt2', requiredSubjectId:'adm-mkt1', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-fin1', requiredSubjectId:'adm-macro',prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-fin1', requiredSubjectId:'adm-cca',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-meto', requiredSubjectId:'adm-est',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-sist', requiredSubjectId:'adm-adm2', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-fin2', requiredSubjectId:'adm-fin1', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-tti1', requiredSubjectId:'adm-der3', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-dg',   requiredSubjectId:'adm-adm2', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-dg',   requiredSubjectId:'adm-mkt1', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-aep',  requiredSubjectId:'adm-fin1', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-aep',  requiredSubjectId:'adm-io',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-tti2', requiredSubjectId:'adm-tti1', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-audi', requiredSubjectId:'adm-cca',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-audi', requiredSubjectId:'adm-dg',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-adm3', requiredSubjectId:'adm-fin2', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-pla',  requiredSubjectId:'adm-aep',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-pla',  requiredSubjectId:'adm-dg',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-pp',   requiredSubjectId:'adm-adm3', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-pp',   requiredSubjectId:'adm-pla',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-pp',   requiredSubjectId:'adm-tti2', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'lic-adm-fceys', subjectId:'adm-pp',   requiredSubjectId:'adm-audi', prerequisiteType:PrerequisiteType.aprobada},
  ]})
  console.log('✅ Lic. Administración: 38 materias, 38 correlativas')

  // ════════════════════════════════════════════
  // ING. INFORMÁTICA
  // ════════════════════════════════════════════
  await prisma.subject.createMany({ skipDuplicates:true, data:[
    {id:'ii-ici',   name:'Intro. Ciencia y la Ingeniería',        code:'ING6101', isActive:true},
    {id:'ii-am1',   name:'Análisis Matemático I',                 code:'INGM101', isActive:true},
    {id:'ii-alg1',  name:'Álgebra I-B',                          code:'INGM105', isActive:true},
    {id:'ii-tia',   name:'Tecnologías Informáticas A',            code:'ING6301', isActive:true},
    {id:'ii-ib',    name:'Informática Básica',                    code:'ING6102', isActive:true},
    {id:'ii-am2',   name:'Análisis Matemático II',                code:'INGM102', isActive:true},
    {id:'ii-alg2',  name:'Álgebra II',                           code:'INGM106', isActive:true},
    {id:'ii-imd',   name:'Matemática Discreta',                   code:'INGM107', isActive:true},
    {id:'ii-proga', name:'Programación A',                        code:'ING6201', isActive:true},
    {id:'ii-pe',    name:'Probabilidad y Estadística',            code:'INGM108', isActive:true},
    {id:'ii-fa',    name:'Física A',                              code:'INGF101', isActive:true},
    {id:'ii-progb', name:'Programación B',                        code:'ING6202', isActive:true},
    {id:'ii-tib',   name:'Tecnologías Informáticas B',            code:'ING6302', isActive:true},
    {id:'ii-ing1',  name:'Inglés I',                              code:'ING8408', isActive:true},
    {id:'ii-fb2',   name:'Física B-II',                           code:'INGF103', isActive:true},
    {id:'ii-progc', name:'Programación C',                        code:'ING6205', isActive:true},
    {id:'ii-tic',   name:'Teoría Info. y Comunicación',           code:'ING6203', isActive:true},
    {id:'ii-fac',   name:'Fund. Arq. Computadoras',               code:'ING6204', isActive:true},
    {id:'ii-ing2',  name:'Inglés II',                             code:'ING8409', isActive:true},
    {id:'ii-io',    name:'Investigación de Operaciones',          code:'ING8410', isActive:true},
    {id:'ii-flf',   name:'Lenguajes Formales',                    code:'ING6208', isActive:true},
    {id:'ii-eod',   name:'Estructura de Datos',                   code:'ING6207', isActive:true},
    {id:'ii-fso',   name:'Sistemas Operativos',                   code:'ING6303', isActive:true},
    {id:'ii-adm-ec',name:'Adm. Emp. Economía del Conocimiento',   code:'ING8401', isActive:true},
    {id:'ii-rcda',  name:'Redes y Com. de Datos A',               code:'ING6305', isActive:true},
    {id:'ii-calsa', name:'Calidad de Software A',                 code:'ING6304', isActive:true},
    {id:'ii-adsa',  name:'Análisis y Diseño de Sistemas A',       code:'ING6306', isActive:true},
    {id:'ii-sbd',   name:'Sistemas de Bases de Datos',            code:'ING6307', isActive:true},
    {id:'ii-iai',   name:'Intro. Inteligencia Artificial',        code:'ING6316', isActive:true},
    {id:'ii-adsb',  name:'Análisis y Diseño de Sistemas B',       code:'ING6310', isActive:true},
    {id:'ii-rcdb',  name:'Redes y Com. de Datos B',               code:'ING6309', isActive:true},
    {id:'ii-cort',  name:'Comp. Org. y Rel. del Trabajo',         code:'ING8402', isActive:true},
    {id:'ii-gsi',   name:'Gestión Seguridad Informática',         code:'ING6312', isActive:true},
    {id:'ii-disd',  name:'Sistemas Distribuidos',                 code:'ING6313', isActive:true},
    {id:'ii-calsb', name:'Calidad de Software B',                 code:'ING6311', isActive:true},
    {id:'ii-gpi',   name:'Gestión de Proyectos Informáticos',     code:'ING6401', isActive:true},
    {id:'ii-tms',   name:'Teoría de Modelos y Simulación',        code:'ING6209', isActive:true},
    {id:'ii-elpi',  name:'Ética y Legislación Profesional',       code:'ING8405', isActive:true},
    {id:'ii-ah',    name:'Auditoría y Homologación',              code:'ING6315', isActive:true},
    {id:'ii-tfi',   name:'Trabajo Final Integrador',              code:'ING6314', isActive:true},
    {id:'ii-sso',   name:'Seguridad y Salud Ocupacional',         code:'ING8412', isActive:true},
  ]})

  await prisma.careerSubject.createMany({ skipDuplicates:true, data:[
    {careerId:'ing-info-fi', subjectId:'ii-ici',   yearNumber:1, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'ing-info-fi', subjectId:'ii-am1',   yearNumber:1, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'ing-info-fi', subjectId:'ii-alg1',  yearNumber:1, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3},
    {careerId:'ing-info-fi', subjectId:'ii-tia',   yearNumber:1, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4},
    {careerId:'ing-info-fi', subjectId:'ii-ib',    yearNumber:1, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:5},
    {careerId:'ing-info-fi', subjectId:'ii-am2',   yearNumber:1, semester:2, isAnnual:false, credits:5,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'ing-info-fi', subjectId:'ii-alg2',  yearNumber:1, semester:2, isAnnual:false, credits:5,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'ing-info-fi', subjectId:'ii-imd',   yearNumber:1, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3},
    {careerId:'ing-info-fi', subjectId:'ii-proga', yearNumber:1, semester:2, isAnnual:false, credits:8,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4},
    {careerId:'ing-info-fi', subjectId:'ii-pe',    yearNumber:2, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'ing-info-fi', subjectId:'ii-fa',    yearNumber:2, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'ing-info-fi', subjectId:'ii-progb', yearNumber:2, semester:1, isAnnual:false, credits:8,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3},
    {careerId:'ing-info-fi', subjectId:'ii-tib',   yearNumber:2, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4},
    {careerId:'ing-info-fi', subjectId:'ii-ing1',  yearNumber:2, semester:1, isAnnual:false, credits:3,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:5},
    {careerId:'ing-info-fi', subjectId:'ii-fb2',   yearNumber:2, semester:2, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'ing-info-fi', subjectId:'ii-progc', yearNumber:2, semester:2, isAnnual:false, credits:8,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'ing-info-fi', subjectId:'ii-tic',   yearNumber:2, semester:2, isAnnual:false, credits:5,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3},
    {careerId:'ing-info-fi', subjectId:'ii-fac',   yearNumber:2, semester:2, isAnnual:false, credits:5,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4},
    {careerId:'ing-info-fi', subjectId:'ii-ing2',  yearNumber:2, semester:2, isAnnual:false, credits:3,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:5},
    {careerId:'ing-info-fi', subjectId:'ii-io',    yearNumber:3, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'ing-info-fi', subjectId:'ii-flf',   yearNumber:3, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'ing-info-fi', subjectId:'ii-eod',   yearNumber:3, semester:1, isAnnual:false, credits:5,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3},
    {careerId:'ing-info-fi', subjectId:'ii-fso',   yearNumber:3, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4},
    {careerId:'ing-info-fi', subjectId:'ii-adm-ec',yearNumber:3, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'ing-info-fi', subjectId:'ii-rcda',  yearNumber:3, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'ing-info-fi', subjectId:'ii-calsa', yearNumber:3, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3},
    {careerId:'ing-info-fi', subjectId:'ii-adsa',  yearNumber:3, semester:2, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4},
    {careerId:'ing-info-fi', subjectId:'ii-sbd',   yearNumber:4, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'ing-info-fi', subjectId:'ii-iai',   yearNumber:4, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'ing-info-fi', subjectId:'ii-adsb',  yearNumber:4, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3},
    {careerId:'ing-info-fi', subjectId:'ii-rcdb',  yearNumber:4, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4},
    {careerId:'ing-info-fi', subjectId:'ii-cort',  yearNumber:4, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:5},
    {careerId:'ing-info-fi', subjectId:'ii-gsi',   yearNumber:4, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'ing-info-fi', subjectId:'ii-disd',  yearNumber:4, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'ing-info-fi', subjectId:'ii-calsb', yearNumber:4, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3},
    {careerId:'ing-info-fi', subjectId:'ii-gpi',   yearNumber:4, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4},
    {careerId:'ing-info-fi', subjectId:'ii-tms',   yearNumber:5, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
    {careerId:'ing-info-fi', subjectId:'ii-elpi',  yearNumber:5, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2},
    {careerId:'ing-info-fi', subjectId:'ii-ah',    yearNumber:5, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3},
    {careerId:'ing-info-fi', subjectId:'ii-tfi',   yearNumber:5, semester:1, isAnnual:false, credits:10, subjectType:SubjectType.obligatoria, isFinalThesis:true,  displayOrder:4},
    {careerId:'ing-info-fi', subjectId:'ii-sso',   yearNumber:5, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1},
  ]})

  await prisma.prerequisite.createMany({ skipDuplicates:true, data:[
    {careerId:'ing-info-fi', subjectId:'ii-am1',   requiredSubjectId:'ii-ici',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-alg1',  requiredSubjectId:'ii-ici',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-tia',   requiredSubjectId:'ii-ici',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-ib',    requiredSubjectId:'ii-ici',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-am2',   requiredSubjectId:'ii-am1',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-alg2',  requiredSubjectId:'ii-alg1',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-imd',   requiredSubjectId:'ii-alg1',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-imd',   requiredSubjectId:'ii-ib',     prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-proga', requiredSubjectId:'ii-am1',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-proga', requiredSubjectId:'ii-alg1',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-proga', requiredSubjectId:'ii-ib',     prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-pe',    requiredSubjectId:'ii-am2',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-fa',    requiredSubjectId:'ii-am1',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-fa',    requiredSubjectId:'ii-alg1',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-progb', requiredSubjectId:'ii-proga',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-progb', requiredSubjectId:'ii-imd',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-tib',   requiredSubjectId:'ii-tia',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-tib',   requiredSubjectId:'ii-proga',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-ing1',  requiredSubjectId:'ii-ici',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-fb2',   requiredSubjectId:'ii-am2',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-fb2',   requiredSubjectId:'ii-alg2',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-fb2',   requiredSubjectId:'ii-fa',     prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-progc', requiredSubjectId:'ii-progb',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-progc', requiredSubjectId:'ii-tib',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-tic',   requiredSubjectId:'ii-pe',     prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-tic',   requiredSubjectId:'ii-progb',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-fac',   requiredSubjectId:'ii-fa',     prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-fac',   requiredSubjectId:'ii-progb',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-ing2',  requiredSubjectId:'ii-ing1',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-io',    requiredSubjectId:'ii-pe',     prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-flf',   requiredSubjectId:'ii-progb',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-flf',   requiredSubjectId:'ii-fac',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-eod',   requiredSubjectId:'ii-progb',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-eod',   requiredSubjectId:'ii-tic',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-fso',   requiredSubjectId:'ii-fac',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-fso',   requiredSubjectId:'ii-progc',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-adm-ec',requiredSubjectId:'ii-io',     prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-rcda',  requiredSubjectId:'ii-fb2',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-rcda',  requiredSubjectId:'ii-fso',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-calsa', requiredSubjectId:'ii-progc',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-adsa',  requiredSubjectId:'ii-progc',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-sbd',   requiredSubjectId:'ii-progc',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-sbd',   requiredSubjectId:'ii-adsa',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-sbd',   requiredSubjectId:'ii-fso',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-iai',   requiredSubjectId:'ii-progc',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-adsb',  requiredSubjectId:'ii-adsa',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-adsb',  requiredSubjectId:'ii-adm-ec', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-rcdb',  requiredSubjectId:'ii-rcda',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-cort',  requiredSubjectId:'ii-adsb',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-gsi',   requiredSubjectId:'ii-rcda',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-disd',  requiredSubjectId:'ii-rcdb',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-disd',  requiredSubjectId:'ii-adsb',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-calsb', requiredSubjectId:'ii-calsa',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-calsb', requiredSubjectId:'ii-sbd',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-calsb', requiredSubjectId:'ii-rcdb',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-gpi',   requiredSubjectId:'ii-adsb',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-tms',   requiredSubjectId:'ii-pe',     prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-tms',   requiredSubjectId:'ii-disd',   prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-elpi',  requiredSubjectId:'ii-adm-ec', prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-ah',    requiredSubjectId:'ii-calsa',  prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-ah',    requiredSubjectId:'ii-gsi',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-ah',    requiredSubjectId:'ii-gpi',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-tfi',   requiredSubjectId:'ii-gpi',    prerequisiteType:PrerequisiteType.aprobada},
    {careerId:'ing-info-fi', subjectId:'ii-sso',   requiredSubjectId:'ii-cort',   prerequisiteType:PrerequisiteType.aprobada},
  ]})
  console.log('✅ Ing. Informática: 41 materias, 60 correlativas')

  // ════════════════════════════════════════════
  // ING. QUÍMICA — Plan 2024 (OCA 357/2023)
  // ════════════════════════════════════════════
  await prisma.subject.createMany({ skipDuplicates:true, data:[
    { id:'req-ingra01', name:'Introducción a la Ciencia y la Ingeniería', code:'INGRA01', isActive:true },

    { id:'iq24-am1',   name:'Análisis Matemático I',               code:'INGM101', isActive:true },
    { id:'iq24-alg1b', name:'Álgebra I-B',                         code:'INGM105', isActive:true },
    { id:'iq24-qgi',   name:'Química General e Inorgánica',         code:'ING1101', isActive:true },
    { id:'iq24-taller1', name:'Taller de Ingeniería I',             code:'ING1502', isActive:true },
    { id:'iq24-am2',   name:'Análisis Matemático II',              code:'INGM102', isActive:true },
    { id:'iq24-alg2',  name:'Álgebra II',                          code:'INGM106', isActive:true },
    { id:'iq24-fis-a', name:'Física A',                            code:'INGF101', isActive:true },
    { id:'iq24-fq1',   name:'Fisicoquímica I',                     code:'ING1201', isActive:true },

    { id:'iq24-am3',   name:'Análisis Matemático III',             code:'INGM103', isActive:true },
    { id:'iq24-bal',   name:'Balances de Masa y Energía',          code:'ING1307', isActive:true },
    { id:'iq24-fundprog', name:'Fundamentos de la Programación',   code:'ING6101', isActive:true },
    { id:'iq24-fis-b2', name:'Física B-II',                        code:'INGF103', isActive:true },
    { id:'iq24-sistrep', name:'Sistemas de Representación en Plantas de Procesos', code:'ING1102', isActive:true },
    { id:'iq24-taller2', name:'Taller de Ingeniería II',           code:'ING1503', isActive:true },
    { id:'iq24-qcarb',   name:'Química del Carbono',               code:'ING1206', isActive:true },
    { id:'iq24-termo1',  name:'Termodinámica I',                   code:'ING1211', isActive:true },
    { id:'iq24-fq2',     name:'Fisicoquímica II',                  code:'ING1202', isActive:true },
    { id:'iq24-fis-c2',  name:'Física C-II',                       code:'INGF105', isActive:true },
    { id:'iq24-ing1',    name:'Inglés I',                          code:'ING8408', isActive:true },
    { id:'iq24-oplant',  name:'Operación de Plantas de Procesos',  code:'ING1501', isActive:true },

    { id:'iq24-metnum', name:'Métodos Numéricos para Ingeniería',  code:'INGM109', isActive:true },
    { id:'iq24-ou1',    name:'Operaciones Unitarias I',            code:'ING1301', isActive:true },
    { id:'iq24-orgemp', name:'Organización Empresarial e Industrial', code:'ING8411', isActive:true },
    { id:'iq24-termo2', name:'Termodinámica II',                   code:'ING1212', isActive:true },
    { id:'iq24-taller3', name:'Taller de Ingeniería III',          code:'ING1504', isActive:true },
    { id:'iq24-ou2',    name:'Operaciones Unitarias II',           code:'ING1302', isActive:true },
    { id:'iq24-probest', name:'Probabilidad y Estadística',        code:'INGM108', isActive:true },
    { id:'iq24-ing2',   name:'Inglés II',                          code:'ING8409', isActive:true },
    { id:'iq24-isp',    name:'Ingeniería de Sistemas de Procesos', code:'ING1315', isActive:true },

    { id:'iq24-irq1',   name:'Ingeniería de Reacciones Químicas I', code:'ING1313', isActive:true },
    { id:'iq24-ou3',    name:'Operaciones Unitarias III',          code:'ING1303', isActive:true },
    { id:'iq24-formproy', name:'Formulación y Evaluación de Proyectos de Inversión', code:'ING8406', isActive:true },
    { id:'iq24-etica',  name:'Ética, Legislación y Propiedad Intelectual en el Ejercicio Profesional', code:'ING8405', isActive:true },
    { id:'iq24-tallerpq', name:'Taller de Proyectos de Ingeniería Química', code:'ING1505', isActive:true },
    { id:'iq24-irq2',   name:'Ingeniería de Reacciones Químicas II', code:'ING1314', isActive:true },
    { id:'iq24-qbio',   name:'Química Biológica y Microbiología',  code:'ING1210', isActive:true },
    { id:'iq24-tecaf',  name:'Técnicas de Análisis Fisicoquímicos', code:'ING1204', isActive:true },
    { id:'iq24-sigest', name:'Sistemas de Gestión Integrados',     code:'ING8413', isActive:true },

    { id:'iq24-tecmat',   name:'Tecnología de los Materiales',       code:'ING1209', isActive:true },
    { id:'iq24-ipbiotec', name:'Ingeniería de Procesos Biotecnológicos', code:'ING1306', isActive:true },
    { id:'iq24-piq',      name:'Proyecto Integrador de Ingeniería Química', code:'ING1506', isActive:true },
    { id:'iq24-segur',    name:'Seguridad y Salud Ocupacional',       code:'ING8412', isActive:true },
    { id:'iq24-dyc',      name:'Dinámica, Instrumentación y Control de Procesos', code:'ING1312', isActive:true },
  ]})

  await prisma.careerSubject.createMany({ skipDuplicates:true, data:[
    { careerId:'ing-quim-fi', subjectId:'iq24-am1',      yearNumber:1, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'ing-quim-fi', subjectId:'iq24-alg1b',    yearNumber:1, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'ing-quim-fi', subjectId:'iq24-qgi',      yearNumber:1, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    { careerId:'ing-quim-fi', subjectId:'iq24-taller1',  yearNumber:1, semester:null, isAnnual:true,  credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4 },

    { careerId:'ing-quim-fi', subjectId:'iq24-am2',      yearNumber:1, semester:2, isAnnual:false, credits:5,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:5 },
    { careerId:'ing-quim-fi', subjectId:'iq24-alg2',     yearNumber:1, semester:2, isAnnual:false, credits:5,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:6 },
    { careerId:'ing-quim-fi', subjectId:'iq24-fis-a',    yearNumber:1, semester:2, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:7 },
    { careerId:'ing-quim-fi', subjectId:'iq24-fq1',      yearNumber:1, semester:2, isAnnual:false, credits:5,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:8 },

    { careerId:'ing-quim-fi', subjectId:'iq24-am3',      yearNumber:2, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'ing-quim-fi', subjectId:'iq24-bal',      yearNumber:2, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'ing-quim-fi', subjectId:'iq24-fundprog', yearNumber:2, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    { careerId:'ing-quim-fi', subjectId:'iq24-fis-b2',   yearNumber:2, semester:1, isAnnual:false, credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4 },
    { careerId:'ing-quim-fi', subjectId:'iq24-sistrep',  yearNumber:2, semester:1, isAnnual:false, credits:2,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:5 },
    { careerId:'ing-quim-fi', subjectId:'iq24-taller2',  yearNumber:2, semester:null, isAnnual:true,  credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:6 },

    { careerId:'ing-quim-fi', subjectId:'iq24-qcarb',    yearNumber:2, semester:2, isAnnual:false, credits:5,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:7 },
    { careerId:'ing-quim-fi', subjectId:'iq24-termo1',   yearNumber:2, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:8 },
    { careerId:'ing-quim-fi', subjectId:'iq24-fq2',      yearNumber:2, semester:2, isAnnual:false, credits:3,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:9 },
    { careerId:'ing-quim-fi', subjectId:'iq24-fis-c2',   yearNumber:2, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:10 },
    { careerId:'ing-quim-fi', subjectId:'iq24-ing1',     yearNumber:2, semester:2, isAnnual:false, credits:3,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:11 },
    { careerId:'ing-quim-fi', subjectId:'iq24-oplant',   yearNumber:2, semester:2, isAnnual:false, credits:2,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:12 },

    { careerId:'ing-quim-fi', subjectId:'iq24-metnum',   yearNumber:3, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'ing-quim-fi', subjectId:'iq24-ou1',      yearNumber:3, semester:1, isAnnual:false, credits:8,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'ing-quim-fi', subjectId:'iq24-orgemp',   yearNumber:3, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    { careerId:'ing-quim-fi', subjectId:'iq24-termo2',   yearNumber:3, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4 },
    { careerId:'ing-quim-fi', subjectId:'iq24-taller3',  yearNumber:3, semester:null, isAnnual:true,  credits:8,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:5 },

    { careerId:'ing-quim-fi', subjectId:'iq24-ou2',      yearNumber:3, semester:2, isAnnual:false, credits:8,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:6 },
    { careerId:'ing-quim-fi', subjectId:'iq24-probest',  yearNumber:3, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:7 },
    { careerId:'ing-quim-fi', subjectId:'iq24-ing2',     yearNumber:3, semester:2, isAnnual:false, credits:3,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:8 },
    { careerId:'ing-quim-fi', subjectId:'iq24-isp',      yearNumber:3, semester:2, isAnnual:false, credits:3,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:9 },

    { careerId:'ing-quim-fi', subjectId:'iq24-irq1',     yearNumber:4, semester:1, isAnnual:false, credits:7,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'ing-quim-fi', subjectId:'iq24-ou3',      yearNumber:4, semester:1, isAnnual:false, credits:8,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'ing-quim-fi', subjectId:'iq24-formproy', yearNumber:4, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    { careerId:'ing-quim-fi', subjectId:'iq24-etica',    yearNumber:4, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4 },
    { careerId:'ing-quim-fi', subjectId:'iq24-tallerpq', yearNumber:4, semester:null, isAnnual:true,  credits:6,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:5 },

    { careerId:'ing-quim-fi', subjectId:'iq24-irq2',     yearNumber:4, semester:2, isAnnual:false, credits:5,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:6 },
    { careerId:'ing-quim-fi', subjectId:'iq24-qbio',     yearNumber:4, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:7 },
    { careerId:'ing-quim-fi', subjectId:'iq24-tecaf',    yearNumber:4, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:8 },
    { careerId:'ing-quim-fi', subjectId:'iq24-sigest',   yearNumber:4, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:9 },

    { careerId:'ing-quim-fi', subjectId:'iq24-tecmat',   yearNumber:5, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'ing-quim-fi', subjectId:'iq24-ipbiotec', yearNumber:5, semester:1, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'ing-quim-fi', subjectId:'iq24-piq',      yearNumber:5, semester:null, isAnnual:true,  credits:10, subjectType:SubjectType.obligatoria, isFinalThesis:true,  displayOrder:3 },

    { careerId:'ing-quim-fi', subjectId:'iq24-segur',    yearNumber:5, semester:2, isAnnual:false, credits:4,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4 },
    { careerId:'ing-quim-fi', subjectId:'iq24-dyc',      yearNumber:5, semester:2, isAnnual:false, credits:7,  subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:5 },
  ]})

  await prisma.prerequisite.createMany({ skipDuplicates:true, data:[
    { careerId:'ing-quim-fi', subjectId:'iq24-am1',      requiredSubjectId:'req-ingra01', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-alg1b',    requiredSubjectId:'req-ingra01', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-qgi',      requiredSubjectId:'req-ingra01', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-taller1',  requiredSubjectId:'req-ingra01', prerequisiteType:PrerequisiteType.aprobada },

    { careerId:'ing-quim-fi', subjectId:'iq24-am2',      requiredSubjectId:'iq24-am1',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-alg2',     requiredSubjectId:'iq24-alg1b', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-fis-a',    requiredSubjectId:'iq24-am1',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-fis-a',    requiredSubjectId:'iq24-alg1b', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-fq1',      requiredSubjectId:'iq24-qgi',   prerequisiteType:PrerequisiteType.aprobada },

    { careerId:'ing-quim-fi', subjectId:'iq24-taller2',  requiredSubjectId:'iq24-taller1', prerequisiteType:PrerequisiteType.aprobada },

    { careerId:'ing-quim-fi', subjectId:'iq24-am3',      requiredSubjectId:'iq24-am2',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-am3',      requiredSubjectId:'iq24-alg2',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-bal',      requiredSubjectId:'iq24-am2',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-bal',      requiredSubjectId:'iq24-fis-a', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-bal',      requiredSubjectId:'iq24-qgi',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-fundprog', requiredSubjectId:'iq24-alg1b', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-fis-b2',   requiredSubjectId:'iq24-alg2',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-fis-b2',   requiredSubjectId:'iq24-am2',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-fis-b2',   requiredSubjectId:'iq24-fis-a', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-sistrep',  requiredSubjectId:'iq24-qgi',   prerequisiteType:PrerequisiteType.aprobada },

    { careerId:'ing-quim-fi', subjectId:'iq24-qcarb',    requiredSubjectId:'iq24-fq1',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-termo1',   requiredSubjectId:'iq24-bal',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-termo1',   requiredSubjectId:'iq24-am2',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-fq2',      requiredSubjectId:'iq24-fq1',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-fq2',      requiredSubjectId:'iq24-am2',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-fis-c2',   requiredSubjectId:'iq24-fis-b2', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-ing1',     requiredSubjectId:'req-ingra01', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-oplant',   requiredSubjectId:'iq24-fis-b2', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-oplant',   requiredSubjectId:'iq24-bal',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-oplant',   requiredSubjectId:'iq24-sistrep', prerequisiteType:PrerequisiteType.aprobada },

    { careerId:'ing-quim-fi', subjectId:'iq24-taller3',  requiredSubjectId:'iq24-taller2', prerequisiteType:PrerequisiteType.aprobada },

    { careerId:'ing-quim-fi', subjectId:'iq24-metnum',   requiredSubjectId:'iq24-am3',    prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-metnum',   requiredSubjectId:'iq24-fundprog', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-ou1',      requiredSubjectId:'iq24-am3',    prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-ou1',      requiredSubjectId:'iq24-oplant', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-orgemp',   requiredSubjectId:'iq24-am3',    prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-termo2',   requiredSubjectId:'iq24-termo1', prerequisiteType:PrerequisiteType.aprobada },

    { careerId:'ing-quim-fi', subjectId:'iq24-ou2',      requiredSubjectId:'iq24-termo1', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-ou2',      requiredSubjectId:'iq24-ou1',    prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-probest',  requiredSubjectId:'iq24-am2',    prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-ing2',     requiredSubjectId:'iq24-ing1',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-isp',      requiredSubjectId:'iq24-metnum', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-isp',      requiredSubjectId:'iq24-termo1', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-isp',      requiredSubjectId:'iq24-fq2',    prerequisiteType:PrerequisiteType.aprobada },

    { careerId:'ing-quim-fi', subjectId:'iq24-tallerpq', requiredSubjectId:'iq24-taller3', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-tallerpq', requiredSubjectId:'iq24-termo1', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-tallerpq', requiredSubjectId:'iq24-fq2',    prerequisiteType:PrerequisiteType.aprobada },

    { careerId:'ing-quim-fi', subjectId:'iq24-irq1',     requiredSubjectId:'iq24-fq2',    prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-irq1',     requiredSubjectId:'iq24-oplant', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-ou3',      requiredSubjectId:'iq24-termo2', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-formproy', requiredSubjectId:'iq24-orgemp', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-formproy', requiredSubjectId:'iq24-taller3', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-etica',    requiredSubjectId:'iq24-am3',    prerequisiteType:PrerequisiteType.aprobada },

    { careerId:'ing-quim-fi', subjectId:'iq24-irq2',     requiredSubjectId:'iq24-irq1',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-irq2',     requiredSubjectId:'iq24-ou3',    prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-qbio',     requiredSubjectId:'iq24-qcarb',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-tecaf',    requiredSubjectId:'iq24-qcarb',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-sigest',   requiredSubjectId:'iq24-orgemp', prerequisiteType:PrerequisiteType.aprobada },

    { careerId:'ing-quim-fi', subjectId:'iq24-tecmat',   requiredSubjectId:'iq24-fis-b2', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-tecmat',   requiredSubjectId:'iq24-fq1',    prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-ipbiotec', requiredSubjectId:'iq24-fq2',    prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-ipbiotec', requiredSubjectId:'iq24-qbio',   prerequisiteType:PrerequisiteType.aprobada },

    { careerId:'ing-quim-fi', subjectId:'iq24-piq',      requiredSubjectId:'iq24-tallerpq', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-piq',      requiredSubjectId:'iq24-isp',      prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-piq',      requiredSubjectId:'iq24-irq1',     prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-piq',      requiredSubjectId:'iq24-ou3',      prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-segur',    requiredSubjectId:'iq24-orgemp',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'ing-quim-fi', subjectId:'iq24-dyc',      requiredSubjectId:'iq24-ou2',      prerequisiteType:PrerequisiteType.aprobada },
  ]})
  console.log('✅ Ing. Química: 44 materias, 69 correlativas (Plan 2024)')

  // ════════════════════════════════════════════
  // MESAS DE EXAMEN — LIC. ADMINISTRACIÓN
  // ════════════════════════════════════════════

  function addDays(d: Date, n: number) {
    const r = new Date(d); r.setDate(r.getDate() + n); return r
  }

  function regDates(examDate: Date, type: ExamType) {
    switch (type) {
      case ExamType.parcial:       return { registrationOpen: addDays(examDate, -14), registrationClose: addDays(examDate, -3) }
      case ExamType.final:         return { registrationOpen: addDays(examDate, -30), registrationClose: addDays(examDate, -7) }
      case ExamType.recuperatorio: return { registrationOpen: addDays(examDate, -10), registrationClose: addDays(examDate, -2) }
      default:                     return { registrationOpen: addDays(examDate, -14), registrationClose: addDays(examDate, -3) }
    }
  }

  const rawExams = [
    // ── 1er año · 1er semestre ──
    { subjectId:'adm-cg1', examType:ExamType.parcial, examDate:new Date('2026-05-04'), startTime:'18:00', endTime:'20:00', location:'Aula 12', callNumber:1 },
    { subjectId:'adm-cg1', examType:ExamType.parcial, examDate:new Date('2026-06-15'), startTime:'18:00', endTime:'20:00', location:'Aula 12', callNumber:2 },
    { subjectId:'adm-cg1', examType:ExamType.recuperatorio, examDate:new Date('2026-07-06'), startTime:'18:00', endTime:'20:00', callNumber:1 },
    { subjectId:'adm-cg1', examType:ExamType.final, examDate:new Date('2026-07-20'), startTime:'08:00', endTime:'10:00', callNumber:1 },
    { subjectId:'adm-cg1', examType:ExamType.final, examDate:new Date('2026-08-03'), startTime:'08:00', endTime:'10:00', callNumber:2 },
    { subjectId:'adm-cg1', examType:ExamType.final, examDate:new Date('2026-12-14'), startTime:'08:00', endTime:'10:00', callNumber:3 },

    { subjectId:'adm-eco', examType:ExamType.parcial, examDate:new Date('2026-05-06'), startTime:'18:00', endTime:'20:00', location:'Aula 8', callNumber:1 },
    { subjectId:'adm-eco', examType:ExamType.parcial, examDate:new Date('2026-06-17'), startTime:'18:00', endTime:'20:00', location:'Aula 8', callNumber:2 },
    { subjectId:'adm-eco', examType:ExamType.final, examDate:new Date('2026-07-22'), startTime:'08:00', endTime:'10:00', callNumber:1 },
    { subjectId:'adm-eco', examType:ExamType.final, examDate:new Date('2026-08-05'), startTime:'08:00', endTime:'10:00', callNumber:2 },

    { subjectId:'adm-mat1', examType:ExamType.parcial, examDate:new Date('2026-05-11'), startTime:'18:00', endTime:'20:00', location:'Aula 5', callNumber:1 },
    { subjectId:'adm-mat1', examType:ExamType.parcial, examDate:new Date('2026-06-22'), startTime:'18:00', endTime:'20:00', location:'Aula 5', callNumber:2 },
    { subjectId:'adm-mat1', examType:ExamType.recuperatorio, examDate:new Date('2026-07-08'), startTime:'18:00', endTime:'20:00', callNumber:1 },
    { subjectId:'adm-mat1', examType:ExamType.final, examDate:new Date('2026-07-24'), startTime:'08:00', endTime:'10:00', callNumber:1 },
    { subjectId:'adm-mat1', examType:ExamType.final, examDate:new Date('2026-08-07'), startTime:'08:00', endTime:'10:00', callNumber:2 },
    { subjectId:'adm-mat1', examType:ExamType.final, examDate:new Date('2026-12-17'), startTime:'08:00', endTime:'10:00', callNumber:3 },

    { subjectId:'adm-soc', examType:ExamType.parcial, examDate:new Date('2026-05-13'), startTime:'18:00', endTime:'20:00', location:'Aula 10', callNumber:1 },
    { subjectId:'adm-soc', examType:ExamType.parcial, examDate:new Date('2026-06-24'), startTime:'18:00', endTime:'20:00', location:'Aula 10', callNumber:2 },
    { subjectId:'adm-soc', examType:ExamType.final, examDate:new Date('2026-07-28'), startTime:'08:00', endTime:'10:00', callNumber:1 },
    { subjectId:'adm-soc', examType:ExamType.final, examDate:new Date('2026-08-10'), startTime:'08:00', endTime:'10:00', callNumber:2 },

    // ── 1er año · 2do semestre ──
    { subjectId:'adm-cg2', examType:ExamType.parcial, examDate:new Date('2026-10-05'), startTime:'18:00', endTime:'20:00', location:'Aula 12', callNumber:1 },
    { subjectId:'adm-cg2', examType:ExamType.parcial, examDate:new Date('2026-11-09'), startTime:'18:00', endTime:'20:00', location:'Aula 12', callNumber:2 },
    { subjectId:'adm-cg2', examType:ExamType.final, examDate:new Date('2026-12-07'), startTime:'08:00', endTime:'10:00', callNumber:1 },
    { subjectId:'adm-cg2', examType:ExamType.final, examDate:new Date('2027-02-08'), startTime:'08:00', endTime:'10:00', callNumber:2 },

    { subjectId:'adm-mat2', examType:ExamType.parcial, examDate:new Date('2026-10-07'), startTime:'18:00', endTime:'20:00', location:'Aula 5', callNumber:1 },
    { subjectId:'adm-mat2', examType:ExamType.parcial, examDate:new Date('2026-11-11'), startTime:'18:00', endTime:'20:00', location:'Aula 5', callNumber:2 },
    { subjectId:'adm-mat2', examType:ExamType.recuperatorio, examDate:new Date('2026-11-25'), startTime:'18:00', endTime:'20:00', callNumber:1 },
    { subjectId:'adm-mat2', examType:ExamType.final, examDate:new Date('2026-12-09'), startTime:'08:00', endTime:'10:00', callNumber:1 },
    { subjectId:'adm-mat2', examType:ExamType.final, examDate:new Date('2027-02-10'), startTime:'08:00', endTime:'10:00', callNumber:2 },

    { subjectId:'adm-adm1', examType:ExamType.parcial, examDate:new Date('2026-10-14'), startTime:'18:00', endTime:'20:00', location:'Aula 3', callNumber:1 },
    { subjectId:'adm-adm1', examType:ExamType.parcial, examDate:new Date('2026-11-18'), startTime:'18:00', endTime:'20:00', location:'Aula 3', callNumber:2 },
    { subjectId:'adm-adm1', examType:ExamType.final, examDate:new Date('2026-12-11'), startTime:'08:00', endTime:'10:00', callNumber:1 },
    { subjectId:'adm-adm1', examType:ExamType.final, examDate:new Date('2027-02-12'), startTime:'08:00', endTime:'10:00', callNumber:2 },

    { subjectId:'adm-der1', examType:ExamType.parcial, examDate:new Date('2026-10-21'), startTime:'18:00', endTime:'20:00', location:'Aula 15', callNumber:1 },
    { subjectId:'adm-der1', examType:ExamType.parcial, examDate:new Date('2026-11-25'), startTime:'18:00', endTime:'20:00', location:'Aula 15', callNumber:2 },
    { subjectId:'adm-der1', examType:ExamType.final, examDate:new Date('2026-12-16'), startTime:'08:00', endTime:'10:00', callNumber:1 },
    { subjectId:'adm-der1', examType:ExamType.final, examDate:new Date('2027-02-17'), startTime:'08:00', endTime:'10:00', callNumber:2 },

    // ── 2do año · 1er semestre ──
    { subjectId:'adm-micro', examType:ExamType.parcial, examDate:new Date('2026-05-05'), startTime:'18:00', endTime:'20:00', location:'Aula 7', callNumber:1 },
    { subjectId:'adm-micro', examType:ExamType.parcial, examDate:new Date('2026-06-16'), startTime:'18:00', endTime:'20:00', location:'Aula 7', callNumber:2 },
    { subjectId:'adm-micro', examType:ExamType.final, examDate:new Date('2026-07-21'), startTime:'10:00', endTime:'12:00', callNumber:1 },
    { subjectId:'adm-micro', examType:ExamType.final, examDate:new Date('2026-12-11'), startTime:'10:00', endTime:'12:00', callNumber:2 },

    { subjectId:'adm-est', examType:ExamType.parcial, examDate:new Date('2026-05-12'), startTime:'18:00', endTime:'20:00', location:'Aula 4', callNumber:1 },
    { subjectId:'adm-est', examType:ExamType.parcial, examDate:new Date('2026-06-23'), startTime:'18:00', endTime:'20:00', location:'Aula 4', callNumber:2 },
    { subjectId:'adm-est', examType:ExamType.recuperatorio, examDate:new Date('2026-07-07'), startTime:'18:00', endTime:'20:00', callNumber:1 },
    { subjectId:'adm-est', examType:ExamType.final, examDate:new Date('2026-07-29'), startTime:'10:00', endTime:'12:00', callNumber:1 },
    { subjectId:'adm-est', examType:ExamType.final, examDate:new Date('2026-08-12'), startTime:'10:00', endTime:'12:00', callNumber:2 },
    { subjectId:'adm-est', examType:ExamType.final, examDate:new Date('2026-12-18'), startTime:'10:00', endTime:'12:00', callNumber:3 },

    { subjectId:'adm-cca', examType:ExamType.parcial, examDate:new Date('2026-05-19'), startTime:'18:00', endTime:'20:00', location:'Aula 9', callNumber:1 },
    { subjectId:'adm-cca', examType:ExamType.parcial, examDate:new Date('2026-06-30'), startTime:'18:00', endTime:'20:00', location:'Aula 9', callNumber:2 },
    { subjectId:'adm-cca', examType:ExamType.final, examDate:new Date('2026-07-23'), startTime:'10:00', endTime:'12:00', callNumber:1 },
    { subjectId:'adm-cca', examType:ExamType.final, examDate:new Date('2026-12-14'), startTime:'10:00', endTime:'12:00', callNumber:2 },
  ].map(e => ({ ...e, careerId:'lic-adm-fceys', ...regDates(e.examDate, e.examType) }))

  await prisma.exam.createMany({ skipDuplicates:true, data:rawExams })
  console.log('✅ Lic. Administración: mesas de examen (1er y 2do año)')

  // ── Usuario demo ───────────────────────────
  await prisma.user.upsert({
    where: { id: 'user-demo-valentina' },
    update: {},
    create: {
      id: 'user-demo-valentina',
      email: 'valentina@demo.com',
      fullName: 'Valentina Demo',
      authProvider: 'email',
      isActive: true,
      emailVerified: false,
    }
  })
  console.log('✅ Usuario demo')

  console.log('\n🎓 Seed final completado — cada carrera tiene IDs únicos ✅')
}

main()
  .catch(e => { console.error('❌', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })