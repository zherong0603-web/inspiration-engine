import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const creations = await prisma.creation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(creations)
  } catch (error) {
    console.error('Error fetching creations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch creations' },
      { status: 500 }
    )
  }
}
