// prisma/seed-fceys-nuevas.ts
// Contador Público (cp-) y Lic. en Economía (eco-)
// Datos oficiales de eco.mdp.edu.ar — Plan E OCS 466/18 y OCA 882/04

import { PrismaClient, DegreeType, SubjectType, PrerequisiteType } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed FCEyS: Contador Público + Lic. en Economía...')

  // ── Carreras ─────────────────────────────────────────────────
  await prisma.career.createMany({ skipDuplicates: true, data: [
    { id:'cp-fceys', facultyId:'fceys', name:'Contador Público', shortName:'C.P.', degreeType:DegreeType.licenciatura, totalYears:5, planCode:'Plan E', planYear:2005, resolution:'OCS 466/18', isActive:true },
    { id:'eco-fceys', facultyId:'fceys', name:'Licenciatura en Economía', shortName:'Lic. en Economía', degreeType:DegreeType.licenciatura, totalYears:5, planCode:'Plan E', planYear:2005, resolution:'OCA 882/04', isActive:true },
  ]})
  console.log('✅ Carreras creadas')

  // ════════════════════════════════════════════
  // CONTADOR PÚBLICO — prefijo cp-
  // ════════════════════════════════════════════
  await prisma.subject.createMany({ skipDuplicates: true, data: [
    // Ciclo Básico — Año 1
    { id:'cp-eco1',  name:'Introducción a la Economía',        code:'101', isActive:true },
    { id:'cp-adm1',  name:'Principios de Administración',      code:'104', isActive:true },
    { id:'cp-mat1',  name:'Matemática I',                      code:'102', isActive:true },
    { id:'cp-cont1', name:'Contabilidad I',                    code:'103', isActive:true },
    { id:'cp-hes1',  name:'Historia Económica y Social I',     code:'180', isActive:true },
    { id:'cp-soc',   name:'Sociología',                        code:'205', isActive:true },
    { id:'cp-mat2',  name:'Matemática II',                     code:'209', isActive:true },
    // Ciclo Básico — Año 2
    { id:'cp-macro1',name:'Macroeconomía I',                   code:'314', isActive:true },
    { id:'cp-fo',    name:'Funciones Organizacionales',        code:'308', isActive:true },
    { id:'cp-hes2',  name:'Historia Económica y Social II',    code:'280', isActive:true },
    { id:'cp-dcon',  name:'Derecho Constitucional',            code:'202', isActive:true },
    { id:'cp-dadm',  name:'Derecho Administrativo',            code:'307', isActive:true },
    { id:'cp-cont2', name:'Contabilidad II',                   code:'210', isActive:true },
    { id:'cp-micro1',name:'Microeconomía I',                   code:'208', isActive:true },
    { id:'cp-est',   name:'Estadística',                       code:'250', isActive:true },
    // Ciclo Profesional — Año 3
    { id:'cp-cont3', name:'Contabilidad III',                  code:'402', isActive:true },
    { id:'cp-si',    name:'Sistemas de Información',           code:'330', isActive:true },
    { id:'cp-matfin',name:'Matemática Financiera',             code:'424', isActive:true },
    { id:'cp-dpriv', name:'Derecho Privado',                   code:'340', isActive:true },
    { id:'cp-costos',name:'Costos',                            code:'401', isActive:true },
    { id:'cp-spub',  name:'Economía y Org. del Sector Público',code:'349', isActive:true },
    { id:'cp-soc2',  name:'Sociedades',                        code:'503', isActive:true },
    { id:'cp-mcs',   name:'Metodología de las Cs. Sociales',   code:'201', isActive:true },
    // Ciclo Profesional — Año 4
    { id:'cp-aef',   name:'Análisis Económico y Financiero',   code:'430', isActive:true },
    { id:'cp-imp1',  name:'Impuestos I',                       code:'460', isActive:true },
    { id:'cp-dtrab', name:'Derecho del Trabajo y Seg. Social', code:'425', isActive:true },
    { id:'cp-admp',  name:'Elementos de Adm. de Personal',     code:'490', isActive:true },
    { id:'cp-admcom',name:'Elementos de Adm. de Comercialización',code:'491', isActive:true },
    { id:'cp-audit', name:'Auditoría',                         code:'527', isActive:true },
    { id:'cp-etica', name:'Ética y Responsabilidad Social',    code:'499', isActive:true },
    // Ciclo Profesional — Año 5
    { id:'cp-imp2',  name:'Impuestos II',                      code:'525', isActive:true },
    { id:'cp-icg',   name:'Información para Control Gerencial',code:'602', isActive:true },
    { id:'cp-ecris', name:'Empresas en Crisis. Títulos de Créd.',code:'590', isActive:true },
    { id:'cp-pp',    name:'Práctica Profesional',              code:'805', isActive:true },
    { id:'cp-elec',  name:'Electiva de Orientación',           code:'ELE', isActive:true },
  ]})

  await prisma.careerSubject.createMany({ skipDuplicates: true, data: [
    // Año 1 - 1C
    { careerId:'cp-fceys', subjectId:'cp-eco1',  yearNumber:1, semester:1, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'cp-fceys', subjectId:'cp-adm1',  yearNumber:1, semester:1, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'cp-fceys', subjectId:'cp-mat1',  yearNumber:1, semester:1, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    // Año 1 - 2C
    { careerId:'cp-fceys', subjectId:'cp-cont1', yearNumber:1, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'cp-fceys', subjectId:'cp-hes1',  yearNumber:1, semester:2, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'cp-fceys', subjectId:'cp-soc',   yearNumber:1, semester:2, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    { careerId:'cp-fceys', subjectId:'cp-mat2',  yearNumber:1, semester:2, isAnnual:false, credits:5, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4 },
    // Año 2 - 1C
    { careerId:'cp-fceys', subjectId:'cp-macro1',yearNumber:2, semester:1, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'cp-fceys', subjectId:'cp-fo',    yearNumber:2, semester:1, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'cp-fceys', subjectId:'cp-hes2',  yearNumber:2, semester:1, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    { careerId:'cp-fceys', subjectId:'cp-dcon',  yearNumber:2, semester:1, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4 },
    { careerId:'cp-fceys', subjectId:'cp-dadm',  yearNumber:2, semester:1, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:5 },
    // Año 2 - 2C
    { careerId:'cp-fceys', subjectId:'cp-cont2', yearNumber:2, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'cp-fceys', subjectId:'cp-micro1',yearNumber:2, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'cp-fceys', subjectId:'cp-est',   yearNumber:2, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    // Año 3 - 1C
    { careerId:'cp-fceys', subjectId:'cp-cont3', yearNumber:3, semester:1, isAnnual:false, credits:5, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'cp-fceys', subjectId:'cp-si',    yearNumber:3, semester:1, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'cp-fceys', subjectId:'cp-matfin',yearNumber:3, semester:1, isAnnual:false, credits:5, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    { careerId:'cp-fceys', subjectId:'cp-dpriv', yearNumber:3, semester:1, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4 },
    // Año 3 - 2C
    { careerId:'cp-fceys', subjectId:'cp-costos',yearNumber:3, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'cp-fceys', subjectId:'cp-spub',  yearNumber:3, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'cp-fceys', subjectId:'cp-soc2',  yearNumber:3, semester:2, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    { careerId:'cp-fceys', subjectId:'cp-mcs',   yearNumber:3, semester:2, isAnnual:false, credits:3, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4 },
    // Año 4 - 1C
    { careerId:'cp-fceys', subjectId:'cp-aef',   yearNumber:4, semester:1, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'cp-fceys', subjectId:'cp-imp1',  yearNumber:4, semester:1, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'cp-fceys', subjectId:'cp-dtrab', yearNumber:4, semester:1, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    // Año 4 - 2C
    { careerId:'cp-fceys', subjectId:'cp-admp',  yearNumber:4, semester:2, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'cp-fceys', subjectId:'cp-admcom',yearNumber:4, semester:2, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'cp-fceys', subjectId:'cp-audit', yearNumber:4, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    { careerId:'cp-fceys', subjectId:'cp-etica', yearNumber:4, semester:2, isAnnual:false, credits:2, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4 },
    // Año 5 - 1C
    { careerId:'cp-fceys', subjectId:'cp-imp2',  yearNumber:5, semester:1, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'cp-fceys', subjectId:'cp-icg',   yearNumber:5, semester:1, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'cp-fceys', subjectId:'cp-ecris', yearNumber:5, semester:1, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    // Año 5 - 2C
    { careerId:'cp-fceys', subjectId:'cp-pp',    yearNumber:5, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:true,  displayOrder:1 },
    { careerId:'cp-fceys', subjectId:'cp-elec',  yearNumber:5, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.electiva,    isFinalThesis:false, displayOrder:2 },
  ]})

  await prisma.prerequisite.createMany({ skipDuplicates: true, data: [
    // Año 1-2C
    { careerId:'cp-fceys', subjectId:'cp-mat2',  requiredSubjectId:'cp-mat1',  prerequisiteType:PrerequisiteType.aprobada },
    // Año 2-1C
    { careerId:'cp-fceys', subjectId:'cp-macro1',requiredSubjectId:'cp-eco1',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-macro1',requiredSubjectId:'cp-mat2',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-fo',    requiredSubjectId:'cp-adm1',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-hes2',  requiredSubjectId:'cp-hes1',  prerequisiteType:PrerequisiteType.aprobada },
    // Año 2-2C
    { careerId:'cp-fceys', subjectId:'cp-cont2', requiredSubjectId:'cp-cont1', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-micro1',requiredSubjectId:'cp-eco1',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-micro1',requiredSubjectId:'cp-mat2',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-est',   requiredSubjectId:'cp-mat2',  prerequisiteType:PrerequisiteType.aprobada },
    // Año 3-1C
    { careerId:'cp-fceys', subjectId:'cp-cont3', requiredSubjectId:'cp-cont2', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-si',    requiredSubjectId:'cp-cont1', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-si',    requiredSubjectId:'cp-fo',    prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-matfin',requiredSubjectId:'cp-est',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-dpriv', requiredSubjectId:'cp-dcon',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-dpriv', requiredSubjectId:'cp-dadm',  prerequisiteType:PrerequisiteType.aprobada },
    // Año 3-2C
    { careerId:'cp-fceys', subjectId:'cp-costos',requiredSubjectId:'cp-cont2', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-spub',  requiredSubjectId:'cp-dcon',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-spub',  requiredSubjectId:'cp-macro1',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-soc2',  requiredSubjectId:'cp-dpriv', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-mcs',   requiredSubjectId:'cp-est',   prerequisiteType:PrerequisiteType.aprobada },
    // Año 4-1C
    { careerId:'cp-fceys', subjectId:'cp-aef',   requiredSubjectId:'cp-fo',    prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-aef',   requiredSubjectId:'cp-macro1',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-aef',   requiredSubjectId:'cp-cont3', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-aef',   requiredSubjectId:'cp-matfin',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-aef',   requiredSubjectId:'cp-costos',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-imp1',  requiredSubjectId:'cp-dadm',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-imp1',  requiredSubjectId:'cp-cont3', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-imp1',  requiredSubjectId:'cp-spub',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-dtrab', requiredSubjectId:'cp-dadm',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-dtrab', requiredSubjectId:'cp-dpriv', prerequisiteType:PrerequisiteType.aprobada },
    // Año 4-2C
    { careerId:'cp-fceys', subjectId:'cp-admp',  requiredSubjectId:'cp-fo',    prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-admcom',requiredSubjectId:'cp-fo',    prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-admcom',requiredSubjectId:'cp-macro1',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-admcom',requiredSubjectId:'cp-est',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-audit', requiredSubjectId:'cp-cont3', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-audit', requiredSubjectId:'cp-si',    prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-audit', requiredSubjectId:'cp-costos',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-audit', requiredSubjectId:'cp-soc2',  prerequisiteType:PrerequisiteType.aprobada },
    // Año 5-1C
    { careerId:'cp-fceys', subjectId:'cp-imp2',  requiredSubjectId:'cp-imp1',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-icg',   requiredSubjectId:'cp-si',    prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-icg',   requiredSubjectId:'cp-aef',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-ecris', requiredSubjectId:'cp-soc2',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-ecris', requiredSubjectId:'cp-aef',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-ecris', requiredSubjectId:'cp-dtrab', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-ecris', requiredSubjectId:'cp-audit', prerequisiteType:PrerequisiteType.aprobada },
    // Año 5-2C
    { careerId:'cp-fceys', subjectId:'cp-pp',    requiredSubjectId:'cp-audit', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-pp',    requiredSubjectId:'cp-ecris', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'cp-fceys', subjectId:'cp-pp',    requiredSubjectId:'cp-imp2',  prerequisiteType:PrerequisiteType.aprobada },
  ]})
  console.log('✅ Contador Público: 35 materias cargadas')

  // ════════════════════════════════════════════
  // LIC. EN ECONOMÍA — prefijo eco-
  // ════════════════════════════════════════════
  await prisma.subject.createMany({ skipDuplicates: true, data: [
    // Ciclo Básico — Año 1
    { id:'eco-intro', name:'Introducción a la Economía',        code:'101', isActive:true },
    { id:'eco-adm1',  name:'Principios de Administración',      code:'104', isActive:true },
    { id:'eco-mat1',  name:'Matemática I',                      code:'102', isActive:true },
    { id:'eco-cont1', name:'Contabilidad I',                    code:'103', isActive:true },
    { id:'eco-hes1',  name:'Historia Económica y Social I',     code:'180', isActive:true },
    { id:'eco-matec1',name:'Matemática para Economistas I',     code:'108', isActive:true },
    // Ciclo Básico — Año 2
    { id:'eco-macro1',name:'Macroeconomía I',                   code:'314', isActive:true },
    { id:'eco-hes2',  name:'Historia Económica y Social II',    code:'280', isActive:true },
    { id:'eco-dcon',  name:'Derecho Constitucional',            code:'202', isActive:true },
    { id:'eco-dadm',  name:'Derecho Administrativo',            code:'307', isActive:true },
    { id:'eco-micro1',name:'Microeconomía I',                   code:'208', isActive:true },
    { id:'eco-estmet',name:'Estadística Metodológica',          code:'206', isActive:true },
    { id:'eco-tsp',   name:'Teoría Social y Política',          code:'218', isActive:true },
    // Ciclo Profesional — Año 3
    { id:'eco-matfin',name:'Matemática Financiera',             code:'424', isActive:true },
    { id:'eco-matec2',name:'Matemática para Economistas II',    code:'328', isActive:true },
    { id:'eco-metinv',name:'Metodología de la Investigación',   code:'356', isActive:true },
    { id:'eco-dec',   name:'Derecho Económico',                 code:'244', isActive:true },
    { id:'eco-macro2',name:'Macroeconomía II',                  code:'448', isActive:true },
    { id:'eco-micro2',name:'Microeconomía II',                  code:'346', isActive:true },
    { id:'eco-estec', name:'Estadística para Economistas',      code:'302', isActive:true },
    { id:'eco-etica', name:'Ética y Responsabilidad Social',    code:'499', isActive:true },
    // Ciclo Profesional — Año 4
    { id:'eco-aefe',  name:'Análisis Económico-Financiero Emp.',code:'408', isActive:true },
    { id:'eco-dcb',   name:'Dinero, Crédito y Bancos',          code:'418', isActive:true },
    { id:'eco-ecoint',name:'Economía Internacional',            code:'407', isActive:true },
    { id:'eco-ecoamb',name:'Economía Ambiental',                code:'447', isActive:true },
    { id:'eco-polecon1',name:'Política Económica I',            code:'409', isActive:true },
    { id:'eco-econom1',name:'Econometría I',                    code:'410', isActive:true },
    { id:'eco-ecopol',name:'Economía Política',                 code:'419', isActive:true },
    { id:'eco-spub',  name:'Economía y Org. del Sector Público',code:'349', isActive:true },
    // Ciclo Profesional — Año 5
    { id:'eco-aep',   name:'Análisis y Evaluación de Proyectos',code:'504', isActive:true },
    { id:'eco-hpe',   name:'Historia del Pensamiento Económico',code:'553', isActive:true },
    { id:'eco-desec', name:'Desarrollo Económico',              code:'556', isActive:true },
    { id:'eco-polecon2',name:'Política Económica II',           code:'505', isActive:true },
    { id:'eco-mia',   name:'Metodología Invest. Aplicada',      code:'520', isActive:true },
    { id:'eco-elec',  name:'Electiva de Orientación',           code:'ELE', isActive:true },
  ]})

  await prisma.careerSubject.createMany({ skipDuplicates: true, data: [
    // Año 1 - 1C
    { careerId:'eco-fceys', subjectId:'eco-intro', yearNumber:1, semester:1, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'eco-fceys', subjectId:'eco-adm1',  yearNumber:1, semester:1, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'eco-fceys', subjectId:'eco-mat1',  yearNumber:1, semester:1, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    // Año 1 - 2C
    { careerId:'eco-fceys', subjectId:'eco-cont1', yearNumber:1, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'eco-fceys', subjectId:'eco-hes1',  yearNumber:1, semester:2, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'eco-fceys', subjectId:'eco-matec1',yearNumber:1, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    // Año 2 - 1C
    { careerId:'eco-fceys', subjectId:'eco-macro1',yearNumber:2, semester:1, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'eco-fceys', subjectId:'eco-hes2',  yearNumber:2, semester:1, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'eco-fceys', subjectId:'eco-dcon',  yearNumber:2, semester:1, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    { careerId:'eco-fceys', subjectId:'eco-dadm',  yearNumber:2, semester:1, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4 },
    // Año 2 - 2C
    { careerId:'eco-fceys', subjectId:'eco-micro1',yearNumber:2, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'eco-fceys', subjectId:'eco-estmet',yearNumber:2, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'eco-fceys', subjectId:'eco-tsp',   yearNumber:2, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    // Año 3 - 1C
    { careerId:'eco-fceys', subjectId:'eco-matfin',yearNumber:3, semester:1, isAnnual:false, credits:5, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'eco-fceys', subjectId:'eco-matec2',yearNumber:3, semester:1, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'eco-fceys', subjectId:'eco-metinv',yearNumber:3, semester:1, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    { careerId:'eco-fceys', subjectId:'eco-dec',   yearNumber:3, semester:1, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4 },
    // Año 3 - 2C
    { careerId:'eco-fceys', subjectId:'eco-macro2',yearNumber:3, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'eco-fceys', subjectId:'eco-micro2',yearNumber:3, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'eco-fceys', subjectId:'eco-estec', yearNumber:3, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    { careerId:'eco-fceys', subjectId:'eco-etica', yearNumber:3, semester:2, isAnnual:false, credits:2, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4 },
    // Año 4 - 1C
    { careerId:'eco-fceys', subjectId:'eco-aefe',  yearNumber:4, semester:1, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'eco-fceys', subjectId:'eco-dcb',   yearNumber:4, semester:1, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'eco-fceys', subjectId:'eco-ecoint',yearNumber:4, semester:1, isAnnual:false, credits:5, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    { careerId:'eco-fceys', subjectId:'eco-ecoamb',yearNumber:4, semester:1, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4 },
    // Año 4 - 2C
    { careerId:'eco-fceys', subjectId:'eco-polecon1',yearNumber:4, semester:2, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'eco-fceys', subjectId:'eco-econom1', yearNumber:4, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'eco-fceys', subjectId:'eco-ecopol',  yearNumber:4, semester:2, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    { careerId:'eco-fceys', subjectId:'eco-spub',    yearNumber:4, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4 },
    // Año 5 - 1C
    { careerId:'eco-fceys', subjectId:'eco-aep',     yearNumber:5, semester:1, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:1 },
    { careerId:'eco-fceys', subjectId:'eco-hpe',     yearNumber:5, semester:1, isAnnual:false, credits:6, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:2 },
    { careerId:'eco-fceys', subjectId:'eco-desec',   yearNumber:5, semester:1, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:3 },
    { careerId:'eco-fceys', subjectId:'eco-polecon2',yearNumber:5, semester:1, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:false, displayOrder:4 },
    // Año 5 - 2C
    { careerId:'eco-fceys', subjectId:'eco-mia',     yearNumber:5, semester:2, isAnnual:false, credits:4, subjectType:SubjectType.obligatoria, isFinalThesis:true,  displayOrder:1 },
    { careerId:'eco-fceys', subjectId:'eco-elec',    yearNumber:5, semester:2, isAnnual:false, credits:6, subjectType:SubjectType.electiva,    isFinalThesis:false, displayOrder:2 },
  ]})

  await prisma.prerequisite.createMany({ skipDuplicates: true, data: [
    // Año 1-2C
    { careerId:'eco-fceys', subjectId:'eco-matec1',requiredSubjectId:'eco-mat1',  prerequisiteType:PrerequisiteType.aprobada },
    // Año 2-1C
    { careerId:'eco-fceys', subjectId:'eco-macro1',requiredSubjectId:'eco-intro', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-macro1',requiredSubjectId:'eco-matec1',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-hes2',  requiredSubjectId:'eco-hes1',  prerequisiteType:PrerequisiteType.aprobada },
    // Año 2-2C
    { careerId:'eco-fceys', subjectId:'eco-micro1',requiredSubjectId:'eco-intro', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-micro1',requiredSubjectId:'eco-matec1',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-estmet',requiredSubjectId:'eco-matec1',prerequisiteType:PrerequisiteType.aprobada },
    // Año 3-1C
    { careerId:'eco-fceys', subjectId:'eco-matfin',requiredSubjectId:'eco-matec1',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-matec2',requiredSubjectId:'eco-matec1',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-dec',   requiredSubjectId:'eco-dcon',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-dec',   requiredSubjectId:'eco-dadm',  prerequisiteType:PrerequisiteType.aprobada },
    // Año 3-2C
    { careerId:'eco-fceys', subjectId:'eco-macro2',requiredSubjectId:'eco-macro1',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-macro2',requiredSubjectId:'eco-matec2',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-micro2',requiredSubjectId:'eco-micro1',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-micro2',requiredSubjectId:'eco-matec2',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-estec', requiredSubjectId:'eco-estmet',prerequisiteType:PrerequisiteType.aprobada },
    // Año 4-1C
    { careerId:'eco-fceys', subjectId:'eco-aefe',  requiredSubjectId:'eco-cont1', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-aefe',  requiredSubjectId:'eco-matfin',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-dcb',   requiredSubjectId:'eco-macro2',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-ecoint',requiredSubjectId:'eco-macro2',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-ecoint',requiredSubjectId:'eco-micro2',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-ecoamb',requiredSubjectId:'eco-macro2',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-ecoamb',requiredSubjectId:'eco-micro2',prerequisiteType:PrerequisiteType.aprobada },
    // Año 4-2C
    { careerId:'eco-fceys', subjectId:'eco-polecon1',requiredSubjectId:'eco-micro2',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-econom1', requiredSubjectId:'eco-estec', prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-ecopol',  requiredSubjectId:'eco-macro1',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-ecopol',  requiredSubjectId:'eco-micro1',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-ecopol',  requiredSubjectId:'eco-tsp',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-spub',    requiredSubjectId:'eco-dcon',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-spub',    requiredSubjectId:'eco-macro1',prerequisiteType:PrerequisiteType.aprobada },
    // Año 5-1C
    { careerId:'eco-fceys', subjectId:'eco-aep',     requiredSubjectId:'eco-matec2',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-aep',     requiredSubjectId:'eco-aefe',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-hpe',     requiredSubjectId:'eco-macro1',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-hpe',     requiredSubjectId:'eco-hes2',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-hpe',     requiredSubjectId:'eco-micro1',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-hpe',     requiredSubjectId:'eco-ecopol',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-desec',   requiredSubjectId:'eco-macro2',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-polecon2',requiredSubjectId:'eco-macro1',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-polecon2',requiredSubjectId:'eco-hes2',  prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-polecon2',requiredSubjectId:'eco-tsp',   prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-polecon2',requiredSubjectId:'eco-polecon1',prerequisiteType:PrerequisiteType.aprobada },
    // Año 5-2C
    { careerId:'eco-fceys', subjectId:'eco-mia',     requiredSubjectId:'eco-micro2',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-mia',     requiredSubjectId:'eco-metinv',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-mia',     requiredSubjectId:'eco-econom1',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-mia',     requiredSubjectId:'eco-ecopol',prerequisiteType:PrerequisiteType.aprobada },
    { careerId:'eco-fceys', subjectId:'eco-mia',     requiredSubjectId:'eco-macro2',prerequisiteType:PrerequisiteType.aprobada },
  ]})
  console.log('✅ Lic. en Economía: 35 materias cargadas')

  console.log('\n🎓 Seed FCEyS completado:')
  console.log('   Contador Público     : 35 materias · IDs prefijo cp-')
  console.log('   Lic. en Economía     : 35 materias · IDs prefijo eco-')
}

main()
  .catch(e => { console.error('❌', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
