import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ facultyId: string }> }
) {
  const { facultyId } = await params
  const careers = await prisma.career.findMany({
    where: { facultyId, isActive: true },
    orderBy: { name: 'asc' }
  })
  return NextResponse.json(careers)
}