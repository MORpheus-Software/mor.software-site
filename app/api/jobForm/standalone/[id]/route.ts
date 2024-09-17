// /api/standaloneJobs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Invalid standalone job ID' }, { status: 400 });
  }

  try {
    const standaloneJob = await prisma.standaloneJobForm.findUnique({
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

    if (!standaloneJob) {
      return NextResponse.json({ error: 'Standalone Job not found' }, { status: 404 });
    }

    return NextResponse.json({ standaloneJob }, { status: 200 });
  } catch (error) {
    console.error('Error fetching standalone job data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
