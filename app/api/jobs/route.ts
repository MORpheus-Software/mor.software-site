import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { notifyNewJobSubmitted } from '@/utils/notifications';

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
    categoryId,
    description,
    walletAddress,
    minimumWeightsTime,
    deliverables, // Directly destructure deliverables from the body
  } = await req.json();

  // Create the JobForm first
  const jobForm = await prisma.jobForm.create({
    data: {
      githubUsername,
      email,
      mriNumber: categoryId ?? 'null',
      walletAddress,
      // minimumWeightsTime,
      user: { connect: { id: session.user.id } },
    },
  });


  const maintainers = await prisma.maintainer.findMany({
    where: {
      categories: {
        some: {
          categoryId: categoryId, 
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


  await Promise.all(
    maintainers.map((maintainer) =>

      notifyNewJobSubmitted(maintainer.wallet?.user?.id, jobForm.githubUsername)
    )
  );
  


  // Create the deliverables linked to the JobForm
  await Promise.all(
    deliverables.map((deliverable: any) =>
      prisma.jobFormDeliverable.create({
        data: {
          jobFormId: jobForm.id,
          deliverableId: deliverable.id,
          weightsRequested: deliverable.weightRequested,
          deliverableDescription: deliverable.description,
          minimumWeightsTime: deliverable.minimumWeightsTime,
          description: deliverable.deliverableDescription,
        },
      }),
    ),
  );



  return new Response('Job submitted successfully', { status: 200 });
}
