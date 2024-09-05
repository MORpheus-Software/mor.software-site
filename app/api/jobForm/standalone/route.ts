'use server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
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
    console.log(data);
    const {
      githubUsername,
      email,
      description,
      deliverables,
      weightsRequested,
      walletAddress,
      minimumWeightsTime,
      mriNumber,
    } = data;

    console.log(mriNumber);

    // Validate required fields
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
      return NextResponse.json({ message: 'Please fill in all required fields.' }, { status: 400 });
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
        category: { connect: { id: parseInt(mriNumber, 10) } }, // Ensure mriNumber is correctly parsed as an integer
      },
    });

    return NextResponse.json(newJobForm, { status: 201 });
  } catch (error) {
    console.error('Error submitting proposal:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit the proposal.' },
      { status: 500 },
    );
  }
}
