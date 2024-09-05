// /api/jobForms/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { notifyJobFormCommentAdded } from '@/utils/notifications';

// POST handler to add a comment to a job form
export async function POST(req: NextRequest) {
  try {
    const { jobFormId, text, walletAddress } = await req.json();

    if (!jobFormId || !text || !walletAddress) {
      return NextResponse.json(
        { message: 'JobForm ID, comment text, and wallet address are required' },
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

    // Fetch the job form by ID to get its related proposal's category
    const jobForm = await prisma.jobForm.findUnique({
      where: { id: jobFormId },
      include: {
        user: {
          select: { id: true }, // Select the userId of the submitter
        },
        deliverables: {
          include: {
            deliverable: {
              select: { proposalId: true },
            },
            
          },
        },
      },
    });

    if (!jobForm) {
      return NextResponse.json({ message: 'JobForm not found' }, { status: 404 });
    }

    // Get the proposal ID related to the job form
    const proposalId = jobForm.deliverables[0]?.deliverable.proposalId;

    if (!proposalId) {
      return NextResponse.json(
        { message: 'No proposal associated with this job form' },
        { status: 404 },
      );
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
      return NextResponse.json(
        { message: 'Unauthorized: Only category maintainers can leave comments' },
        { status: 403 },
      );
    }

    notifyJobFormCommentAdded(jobForm.userId,jobFormId)


    // Add a new comment to the job form
    const comment = await prisma.jobFormComment.create({
      data: {
        text,
        userId: user.userId,
        jobFormId,
      },
    });




    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error adding comment to job form:', error);
    return NextResponse.json({ message: 'Failed to add comment to job form.' }, { status: 500 });
  }
}
