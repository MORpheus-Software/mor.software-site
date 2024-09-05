// export const dynamic = 'force-dynamic'; // Forces the route to be treated as dynamic

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// Get job forms created by the authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch job forms created by the authenticated user
    const jobForms = await prisma.jobForm.findMany({
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

    return NextResponse.json({ jobForms });
  } catch (error) {
    console.error('Error fetching user job forms:', error);
    return NextResponse.json({ message: 'Failed to fetch user job forms.' }, { status: 500 });
  }
}
