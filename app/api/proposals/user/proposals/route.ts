'use server';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma'; // Adjust the path to your prisma client

// Get proposals created by the authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch proposals created by the authenticated user
    const proposals = await prisma.proposal.findMany({
      where: { userId: userId },
      include: {
        deliverables: true,
        comments: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ proposals });
  } catch (error) {
    console.error('Error fetching user proposals:', error);
    return NextResponse.json({ message: 'Failed to fetch user proposals.' }, { status: 500 });
  }
}
