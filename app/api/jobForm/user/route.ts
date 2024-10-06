// /api/standaloneJobs/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    // Get the session to retrieve the user ID
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the user's standalone jobs with the category included
    const standaloneJobs = await prisma.standaloneJobForm.findMany({
      where: { userId: session.user.id },
      include: {
        comments: {
          include: {
            user: { select: { name: true } },
          },
        },
        category: {
          // Include the category associated with the job
          select: {
            name: true, // Select only the category name (you can select more fields if needed)
          },
        },
      },
    });

    return NextResponse.json({ standaloneJobs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user standalone jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
