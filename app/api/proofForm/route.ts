import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; // Adjust the path as needed

export async function POST(request: NextRequest) {
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
      userId,
    } = body;

    // Validate all required fields
    if (
      !githubUsername ||
      !email ||
      !mriNumber ||
      !linksToProof ||
      !weightsAgreed ||
      !description ||
      !walletAddress ||
      !userId
    ) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // If the user does not exist, return an error response
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Save the contribution data to the database
    const contribution = await prisma.proofContribution.create({
      data: {
        githubUsername,
        email,
        mriNumber,
        linksToProof,
        weightsAgreed,
        description,
        walletAddress,
        user: { connect: { id: userId } },
      },
    });

    return NextResponse.json(
      { message: 'Form submitted successfully', contribution },
      { status: 200 },
    );
  } catch (error) {
    console.error('Failed to submit the form:', error);
    return NextResponse.json({ error: 'Failed to submit the form' }, { status: 500 });
  }
}
