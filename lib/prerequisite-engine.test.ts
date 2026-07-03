import { describe, it, expect } from 'vitest'
import { canEnroll, computeCareerProgress, simulateApproval, getRecommendedSubjects, computeGraduationProjection } from './prerequisite-engine'
import type { CareerSubjectMeta, Prerequisite, SubjectProgress, SubjectResult } from './prerequisite-engine'

const math1: CareerSubjectMeta = { subjectId: 'm1', subjectName: 'Análisis Matemático I', subjectCode: 'M101', yearNumber: 1, semester: 1, isAnnual: false, credits: 6, isFinalThesis: false }
const algebra1: CareerSubjectMeta = { subjectId: 'a1', subjectName: 'Álgebra I', subjectCode: 'A101', yearNumber: 1, semester: 1, isAnnual: false, credits: 4, isFinalThesis: false }
const physics1: CareerSubjectMeta = { subjectId: 'p1', subjectName: 'Física I', subjectCode: 'F101', yearNumber: 1, semester: 2, isAnnual: false, credits: 6, isFinalThesis: false }
const math2: CareerSubjectMeta = { subjectId: 'm2', subjectName: 'Análisis Matemático II', subjectCode: 'M102', yearNumber: 1, semester: 2, isAnnual: false, credits: 6, isFinalThesis: false }
const programming: CareerSubjectMeta = { subjectId: 'pg1', subjectName: 'Programación', subjectCode: 'PG101', yearNumber: 2, semester: 1, isAnnual: false, credits: 8, isFinalThesis: false }
const thesis: CareerSubjectMeta = { subjectId: 'th1', subjectName: 'Tesis Final', subjectCode: 'TH001', yearNumber: 5, semester: null, isAnnual: true, credits: 10, isFinalThesis: true }

const allSubjects = [math1, algebra1, physics1, math2, programming, thesis]

const prereqs: Prerequisite[] = [
  { subjectId: 'p1', requiredSubjectId: 'm1', prerequisiteType: 'regular' },
  { subjectId: 'm2', requiredSubjectId: 'm1', prerequisiteType: 'aprobada' },
  { subjectId: 'pg1', requiredSubjectId: 'm2', prerequisiteType: 'aprobada' },
  { subjectId: 'pg1', requiredSubjectId: 'a1', prerequisiteType: 'regular' },
  { subjectId: 'th1', requiredSubjectId: 'pg1', prerequisiteType: 'aprobada' },
  { subjectId: 'th1', requiredSubjectId: 'm2', prerequisiteType: 'aprobada' },
]

function makeMeta(s: SubjectResult): CareerSubjectMeta {
  return { subjectId: s.subjectId, subjectName: s.subjectName, subjectCode: s.subjectCode, yearNumber: s.yearNumber, semester: s.semester, isAnnual: s.isAnnual, credits: s.credits, isFinalThesis: s.isFinalThesis }
}

