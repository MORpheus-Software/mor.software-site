// app/api/proposals/open/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const openProposals = await prisma.proposal.findMany({
    where: {
      status: 'open',
    },
    include: {
      deliverables: true,
    },
  });

  return NextResponse.json(openProposals);
}
