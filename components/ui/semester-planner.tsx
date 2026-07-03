'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import type { SubjectResult, Prerequisite } from '@/lib/prerequisite-engine'

interface SemesterPlannerProps {
  subjects: SubjectResult[]
  prerequisites: Prerequisite[]
}

type PlannedSlot = {
  year: number
  semester: 1 | 2
  subjectIds: string[]
}

function getCurrentSemester(): { year: number; semester: 1 | 2 } {
  const now = new Date()
  return { year: now.getFullYear(), semester: now.getMonth() < 7 ? 1 : 2 }
}

function semesterLabel(year: number, semester: 1 | 2) {
  return `${semester === 1 ? '1er' : '2do'} cuatrimestre ${year}`
}

const MAX_CREDITS = 30
const MAX_SUBJECTS = 6

const STATE_COLORS: Record<string, string> = {
  aprobada: 'var(--success)', regular: 'var(--info)', habilitada: 'var(--accent)',
  cursada: '#eab308', en_curso: '#8b5cf6', bloqueada: 'var(--border)',
}

export function SemesterPlanner({ subjects, prerequisites }: SemesterPlannerProps) {
  const { year: currentYear, semester: currentSem } = getCurrentSemester()
  const storageKey = useMemo(() => `trayectai_plan_${subjects.length}`, [subjects.length])

  const [slots, setSlots] = useState<PlannedSlot[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) return JSON.parse(saved)
    } catch {}
    return Array.from({ length: 4 }, (_, i) => {
      const semCount = Math.floor((currentSem + i - 1) % 2) + 1 as 1 | 2
      const yr = currentYear + Math.floor((currentSem + i - 1) / 2)
      return { year: yr, semester: semCount, subjectIds: [] }
    })
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(slots))
  }, [slots, storageKey])

  const subjectMap = useMemo(() => {
    const m = new Map<string, SubjectResult>()
    for (const s of subjects) m.set(s.subjectId, s)
    return m
  }, [subjects])

  const assignedIds = useMemo(() => new Set(slots.flatMap(s => s.subjectIds)), [slots])

  const availableSubjects = useMemo(() =>
    subjects.filter(s =>
      (s.state === 'habilitada' || s.state === 'en_curso') &&
      !assignedIds.has(s.subjectId)
    ),
    [subjects, assignedIds]
  )

  const prereqOf = useMemo(() => {
    const idx = new Map<string, string[]>()
    for (const p of prerequisites) {
      if (!idx.has(p.requiredSubjectId)) idx.set(p.requiredSubjectId, [])
      idx.get(p.requiredSubjectId)!.push(p.subjectId)
    }
    return idx
  }, [prerequisites])

  const prereqFor = useMemo(() => {
    const idx = new Map<string, string[]>()
    for (const p of prerequisites) {
      if (!idx.has(p.subjectId)) idx.set(p.subjectId, [])
      idx.get(p.subjectId)!.push(p.requiredSubjectId)
    }
    return idx
  }, [prerequisites])

  function addToSlot(slotIndex: number, subjectId: string) {
    setSlots(prev => {
      const next = prev.map(s => ({ ...s, subjectIds: [...s.subjectIds] }))
      next[slotIndex].subjectIds.push(subjectId)
      return next
    })
  }

  function removeFromSlot(slotIndex: number, subjectId: string) {
    setSlots(prev => {
      const next = prev.map(s => ({ ...s, subjectIds: s.subjectIds.filter(id => id !== subjectId) }))
      return next
    })
  }

  function resetPlan() {
    setSlots(Array.from({ length: 4 }, (_, i) => {
      const semCount = Math.floor((currentSem + i - 1) % 2) + 1 as 1 | 2
      const yr = currentYear + Math.floor((currentSem + i - 1) / 2)
      return { year: yr, semester: semCount, subjectIds: [] }
    }))
  }

  function getWarnings(slotIndex: number): string[] {
    const slot = slots[slotIndex]
    if (slot.subjectIds.length === 0) return []
    const warnings: string[] = []
    let totalCredits = 0
    for (const id of slot.subjectIds) {
      const s = subjectMap.get(id)
      if (s) totalCredits += s.credits
    }
    if (totalCredits > MAX_CREDITS) {
      warnings.push(`⚠️ ${totalCredits} créditos excede el máximo recomendado (${MAX_CREDITS})`)
    }
    if (slot.subjectIds.length > MAX_SUBJECTS) {
      warnings.push(`⚠️ ${slot.subjectIds.length} materias puede ser mucho para un cuatrimestre`)
    }
    for (const id of slot.subjectIds) {
      const needed = prereqFor.get(id)
      if (needed) {
        for (const reqId of needed) {
          const reqSubject = subjectMap.get(reqId)
          if (!reqSubject) continue
          if (reqSubject.state !== 'aprobada' && reqSubject.state !== 'regular') {
            const reqAssignedTo = slots.findIndex(s => s.subjectIds.includes(reqId))
            if (reqAssignedTo === -1) {
              warnings.push(`❌ ${subjectMap.get(id)?.subjectName ?? id} necesita "${reqSubject.subjectName}" que no está en el plan`)
            } else if (reqAssignedTo >= slotIndex) {
              warnings.push(`⚠️ ${subjectMap.get(id)?.subjectName ?? id} necesita "${reqSubject.subjectName}" que está en el mismo o posterior cuatrimestre`)
            }
          }
        }
      }
    }
    return warnings
  }

  function getSceneWarnings(scene: PlannedSlot[]): string[] {
    const warnings: string[] = []
    for (let i = 0; i < scene.length; i++) {
      const slot = scene[i]
      if (slot.subjectIds.length === 0) continue
      let totalCredits = 0
      for (const id of slot.subjectIds) {
        const s = subjectMap.get(id)
        if (s) totalCredits += s.credits
      }
      if (totalCredits > MAX_CREDITS) {
        warnings.push(`${semesterLabel(slot.year, slot.semester)}: ${totalCredits} créditos (máx ${MAX_CREDITS})`)
      }
      for (const id of slot.subjectIds) {
        const needed = prereqFor.get(id)
        if (!needed) continue
        for (const reqId of needed) {
          const reqSubject = subjectMap.get(reqId)
          if (!reqSubject || reqSubject.state === 'aprobada' || reqSubject.state === 'regular') continue
          const reqAssignedTo = scene.findIndex(s => s.subjectIds.includes(reqId))
          if (reqAssignedTo === -1) {
            warnings.push(`${subjectMap.get(id)?.subjectName ?? id}: falta "${reqSubject.subjectName}"`)
          } else if (reqAssignedTo >= i) {
            warnings.push(`${subjectMap.get(id)?.subjectName ?? id}: "${reqSubject.subjectName}" está en el mismo o posterior cuatrimestre`)
          }
        }
      }
    }
    return warnings
  }

  function getUnlocks(subjectId: string): SubjectResult[] {
    return subjects.filter(s => {
      const needed = prereqFor.get(s.subjectId)
      return needed?.includes(subjectId) ?? false
    })
  }

  const totalCreditsPlanned = useMemo(() => {
    let total = 0
    for (const slot of slots) {
      for (const id of slot.subjectIds) {
        const s = subjectMap.get(id)
        if (s) total += s.credits
      }
    }
    return total
  }, [slots, subjectMap])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)', marginBottom: 'var(--gap-md)' }}>
        <span style={{ fontSize: 20 }}>📋</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
            Planificador cuatrimestral
          </p>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            {assignedIds.size} materias planeadas · {totalCreditsPlanned} créditos
          </p>
        </div>
        <button
          onClick={resetPlan}
          style={{
            background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)',
            borderRadius: 999, padding: '8px 14px', fontSize: 'var(--font-xs)', cursor: 'pointer', minHeight: 44,
          }}
        >
          🔄 Restablecer
        </button>
      </div>

      <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', marginBottom: 'var(--gap-md)' }}>
        <p style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--accent)', margin: '0 0 8px' }}>
          🎯 Materias disponibles ({availableSubjects.length})
        </p>
        {availableSubjects.length === 0 ? (
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: 0 }}>
            {assignedIds.size > 0 ? 'Todas las materias disponibles están asignadas.' : 'No hay materias habilitadas para planificar.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {availableSubjects.map(s => (
              <button
                key={s.subjectId}
                onClick={() => {
                  const firstEmpty = slots.findIndex(sl => sl.subjectIds.length < MAX_SUBJECTS)
                  if (firstEmpty >= 0) addToSlot(firstEmpty, s.subjectId)
                }}
                style={{
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                  color: 'var(--accent)', borderRadius: 999, padding: '6px 12px', minHeight: 36,
                  fontSize: 'var(--font-xs)', cursor: 'pointer', fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                + {s.subjectName} ({s.credits} cr)
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
        {slots.map((slot, i) => {
          const creditTotal = slot.subjectIds.reduce((sum, id) => sum + (subjectMap.get(id)?.credits ?? 0), 0)
          const warnings = getWarnings(i)
          const overCredit = creditTotal > MAX_CREDITS
          const overSubjects = slot.subjectIds.length > MAX_SUBJECTS

          return (
            <div
              key={`${slot.year}-${slot.semester}`}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--card-radius)', overflow: 'hidden',
                opacity: slot.subjectIds.length === 0 ? 0.6 : 1,
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--gap-md)',
                padding: 'var(--card-pad)', borderBottom: slot.subjectIds.length > 0 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{ fontSize: slot.semester === 1 ? '🌱' : '☀️' }}/>
                <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text)', flex: 1 }}>
                  {semesterLabel(slot.year, slot.semester)}
                </span>
                <span style={{
                  fontSize: 'var(--font-xs)', fontWeight: 700,
                  color: overCredit ? 'var(--danger)' : 'var(--success)',
                }}>
                  {creditTotal} créditos
                </span>
                {overSubjects && (
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--accent)', fontWeight: 600 }}>
                    {slot.subjectIds.length} materias
                  </span>
                )}
              </div>

              {slot.subjectIds.length > 0 ? (
                <div style={{ padding: 'var(--card-pad)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {slot.subjectIds.map(id => {
                      const s = subjectMap.get(id)
                      if (!s) return null
                      const needsPrereq = prereqFor.get(id)
                      const missing = needsPrereq?.filter(reqId => {
                        const req = subjectMap.get(reqId)
                        return req && req.state !== 'aprobada' && req.state !== 'regular' && !assignedIds.has(reqId)
                      })
                      return (
                        <div
                          key={id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 'var(--gap-md)',
                            padding: '8px 10px', borderRadius: 10,
                            background: 'var(--bg-subject)', border: '1px solid var(--border)',
                          }}
                        >
                          <div style={{ width: 4, height: 28, borderRadius: 999, background: STATE_COLORS[s.state] ?? 'var(--border)', flexShrink: 0 }}/>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 'var(--font-xs)', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.subjectName}
                            </div>
                            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 1 }}>
                              {s.subjectCode} · {s.credits} cr
                              {missing && missing.length > 0 && (
                                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                                  {' · ❌ Falta correlativa'}
                                </span>
                              )}
                            </div>
                          </div>
                          {(() => {
                            const unlocks = getUnlocks(id)
                            return unlocks.length > 0 && (
                              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--success)', fontWeight: 600, textAlign: 'right', flexShrink: 0 }}>
                                🔓 {unlocks.length}
                              </div>
                            )
                          })()}
                          <button
                            onClick={() => removeFromSlot(i, id)}
                            aria-label={`Quitar ${s.subjectName}`}
                            style={{
                              background: 'none', border: 'none', color: 'var(--text-muted)',
                              fontSize: 14, cursor: 'pointer', padding: '8px 10px', flexShrink: 0,
                              lineHeight: 1, minHeight: 36, borderRadius: 6,
                              transition: 'color 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)' }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                          >
                            ✕
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ padding: 'var(--card-pad)', textAlign: 'center' }}>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: 0 }}>
                    No hay materias asignadas
                  </p>
                </div>
              )}

              <div style={{ padding: '0 var(--card-pad) var(--card-pad)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {availableSubjects.slice(0, 8).map(s => (
                    <button
                      key={s.subjectId}
                      onClick={() => {
                        if (slot.subjectIds.length < MAX_SUBJECTS) addToSlot(i, s.subjectId)
                      }}
                      style={{
                        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)',
                        color: 'var(--accent)', borderRadius: 999, padding: '4px 10px',
                        fontSize: 'var(--font-xs)', cursor: 'pointer', fontWeight: 500, minHeight: 32,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      + {s.subjectName}
                    </button>
                  ))}
                </div>
              </div>

              {warnings.length > 0 && (
                <div style={{ padding: '0 var(--card-pad) var(--card-pad)' }}>
                  {warnings.map((w, j) => (
                    <div key={j} style={{ fontSize: 'var(--font-xs)', color: 'var(--danger)', marginTop: 4 }}>{w}</div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {assignedIds.size > 0 && (() => {
        const sceneWarnings = getSceneWarnings(slots)
        return sceneWarnings.length > 0 ? (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', marginTop: 'var(--gap-md)',
          }}>
            <p style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--danger)', margin: '0 0 6px' }}>
              ⚠️ Problemas detectados en el plan
            </p>
            {sceneWarnings.map((w, i) => (
              <p key={i} style={{ fontSize: 'var(--font-xs)', color: 'var(--text)', margin: '2px 0' }}>{w}</p>
            ))}
          </div>
        ) : (
          <div style={{
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', marginTop: 'var(--gap-md)',
          }}>
            <p style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--success)', margin: 0 }}>
              ✅ No se detectaron problemas en tu plan
            </p>
          </div>
        )
      })()}
    </div>
  )
}
