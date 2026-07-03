import type { SubjectResult, Prerequisite, SubjectProgress } from './prerequisite-engine'
import {
  getRecommendedSubjects,
  simulateApproval,
  computeGraduationProjection,
} from './prerequisite-engine'

export interface ChatContext {
  subjects: SubjectResult[]
  prerequisites: Prerequisite[]
  userProgress: SubjectProgress[]
  averageGrade: number | null
  careerTotalYears: number
  careerName?: string
}

interface ChatResponse {
  text: string
  suggestions?: string[]
}

function findMateria(query: string, subjects: SubjectResult[]): SubjectResult | null {
  const q = query.toLowerCase().trim()
  if (q.length < 2) return null
  let best: SubjectResult | null = null
  let bestScore = 0
  for (const s of subjects) {
    let score = 0
    if (s.subjectName.toLowerCase().includes(q)) score += q.length / s.subjectName.length
    if (s.subjectCode.toLowerCase().includes(q)) score += 5
    if (q.includes(s.subjectName.toLowerCase().slice(0, 4))) score += 3
    if (s.subjectName.toLowerCase().split(' ').some(w => w.startsWith(q))) score += 2
    if (score > bestScore) { bestScore = score; best = s }
  }
  return bestScore > 0.3 ? best : null
}

function handleAvailable(ctx: ChatContext): ChatResponse {
  const available = ctx.subjects.filter(s => s.state === 'habilitada')
  if (available.length === 0) {
    return {
      text: 'No tenés materias habilitadas para cursar este cuatrimestre.\n\nAprobá alguna de las que estás cursando para desbloquear más. También podés revisar si hay materias regulares que puedas promocionar.',
      suggestions: ['¿Qué estoy cursando?', '¿Cuánto me falta para egresar?', 'Recomendame'],
    }
  }
  const byYear: Record<number, SubjectResult[]> = {}
  for (const s of available) {
    const key = s.yearNumber
    if (!byYear[key]) byYear[key] = []
    byYear[key].push(s)
  }
  const lines: string[] = []
  for (const year of Object.keys(byYear).sort()) {
    const group = byYear[Number(year)]
    lines.push(`\n📘 ${year}° año:`)
    for (const s of group) {
      lines.push(`  • ${s.subjectName} (${s.credits} cr)`)
    }
  }
  const extra = available.length > 12 ? `\n...y ${available.length - 12} más` : ''
  return {
    text: `Podés cursar **${available.length} materias** este cuatrimestre:${lines.slice(0, 14).join('')}${extra}\n\n💡 Tip: priorizá las que desbloquean más materias (usá "Recomendame").`,
    suggestions: ['Recomendame cuáles cursar', '¿Qué desbloquea cada una?', '¿Cómo voy?'],
  }
}

function handleBlocked(ctx: ChatContext): ChatResponse {
  const blocked = ctx.subjects.filter(s => s.state === 'bloqueada')
  if (blocked.length === 0) {
    return { text: '🎉 No tenés materias bloqueadas. ¡Vas muy bien!', suggestions: ['¿Qué puedo cursar?', 'Recomendame'] }
  }
  const top = blocked.slice(0, 6).map(s => {
    const missing = s.missingPrerequisites.map(m => m.requiredSubjectName).join(', ')
    return `  🔒 ${s.subjectName} → falta: ${missing}`
  }).join('\n')
  const extra = blocked.length > 6 ? `\n...y ${blocked.length - 6} materias más bloqueadas` : ''
  return {
    text: `Tenés **${blocked.length} materias bloqueadas**. Priorizá aprobar las correlativas:\n${top}${extra}\n\n📌 Concentrate en las materias que desbloquean varias simultáneamente.`,
    suggestions: ['¿Qué me conviene aprobar primero?', 'Simular aprobación', '¿Qué puedo cursar?'],
  }
}

