import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ facultyId: string }> }
) {
  const { facultyId } = await params
  const careers = await prisma.career.findMany({
    where: { facultyId, isActive: true },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { careerSubjects: true }
      }
    }
  })
  const careersWithFlag = careers.map(c => ({
    ...c,
    hasSubjects: c._count.careerSubjects > 0
  }))
  return NextResponse.json(careersWithFlag)
}