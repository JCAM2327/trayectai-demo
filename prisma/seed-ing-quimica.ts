import { PrismaClient, DegreeType, SubjectType, PrerequisiteType } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed: Ingeniería Química — Plan 2024 (OCA 357/2023)')

  await prisma.career.upsert({
    where: { id: 'ing-quim-fi' },
    update: {},
    create: {
      id: 'ing-quim-fi', facultyId: 'fi',
      name: 'Ingeniería Química', shortName: 'Ing. Química',
      degreeType: DegreeType.ingenieria, totalYears: 5, totalCredits: 237,
      planCode: 'Plan 2024', planYear: 2024, isActive: true,
    },
  })

  const subjects = [
    // === Requisito académico (no es materia curricular) ===
    { id: 'req-ingra01', name: 'Introducción a la Ciencia y la Ingeniería', code: 'INGRA01' },

    // === Año 1 - Cuatrimestre 1 ===
    { id: 'iq24-am1',   name: 'Análisis Matemático I',               code: 'INGM101', year: 1, sem: 1, credits: 6 },
    { id: 'iq24-alg1b', name: 'Álgebra I-B',                         code: 'INGM105', year: 1, sem: 1, credits: 4 },
    { id: 'iq24-qgi',   name: 'Química General e Inorgánica',         code: 'ING1101', year: 1, sem: 1, credits: 6 },
    { id: 'iq24-taller1', name: 'Taller de Ingeniería I',             code: 'ING1502', year: 1, sem: null, credits: 6, annual: true },

    // === Año 1 - Cuatrimestre 2 ===
    { id: 'iq24-am2',   name: 'Análisis Matemático II',              code: 'INGM102', year: 1, sem: 2, credits: 5 },
    { id: 'iq24-alg2',  name: 'Álgebra II',                          code: 'INGM106', year: 1, sem: 2, credits: 5 },
    { id: 'iq24-fis-a', name: 'Física A',                            code: 'INGF101', year: 1, sem: 2, credits: 6 },
    { id: 'iq24-fq1',   name: 'Fisicoquímica I',                     code: 'ING1201', year: 1, sem: 2, credits: 5 },

    // === Año 2 - Cuatrimestre 3 ===
    { id: 'iq24-am3',   name: 'Análisis Matemático III',             code: 'INGM103', year: 2, sem: 1, credits: 6 },
    { id: 'iq24-bal',   name: 'Balances de Masa y Energía',          code: 'ING1307', year: 2, sem: 1, credits: 4 },
    { id: 'iq24-fundprog', name: 'Fundamentos de la Programación',   code: 'ING6101', year: 2, sem: 1, credits: 4 },
    { id: 'iq24-fis-b2', name: 'Física B-II',                        code: 'INGF103', year: 2, sem: 1, credits: 6 },
    { id: 'iq24-sistrep', name: 'Sistemas de Representación en Plantas de Procesos', code: 'ING1102', year: 2, sem: 1, credits: 2 },
    { id: 'iq24-taller2', name: 'Taller de Ingeniería II',           code: 'ING1503', year: 2, sem: null, credits: 6, annual: true },

    // === Año 2 - Cuatrimestre 4 ===
    { id: 'iq24-qcarb', name: 'Química del Carbono',                 code: 'ING1206', year: 2, sem: 2, credits: 5 },
    { id: 'iq24-termo1', name: 'Termodinámica I',                    code: 'ING1211', year: 2, sem: 2, credits: 4 },
    { id: 'iq24-fq2',   name: 'Fisicoquímica II',                    code: 'ING1202', year: 2, sem: 2, credits: 3 },
    { id: 'iq24-fis-c2', name: 'Física C-II',                        code: 'INGF105', year: 2, sem: 2, credits: 4 },
    { id: 'iq24-ing1',  name: 'Inglés I',                            code: 'ING8408', year: 2, sem: 2, credits: 3 },
    { id: 'iq24-oplant', name: 'Operación de Plantas de Procesos',   code: 'ING1501', year: 2, sem: 2, credits: 2 },

    // === Año 3 - Cuatrimestre 5 ===
    { id: 'iq24-metnum', name: 'Métodos Numéricos para Ingeniería',  code: 'INGM109', year: 3, sem: 1, credits: 4 },
    { id: 'iq24-ou1',   name: 'Operaciones Unitarias I',             code: 'ING1301', year: 3, sem: 1, credits: 8 },
    { id: 'iq24-orgemp', name: 'Organización Empresarial e Industrial', code: 'ING8411', year: 3, sem: 1, credits: 4 },
    { id: 'iq24-termo2', name: 'Termodinámica II',                   code: 'ING1212', year: 3, sem: 1, credits: 4 },
    { id: 'iq24-taller3', name: 'Taller de Ingeniería III',          code: 'ING1504', year: 3, sem: null, credits: 8, annual: true },

    // === Año 3 - Cuatrimestre 6 ===
    { id: 'iq24-ou2',   name: 'Operaciones Unitarias II',            code: 'ING1302', year: 3, sem: 2, credits: 8 },
    { id: 'iq24-probest', name: 'Probabilidad y Estadística',        code: 'INGM108', year: 3, sem: 2, credits: 4 },
    { id: 'iq24-ing2',  name: 'Inglés II',                           code: 'ING8409', year: 3, sem: 2, credits: 3 },
    { id: 'iq24-isp',   name: 'Ingeniería de Sistemas de Procesos',  code: 'ING1315', year: 3, sem: 2, credits: 3 },

    // === Año 4 - Cuatrimestre 7 ===
    { id: 'iq24-irq1',  name: 'Ingeniería de Reacciones Químicas I', code: 'ING1313', year: 4, sem: 1, credits: 7 },
    { id: 'iq24-ou3',   name: 'Operaciones Unitarias III',           code: 'ING1303', year: 4, sem: 1, credits: 8 },
    { id: 'iq24-formproy', name: 'Formulación y Evaluación de Proyectos de Inversión', code: 'ING8406', year: 4, sem: 1, credits: 4 },
    { id: 'iq24-etica', name: 'Ética, Legislación y Propiedad Intelectual en el Ejercicio Profesional', code: 'ING8405', year: 4, sem: 1, credits: 4 },
    { id: 'iq24-tallerpq', name: 'Taller de Proyectos de Ingeniería Química', code: 'ING1505', year: 4, sem: null, credits: 6, annual: true },

    // === Año 4 - Cuatrimestre 8 ===
    { id: 'iq24-irq2',  name: 'Ingeniería de Reacciones Químicas II', code: 'ING1314', year: 4, sem: 2, credits: 5 },
    { id: 'iq24-qbio',  name: 'Química Biológica y Microbiología',   code: 'ING1210', year: 4, sem: 2, credits: 4 },
    { id: 'iq24-tecaf', name: 'Técnicas de Análisis Fisicoquímicos', code: 'ING1204', year: 4, sem: 2, credits: 4 },
    { id: 'iq24-sigest', name: 'Sistemas de Gestión Integrados',     code: 'ING8413', year: 4, sem: 2, credits: 4 },

    // === Año 5 - Cuatrimestre 9 ===
    { id: 'iq24-tecmat', name: 'Tecnología de los Materiales',       code: 'ING1209', year: 5, sem: 1, credits: 4 },
    { id: 'iq24-ipbiotec', name: 'Ingeniería de Procesos Biotecnológicos', code: 'ING1306', year: 5, sem: 1, credits: 4 },
    { id: 'iq24-piq',   name: 'Proyecto Integrador de Ingeniería Química', code: 'ING1506', year: 5, sem: null, credits: 10, annual: true },

    // === Año 5 - Cuatrimestre 10 ===
    { id: 'iq24-segur', name: 'Seguridad y Salud Ocupacional',       code: 'ING8412', year: 5, sem: 2, credits: 4 },
    { id: 'iq24-dyc',   name: 'Dinámica, Instrumentación y Control de Procesos', code: 'ING1312', year: 5, sem: 2, credits: 7 },
  ]

  for (const s of subjects) {
    await prisma.subject.upsert({
      where: { id: s.id },
      update: {},
      create: { id: s.id, name: s.name, code: s.code, isActive: true },
    })
    if (s.year) {
      await prisma.careerSubject.upsert({
        where: { careerId_subjectId: { careerId: 'ing-quim-fi', subjectId: s.id } },
        update: {},
        create: {
          careerId: 'ing-quim-fi', subjectId: s.id,
          yearNumber: s.year, semester: s.sem ?? null,
          isAnnual: s.annual ?? false,
          credits: s.credits,
          subjectType: s.id === 'req-ingra01' ? SubjectType.obligatoria : SubjectType.obligatoria,
          isFinalThesis: s.id === 'iq24-piq',
        },
      })
    }
  }

  const prereqs: [string, string][] = [
    // Año 1 → requieren Introducción a la Ciencia y la Ingeniería
    ['iq24-am1', 'req-ingra01'],
    ['iq24-alg1b', 'req-ingra01'],
    ['iq24-qgi', 'req-ingra01'],
    ['iq24-taller1', 'req-ingra01'],

    // Cuat 2 → Cuat 1
    ['iq24-am2', 'iq24-am1'],
    ['iq24-alg2', 'iq24-alg1b'],
    ['iq24-fis-a', 'iq24-am1'],
    ['iq24-fis-a', 'iq24-alg1b'],
    ['iq24-fq1', 'iq24-qgi'],

    // Año 2 → Año 1
    ['iq24-taller2', 'iq24-taller1'],

    // Cuat 3 → Cuat 1-2
    ['iq24-am3', 'iq24-am2'],
    ['iq24-am3', 'iq24-alg2'],
    ['iq24-bal', 'iq24-am2'],
    ['iq24-bal', 'iq24-fis-a'],
    ['iq24-bal', 'iq24-qgi'],
    ['iq24-fundprog', 'iq24-alg1b'],
    ['iq24-fis-b2', 'iq24-alg2'],
    ['iq24-fis-b2', 'iq24-am2'],
    ['iq24-fis-b2', 'iq24-fis-a'],
    ['iq24-sistrep', 'iq24-qgi'],

    // Cuat 4 → Cuat 3
    ['iq24-qcarb', 'iq24-fq1'],
    ['iq24-termo1', 'iq24-bal'],
    ['iq24-termo1', 'iq24-am2'],
    ['iq24-fq2', 'iq24-fq1'],
    ['iq24-fq2', 'iq24-am2'],
    ['iq24-fis-c2', 'iq24-fis-b2'],
    ['iq24-ing1', 'req-ingra01'],
    ['iq24-oplant', 'iq24-fis-b2'],
    ['iq24-oplant', 'iq24-bal'],
    ['iq24-oplant', 'iq24-sistrep'],

    // Año 3 → Año 2
    ['iq24-taller3', 'iq24-taller2'],

    // Cuat 5 → Cuat 3-4
    ['iq24-metnum', 'iq24-am3'],
    ['iq24-metnum', 'iq24-fundprog'],
    ['iq24-ou1', 'iq24-am3'],
    ['iq24-ou1', 'iq24-oplant'],
    ['iq24-orgemp', 'iq24-am3'],
    ['iq24-termo2', 'iq24-termo1'],

    // Cuat 6 → Cuat 5
    ['iq24-ou2', 'iq24-termo1'],
    ['iq24-ou2', 'iq24-ou1'],
    ['iq24-probest', 'iq24-am2'],
    ['iq24-ing2', 'iq24-ing1'],
    ['iq24-isp', 'iq24-metnum'],
    ['iq24-isp', 'iq24-termo1'],
    ['iq24-isp', 'iq24-fq2'],

    // Año 4 → Año 3
    ['iq24-tallerpq', 'iq24-taller3'],
    ['iq24-tallerpq', 'iq24-termo1'],
    ['iq24-tallerpq', 'iq24-fq2'],

    // Cuat 7 → Cuat 5-6
    ['iq24-irq1', 'iq24-fq2'],
    ['iq24-irq1', 'iq24-oplant'],
    ['iq24-ou3', 'iq24-termo2'],
    ['iq24-formproy', 'iq24-orgemp'],
    ['iq24-formproy', 'iq24-taller3'],
    ['iq24-etica', 'iq24-am3'],

    // Cuat 8 → Cuat 7
    ['iq24-irq2', 'iq24-irq1'],
    ['iq24-irq2', 'iq24-ou3'],
    ['iq24-qbio', 'iq24-qcarb'],
    ['iq24-tecaf', 'iq24-qcarb'],
    ['iq24-sigest', 'iq24-orgemp'],

    // Año 5 → Año 4
    ['iq24-tecmat', 'iq24-fis-b2'],
    ['iq24-tecmat', 'iq24-fq1'],
    ['iq24-ipbiotec', 'iq24-fq2'],
    ['iq24-ipbiotec', 'iq24-qbio'],

    // Cuat 9-10
    ['iq24-piq', 'iq24-tallerpq'],
    ['iq24-piq', 'iq24-isp'],
    ['iq24-piq', 'iq24-irq1'],
    ['iq24-piq', 'iq24-ou3'],
    ['iq24-segur', 'iq24-orgemp'],
    ['iq24-dyc', 'iq24-ou2'],
  ]

  for (const [subjectId, requiredSubjectId] of prereqs) {
    await prisma.prerequisite.upsert({
      where: {
        careerId_subjectId_requiredSubjectId: {
          careerId: 'ing-quim-fi', subjectId, requiredSubjectId,
        },
      },
      update: {},
      create: {
        careerId: 'ing-quim-fi', subjectId, requiredSubjectId,
        prerequisiteType: PrerequisiteType.aprobada,
      },
    })
  }

  const subjectCount = subjects.filter(s => s.year).length
  console.log(`✅ Ing. Química Plan 2024: ${subjectCount} materias, ${prereqs.length} correlativas`)
}

main()
  .catch(e => { console.error('❌', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
