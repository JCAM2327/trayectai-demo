// lib/prerequisite-engine.ts
// AcadémIA — Motor de Correlativas
//
// Resuelve en tiempo real:
//   - Estado de cada materia (bloqueada, habilitada, en_curso, aprobada, etc.)
//   - Qué materias se desbloquean al aprobar una
//   - Simulación "¿qué pasa si apruebo X?"
//   - Métricas de progreso del plan

import { PrerequisiteType, SubjectStatus } from '@prisma/client'

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export type SubjectState =
  | 'aprobada'    // final aprobado
  | 'regular'     // regularidad vigente (sin final aún)
  | 'cursada'     // cursada pero libre (venció regularidad)
  | 'en_curso'    // cursando este cuatrimestre
  | 'habilitada'  // puede inscribirse (correlativas OK)
  | 'bloqueada'   // no puede inscribirse aún

export interface SubjectProgress {
  subjectId: string
  status: SubjectStatus
  grade?: number | null
  passedAt?: Date | null
  regularizedAt?: Date | null
}

export interface Prerequisite {
  subjectId: string
  requiredSubjectId: string
  prerequisiteType: PrerequisiteType
}

export interface CareerSubjectMeta {
  subjectId: string
  subjectName: string
  subjectCode: string
  yearNumber: number
  semester: number | null
  isAnnual: boolean
  credits: number
  isFinalThesis: boolean
}

export interface SubjectResult {
  subjectId: string
  subjectName: string
  subjectCode: string
  yearNumber: number
  semester: number | null
  isAnnual: boolean
  credits: number
  isFinalThesis: boolean
  state: SubjectState
  grade?: number | null
  passedAt?: Date | null
  // Qué correlativas le faltan (solo si está bloqueada)
  missingPrerequisites: MissingPrereq[]
}

export interface MissingPrereq {
  requiredSubjectId: string
  requiredSubjectName: string
  prerequisiteType: PrerequisiteType
  currentStatus: SubjectState | 'sin_cursar'
}

export interface CareerProgress {
  subjects: SubjectResult[]
  totalSubjects: number
  approvedSubjects: number
  enabledSubjects: number     // habilitadas para cursar ahora
  blockedSubjects: number
  totalCredits: number
  earnedCredits: number
  progressPercent: number     // basado en créditos
  estimatedSemestersLeft: number
}

export interface SimulationResult {
  simulatedSubjectId: string
  newlyEnabled: SubjectResult[]    // se habilitarían
  stillBlocked: SubjectResult[]    // seguirían bloqueadas
}

// ─────────────────────────────────────────────
// HELPERS INTERNOS
// ─────────────────────────────────────────────

// Convierte SubjectStatus (DB) → SubjectState (motor)
// SubjectStatus viene de UserSubjectProgress (lo que el usuario registró)
// SubjectState es el estado calculado para mostrar en UI
function dbStatusToState(status: SubjectStatus): SubjectState {
  switch (status) {
    case 'aprobada':  return 'aprobada'
    case 'regular':   return 'regular'
    case 'cursada':   return 'cursada'
    case 'en_curso':  return 'en_curso'
    case 'libre':     return 'cursada'  // libre = venció regularidad, equivale a cursada
    default:          return 'bloqueada'
  }
}

// Determina si un progreso satisface un tipo de correlativa
function satisfiesPrerequisite(
  progress: SubjectProgress | undefined,
  type: PrerequisiteType
): boolean {
  if (!progress) return false

  const state = dbStatusToState(progress.status)

  switch (type) {
    case PrerequisiteType.aprobada:
      // Solo cuenta si el final está aprobado
      return state === 'aprobada'

    case PrerequisiteType.regular:
      // Regularidad vigente o aprobada
      return state === 'aprobada' || state === 'regular'

    case PrerequisiteType.cursada:
      // Cualquier estado de cursada o superior
      return (
        state === 'aprobada' ||
        state === 'regular' ||
        state === 'cursada' ||
        state === 'en_curso'
      )

    default:
      return false
  }
}

// ─────────────────────────────────────────────
// FUNCIÓN CENTRAL: ¿puede cursar?
// ─────────────────────────────────────────────

/**
 * Determina si el usuario puede inscribirse en una materia.
 * Retorna { canEnroll, missingPrereqs }.
 * Todas las correlativas deben cumplirse (AND lógico).
 */
