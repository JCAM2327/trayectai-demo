'use client'

import { useMemo, useRef, useLayoutEffect, useState } from 'react'
import { stateLabel } from '@/lib/prerequisite-engine'
import type { SubjectResult, Prerequisite } from '@/lib/prerequisite-engine'

interface SubjectGraphProps {
  subjects: SubjectResult[]
  prerequisites: Prerequisite[]
  selectedSubjectId: string | null
  onSubjectSelect: (subjectId: string | null) => void
}

type Edge = {
  fromX: number; fromY: number
  toX: number; toY: number
  fromId: string
  toId: string
}

const STATE_COLORS: Record<string, { bar: string; label: string }> = {
  aprobada:   { bar: 'var(--success)', label: 'Aprobada' },
  regular:    { bar: 'var(--info)', label: 'Regular' },
  habilitada: { bar: 'var(--accent)', label: 'Podés cursar' },
  cursada:    { bar: 'var(--cursada)', label: 'Cursada' },
  en_curso:   { bar: 'var(--en-curso)', label: 'En curso' },
  bloqueada:  { bar: 'var(--border)', label: 'Bloqueada' },
}

const YEAR_LABELS: Record<number, string> = {
  1: '1er Año', 2: '2do Año', 3: '3er Año', 4: '4to Año', 5: '5to Año',
}

