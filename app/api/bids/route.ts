import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const {
    proposalId,
    githubUsername,
    email,
    mriNumber,
    description,
    walletAddress,
    minimumWeightsTime,
    deliverables, // Directly destructure deliverables from the body
  } = await req.json();

  // Create the BidForm first
  const bidForm = await prisma.bidForm.create({
    data: {
      githubUsername,
      email,
      mriNumber: mriNumber ?? 'null',
      walletAddress,
      // minimumWeightsTime,
      user: { connect: { id: session.user.id } },
    },
  });

  // Create the deliverables linked to the BidForm
  await Promise.all(
    deliverables.map((deliverable: any) =>
      prisma.bidFormDeliverable.create({
        data: {
          bidFormId: bidForm.id,
          deliverableId: deliverable.id,
          weightsRequested: deliverable.weightRequested,
          deliverableDescription: deliverable.description,
          minimumWeightsTime: deliverable.minimumWeightsTime,
          description: deliverable.deliverableDescription,
        },
      }),
    ),
  );

  return new Response('Bid submitted successfully', { status: 200 });
}
