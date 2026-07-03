import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, password, universityId, facultyId, careerId } = body

    if (!fullName || !email || !password || !universityId || !facultyId || !careerId) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Ese email ya está registrado' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        authProvider: 'email',
        isActive: true,
        emailVerified: false,
      }
    })

    await prisma.userAcademicProfile.create({
      data: {
        userId: user.id,
        universityId,
        facultyId,
        careerId,
        isPrimary: true,
      }
    })

    const token = await createToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      careerId,
    })

    const response = NextResponse.json({ user: { id: user.id, email: user.email, fullName: user.fullName, careerId } })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ese email ya está registrado' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 500 })
  }
}
