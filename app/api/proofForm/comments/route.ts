// /api/proofContributions/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { proofContributionId, text, walletAddress } = await req.json();

    // Validate required fields
    if (!proofContributionId || !text || !walletAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the wallet associated with the wallet address
    const wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress },
      include: { user: true },
    });

    if (!wallet || !wallet.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create the comment
    const comment = await prisma.proofContributionComment.create({
      data: {
        text,
        userId: wallet.user.id,
        proofContributionId,
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error adding comment to Proof Contribution:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}