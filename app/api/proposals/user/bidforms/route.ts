'use server';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma'; // Adjust the path to your prisma client

// Get bid forms created by the authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch bid forms created by the authenticated user
    const bidForms = await prisma.bidForm.findMany({
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
      },
    });

    return NextResponse.json({ bidForms });
  } catch (error) {
    console.error('Error fetching user bid forms:', error);
    return NextResponse.json({ message: 'Failed to fetch user bid forms.' }, { status: 500 });
  }
}