function handleRecommend(ctx: ChatContext): ChatResponse {
  const recommended = getRecommendedSubjects(ctx.subjects, ctx.prerequisites, ctx.userProgress)
  if (recommended.length === 0) {
    return { text: 'No hay materias disponibles para recomendar en este momento. Aprobá algo primero para generar nuevas opciones.', suggestions: ['¿Qué puedo cursar?', '¿Cómo voy?'] }
  }
  const top = recommended.slice(0, 4)
  const lines = top.map(r =>
    `  ⭐ ${r.subjectName} → desbloquea ${r.unlocksCount} materia${r.unlocksCount !== 1 ? 's' : ''} (${r.credits} cr)`
  ).join('\n')
  return {
    text: `📋 **Materias con mayor impacto** (ordenadas por lo que desbloquean):\n${lines}\n\n✅ Cursá estas primero para abrir la mayor cantidad de opciones en cuatrimestres siguientes.`,
    suggestions: ['¿Qué puedo cursar?', '¿Cuánto me falta?', '¿Qué pasa si apruebo la primera?'],
  }
}

function handleProgress(ctx: ChatContext): ChatResponse {
  const approved = ctx.subjects.filter(s => s.state === 'aprobada')
  const regular = ctx.subjects.filter(s => s.state === 'regular')
  const enCurso = ctx.subjects.filter(s => s.state === 'en_curso')
  const habilitadas = ctx.subjects.filter(s => s.state === 'habilitada')
  const total = ctx.subjects.length
  const credits = ctx.subjects.reduce((sum, s) => sum + s.credits, 0)
  const earned = approved.reduce((sum, s) => sum + s.credits, 0)
  const pct = credits > 0 ? Math.round((earned / credits) * 100) : 0
  return {
    text:
      `📊 **Resumen académico**\n\n` +
      `✅ ${approved.length}/${total} aprobadas (${pct}%)\n` +
      (regular.length > 0 ? `📖 ${regular.length} regulares\n` : '') +
      (enCurso.length > 0 ? `📝 ${enCurso.length} en curso\n` : '') +
      (habilitadas.length > 0 ? `🔓 ${habilitadas.length} habilitadas para cursar\n` : '') +
      `💳 ${earned}/${credits} créditos\n` +
      `${ctx.averageGrade ? `📈 Promedio: ${ctx.averageGrade}\n` : ''}\n` +
      `💡 Si querés más detalles, preguntame por algo específico.`,
    suggestions: ['¿Cuándo me egreso?', 'Recomendame materias', '¿Qué puedo cursar?'],
  }
}

function handleGPA(ctx: ChatContext): ChatResponse {
  if (ctx.averageGrade == null) {
    return {
      text: 'Todavía no tenés notas registradas. Cuando marques materias como aprobadas con nota, voy a calcular tu promedio automáticamente.',
      suggestions: ['¿Cómo voy en la carrera?', '¿Cuánto me falta?'],
    }
  }
  const r = ctx.averageGrade
  let msg = ''
  if (r >= 9) msg = '🎉 **Excelente promedio.** Estás en el top. Seguí así y vas a egresar con honores.'
  else if (r >= 8) msg = '🎉 **Muy bien.** Promedio sobresaliente. Mantené el nivel.'
  else if (r >= 7) msg = '👍 **Buen promedio.** Con constancia llegás tranquilo al final de la carrera.'
  else if (r >= 6) msg = '👍 **Promedio aceptable.** Podés mejorarlo identificando las materias que más te cuestan.'
  else msg = '💪 **Tenés margen para mejorar.** Revisá tu método de estudio y priorizá las materias que más pesan en el promedio.'
  return {
    text: `Tu promedio general es **${r}**.\n\n${msg}`,
    suggestions: ['¿Cómo voy en la carrera?', 'Recomendame materias', '¿Qué materias me bajaron el promedio?'],
  }
}

