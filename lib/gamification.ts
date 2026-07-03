export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  progress?: number
  progressMax?: number
}

export interface HealthIndex {
  score: number
  label: string
  color: string
  breakdown: { label: string; score: number; max: number }[]
  recommendation: string
}

export interface GamificationState {
  healthIndex: HealthIndex
  streak: number
  achievements: Achievement[]
}

function computeHealthIndex(
  subjects: { state: string; credits: number }[],
  averageGrade: number | null,
  totalCredits: number,
  earnedCredits: number,
  isOnTrack: boolean,
  streak: number
): HealthIndex {
  const gpaScore = averageGrade != null ? Math.min((averageGrade / 10) * 40, 40) : 0
  const progressPct = totalCredits > 0 ? earnedCredits / totalCredits : 0
  const progressScore = Math.round(progressPct * 25)
  const paceScore = isOnTrack ? 20 : 10
  const streakScore = Math.min(Math.round((streak / 6) * 15), 15)

  const total = Math.min(gpaScore + progressScore + paceScore + streakScore, 100)

  let label: string
  let color: string
  let recommendation: string

  if (total >= 80) {
    label = 'Excelente'
    color = '#10b981'
    recommendation = '¡Vas muy bien! Seguí con este ritmo y vas a egresar con éxito.'
  } else if (total >= 60) {
    label = 'Buena'
    color = '#3b82f6'
    recommendation = 'Vas por buen camino. Identificá las materias que más te cuestan y dedicate más tiempo.'
  } else if (total >= 40) {
    label = 'Regular'
    color = '#f59e0b'
    recommendation = 'Tenés margen para mejorar. Considerá reforzar tu plan de estudio y buscar apoyo en las materias más difíciles.'
  } else {
    label = 'Precaria'
    color = '#ef4444'
    recommendation = 'Necesitás un cambio de estrategia. Hablá con tutores, revisá tu método de estudio y priorizá las materias clave.'
  }

  const breakdown = [
    { label: 'Promedio', score: Math.round(gpaScore), max: 40 },
    { label: 'Progreso', score: progressScore, max: 25 },
    { label: 'Ritmo', score: paceScore, max: 20 },
    { label: 'Consistencia', score: streakScore, max: 15 },
  ]

  return { score: Math.round(total), label, color, breakdown, recommendation }
}

function computeStreak(
  subjects: { state: string; semester: number | null; yearNumber: number }[]
): number {
  const hasCursada = subjects.some(s => s.state === 'cursada')
  const hasLibre = subjects.some(s => s.state === 'cursada')
  const approvedCount = subjects.filter(s => s.state === 'aprobada').length

  if (hasCursada || hasLibre) return 0
  if (approvedCount === 0) return 0
  return Math.min(Math.max(Math.floor(approvedCount / 3), 1), 8)
}

function computeAchievements(
  subjects: { state: string; credits: number; subjectName: string }[],
  averageGrade: number | null,
  totalCredits: number,
  earnedCredits: number,
  totalSubjects: number,
  approvedSubjects: number,
  streak: number,
  isOnTrack: boolean,
  enabledSubjects: number,
  hasPlan?: boolean
): Achievement[] {
  const progressPct = totalCredits > 0 ? earnedCredits / totalCredits : 0
  const approvedPct = totalSubjects > 0 ? approvedSubjects / totalSubjects : 0

  const achievements: Achievement[] = [
    {
      id: 'first_pass',
      name: 'Primer paso',
      description: 'Aprobar la primera materia',
      icon: '🌟',
      unlocked: approvedSubjects >= 1,
    },
    {
      id: 'half_career',
      name: 'Mitad de carrera',
      description: 'Completar el 50% de las materias',
      icon: '🏔️',
      unlocked: approvedPct >= 0.5,
      progress: Math.min(Math.round(approvedPct * 100), 100),
      progressMax: 100,
    },
    {
      id: 'almost_done',
      name: 'Casi egresado',
      description: 'Completar el 80% de la carrera',
      icon: '🎓',
      unlocked: approvedPct >= 0.8,
      progress: Math.min(Math.round(approvedPct * 100), 100),
      progressMax: 100,
    },
    {
      id: 'excellence',
      name: 'Excelencia académica',
      description: 'Mantener un promedio de 8 o más',
      icon: '🏆',
      unlocked: averageGrade != null && averageGrade >= 8,
    },
    {
      id: 'good_performance',
      name: 'Buen rendimiento',
      description: 'Promedio de 6 o más',
      icon: '👍',
      unlocked: averageGrade != null && averageGrade >= 6,
    },
    {
      id: 'streak_3',
      name: 'Ritmo constante',
      description: '3 cuatrimestres sin materias libres',
      icon: '🔥',
      unlocked: streak >= 3,
      progress: Math.min(streak, 3),
      progressMax: 3,
    },
    {
      id: 'streak_6',
      name: 'Imparable',
      description: '6 cuatrimestres sin materias libres',
      icon: '⚡',
      unlocked: streak >= 6,
      progress: Math.min(streak, 6),
      progressMax: 6,
    },
    {
      id: 'on_track',
      name: 'A tiempo',
      description: 'Estar al día con el ritmo esperado de la carrera',
      icon: '✅',
      unlocked: isOnTrack,
    },
    {
      id: 'subject_collector',
      name: 'Coleccionista',
      description: 'Tener 10 o más materias aprobadas',
      icon: '📚',
      unlocked: approvedSubjects >= 10,
      progress: Math.min(approvedSubjects, 10),
      progressMax: 10,
    },
    {
      id: 'credit_milestone',
      name: 'Créditos acumulados',
      description: 'Acumular 100 créditos',
      icon: '💎',
      unlocked: earnedCredits >= 100,
      progress: Math.min(Math.round(earnedCredits), 100),
      progressMax: 100,
    },
    {
      id: 'planner',
      name: 'Planificador',
      description: 'Crear un plan cuatrimestral',
      icon: '📋',
      unlocked: hasPlan === true,
    },
  ]

  return achievements
}

export function computeGamification(
  subjects: { state: string; credits: number; subjectName: string; semester: number | null; yearNumber: number }[],
  averageGrade: number | null,
  totalCredits: number,
  earnedCredits: number,
  totalSubjects: number,
  approvedSubjects: number,
  enabledSubjects: number,
  isOnTrack: boolean,
  hasPlan?: boolean
): GamificationState {
  const streak = computeStreak(subjects)
  const healthIndex = computeHealthIndex(subjects, averageGrade, totalCredits, earnedCredits, isOnTrack, streak)
  const achievements = computeAchievements(
    subjects, averageGrade, totalCredits, earnedCredits,
    totalSubjects, approvedSubjects, streak, isOnTrack, enabledSubjects, hasPlan
  )

  return { healthIndex, streak, achievements }
}
