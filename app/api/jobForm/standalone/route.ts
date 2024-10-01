'use server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { appendToSheet } from '@/utils/googlesheets';
import { notifyStandaloneJobFormCreation } from '@/utils/notifications';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await auth();

  // Check if the user is authenticated
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Extract data from the form
    const data = await req.json();

    const {
      jobId,
      text,
      walletAddress,
      githubUsername,
      email,
      description,
      deliverables,
      weightsRequested,
      minimumWeightsTime,
      mriNumber,
    } = data;

    if (jobId) {
      // Standalone comment
      try {
        if (!jobId || !text || !walletAddress) {
          return NextResponse.json(
            { message: 'Standalone ID, comment text, and wallet address are required' },
            { status: 400 },
          );
        }
        // Find the user by their wallet address
        // const user = await prisma.wallet.findUnique({
        //   where: { address: walletAddress },
        //   select: { userId: true },
        // });
        // if (!user) {
        //   return NextResponse.json(
        //     { message: 'User not found for this wallet address' },
        //     { status: 404 },
        //   );
        // }
        // Add a new comment to the standalone job
        const comment = await prisma.standaloneJobComment.create({
          data: {
            text,
            userId: session.user.id,
            standaloneJobFormId: jobId,
          },
        });
        return NextResponse.json(comment);
      } catch (error) {
        console.error('Error adding comment to standalone Job Id:', error);
        return NextResponse.json(
          { message: 'Failed to add comment to standalone job.' },
          { status: 500 },
        );
      }
    } else {
      // Validate required fields for new job form creation
      if (
        !githubUsername ||
        !email ||
        !description ||
        !deliverables ||
        !weightsRequested ||
        !walletAddress ||
        !minimumWeightsTime ||
        !mriNumber
      ) {
        return NextResponse.json(
          { message: 'Please fill in all required fields.' },
          { status: 400 },
        );
      }

      // Create a new StandaloneJobForm entry
      const newJobForm = await prisma.standaloneJobForm.create({
        data: {
          githubUsername,
          email,
          description,
          deliverables,
          weightsRequested,
          walletAddress,
          minimumWeightsTime: parseInt(minimumWeightsTime, 10),
          status: 'pending',
          user: { connect: { id: session.user.id } },
          category: { connect: { id: parseInt(mriNumber, 10) } },
        },
      });

      const rowData = [
        newJobForm.githubUsername,
        newJobForm.email,
        mriNumber,
        newJobForm.deliverables,
        newJobForm.weightsRequested,
        newJobForm.description,
        newJobForm.walletAddress,
        new Date().toISOString(),
      ];

      const headers = [
        'GitHub Username',
        'Email',
        'MRI Number',
        'Deliverables',
        'Weights Requested',
        'Description',
        'Wallet Address',
        'Timestamp',
      ];

      // Append the rowData to the Google Sheet
      try {
        await appendToSheet(rowData, 'StandaloneJobForms');
        console.log('Data appended successfully to Google Sheet!');
      } catch (error) {
        console.error('Error appending data to Google Sheet:', error);
      }

      // Notify maintainers of the new job form creation
      const maintainers = await prisma.maintainer.findMany({
        where: {
          categories: {
            some: { categoryId: parseInt(mriNumber, 10) },
          },
        },
        select: {
          id: true,
          wallet: {
            select: {
              user: { select: { id: true } },
            },
          },
        },
      });

      if (newJobForm.id) {
        await Promise.all(
          maintainers.map((maintainer) =>
            notifyStandaloneJobFormCreation(maintainer.wallet?.user?.id, newJobForm.githubUsername),
          ),
        );
      }

      return NextResponse.json(newJobForm, { status: 200 });
    }
  } catch (error) {
    console.error('Error submitting proposal:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit the proposal.' },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, status, walletAddress } = data;

    if (!id || !status || !walletAddress) {
      return NextResponse.json(
        { message: 'Standalone ID, status, and wallet address are required' },
        { status: 400 },
      );
    }

    // Fetch the proposal by ID to get its categoryId and userId
    const proposal = await prisma.standaloneJobForm.findUnique({
      where: { id: id },
      select: { categoryId: true, userId: true },
    });

    if (!proposal) {
      return NextResponse.json({ message: 'Standalone job not found' }, { status: 404 });
    }

    // Check if the wallet is a maintainer for this category
    const isMaintainer = await prisma.maintainerCategory.findFirst({
      where: {
        maintainer: { wallet: { address: walletAddress } },
        categoryId: proposal.categoryId,
      },
    });

    if (!isMaintainer) {
      return NextResponse.json(
        { message: 'Unauthorized: You do not have permission to update this standalone job' },
        { status: 403 },
      );
    }

    // Update the proposal status
    const updatedProposal = await prisma.standaloneJobForm.update({
      where: { id: id },
      data: { status },
    });

    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error('Error updating standalone job status:', error);
    return NextResponse.json(
      { message: 'Failed to update standalone job status.' },
      { status: 500 },
    );
  }
}