function handleGraduation(ctx: ChatContext): ChatResponse {
  const proj = computeGraduationProjection(ctx.subjects, ctx.prerequisites, ctx.userProgress, ctx.careerTotalYears)
  const remaining = ctx.subjects.filter(s => s.state !== 'aprobada')
  return {
    text:
      `🎓 **Proyección de egreso**\n\n` +
      `📅 Fecha estimada: **${proj.estimatedDate}**\n` +
      `📚 ${proj.remainingSubjects} materias restantes (${remaining.length - proj.remainingSubjects} son optativas/tesis)\n` +
      `💳 ${proj.remainingCredits} créditos por completar\n` +
      `📈 Ritmo actual: ${proj.subjectsPerSemester} materia${proj.subjectsPerSemester !== 1 ? 's' : ''}/cuatrimestre\n` +
      `⏳ Cuatrimestres restantes: ~${proj.estimatedSemesters}\n\n` +
      (proj.isOnTrack
        ? '✅ **Vas a tiempo.** Mantené este ritmo y egresás en el plazo esperado.'
        : '⚠️ **Estás un poco atrasado.** Si podés, aumentá la carga a 4-5 materias por cuatrimestre para recuperar terreno.'),
    suggestions: ['¿Qué puedo cursar para acelerar?', 'Recomendame', '¿Cómo voy?'],
  }
}

function handlePrereqFor(materia: SubjectResult, ctx: ChatContext): ChatResponse {
  const needed = ctx.prerequisites
    .filter(p => p.subjectId === materia.subjectId)
    .map(p => {
      const sub = ctx.subjects.find(s => s.subjectId === p.requiredSubjectId)
      const name = sub?.subjectName ?? p.requiredSubjectId
      const state = sub?.state ?? 'desconocido'
      const icon = state === 'aprobada' ? '✅' : state === 'regular' ? '📖' : state === 'en_curso' ? '📝' : '❌'
      return `  ${icon} ${name} (${state})`
    })
  if (needed.length === 0) {
    return {
      text: `**${materia.subjectName}** es materia inicial — no necesita correlativas. Podés cursarla directamente.`,
      suggestions: ['¿Qué puedo cursar?', 'Recomendame materias'],
    }
  }
  const missing = needed.filter(n => n.includes('❌')).length
  return {
    text:
      `📋 **Requisitos para ${materia.subjectName}**\n${needed.join('\n')}\n\n` +
      (missing > 0
        ? `❌ Te faltan ${missing} correlativa${missing > 1 ? 's' : ''}. Priorizá aprobarlas para desbloquear esta materia.`
        : '✅ Cumplís con todas las correlativas. ¡Podés cursarla!'),
    suggestions: ['¿Qué puedo cursar?', '¿Por qué está bloqueada otra materia?', 'Recomendame'],
  }
}

function handleWhatUnlocks(materia: SubjectResult, ctx: ChatContext): ChatResponse {
  const result = simulateApproval([materia.subjectId], ctx.subjects, ctx.prerequisites, ctx.userProgress)
  const sim = result[0]
  if (!sim || sim.newlyEnabled.length === 0) {
    return {
      text: `Si aprobás **${materia.subjectName}** no se desbloquea ninguna materia nueva directamente. Puede que igual sea útil para cuatrimestres más avanzados.`,
      suggestions: ['Recomendame otra materia', '¿Qué puedo cursar?', '¿Qué pasa si apruebo una distinta?'],
    }
  }
  const list = sim.newlyEnabled.map(s => `  🔓 ${s.subjectName} (${s.credits} cr)`).join('\n')
  const totalCredits = sim.newlyEnabled.reduce((sum, s) => sum + s.credits, 0)
  return {
    text: `✅ **Si aprobás ${materia.subjectName}** se desbloquean **${sim.newlyEnabled.length} materias** (${totalCredits} créditos):\n${list}\n\n📌 Alta prioridad: esta materia destraba mucho contenido.`,
    suggestions: ['¿Y si apruebo otra?', 'Recomendame basado en esto', '¿Qué más puedo cursar?'],
  }
}