export function canEnroll(
  subjectPrereqs: Prerequisite[],
  progressMap: Map<string, SubjectProgress>,
  subjectNameMap: Map<string, string>
): { canEnroll: boolean; missing: MissingPrereq[] } {
  if (subjectPrereqs.length === 0) {
    return { canEnroll: true, missing: [] }
  }

  const missing: MissingPrereq[] = []

  for (const prereq of subjectPrereqs) {
    const progress = progressMap.get(prereq.requiredSubjectId)
    const satisfied = satisfiesPrerequisite(progress, prereq.prerequisiteType)

    if (!satisfied) {
      const currentState = progress
        ? dbStatusToState(progress.status)
        : 'sin_cursar'

      missing.push({
        requiredSubjectId: prereq.requiredSubjectId,
        requiredSubjectName:
          subjectNameMap.get(prereq.requiredSubjectId) ?? prereq.requiredSubjectId,
        prerequisiteType: prereq.prerequisiteType,
        currentStatus: currentState,
      })
    }
  }

  return { canEnroll: missing.length === 0, missing }
}

// ─────────────────────────────────────────────
// FUNCIÓN PRINCIPAL: calcular plan completo
// ─────────────────────────────────────────────

/**
 * Calcula el estado de todas las materias de una carrera
 * para un usuario dado, en un solo recorrido.
 *
 * @param careerSubjects - Todas las materias del plan
 * @param prerequisites  - Todas las correlativas de la carrera
 * @param userProgress   - Progreso registrado por el usuario
 * @returns CareerProgress con estado completo
 */
export function computeCareerProgress(
  careerSubjects: CareerSubjectMeta[],
  prerequisites: Prerequisite[],
  userProgress: SubjectProgress[]
): CareerProgress {
  // Índice rápido de progreso por materia
  const progressMap = new Map<string, SubjectProgress>()
  for (const p of userProgress) {
    progressMap.set(p.subjectId, p)
  }

  // Índice de nombres para mensajes de error legibles
  const subjectNameMap = new Map<string, string>()
  for (const s of careerSubjects) {
    subjectNameMap.set(s.subjectId, s.subjectName)
  }

  // Pre-indexar correlativas por subjectId (evita filtros O(n) en cada materia)
  const prereqBySubject = new Map<string, Prerequisite[]>()
  for (const p of prerequisites) {
    const list = prereqBySubject.get(p.subjectId)
    if (list) list.push(p)
    else prereqBySubject.set(p.subjectId, [p])
  }

  const results: SubjectResult[] = []
  let earnedCredits = 0
  let totalCredits = 0
  let approvedSubjects = 0
  let enabledSubjects = 0
  let blockedSubjects = 0

  for (const subject of careerSubjects) {
    totalCredits += subject.credits ?? 0

    const progress = progressMap.get(subject.subjectId)

    let state: SubjectState
    let missingPrereqs: MissingPrereq[] = []

    if (progress) {
      // El usuario tiene un registro para esta materia
      state = dbStatusToState(progress.status)

      if (state === 'aprobada') {
        earnedCredits += subject.credits ?? 0
        approvedSubjects++
      }
    } else {
      // Sin registro: calcular si está habilitada o bloqueada
      const { canEnroll: enabled, missing } = canEnroll(
        prereqBySubject.get(subject.subjectId) ?? [],
        progressMap,
        subjectNameMap
      )

      if (enabled) {
        state = 'habilitada'
        enabledSubjects++
      } else {
        state = 'bloqueada'
        missingPrereqs = missing
        blockedSubjects++
      }
    }

    results.push({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
      yearNumber: subject.yearNumber,
      semester: subject.semester,
      isAnnual: subject.isAnnual,
      credits: subject.credits,
      isFinalThesis: subject.isFinalThesis,
      state,
      grade: progress?.grade ?? null,
      passedAt: progress?.passedAt ?? null,
      missingPrerequisites: missingPrereqs,
    })
  }

  const progressPercent =
    totalCredits > 0
      ? Math.round((earnedCredits / totalCredits) * 100)
      : 0

  // Estimación simple: promedio de materias por cuatrimestre del usuario
  // (fallback: asumir 3 materias/cuatrimestre si no hay historial)
  const remainingCredits = totalCredits - earnedCredits
  const avgCreditsPerSemester =
    approvedSubjects > 0
      ? earnedCredits / Math.max(approvedSubjects / 3, 1)
      : 15 // créditos promedio por cuatrimestre estimados
  const estimatedSemestersLeft =
    avgCreditsPerSemester > 0
      ? Math.ceil(remainingCredits / avgCreditsPerSemester)
      : 0

  return {
    subjects: results,
    totalSubjects: careerSubjects.length,
    approvedSubjects,
    enabledSubjects,
    blockedSubjects,
    totalCredits,
    earnedCredits,
    progressPercent,
    estimatedSemestersLeft,
  }
}

// ─────────────────────────────────────────────
// SIMULACIÓN: ¿qué pasa si apruebo X?
// ─────────────────────────────────────────────

/**
 * Simula qué materias se desbloquearían si el usuario
 * aprobara una o varias materias, SIN persistir nada.
 *
 * Ideal para el "modo simulación" de la UI.
 */