export function SubjectGraph({ subjects, prerequisites, selectedSubjectId, onSubjectSelect }: SubjectGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState<Edge[]>([])
  const subjectIds = useMemo(() => new Set(subjects.map(s => s.subjectId)), [subjects])

  const grouped = useMemo(() => {
    const years = new Map<number, Map<number, SubjectResult[]>>()
    for (const s of subjects) {
      if (!years.has(s.yearNumber)) years.set(s.yearNumber, new Map())
      const sem = s.semester ?? 0
      if (!years.get(s.yearNumber)!.has(sem)) years.get(s.yearNumber)!.set(sem, [])
      years.get(s.yearNumber)!.get(sem)!.push(s)
    }
    for (const [, semMap] of years) {
      for (const [, list] of semMap) {
        list.sort((a, b) => a.subjectName.localeCompare(b.subjectName))
      }
    }
    return years
  }, [subjects])

  const unlockIndex = useMemo(() => {
    const idx = new Map<string, SubjectResult[]>()
    for (const s of subjects) {
      const direct = prerequisites
        .filter(p => p.subjectId === s.subjectId && subjectIds.has(p.requiredSubjectId))
      for (const p of direct) {
        if (!idx.has(p.requiredSubjectId)) idx.set(p.requiredSubjectId, [])
        idx.get(p.requiredSubjectId)!.push(s)
      }
    }
    return idx
  }, [subjects, prerequisites, subjectIds])

  const unlockedIds = useMemo(() => {
    if (!selectedSubjectId) return new Set<string>()
    const result = new Set<string>()
    const visit = (id: string) => {
      const unlocked = unlockIndex.get(id)
      if (!unlocked) return
      for (const s of unlocked) {
        if (!result.has(s.subjectId)) {
          result.add(s.subjectId)
          visit(s.subjectId)
        }
      }
    }
    visit(selectedSubjectId)
    return result
  }, [selectedSubjectId, unlockIndex])

  const prereqIds = useMemo(() => {
    if (!selectedSubjectId) return new Set<string>()
    return new Set(
      prerequisites
        .filter(p => p.subjectId === selectedSubjectId && subjectIds.has(p.requiredSubjectId))
        .map(p => p.requiredSubjectId)
    )
  }, [selectedSubjectId, prerequisites, subjectIds])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    function measure() {
      if (!container) return
      const cRect = container.getBoundingClientRect()
      const cardMap = new Map<string, { left: number; top: number; right: number; bottom: number }>()

      container.querySelectorAll<HTMLDivElement>('[data-subject-id]').forEach(el => {
        const id = el.dataset.subjectId!
        const r = el.getBoundingClientRect()
        cardMap.set(id, {
          left: r.left - cRect.left,
          top: r.top - cRect.top,
          right: r.right - cRect.left,
          bottom: r.bottom - cRect.top,
        })
      })

      const result: Edge[] = []
      for (const p of prerequisites) {
        const fromRect = cardMap.get(p.requiredSubjectId)
        const toRect = cardMap.get(p.subjectId)
        if (!fromRect || !toRect) continue
        result.push({
          fromX: fromRect.right,
          fromY: fromRect.top + (fromRect.bottom - fromRect.top) / 2,
          toX: toRect.left,
          toY: toRect.top + (toRect.bottom - toRect.top) / 2,
          fromId: p.requiredSubjectId,
          toId: p.subjectId,
        })
      }
      setEdges(result)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(container)
    return () => ro.disconnect()
  }, [subjects, prerequisites])

  function isHighlighted(fromId: string, toId: string) {
    if (!selectedSubjectId) return false
    return (
      prereqIds.has(fromId) ||
      unlockedIds.has(toId) ||
      fromId === selectedSubjectId ||
      toId === selectedSubjectId ||
      (unlockedIds.has(fromId) && subjectIds.has(toId))
    )
  }

  const years = Array.from(grouped.keys()).sort()

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <svg
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 1, display: edges.length === 0 ? 'none' : undefined,
        }}
      >
        {edges.map((edge, i) => {
          const hl = isHighlighted(edge.fromId, edge.toId)
          const isFromSelected = selectedSubjectId !== null && prereqIds.has(edge.fromId)
          const isToSelected = unlockedIds.has(edge.toId)
          const isDirect = edge.fromId === selectedSubjectId || edge.toId === selectedSubjectId
          const active = hl || isDirect
          const dx = Math.abs(edge.toX - edge.fromX)

          return (
              <path
                  key={i}
                  d={`M ${edge.fromX} ${edge.fromY} C ${edge.fromX + dx * 0.5} ${edge.fromY}, ${edge.toX - dx * 0.5} ${edge.toY}, ${edge.toX} ${edge.toY}`}
                  stroke={isDirect ? 'var(--selected)' : hl ? 'var(--success)' : 'var(--border)'}
                  strokeWidth={isDirect ? 2.5 : hl ? 2 : 1}
                  fill="none"
                  opacity={active ? 1 : 0.15}
                  style={{ transition: 'opacity 0.25s, stroke 0.25s' }}
                />
          )
        })}
      </svg>

      <div style={{ position: 'relative', zIndex: 2 }}>
        {years.map(year => {
          const semesters = grouped.get(year)!
          const semKeys = Array.from(semesters.keys()).sort()

          return (
            <div key={year} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)', marginBottom: 12 }}>
                <div style={{ background: 'var(--year-badge)', border: '1px solid var(--year-badge-border)', color: 'var(--year-badge-text)', fontSize: 'var(--font-xs)', fontWeight: 600, padding: '3px 12px', borderRadius: 999 }}>
                  {YEAR_LABELS[year] ?? `${year}° Año`}
                </div>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
              </div>

              {semKeys.length === 0 && (
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', padding: 8 }}>
                  Sin materias en este año
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--gap-md)' }}>
                {semKeys.map(sem => {
                  const groupSubjects = semesters.get(sem)!

                  return (
                    <div key={String(sem)} style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--section-text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                        {sem === 0 ? 'Anuales' : sem === 1 ? '1er cuatrimestre' : '2do cuatrimestre'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {groupSubjects.map(s => {
                          const colors = STATE_COLORS[s.state]
                          const isSelected = s.subjectId === selectedSubjectId
                          const isUnlocked = unlockedIds.has(s.subjectId)
                          const isPrereq = prereqIds.has(s.subjectId)
                          const isBlocked = s.state === 'bloqueada'

                          let borderColor = 'var(--border)'
                          let bgColor = isBlocked ? 'var(--bg-subject)' : 'var(--bg-subject)'
                          let shadow = ''
                          let opacity = isBlocked && !isUnlocked && !isSelected && !isPrereq ? 0.35 : 1

                          if (isSelected) {
                            borderColor = 'var(--selected)'
                            shadow = '0 0 0 2px color-mix(in srgb, var(--selected) 15%, transparent), 0 4px 12px color-mix(in srgb, var(--selected) 15%, transparent)'
                          } else if (isUnlocked) {
                            borderColor = 'var(--success)'
                            bgColor = 'rgba(16,185,129,0.08)'
                          } else if (isPrereq) {
                            borderColor = 'var(--info)'
                            bgColor = 'rgba(37,99,235,0.08)'
                          }

                          const unlocks = unlockIndex.get(s.subjectId)

                          return (
                            <div
                              key={s.subjectId}
                              data-subject-id={s.subjectId}
                              onClick={() => onSubjectSelect(isSelected ? null : s.subjectId)}
                              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSubjectSelect(isSelected ? null : s.subjectId) } }}
                              role="button"
                              tabIndex={0}
                              aria-label={`${s.subjectName} - ${colors.label}${isSelected ? ' (seleccionado)' : ''}`}
                              style={{
                                padding: '10px 12px',
                                borderRadius: 12,
                                border: `1px solid ${borderColor}`,
                                background: bgColor,
                                cursor: 'pointer',
                                opacity,
                                boxShadow: shadow,
                                transition: 'all 0.2s',
                                minHeight: 'var(--touch-min)',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-xs)', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors.bar, flexShrink: 0 }}/>
                                {isSelected && '✓ '}<span title={s.subjectName}>{s.subjectName}</span>
                              </div>
                              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {s.subjectCode} · {s.credits} cr
                                {isBlocked && !isUnlocked && s.missingPrerequisites.length > 0 && (
                                  <span style={{ color: 'var(--danger)' }}>
                                    {' · Falta: '}{s.missingPrerequisites[0].requiredSubjectName}
                                    {s.missingPrerequisites.length > 1 && ` +${s.missingPrerequisites.length - 1}`}
                                  </span>
                                )}
                              </div>
                              {isSelected && unlocks && unlocks.length > 0 && (
                                <div style={{ marginTop: 6, fontSize: 'var(--font-xs)', color: 'var(--success)', fontWeight: 600 }}>
                                  🔓 Desbloquea {unlocks.length} materia{unlocks.length !== 1 ? 's' : ''}: {unlocks.map(u => u.subjectName).join(', ')}
                                </div>
                              )}
                              {isSelected && (!unlocks || unlocks.length === 0) && (
                                <div style={{ marginTop: 6, fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                                  No desbloquea otras materias directamente
                                </div>
                              )}
                              {isUnlocked && !isSelected && (
                                <div style={{ marginTop: 6, fontSize: 'var(--font-xs)', color: 'var(--success)', fontWeight: 600 }}>
                                  🔓 Se desbloquearía al aprobar la materia seleccionada
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {years.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          No hay materias para mostrar
        </div>
      )}

      {selectedSubjectId && (
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <button
            onClick={() => onSubjectSelect(null)}
            style={{
              background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)',
              borderRadius: 999, padding: '8px 16px', fontSize: 'var(--font-xs)', minHeight: 44,
              cursor: 'pointer',
            }}
          >
            ✕ Limpiar selección
          </button>
        </div>
      )}
    </div>
  )
}
