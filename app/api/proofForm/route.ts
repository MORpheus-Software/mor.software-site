import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; // Adjust the path as needed
import { auth } from '@/auth';
import { notifyProofOfContributionCreation } from '@/utils/notifications';
import { appendToSheet } from '@/utils/googlesheets';

export async function POST(request: NextRequest) {
  const session = await auth();

  // Check if the user is authenticated
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      githubUsername,
      email,
      mriNumber,
      linksToProof,
      weightsAgreed,
      description,
      walletAddress,
    } = body;

    // Validate all required fields
    if (
      !githubUsername ||
      !email ||
      !mriNumber ||
      !linksToProof ||
      !weightsAgreed ||
      !description ||
      !walletAddress
    ) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    // If the user does not exist, return an error response
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const contribution = await prisma.proofContribution.create({
      data: {
        githubUsername,
        email,
        mriNumber,
        linksToProof,
        weightsAgreed,
        description,
        walletAddress,
        user: { connect: { id: session.user.id } },
        category: { connect: { id: parseInt(mriNumber, 10) } },
      },
    });

    // Create headers and row data
    const headers = [
      'GitHub Username',
      'Email',
      'MRI Number',
      'Links to Proof',
      'Weights Agreed',
      'Description',
      'Wallet Address',
      'Timestamp',
    ];

    const rowData = [
      githubUsername,
      email,
      mriNumber,
      linksToProof,
      weightsAgreed,
      description,
      walletAddress,
      new Date().toISOString(), // Add timestamp or any other relevant data
    ];

    // Append the headers and data to the Google Sheet
    try {
      // Append the data
      await appendToSheet(rowData);
      console.log('Data appended to Google Sheet successfully.');
    } catch (error) {
      console.error('Error appending data to Google Sheet:', error);
    }

    const maintainers = await prisma.maintainer.findMany({
      where: {
        categories: {
          some: {
            categoryId: parseInt(mriNumber, 10),
          },
        },
      },
      select: {
        id: true,
        wallet: {
          select: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (contribution.id) {
      await Promise.all(
        maintainers.map((maintainer) =>
          notifyProofOfContributionCreation(
            maintainer.wallet?.user?.id,
            contribution.githubUsername,
          ),
        ),
      );
    }

    return NextResponse.json(
      { message: 'Form submitted successfully', contribution },
      { status: 200 },
    );
  } catch (error) {
    console.error('Failed to submit the form:', error);
    return NextResponse.json({ error: 'Failed to submit the form' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, status, walletAddress } = await req.json();

    // Validate required fields
    if (!id || !status || !walletAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the wallet associated with the wallet address
    const wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress },
      include: {
        maintainers: {
          include: {
            categories: true, // Include categories managed by the maintainer
          },
        },
      },
    });

    if (!wallet || wallet.maintainers.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch the proof contribution
    const proofContribution = await prisma.proofContribution.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!proofContribution) {
      return NextResponse.json({ error: 'Proof Contribution not found' }, { status: 404 });
    }

    // Check if the maintainer is authorized to update this proof contribution
    const maintainerCategories = wallet.maintainers.flatMap((maintainer) =>
      maintainer.categories.map((mc) => mc.categoryId),
    );

    if (!maintainerCategories.includes(proofContribution.categoryId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the status of the proof contribution
    const updatedProofContribution = await prisma.proofContribution.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ updatedProofContribution }, { status: 200 });
  } catch (error) {
    console.error('Error updating Proof Contribution status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
