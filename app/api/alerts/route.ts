import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function daysUntil(d: Date, ref: Date) {
  const diff = d.getTime() - ref.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function todayDate() {
  const t = new Date()
  return new Date(t.getFullYear(), t.getMonth(), t.getDate())
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const careerId = searchParams.get('careerId')

    if (!careerId) {
      return NextResponse.json({ error: 'careerId es requerido' }, { status: 400 })
    }

    const now = todayDate()

    const exams = await prisma.exam.findMany({
      where: { careerId },
      include: { subject: { select: { id: true, name: true, code: true } } },
      orderBy: { examDate: 'asc' },
    })

    const alerts: {
      id: string
      type: 'opening_soon' | 'open_now' | 'closing_soon' | 'closed' | 'exam_today'
      severity: 'info' | 'warning' | 'danger'
      title: string
      description: string
      examId: string
      subjectName: string
      examDate: string
      daysRemaining: number
    }[] = []

    for (const exam of exams) {
      const open = exam.registrationOpen ? new Date(exam.registrationOpen) : null
      const close = exam.registrationClose ? new Date(exam.registrationClose) : null
      const examDate = new Date(exam.examDate)
      const days = daysUntil(examDate, now)

      if (open && close) {
        const daysToOpen = daysUntil(open, now)
        const daysToClose = daysUntil(close, now)

        // opening in the next 7 days
        if (daysToOpen >= 0 && daysToOpen <= 7) {
          alerts.push({
            id: `open-soon-${exam.id}`,
            type: 'opening_soon',
            severity: 'info',
            title: 'Pronto abre la inscripción',
            description: `La inscripción para ${exam.subject.name} (${exam.examType}) abre en ${daysToOpen === 0 ? 'hoy' : `${daysToOpen} día${daysToOpen > 1 ? 's' : ''}`}`,
            examId: exam.id,
            subjectName: exam.subject.name,
            examDate: exam.examDate.toISOString(),
            daysRemaining: days,
          })
        }

        // opened today or yesterday
        if (daysToOpen === 0 || daysToOpen === -1) {
          alerts.push({
            id: `open-now-${exam.id}`,
            type: 'open_now',
            severity: 'info',
            title: 'Inscripción abierta',
            description: `Ya podés inscribirte a ${exam.subject.name} (${exam.examType})${close ? ` · Cierra el ${close.toLocaleDateString('es-AR')}` : ''}`,
            examId: exam.id,
            subjectName: exam.subject.name,
            examDate: exam.examDate.toISOString(),
            daysRemaining: days,
          })
        }

        // closing in the next 48 hours
        if (daysToClose >= 0 && daysToClose <= 2) {
          alerts.push({
            id: `close-soon-${exam.id}`,
            type: 'closing_soon',
            severity: daysToClose <= 1 ? 'danger' : 'warning',
            title: daysToClose === 0 ? 'Último día de inscripción' : 'Cierra la inscripción',
            description: daysToClose === 0
              ? `Hoy es el último día para inscribirte a ${exam.subject.name} (${exam.examType})`
              : `En ${daysToClose} día${daysToClose > 1 ? 's' : ''} cierra la inscripción a ${exam.subject.name} (${exam.examType})`,
            examId: exam.id,
            subjectName: exam.subject.name,
            examDate: exam.examDate.toISOString(),
            daysRemaining: days,
          })
        }
      }

      // exam is today
      if (days === 0) {
        alerts.push({
          id: `exam-today-${exam.id}`,
          type: 'exam_today',
          severity: 'danger',
          title: '¡Examen hoy!',
          description: `Hoy rendís ${exam.subject.name} (${exam.examType})${exam.startTime ? ` a las ${exam.startTime}` : ''}${exam.location ? ` en ${exam.location}` : ''}`,
          examId: exam.id,
          subjectName: exam.subject.name,
          examDate: exam.examDate.toISOString(),
          daysRemaining: 0,
        })
      }
    }

    alerts.sort((a, b) => a.daysRemaining - b.daysRemaining)

    return NextResponse.json({
      alerts,
      total: alerts.length,
      hasUrgent: alerts.some(a => a.severity === 'danger'),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener alertas' }, { status: 500 })
  }
}
