import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const careerId = searchParams.get('careerId')

    if (!careerId) {
      return NextResponse.json({ error: 'careerId es requerido' }, { status: 400 })
    }

    const exams = await prisma.exam.findMany({
      where: { careerId },
      include: { subject: { select: { id: true, name: true, code: true } } },
      orderBy: { examDate: 'asc' },
    })

    const data = exams.map(exam => ({
      id: exam.id,
      subjectId: exam.subjectId,
      subjectName: exam.subject.name,
      subjectCode: exam.subject.code,
      examType: exam.examType,
      examDate: exam.examDate,
      startTime: exam.startTime,
      endTime: exam.endTime,
      location: exam.location,
      callNumber: exam.callNumber,
      notes: exam.notes,
    }))

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener exámenes' }, { status: 500 })
  }
}