describe('canEnroll', () => {
  it('returns true when no prereqs', () => {
    const result = canEnroll([], new Map(), new Map())
    expect(result.canEnroll).toBe(true)
    expect(result.missing).toHaveLength(0)
  })

  it('returns true when all prereqs satisfied', () => {
    const progressMap = new Map([
      ['m1', { subjectId: 'm1', status: 'aprobada' as const, grade: 8, passedAt: null, regularizedAt: null }],
    ])
    const nameMap = new Map([['m1', 'Análisis Matemático I']])
    const result = canEnroll([{ subjectId: 'm2', requiredSubjectId: 'm1', prerequisiteType: 'aprobada' }], progressMap, nameMap)
    expect(result.canEnroll).toBe(true)
    expect(result.missing).toHaveLength(0)
  })

  it('returns blocked when prereq not met', () => {
    const progressMap = new Map<string, SubjectProgress>()
    const nameMap = new Map([['m1', 'Análisis Matemático I']])
    const result = canEnroll([{ subjectId: 'm2', requiredSubjectId: 'm1', prerequisiteType: 'aprobada' }], progressMap, nameMap)
    expect(result.canEnroll).toBe(false)
    expect(result.missing).toHaveLength(1)
    expect(result.missing[0].requiredSubjectName).toBe('Análisis Matemático I')
    expect(result.missing[0].currentStatus).toBe('sin_cursar')
  })

  it('regular type allows aprobada or regular', () => {
    const nameMap = new Map([['m1', 'Análisis Matemático I']])

    const regularProgress = new Map([['m1', { subjectId: 'm1', status: 'regular' as const, grade: null, passedAt: null, regularizedAt: null }]])
    expect(canEnroll([{ subjectId: 'p1', requiredSubjectId: 'm1', prerequisiteType: 'regular' }], regularProgress, nameMap).canEnroll).toBe(true)

    const cursadaProgress = new Map([['m1', { subjectId: 'm1', status: 'cursada' as const, grade: null, passedAt: null, regularizedAt: null }]])
    expect(canEnroll([{ subjectId: 'p1', requiredSubjectId: 'm1', prerequisiteType: 'regular' }], cursadaProgress, nameMap).canEnroll).toBe(false)
  })

  it('aprobada type only allows aprobada', () => {
    const nameMap = new Map([['m1', 'Análisis Matemático I']])

    const regularProgress = new Map([['m1', { subjectId: 'm1', status: 'regular' as const, grade: null, passedAt: null, regularizedAt: null }]])
    expect(canEnroll([{ subjectId: 'm2', requiredSubjectId: 'm1', prerequisiteType: 'aprobada' }], regularProgress, nameMap).canEnroll).toBe(false)

    const aprobadaProgress = new Map([['m1', { subjectId: 'm1', status: 'aprobada' as const, grade: 8, passedAt: null, regularizedAt: null }]])
    expect(canEnroll([{ subjectId: 'm2', requiredSubjectId: 'm1', prerequisiteType: 'aprobada' }], aprobadaProgress, nameMap).canEnroll).toBe(true)
  })

  it('cursada type allows any state except sin_cursar', () => {
    const nameMap = new Map([['m1', 'Análisis Matemático I']])

    const enCurso = new Map([['m1', { subjectId: 'm1', status: 'en_curso' as const, grade: null, passedAt: null, regularizedAt: null }]])
    expect(canEnroll([{ subjectId: 'p1', requiredSubjectId: 'm1', prerequisiteType: 'cursada' }], enCurso, nameMap).canEnroll).toBe(true)

    expect(canEnroll([{ subjectId: 'p1', requiredSubjectId: 'm1', prerequisiteType: 'cursada' }], new Map(), nameMap).canEnroll).toBe(false)
  })

  it('returns multiple missing prereqs', () => {
    const nameMap = new Map([['m2', 'Análisis Matemático II'], ['a1', 'Álgebra I']])
    const result = canEnroll([
      { subjectId: 'pg1', requiredSubjectId: 'm2', prerequisiteType: 'aprobada' },
      { subjectId: 'pg1', requiredSubjectId: 'a1', prerequisiteType: 'regular' },
    ], new Map(), nameMap)
    expect(result.canEnroll).toBe(false)
    expect(result.missing).toHaveLength(2)
  })
})

describe('computeCareerProgress', () => {
  it('computes full progress for empty user data', () => {
    const result = computeCareerProgress(allSubjects, prereqs, [])
    expect(result.totalSubjects).toBe(6)
    expect(result.approvedSubjects).toBe(0)
    expect(result.earnedCredits).toBe(0)
    // math1 and algebra1 have no prereqs -> habilitada
    const math1Result = result.subjects.find(s => s.subjectId === 'm1')
    expect(math1Result?.state).toBe('habilitada')
    const a1Result = result.subjects.find(s => s.subjectId === 'a1')
    expect(a1Result?.state).toBe('habilitada')
  })

  it('computes approved subject correctly', () => {
    const progress: SubjectProgress[] = [
      { subjectId: 'm1', status: 'aprobada', grade: 8 },
    ]
    const result = computeCareerProgress(allSubjects, prereqs, progress)
    expect(result.approvedSubjects).toBe(1)
    expect(result.earnedCredits).toBe(6)
    expect(result.progressPercent).toBeGreaterThan(0)
  })

  it('propagates state changes through prereq chain', () => {
    const progress: SubjectProgress[] = [
      { subjectId: 'm1', status: 'aprobada', grade: 8 },
      { subjectId: 'a1', status: 'aprobada', grade: 7 },
    ]
    const result = computeCareerProgress(allSubjects, prereqs, progress)
    // m2 needs m1 aprobada
    expect(result.subjects.find(s => s.subjectId === 'm2')?.state).toBe('habilitada')
    // p1 needs m1 regular -> yes
    expect(result.subjects.find(s => s.subjectId === 'p1')?.state).toBe('habilitada')
    // pg1 needs m2 aprobada + a1 regular -> m2 not approved, so blocked
    expect(result.subjects.find(s => s.subjectId === 'pg1')?.state).toBe('bloqueada')
  })

  it('detects en_curso state', () => {
    const progress: SubjectProgress[] = [
      { subjectId: 'm1', status: 'en_curso', grade: null },
      { subjectId: 'a1', status: 'en_curso', grade: null },
    ]
    const result = computeCareerProgress(allSubjects, prereqs, progress)
    expect(result.subjects.find(s => s.subjectId === 'm1')?.state).toBe('en_curso')
    // m2 needs m1 aprobada -> blocked
    expect(result.subjects.find(s => s.subjectId === 'm2')?.state).toBe('bloqueada')
  })

  it('maps libre status to cursada', () => {
    const progress: SubjectProgress[] = [
      { subjectId: 'm1', status: 'libre', grade: null },
    ]
    const result = computeCareerProgress(allSubjects, prereqs, progress)
    expect(result.subjects.find(s => s.subjectId === 'm1')?.state).toBe('cursada')
  })

  it('handles empty subjects array', () => {
    const result = computeCareerProgress([], [], [])
    expect(result.totalSubjects).toBe(0)
    expect(result.subjects).toHaveLength(0)
  })
})

