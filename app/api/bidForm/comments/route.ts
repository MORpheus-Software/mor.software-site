// /api/bidForms/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST handler to add a comment to a bid form
export async function POST(req: NextRequest) {
  try {
    const { bidFormId, text, walletAddress } = await req.json();

    if (!bidFormId || !text || !walletAddress) {
      return NextResponse.json({ message: 'BidForm ID, comment text, and wallet address are required' }, { status: 400 });
    }

    // Find the user by their wallet address
    const user = await prisma.wallet.findUnique({
      where: { address: walletAddress },
      select: { userId: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found for this wallet address' }, { status: 404 });
    }

    // Fetch the bid form by ID to get its related proposal's category
    const bidForm = await prisma.bidForm.findUnique({
      where: { id: bidFormId },
      include: {
        deliverables: {
          include: {
            deliverable: {
              select: { proposalId: true },
            },
          },
        },
      },
    });

    if (!bidForm) {
      return NextResponse.json({ message: 'BidForm not found' }, { status: 404 });
    }

    // Get the proposal ID related to the bid form
    const proposalId = bidForm.deliverables[0]?.deliverable.proposalId;

    if (!proposalId) {
      return NextResponse.json({ message: 'No proposal associated with this bid form' }, { status: 404 });
    }

    // Fetch the proposal to get its category ID
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: { categoryId: true },
    });

    if (!proposal) {
      return NextResponse.json({ message: 'Associated proposal not found' }, { status: 404 });
    }

    // Check if the user is a maintainer for the category of the associated proposal
    const isMaintainer = await prisma.maintainerCategory.findFirst({
      where: {
        maintainer: {
          wallet: {
            address: walletAddress,
          },
        },
        categoryId: proposal.categoryId,
      },
    });

    if (!isMaintainer) {
      return NextResponse.json({ message: 'Unauthorized: Only category maintainers can leave comments' }, { status: 403 });
    }

    // Add a new comment to the bid form
    const comment = await prisma.bidFormComment.create({
      data: {
        text,
        userId: user.userId,
        bidFormId,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error adding comment to bid form:', error);
    return NextResponse.json({ message: 'Failed to add comment to bid form.' }, { status: 500 });
  }
}
