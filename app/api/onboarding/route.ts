import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST — crear usuario + perfil académico
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, universityId, facultyId, careerId } = body

    if (!fullName || !email || !universityId || !facultyId || !careerId) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Crear usuario (sin password por ahora, es el modo demo)
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        authProvider: 'email',
        isActive: true,
        emailVerified: false,
      }
    })

    // Crear perfil académico
    const profile = await prisma.userAcademicProfile.create({
      data: {
        userId: user.id,
        universityId,
        facultyId,
        careerId,
        isPrimary: true,
      }
    })

    return NextResponse.json({ user, profile })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ese email ya está registrado' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al crear el perfil' }, { status: 500 })
  }
}