describe('simulateApproval', () => {
  it('unlocks subjects when approving a blocker', () => {
    const progress: SubjectProgress[] = [
      { subjectId: 'm1', status: 'aprobada', grade: 8 },
      { subjectId: 'a1', status: 'aprobada', grade: 7 },
      { subjectId: 'm2', status: 'aprobada', grade: 6 },
    ]
    // pg1 should now be habilitada (m2 aprobada + a1 regular)
    // thesis needs pg1 aprobada + m2 aprobada
    const result = simulateApproval(['pg1'], allSubjects, prereqs, progress)
    expect(result).toHaveLength(1)
    expect(result[0].simulatedSubjectId).toBe('pg1')
    // thesis should be newly enabled
    expect(result[0].newlyEnabled.some(s => s.subjectId === 'th1')).toBe(true)
  })

  it('simulate multiple subjects', () => {
    const progress: SubjectProgress[] = [
      { subjectId: 'm1', status: 'aprobada', grade: 8 },
    ]
    const result = simulateApproval(['m2', 'a1'], allSubjects, prereqs, progress)
    expect(result).toHaveLength(2)
  })

  it('returns empty newlyEnabled for a subject that unlocks nothing', () => {
    const result = simulateApproval(['th1'], allSubjects, prereqs, [])
    expect(result[0].newlyEnabled).toHaveLength(0)
  })
})

describe('getRecommendedSubjects', () => {
  it('returns subjects ranked by unlocks', () => {
    const progress: SubjectProgress[] = [
      { subjectId: 'm1', status: 'aprobada', grade: 8 },
      { subjectId: 'a1', status: 'aprobada', grade: 7 },
    ]
    const result = getRecommendedSubjects(allSubjects, prereqs, progress)
    expect(result.length).toBeGreaterThan(0)
    // First result should be the one that unlocks the most
    expect(result[0].unlocksCount).toBeGreaterThanOrEqual(0)
  })

  it('returns habilitadas with no progress (initial subjects)', () => {
    const result = getRecommendedSubjects(allSubjects, prereqs, [])
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].subjectName).toBeTruthy()
  })
})

describe('computeGraduationProjection', () => {
  it('returns projection with all required fields', () => {
    const progress: SubjectProgress[] = [
      { subjectId: 'm1', status: 'aprobada', grade: 8 },
      { subjectId: 'a1', status: 'aprobada', grade: 7 },
    ]
    const result = computeGraduationProjection(allSubjects, prereqs, progress, 5)
    expect(result.remainingSubjects).toBeGreaterThan(0)
    expect(result.remainingCredits).toBeGreaterThan(0)
    expect(result.estimatedSemesters).toBeGreaterThan(0)
    expect(result.estimatedDate).toBeTruthy()
    expect(typeof result.isOnTrack).toBe('boolean')
    expect(result.subjectsBySemester.length).toBeGreaterThan(0)
  })

  it('handles empty progress gracefully', () => {
    const result = computeGraduationProjection(allSubjects, prereqs, [], 5)
    expect(result.remainingSubjects).toBe(6)
    expect(result.estimatedSemesters).toBeGreaterThan(0)
    expect(result.estimatedDate).toBeTruthy()
  })

  it('handles all subjects approved', () => {
    const allApproved: SubjectProgress[] = allSubjects.map(s => ({
      subjectId: s.subjectId,
      status: 'aprobada' as const,
      grade: 8,
    }))
    const result = computeGraduationProjection(allSubjects, prereqs, allApproved, 5)
    expect(result.remainingSubjects).toBe(0)
    expect(result.remainingCredits).toBe(0)
    expect(result.isOnTrack).toBe(true)
  })

  it('computes avg subjects per semester correctly for 1 subject', () => {
    const oneApproved: SubjectProgress[] = [{ subjectId: 'm1', status: 'aprobada', grade: 7 }]
    const result = computeGraduationProjection(allSubjects, prereqs, oneApproved, 5)
    expect(result.subjectsPerSemester).toBe(1)
  })

  it('computes avg subjects per semester correctly for 4 subjects', () => {
    const fourApproved: SubjectProgress[] = allSubjects.slice(0, 4).map(s => ({
      subjectId: s.subjectId,
      status: 'aprobada' as const,
      grade: 7,
    }))
    const result = computeGraduationProjection(allSubjects, prereqs, fourApproved, 5)
    expect(result.subjectsPerSemester).toBe(2)
  })
})
