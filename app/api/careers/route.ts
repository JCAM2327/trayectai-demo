import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const careers = await prisma.career.findMany({
      where: { isActive: true },
      include: { faculty: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(careers)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener carreras' }, { status: 500 })
  }
}
