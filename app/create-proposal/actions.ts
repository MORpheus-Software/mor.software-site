'use server';
import { auth } from '@/auth';
import prisma from '../../lib/prisma'; // Adjust the path to your prisma client

export async function submitProposal(formData: FormData) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    // Extract data from the form
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const mri = formData.get('mri') as string;
    const categoryId = parseInt(formData.get('categoryId') as string, 10); // Get the categoryId

    // Gather deliverables
    const deliverables = Array.from(formData.entries())
      .filter(([key]) => key.startsWith('deliverable-'))
      .map(([, value]) => ({ description: value as string }));

    // Create a new proposal with associated deliverables and category
    await prisma.proposal.create({
      data: {
        title,
        description,
        mri,
        status:'closed',
        user: { connect: { id: session.user.id } },
        category: { connect: { id: categoryId } }, // Correctly associate the category
        deliverables: {
          create: deliverables,
        },
      },
    });

    return { success: true, message: 'Proposal submitted successfully!' };
  } catch (error) {
    console.error('Error submitting proposal:', error);
    return { success: false, message: 'Failed to submit the proposal.' };
  }
}