export function simulateApproval(
  subjectIdsToSimulate: string[],
  careerSubjects: CareerSubjectMeta[],
  prerequisites: Prerequisite[],
  userProgress: SubjectProgress[]
): SimulationResult[] {
  const results: SimulationResult[] = []

  for (const simulatedId of subjectIdsToSimulate) {
    // Crear progreso temporal con la materia simulada como aprobada
    const simulatedProgress: SubjectProgress[] = [
      ...userProgress,
      {
        subjectId: simulatedId,
        status: 'aprobada' as SubjectStatus,
        grade: null,
        passedAt: null,
        regularizedAt: null,
      },
    ]

    const current = computeCareerProgress(
      careerSubjects,
      prerequisites,
      userProgress
    )

    const simulated = computeCareerProgress(
      careerSubjects,
      prerequisites,
      simulatedProgress
    )

    // Materias que eran bloqueadas y ahora son habilitadas
    const currentBlockedIds = new Set(
      current.subjects
        .filter(s => s.state === 'bloqueada')
        .map(s => s.subjectId)
    )

    const newlyEnabled = simulated.subjects.filter(
      s => s.state === 'habilitada' && currentBlockedIds.has(s.subjectId)
    )

    const stillBlocked = simulated.subjects.filter(
      s => s.state === 'bloqueada' && currentBlockedIds.has(s.subjectId)
    )

    results.push({
      simulatedSubjectId: simulatedId,
      newlyEnabled,
      stillBlocked,
    })
  }

  return results
}

// ─────────────────────────────────────────────
// RECOMENDACIÓN INTELIGENTE
// ─────────────────────────────────────────────

export interface RecommendedSubject {
  subjectId: string
  subjectName: string
  subjectCode: string
  yearNumber: number
  semester: number | null
  credits: number
  unlocksCount: number
  unlocksSubjects: SubjectResult[]
}

/**
 * Ranking de materias habilitadas ordenadas por impacto:
 * cuántas materias bloqueadas se desbloquean si la aprobás.
 */
export function getRecommendedSubjects(
  careerSubjects: CareerSubjectMeta[],
  prerequisites: Prerequisite[],
  userProgress: SubjectProgress[]
): RecommendedSubject[] {
  const current = computeCareerProgress(careerSubjects, prerequisites, userProgress)
  const available = current.subjects.filter(s => s.state === 'habilitada')

  if (available.length === 0) return []

  const result = simulateApproval(
    available.map(s => s.subjectId),
    careerSubjects,
    prerequisites,
    userProgress
  )

  const resultMap = new Map(result.map(r => [r.simulatedSubjectId, r]))

  return available
    .map(subject => {
      const sim = resultMap.get(subject.subjectId)!
      return {
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode,
        yearNumber: subject.yearNumber,
        semester: subject.semester,
        credits: subject.credits,
        unlocksCount: sim.newlyEnabled.length,
        unlocksSubjects: sim.newlyEnabled,
      }
    })
    .sort((a, b) => {
      if (b.unlocksCount !== a.unlocksCount) return b.unlocksCount - a.unlocksCount
      if (a.yearNumber !== b.yearNumber) return a.yearNumber - b.yearNumber
      return (a.semester ?? 0) - (b.semester ?? 0)
    })
}

// ─────────────────────────────────────────────
// PROYECCIÓN DE EGRESO
// ─────────────────────────────────────────────

export interface GraduationProjection {
  estimatedDate: string
  estimatedSemesters: number
  semestersAtCurrentPace: number
  subjectsPerSemester: number
  remainingSubjects: number
  remainingCredits: number
  isOnTrack: boolean
  canGraduateInTheoreticalMin: boolean
  theoreticalMinSemesters: number
  subjectsBySemester: {
    semester: number
    year: number
    subjects: {
      subjectId: string
      subjectName: string
      credits: number
      yearNumber: number
    }[]
  }[]
}

