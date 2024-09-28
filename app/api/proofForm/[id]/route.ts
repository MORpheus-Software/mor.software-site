// /api/proofContributions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Invalid proof contribution ID' }, { status: 400 });
  }

  try {
    const proofContribution = await prisma.proofContribution.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!proofContribution) {
      return NextResponse.json({ error: 'Proof Contribution not found' }, { status: 404 });
    }

    return NextResponse.json({ proofContribution }, { status: 200 });
  } catch (error) {
    console.error('Error fetching proof contribution data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
