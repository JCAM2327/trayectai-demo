import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const session = await verifyToken(token)
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        academicProfile: {
          include: { career: true, faculty: true, university: true },
        },
      },
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        careerId: user.academicProfile?.careerId ?? null,
        careerTotalYears: user.academicProfile?.career?.totalYears ?? null,
        profile: user.academicProfile
          ? {
              universityId: user.academicProfile.universityId,
              facultyId: user.academicProfile.facultyId,
              careerId: user.academicProfile.careerId,
            }
          : null,
      }
    })
  } catch {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