function handleRegularOrCursada(ctx: ChatContext): ChatResponse {
  const regular = ctx.subjects.filter(s => s.state === 'regular')
  const enCurso = ctx.subjects.filter(s => s.state === 'en_curso')
  const parts: string[] = []
  if (enCurso.length > 0) parts.push(`📝 **Cursando:** ${enCurso.map(s => s.subjectName).join(', ')}`)
  if (regular.length > 0) parts.push(`📖 **Regulares:** ${regular.map(s => s.subjectName).join(', ')}`)
  if (parts.length === 0) return { text: 'No tenés materias regulares ni en curso.', suggestions: ['¿Qué puedo cursar?', 'Recomendame'] }
  return { text: parts.join('\n\n'), suggestions: ['¿Qué puedo cursar?', '¿Cuánto me falta?'] }
}

function handleHelp(): ChatResponse {
  return {
    text:
      '🤖 **Copiloto académico** — puedo ayudarte con:\n\n' +
      '🔹 `¿Qué puedo cursar?` — materias habilitadas\n' +
      '🔹 `Recomendame` — priorizadas por impacto\n' +
      '🔹 `¿Qué necesito para [materia]?` — correlativas\n' +
      '🔹 `¿Qué pasa si apruebo [materia]?` — simular\n' +
      '🔹 `¿Cómo voy?` — resumen de avance\n' +
      '🔹 `¿Cuándo me egreso?` — proyección\n' +
      '🔹 `¿Cuál es mi promedio?` — GPA\n' +
      '🔹 `¿Qué estoy cursando?` — materias actuales\n' +
      '🔹 `¿Por qué bloqueada?` — materias trabadas\n\n' +
      'También podés preguntar con lenguaje natural, ejemplo: "voy bien?", "cuánto falta?", "qué me aconsejás?"',
    suggestions: ['¿Qué puedo cursar?', 'Recomendame', '¿Cuánto me falta?', '¿Cómo voy?'],
  }
}

