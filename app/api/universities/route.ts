import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const universities = await prisma.university.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(universities)
  } catch {
    return NextResponse.json({ error: 'Error al obtener universidades' }, { status: 500 })
  }
}
