import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SubjectStatus } from '@prisma/client'

const VALID_STATUSES = Object.values(SubjectStatus)

// GET — obtener progreso del usuario
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const careerId = searchParams.get('careerId')
    const userId = searchParams.get('userId')

    if (!careerId || !userId) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const progress = await prisma.userSubjectProgress.findMany({
      where: { careerId, userId }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('GET /api/progress error:', error)
    return NextResponse.json({ error: 'Error al obtener progreso' }, { status: 500 })
  }
}

// POST — marcar materia (aprobada, regular, etc.)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, careerId, subjectId, status, grade } = body

    if (!userId || !careerId || !subjectId || !status) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
    }
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Estado inválido: ${status}` }, { status: 400 })
    }

    const data: Record<string, unknown> = { status }
    if (grade !== undefined) data.grade = grade
    if (status === 'aprobada') data.passedAt = new Date()
    if (status === 'regular') data.regularizedAt = new Date()

    const progress = await prisma.userSubjectProgress.upsert({
      where: {
        userId_careerId_subjectId: { userId, careerId, subjectId }
      },
      update: data as any,
      create: { userId, careerId, subjectId, status, grade: grade ?? null, passedAt: status === 'aprobada' ? new Date() : null, regularizedAt: status === 'regular' ? new Date() : null },
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('POST /api/progress error:', error)
    const msg = error instanceof Error ? error.message : 'Error al guardar'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE — desmarcar materia
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const careerId = searchParams.get('careerId')
    const subjectId = searchParams.get('subjectId')

    if (!userId || !careerId || !subjectId) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    await prisma.userSubjectProgress.deleteMany({
      where: { userId, careerId, subjectId }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/progress error:', error)
    return NextResponse.json({ error: 'Error al desmarcar' }, { status: 500 })
  }
}