export function computeGraduationProjection(
  careerSubjects: CareerSubjectMeta[],
  prerequisites: Prerequisite[],
  userProgress: SubjectProgress[],
  careerTotalYears: number,
  currentSemester?: number
): GraduationProjection {
  const current = computeCareerProgress(careerSubjects, prerequisites, userProgress)

  const remaining = current.subjects.filter(s => s.state !== 'aprobada')
  const remainingCreditsValue = remaining.reduce((sum, s) => sum + s.credits, 0)

  const approvedCount = current.approvedSubjects
  const MAX_SUBJECTS_PER_SEMESTER = 3
  const estimatedSemestersDone = approvedCount > 0
    ? Math.max(1, Math.ceil(approvedCount / MAX_SUBJECTS_PER_SEMESTER))
    : 0
  const avgSubjectsPerSemester = approvedCount > 0
    ? Math.max(1, Math.round(approvedCount / estimatedSemestersDone))
    : 2

  const theoreticalMinSemestersPerYear = 2
  const totalSubjects = careerSubjects.length
  const remainingSubjects = totalSubjects - approvedCount
  const theoreticalMinSemesters = Math.ceil(remainingSubjects / (totalSubjects / (careerTotalYears * 2)))

  const semestersAtCurrentPace = Math.ceil(remainingSubjects / avgSubjectsPerSemester)
  const estimatedSemesters = Math.max(semestersAtCurrentPace, theoreticalMinSemesters)

  const now = new Date()
  const currentYear = now.getFullYear()
  const semester = currentSemester ?? (now.getMonth() < 7 ? 1 : 2)
  const semesterNames = ['', '1er cuatrimestre', '2do cuatrimestre']

  const subjectsBySemester: GraduationProjection['subjectsBySemester'] = []
  const subjectPool = remaining.filter(s =>
    s.state === 'habilitada' || s.state === 'bloqueada'
  )

  const simulatedProgress = [...userProgress]
  let remainingPool = [...subjectPool]
  let simMonth = now.getMonth()
  let simYear = currentYear
  let semCounter = semester

  for (let s = 0; s < estimatedSemesters && remainingPool.length > 0; s++) {
    const state = computeCareerProgress(careerSubjects, prerequisites, simulatedProgress)
    const available = state.subjects.filter(sub =>
      sub.state === 'habilitada' &&
      remainingPool.find(r => r.subjectId === sub.subjectId)
    )

    const batch = available.slice(0, avgSubjectsPerSemester)
    if (batch.length === 0) break

    const semesterSubjects = batch.map(b => ({
      subjectId: b.subjectId,
      subjectName: b.subjectName,
      credits: b.credits,
      yearNumber: b.yearNumber,
    }))

    const yearLabel = semCounter === 1 ? simYear : simYear
    subjectsBySemester.push({
      semester: semCounter,
      year: yearLabel,
      subjects: semesterSubjects,
    })

    for (const b of batch) {
      simulatedProgress.push({
        subjectId: b.subjectId,
        status: 'aprobada' as SubjectStatus,
        grade: null,
        passedAt: null,
        regularizedAt: null,
      })
      remainingPool = remainingPool.filter(r => r.subjectId !== b.subjectId)
    }

    semCounter = semCounter === 1 ? 2 : 1
    if (semCounter === 1) simYear++
    simMonth = semCounter === 1 ? 2 : 8
  }

  const estDate = subjectsBySemester.length > 0
    ? subjectsBySemester[subjectsBySemester.length - 1]
    : null

  return {
    estimatedDate: estDate
      ? `${semesterNames[estDate.semester]} ${estDate.year}`
      : 'Ya completaste todas las materias',
    estimatedSemesters,
    semestersAtCurrentPace,
    subjectsPerSemester: avgSubjectsPerSemester,
    remainingSubjects,
    remainingCredits: remainingCreditsValue,
    isOnTrack: semestersAtCurrentPace <= theoreticalMinSemesters * 1.5,
    canGraduateInTheoreticalMin: semestersAtCurrentPace <= theoreticalMinSemesters,
    theoreticalMinSemesters,
    subjectsBySemester,
  }
}

// ─────────────────────────────────────────────
// HELPERS DE UI
// ─────────────────────────────────────────────

/** Agrupa los resultados por año para renderizar el plan por filas */
export function groupByYear(
  subjects: SubjectResult[]
): Map<number, SubjectResult[]> {
  const map = new Map<number, SubjectResult[]>()
  for (const s of subjects) {
    const year = s.yearNumber
    if (!map.has(year)) map.set(year, [])
    map.get(year)!.push(s)
  }
  // Ordenar dentro de cada año por cuatrimestre y displayOrder
  for (const [, list] of map) {
    list.sort((a, b) => {
      const semA = a.semester ?? 0
      const semB = b.semester ?? 0
      return semA !== semB ? semA - semB : 0
    })
  }
  return map
}

/** Filtra solo las materias que el estudiante puede cursar ahora */
export function getAvailableNow(subjects: SubjectResult[]): SubjectResult[] {
  return subjects.filter(s => s.state === 'habilitada')
}

/** Etiqueta legible para mostrar en UI */
export function stateLabel(state: SubjectState): string {
  switch (state) {
    case 'aprobada':   return 'Aprobada'
    case 'regular':    return 'Regular'
    case 'cursada':    return 'Cursada'
    case 'en_curso':   return 'En curso'
    case 'habilitada': return 'Podés cursar'
    case 'bloqueada':  return 'Bloqueada'
  }
}

/** Color Tailwind para badge de estado */
export function stateBadgeClass(state: SubjectState): string {
  switch (state) {
    case 'aprobada':   return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'regular':    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'cursada':    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'en_curso':   return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'habilitada': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
    case 'bloqueada':  return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
  }
}
