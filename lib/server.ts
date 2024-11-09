'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import parsePhoneNumberFromString from 'libphonenumber-js';

/**
 * Updates the user's phone number in the database.
 *
 * @param {string} userId - The ID of the user whose phone number is being updated.
 * @param {string} newPhoneNumber - The new phone number to be validated and saved.
 * @returns {Promise<object | void>} - Returns the updated user object or an error message if validation fails.
 */
export async function updatePhoneNumber(newPhoneNumber: string) {
  if (!newPhoneNumber) {
    return { error: 'Phone number is required.' };
  }

  console.log(newPhoneNumber);

  const user = await getCurrentUser();

  // Check if user retrieval resulted in an error
  if (!user || 'error' in user) {
    return { error: 'User is not authenticated or not found.' };
  }

  // Parse and validate the phone number using libphonenumber-js
  const phoneNumberParsed = parsePhoneNumberFromString(newPhoneNumber, 'US'); // Adjust country code as needed

  if (!phoneNumberParsed || !phoneNumberParsed.isValid()) {
    return { error: 'Please enter a valid phone number.' };
  }

  try {
    // Update the user's phone number in the database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { phoneNumber: phoneNumberParsed.format('E.164') },
    });

    return updatedUser;
  } catch (error) {
    console.error('Error updating phone number:', error);
    return { error: 'Failed to update phone number.' };
  }
}

/**
 * Retrieves the current user's data, including the phone number.
 *
 * @returns {Promise<object | void>} - Returns the current user data.
 */
export async function getCurrentUser() {
  const session = await auth(); // Assuming you have a method to get the authenticated session
  if (!session?.user?.id) {
    return { error: 'User is not authenticated.' };
  }

  try {
    // Fetch the current user data from the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      return { error: 'User not found.' };
    }

    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return { error: 'Failed to fetch user data.' };
  }
}

export async function getNotificationsByUserId(userId: string) {
  if (!userId) {
    return;
  }
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10, // Limit to the last 10 notifications
  });
}

export async function markNotificationsAsRead(userId: string) {
  const response = await prisma.notification.updateMany({
    where: {
      userId: userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
  return response;
}

export async function exportData(
  type: string,
  startDate: string,
  endDate: string,
  categoryIds: number[],
): Promise<string> {
  let data;

  // Parse start and end dates
  const start = new Date(startDate);
  let end = new Date(endDate);

  // If endDate is today, set the end date to the current time
  const today = new Date();
  if (
    end.getFullYear() === today.getFullYear() &&
    end.getMonth() === today.getMonth() &&
    end.getDate() === today.getDate()
  ) {
    end = new Date(); // Set end to the current date and time
  }

  // Fetch data based on type and timeframe
  switch (type) {
    case 'proofContribution':
      data = await prisma.proofContribution.findMany({
        where: {
          categoryId: { in: categoryIds },
          createdAt: { gte: start, lte: end },
        },
      });
      data = formatProofOfContribution(data);
      break;
    case 'standaloneJobForm':
      data = await prisma.standaloneJobForm.findMany({
        where: {
          categoryId: { in: categoryIds },
          createdAt: { gte: start, lte: end },
        },
      });
      data = formatStandaloneJobs(data);
      break;
    case 'proposals':
      data = await prisma.proposal.findMany({
        include: {
          user: true,
          deliverables: true,
        },
        where: {
          categoryId: { in: categoryIds },
          createdAt: { gte: start, lte: end },
        },
      });
      data = formatMRC(data);
      break;
    case 'mrcjobs':
      data = await prisma.jobFormDeliverable.findMany({
        where: {
          deliverable: {
            proposal: {
              categoryId: { in: categoryIds },
            },
          },
        },
        include: {
          jobForm: true,
          deliverable: {
            include: {
              proposal: true,
            },
          },
        },
      });
      data = formatMRCJobs(data);
      break;
    default:
      throw new Error('Invalid type');
  }

  // Convert data to CSV format
  return objectToCsv(data);
}

const formatMRCJobs = (data: any[]) => {
  return data.map((item) => ({
    id: item.id,
    mrcId: item.deliverable.proposalId,
    githubUsername: item.jobForm.githubUsername,
    email: item.jobForm.email,
    description: item.description,
    requestedDeliverable: item.deliverable.description,
    deliverableDescription: item.deliverableDescription,
    weightsRequested: item.weightsRequested,
    minimumWeightsTime: item.minimumWeightsTime,
    walletAddress: item.jobForm.walletAddress,
    status: item.jobForm.status,
    createdAt: item.jobForm.createdAt,
  }));
};
const formatMRC = (data: any[]) => {
  let maxDeliverable = 0;
  data.forEach((item) => {
    if (item.deliverables.length > maxDeliverable) {
      maxDeliverable = item.deliverables.length;
    }
  });
  return data.map((item) => {
    const toFormat: any = {
      id: item.id,
      githubUsername: item.githubUsername,
      email: item.user.email,
      title: item.title,
      MRI: item.mri,
      status: item.status,
      description: item.description,
      createdAt: item.createdAt,
    };
    for (let i = 0; i < maxDeliverable; i++) {
      toFormat[`Deliverable ${i + 1}`] = '';
    }
    item.deliverables.forEach((deliverable: { description: any }, index: any) => {
      toFormat[`Deliverable ${index + 1}`] = deliverable.description;
    });
    return toFormat;
  });
};
const formatProofOfContribution = (data: any[]) => {
  return data.map((item) => ({
    id: item.id,
    githubUsername: item.githubUsername,
    email: item.email,
    MRINumber: item.mriNumber,
    linksToProof: item.linksToProof,
    weightsAgreed: item.weightsAgreed,
    walletAddress: item.walletAddress,
    status: item.status,
    description: item.description,
    createdAt: item.createdAt,
  }));
};
const formatStandaloneJobs = (data: any[]) => {
  return data.map((item) => ({
    id: item.id,
    userId: item.userId,
    githubUsername: item.githubUsername,
    email: item.email,
    MRINumber: item.categoryId,
    description: item.description,
    deliverables: item.deliverables,
    weightsRequested: item.weightsRequested,
    walletAddress: item.walletAddress,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
};

const objectToCsv = function (data: any[]) {
  const csvRows = [];
  const headers = Object.keys(data[0]);

  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      return `"${val}"`;
    });

    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};
