import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { computeCareerProgress } from '@/lib/prerequisite-engine'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ careerId: string }> }
) {
  try {
    const { careerId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const careerSubjects = await prisma.careerSubject.findMany({
      where: { careerId },
      include: { subject: true },
      orderBy: [
        { yearNumber: 'asc' },
        { semester: 'asc' },
        { displayOrder: 'asc' }
      ]
    })

    const careerSubjectIds = new Set(careerSubjects.map(cs => cs.subjectId))

    const [prerequisites, userProgress] = await Promise.all([
      prisma.prerequisite.findMany({
        where: {
          careerId,
          subjectId: { in: Array.from(careerSubjectIds) },
          requiredSubjectId: { in: Array.from(careerSubjectIds) }
        }
      }),
      userId
        ? prisma.userSubjectProgress.findMany({ where: { careerId, userId } })
        : Promise.resolve([])
    ])

    const subjects = careerSubjects.map(cs => ({
      subjectId: cs.subjectId,
      subjectName: cs.subject.name,
      subjectCode: cs.subject.code ?? '',
      yearNumber: cs.yearNumber,
      semester: cs.semester,
      isAnnual: cs.isAnnual,
      credits: Number(cs.credits ?? 0),
      isFinalThesis: cs.isFinalThesis,
    }))

    const mappedProgress = userProgress.map(up => ({
      subjectId: up.subjectId,
      status: up.status,
      grade: up.grade ? Number(up.grade) : null,
      passedAt: up.passedAt,
      regularizedAt: up.regularizedAt,
    }))

    const progress = computeCareerProgress(subjects, prerequisites, mappedProgress)

    const grades = mappedProgress
      .filter(up => up.status === 'aprobada' && up.grade != null)
      .map(up => up.grade as number)
    const averageGrade = grades.length > 0
      ? Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10
      : null

    const responseData = {
      ...progress,
      averageGrade,
      prerequisites: prerequisites.map(p => ({
        subjectId: p.subjectId,
        requiredSubjectId: p.requiredSubjectId,
        prerequisiteType: p.prerequisiteType,
      })),
      userProgress: mappedProgress,
    }

    const res = NextResponse.json(responseData)
    return res
  } catch (error) {
    console.error('GET /api/careers/[careerId]/subjects error:', error)
    return NextResponse.json({ error: 'Error al obtener materias' }, { status: 500 })
  }
}