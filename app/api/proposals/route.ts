import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get a proposal by ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Proposal ID is required' }, { status: 400 });
    }

    // Fetch the proposal by ID with comments and deliverables
    const proposal = await prisma.proposal.findUnique({
      where: { id: Number(id) },
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
      return NextResponse.json({ message: 'Proposal not found' }, { status: 404 });
    }

    // Fetch related job forms for the proposal
    // const jobForms = await prisma.jobForm.findMany({
    //   where: { proposalId: Number(id) },
    //   include: {
    //     deliverables: true,
    //     comments: {
    //       include: {
    //         user: {
    //           select: { name: true },
    //         },
    //       },
    //     },
    //     user: {
    //       select: { name: true, githubUsername: true },
    //     },
    //   },
    // });

    return NextResponse.json({ proposal });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json({ message: 'Failed to fetch proposal.' }, { status: 500 });
  }
}

// Update a proposal's status
export async function PUT(req: NextRequest) {
  try {
    const { id, status, walletAddress } = await req.json();

    if (!id || !status || !walletAddress) {
      return NextResponse.json(
        { message: 'Proposal ID, status, and wallet address are required' },
        { status: 400 },
      );
    }

    // Fetch the proposal by ID to get its categoryId
    const proposal = await prisma.proposal.findUnique({
      where: { id: Number(id) },
      select: { categoryId: true },
    });

    if (!proposal) {
      return NextResponse.json({ message: 'Proposal not found' }, { status: 404 });
    }

    // Check if the wallet is a maintainer for this category
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
      return NextResponse.json(
        { message: 'Unauthorized: You do not have permission to update this proposal' },
        { status: 403 },
      );
    }

    // Update the proposal status
    const updatedProposal = await prisma.proposal.update({
      where: { id: Number(id) },
      data: { status },
    });

    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error('Error updating proposal status:', error);
    return NextResponse.json({ message: 'Failed to update proposal status.' }, { status: 500 });
  }
}

// Add a comment to a proposal
export async function POST(req: NextRequest) {
  try {
    const { proposalId, text, walletAddress } = await req.json();

    if (!proposalId || !text || !walletAddress) {
      return NextResponse.json(
        { message: 'Proposal ID, comment text, and wallet address are required' },
        { status: 400 },
      );
    }

    // Find the user by their wallet address
    const user = await prisma.wallet.findUnique({
      where: { address: walletAddress },
      select: { userId: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found for this wallet address' },
        { status: 404 },
      );
    }

    // Fetch the proposal by ID to get its categoryId
    const proposal = await prisma.proposal.findUnique({
      where: { id: Number(proposalId) },
      select: { categoryId: true },
    });

    if (!proposal) {
      return NextResponse.json({ message: 'Proposal not found' }, { status: 404 });
    }

    // Check if the wallet is a maintainer for this category
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
      return NextResponse.json(
        { message: 'Unauthorized: Only category maintainers can leave comments' },
        { status: 403 },
      );
    }

    // Add a new comment to the proposal
    const comment = await prisma.proposalComment.create({
      data: {
        text,
        userId: user.userId,
        proposalId: Number(proposalId),
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error adding comment to proposal:', error);
    return NextResponse.json({ message: 'Failed to add comment to proposal.' }, { status: 500 });
  }
}