export function processChatMessage(message: string, ctx: ChatContext): ChatResponse {
  try {
    const q = message.toLowerCase().trim()
    const words = q.split(/\s+/)

  // Saludos
  if (!q || words.length <= 2 && (q === 'hola' || q === 'buenas' || q === 'hey' || q === 'buen día' || q === 'buenas tardes')) {
    return {
      text: '¡Hola! ¿En qué puedo ayudarte con tu carrera hoy?',
      suggestions: ['¿Qué puedo cursar?', 'Recomendame', '¿Cuánto me falta?', '¿Cómo voy?'],
    }
  }

  // Gracias
  if (q.includes('gracias') || q.includes('graciass')) {
    return { text: '😊 De nada. Siempre acá para ayudarte.', suggestions: ['¿Qué puedo cursar?', 'Recomendame', '¿Cómo voy?'] }
  }

  // Ask about copilot itself
  if (q.includes('quién sos') || q.includes('quien sos') || q.includes('qué hacés') || q.includes('que haces') || q.includes('cómo funcion')) {
    return {
      text: 'Soy el **Copiloto académico** de TrayectAI. Analizo tu plan de estudios en tiempo real para ayudarte a decidir qué cursar, entender correlativas, proyectar tu egreso y más. Todo basado en tu progreso actual.',
      suggestions: ['¿Qué puedo cursar?', 'Recomendame', '¿Cuánto me falta?'],
    }
  }

  // Help / qué puedo preguntar
  if (q === 'ayuda' || q === 'help' || q === 'comandos' || q.includes('qué podés') || q.includes('que puedes') || q.includes('qué pregunt') || q.includes('que pregunt')) {
    return handleHelp()
  }

  // GPA / promedio
  if (q.includes('promedio') || q.includes('nota') || q.includes('gpa')) {
    return handleGPA(ctx)
  }

  // Cómo voy / progreso general
  if ((q.includes('cómo voy') || q.includes('como voy') || q.includes('cómo vamos') || q.includes('como vamos') || q.includes('progreso') || q.includes('avance') || q.includes('porcentaje') || q.includes('resumen')) && !q.includes('puedo')) {
    return handleProgress(ctx)
  }

  // Egreso / cuánto falta
  if (q.includes('egreso') || q.includes('egresar') || q.includes('falta') || q.includes('recibo') || q.includes('termino') || q.includes('terminar') || q.includes('gradu') || q.includes('cuándo me') || q.includes('cuanto me')) {
    return handleGraduation(ctx)
  }

  // Qué estoy cursando / qué tengo regular
  if ((q.includes('cursando') || q.includes('regular') || q.includes('en curso')) && !q.includes('puedo') && !q.includes('habilitada') && !q.includes('recomend')) {
    return handleRegularOrCursada(ctx)
  }

  // Materias disponibles / puedo cursar / habilitadas
  if (q.includes('puedo') || q.includes('habilitada') || q.includes('disponible') || q.includes('cursar') || (q.includes('qué') && q.includes('materia'))) {
    if (q.includes('cursar') || q.includes('tomar') || q.includes('inscrib') || q.includes('habilitada') || q.includes('disponible')) {
      return handleAvailable(ctx)
    }
  }

  // Por qué bloqueada / trabada
  if ((q.includes('bloqueada') || q.includes('trabada') || q.includes('por qué no') || q.includes('no puedo')) && (q.includes('materia') || q.length > 20)) {
    const cleaned = q.replace(/bloqueada|trabada|por qué no|no puedo|cursar|materia|esta/gi, '').trim()
    const found = cleaned.length > 1 ? findMateria(cleaned, ctx.subjects) : null
    if (found) return handlePrereqFor(found, ctx)
    if (q.includes('materia') || q.includes('por qué')) return handleBlocked(ctx)
  }

  // Todas las bloqueadas
  if (q.includes('bloqueada') || q.includes('bloqueadas') || q.includes('trabada')) {
    return handleBlocked(ctx)
  }

  // Recomendar
  if (q.includes('recomend') || q.includes('conviene') || q.includes('debería') || q.includes('mejor') || q.includes('conse') || q.includes('aconsej') || q.includes('suger')) {
    return handleRecommend(ctx)
  }

  // Materia específica + necesidades / requisitos / "para cursar"
  if (q.includes('necesito') || q.includes('correlativa') || q.includes('prerrequisito') || q.includes('requisito') || q.includes('para') || q.includes('cómo puedo') || q.includes('que necesito') || q.includes('hace falta')) {
    const cleaned = q.replace(/necesito|correlativa|prerrequisito|requisito|para|cursar|materia|qué|que|cómo|hace falta/gi, '').trim()
    const found = cleaned.length > 1 ? findMateria(cleaned, ctx.subjects) : null
    if (found) return handlePrereqFor(found, ctx)
  }

  // "Qué pasa si apruebo X" / simular / desbloquea
  if ((q.includes('apruebo') || q.includes('aprob') || q.includes('simular') || q.includes('desbloque') || q.includes('pasa si') || q.includes('pasaria si')) && !q.includes('recomend')) {
    const cleaned = q.replace(/apruebo|aprob|qué|que|pasa|pasaría|simular|desbloque|si/gi, '').trim()
    const found = cleaned.length > 1 ? findMateria(cleaned, ctx.subjects) : null
    if (found) return handleWhatUnlocks(found, ctx)
    // Maybe they want to know what unlocks
    if (q.includes('desbloque')) return handleRecommend(ctx)
  }

  // "Voy bien/mal" - sentiment analysis
  if (q.includes('voy bien') || q.includes('voy mal') || q.includes('estoy bien') || q.includes('estoy mal') || q.includes('qué tal voy') || q.includes('como voy') || q.includes('voy atrasado') || q.includes('estoy atrasado')) {
    const proj = computeGraduationProjection(ctx.subjects, ctx.prerequisites, ctx.userProgress, ctx.careerTotalYears)
    if (proj.isOnTrack) {
      return { text: '✅ **Vas bien.** Estás al día con el ritmo esperado para tu carrera. Seguí así y egresás en el tiempo estimado.', suggestions: ['¿Cuándo me egreso?', '¿Qué puedo cursar?', 'Recomendame'] }
    }
    return { text: '⚠️ **Estás un poco atrasado.** No te preocupes — todavía podés recuperar. Tratá de cursar 4-5 materias por cuatrimestre y priorizá las que más desbloquean.', suggestions: ['¿Qué me recomendás?', '¿Cuánto me falta?', '¿Qué puedo cursar?'] }
  }

  // "Qué materias son las más / menos pesadas" - créditos
  if (q.includes('crédito') || q.includes('credito') || (q.includes('más pesada') || q.includes('menos pesada') || q.includes('carga'))) {
    const sorted = [...ctx.subjects].sort((a, b) => b.credits - a.credits)
    const top = sorted.slice(0, 6)
    const lines = top.map(s => `  • ${s.subjectName}: ${s.credits} créditos`).join('\n')
    return { text: `📊 **Materias con más créditos:**\n${lines}\n\n💡 Las materias con más créditos tienen más impacto en tu progreso general.`, suggestions: ['Recomendame', '¿Qué puedo cursar?', '¿Cómo voy?'] }
  }

  // "Cuántas materias tiene la carrera"
  if (q.includes('cuántas') || q.includes('cuantas') || q.includes('total') || q.includes('materias tiene')) {
    return { text: `Tu plan de estudios tiene **${ctx.subjects.length} materias** en total.`, suggestions: ['¿Cuánto me falta?', '¿Qué puedo cursar?', 'Recomendame'] }
  }

  // Materia lookup - try to find any mentioned subject
  const possibleSubject = findMateria(q, ctx.subjects)
  if (possibleSubject && q.length > 4) {
    const prereqCount = ctx.prerequisites.filter(p => p.subjectId === possibleSubject.subjectId).length
    const unlocks = ctx.prerequisites.filter(p => p.requiredSubjectId === possibleSubject.subjectId).length
    const stateIcons: Record<string, string> = { aprobada: '✅', regular: '📖', en_curso: '📝', habilitada: '🔓', bloqueada: '🔒' }
    const icon = stateIcons[possibleSubject.state] ?? '❓'
    return {
      text:
        `📘 **${possibleSubject.subjectName}** (${possibleSubject.subjectCode})\n\n` +
        `${icon} Estado: **${possibleSubject.state}**\n` +
        `💳 ${possibleSubject.credits} créditos\n` +
        `📅 ${possibleSubject.yearNumber}° año · ${possibleSubject.semester ? possibleSubject.semester + '° cuatrimestre' : 'anual'}\n` +
        `🔗 ${prereqCount} correlativa${prereqCount !== 1 ? 's' : ''} necesaria${prereqCount !== 1 ? 's' : ''}\n` +
        `🔓 Desbloquea ${unlocks} materia${unlocks !== 1 ? 's' : ''}\n` +
        (possibleSubject.isFinalThesis ? '🎯 Es trabajo final/tesis\n' : ''),
      suggestions: ['¿Qué necesito para cursarla?', '¿Qué desbloquea?', 'Recomendame'],
    }
  }

  // Fallback
  return {
    text: 'No entendí bien tu consulta. 😅 Podés preguntarme cosas como:\n\n• "¿Qué puedo cursar?"\n• "Recomendame materias"\n• "¿Qué necesito para Análisis I?"\n• "¿Cuándo me egreso?"\n• "¿Cómo voy?"',
    suggestions: ['¿Qué puedo cursar?', 'Recomendame', '¿Cómo voy?', 'Ayuda'],
  }
  } catch (e) {
    return { text: 'Ocurrió un error procesando tu consulta. Intentalo de nuevo.', suggestions: ['¿Qué puedo cursar?', 'Recomendame', '¿Cómo voy?'] }
  }
}
