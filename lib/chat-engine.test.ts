import { describe, it, expect } from 'vitest'
import { processChatMessage } from './chat-engine'
import type { ChatContext } from './chat-engine'
import type { SubjectResult } from './prerequisite-engine'

const mockSubjects: SubjectResult[] = [
  { subjectId: 'm1', subjectName: 'Análisis Matemático I', subjectCode: 'M101', yearNumber: 1, semester: 1, isAnnual: false, credits: 6, isFinalThesis: false, state: 'habilitada', grade: null, missingPrerequisites: [] },
  { subjectId: 'm2', subjectName: 'Análisis Matemático II', subjectCode: 'M102', yearNumber: 1, semester: 2, isAnnual: false, credits: 6, isFinalThesis: false, state: 'bloqueada', grade: null, missingPrerequisites: [{ requiredSubjectId: 'm1', requiredSubjectName: 'Análisis Matemático I', prerequisiteType: 'aprobada', currentStatus: 'sin_cursar' }] },
  { subjectId: 'a1', subjectName: 'Álgebra I', subjectCode: 'A101', yearNumber: 1, semester: 1, isAnnual: false, credits: 4, isFinalThesis: false, state: 'habilitada', grade: null, missingPrerequisites: [] },
  { subjectId: 'p1', subjectName: 'Física I', subjectCode: 'F101', yearNumber: 1, semester: 2, isAnnual: false, credits: 6, isFinalThesis: false, state: 'bloqueada', grade: null, missingPrerequisites: [{ requiredSubjectId: 'm1', requiredSubjectName: 'Análisis Matemático I', prerequisiteType: 'regular', currentStatus: 'sin_cursar' }] },
  { subjectId: 'pg1', subjectName: 'Programación', subjectCode: 'PG101', yearNumber: 2, semester: 1, isAnnual: false, credits: 8, isFinalThesis: false, state: 'aprobada', grade: 8, missingPrerequisites: [] },
  { subjectId: 'th1', subjectName: 'Tesis Final', subjectCode: 'TH001', yearNumber: 5, semester: null, isAnnual: true, credits: 10, isFinalThesis: true, state: 'bloqueada', grade: null, missingPrerequisites: [{ requiredSubjectId: 'pg1', requiredSubjectName: 'Programación', prerequisiteType: 'aprobada', currentStatus: 'aprobada' }, { requiredSubjectId: 'm2', requiredSubjectName: 'Análisis Matemático II', prerequisiteType: 'aprobada', currentStatus: 'sin_cursar' }] },
]

const mockContext: ChatContext = {
  subjects: mockSubjects,
  prerequisites: [
    { subjectId: 'm2', requiredSubjectId: 'm1', prerequisiteType: 'aprobada' },
    { subjectId: 'p1', requiredSubjectId: 'm1', prerequisiteType: 'regular' },
    { subjectId: 'pg1', requiredSubjectId: 'm2', prerequisiteType: 'aprobada' },
    { subjectId: 'pg1', requiredSubjectId: 'a1', prerequisiteType: 'regular' },
    { subjectId: 'th1', requiredSubjectId: 'pg1', prerequisiteType: 'aprobada' },
    { subjectId: 'th1', requiredSubjectId: 'm2', prerequisiteType: 'aprobada' },
  ],
  userProgress: [{ subjectId: 'pg1', status: 'aprobada', grade: 8 }],
  averageGrade: 8,
  careerTotalYears: 5,
}

