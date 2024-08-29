// api/proposals/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid proposal ID' }, { status: 400 });
  }

  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: parseInt(id) },
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

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const bidForms = await prisma.bidForm.findMany({
      where: { deliverables: { some: { deliverable: { proposalId: proposal.id } } } },
      include: {
        user: true,
        deliverables: {
          include: {
            deliverable: true,
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

    return NextResponse.json({ proposal, bidForms }, { status: 200 });
  } catch (error) {
    console.error('Error fetching proposal data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