describe('processChatMessage', () => {
  it('greets on hola', () => {
    const res = processChatMessage('hola', mockContext)
    expect(res.text).toContain('Hola')
    expect(res.suggestions).toHaveLength(4)
  })

  it('greets on buenas', () => {
    const res = processChatMessage('buenas', mockContext)
    expect(res.text).toContain('Hola')
  })

  it('thanks response', () => {
    const res = processChatMessage('gracias', mockContext)
    expect(res.text).toContain('De nada')
  })

  it('identifies itself', () => {
    const res = processChatMessage('quién sos', mockContext)
    expect(res.text).toContain('Copiloto académico')
  })

  it('returns help', () => {
    const res = processChatMessage('ayuda', mockContext)
    expect(res.text).toContain('Copiloto académico')
    expect(res.text).toContain('puedo ayudarte')
  })

  it('returns help on qué podés', () => {
    const res = processChatMessage('qué podés hacer', mockContext)
    expect(res.text).toContain('puedo ayudarte')
  })

  it('returns GPA info', () => {
    const res = processChatMessage('cuál es mi promedio', mockContext)
    expect(res.text).toContain('promedio general')
    expect(res.text).toContain('8')
  })

  it('returns progress summary', () => {
    const res = processChatMessage('cómo voy', mockContext)
    expect(res.text).toContain('Resumen académico')
    expect(res.text).toContain('aprobadas')
  })

  it('returns graduation projection', () => {
    const res = processChatMessage('cuándo me egreso', mockContext)
    expect(res.text).toContain('Proyección de egreso')
  })

  it('lists available subjects', () => {
    const res = processChatMessage('qué puedo cursar', mockContext)
    expect(res.text).toContain('Podés cursar')
    expect(res.text).toContain('Análisis Matemático I')
  })

  it('lists blocked subjects', () => {
    const res = processChatMessage('materias bloqueadas', mockContext)
    expect(res.text).toContain('materias bloqueadas')
    expect(res.text).toContain('Análisis Matemático II')
  })

  it('recommends subjects', () => {
    const res = processChatMessage('recomendame', mockContext)
    expect(res.text).toContain('Materias con mayor impacto')
  })

  it('shows prereqs for a specific subject', () => {
    const res = processChatMessage('qué necesito para análisis matemático ii', mockContext)
    expect(res.text).toContain('Requisitos para')
    expect(res.text).toContain('Análisis Matemático I')
  })

  it('simulates what-if approval', () => {
    const res = processChatMessage('qué pasa si apruebo análisis matemático i', mockContext)
    expect(res.text).toContain('Si aprobás')
    expect(res.text).toContain('Análisis Matemático I')
  })

  it('shows in-progress subjects', () => {
    const res = processChatMessage('qué estoy cursando', mockContext)
    expect(res.text).toContain('No tenés materias')
  })

  it('shows regular subjects', () => {
    const res = processChatMessage('qué tengo regular', mockContext)
    expect(res.text).toContain('No tenés materias regulares')
  })

  it('answers sentiment - voy bien', () => {
    const res = processChatMessage('voy bien', mockContext)
    expect(res.text).toContain('Vas')
  })

  it('shows credit weight info', () => {
    const res = processChatMessage('materias con más créditos', mockContext)
    expect(res.text).toContain('Materias con más créditos')
  })

  it('shows total subject count', () => {
    const res = processChatMessage('cuántas materias tiene la carrera', mockContext)
    expect(res.text).toContain('6 materias')
  })

  it('finds a subject by name', () => {
    const res = processChatMessage('programación', mockContext)
    expect(res.text).toContain('Programación')
    expect(res.text).toContain('PG101')
  })

  it('returns fallback for unrecognized input', () => {
    const res = processChatMessage('xyzzy flurbo garblex', mockContext)
    expect(res.text).toContain('No entendí')
  })

  it('handles empty message', () => {
    const res = processChatMessage('', mockContext)
    expect(res.text).toContain('Hola')
  })

  it('does not crash on broken context', () => {
    const brokenCtx = { ...mockContext, subjects: [], prerequisites: [], userProgress: [] }
    const res = processChatMessage('¿Qué puedo cursar?', brokenCtx)
    expect(res.text).toBeTruthy()
  })

  it('does not crash on null grade in progress', () => {
    const nullGradeCtx = { ...mockContext, userProgress: [{ subjectId: 'pg1', status: 'aprobada', grade: null }] }
    const res = processChatMessage('¿Cómo voy?', nullGradeCtx)
    expect(res.text).toBeTruthy()
  })

  it('handles graduation projection with no progress', () => {
    const emptyCtx = { ...mockContext, subjects: mockSubjects, prerequisites: mockContext.prerequisites, userProgress: [], averageGrade: null, careerTotalYears: 5 }
    const res = processChatMessage('¿Cuándo me egreso?', emptyCtx)
    expect(res.text).toContain('materias')
  })
})
