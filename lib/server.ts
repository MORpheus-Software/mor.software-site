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
      break;
    case 'standaloneJobForm':
      data = await prisma.standaloneJobForm.findMany({
        where: {
          categoryId: { in: categoryIds },
          createdAt: { gte: start, lte: end },
        },
      });
      break;
    case 'proposals':
      data = await prisma.proposal.findMany({
        where: {
          categoryId: { in: categoryIds },
          createdAt: { gte: start, lte: end },
        },
      });
      break;
    default:
      throw new Error('Invalid type');
  }

  // Convert data to CSV format
  return convertToCSV(data);
}

// Convert data to CSV format
function convertToCSV(data: any[]): string {
  if (!data.length) return '';
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map((row) => Object.values(row).join(','));
  return [headers, ...rows].join('\n');
}

// export async function getParentProposalFromJob(commentId: string) {
//   const comment = await prisma.proposalComment.findUnique({
//     where: {
//       id: 'cm1gpstgf0008zjn13qu60umu', // Your comment ID
//     },
//   });

//   console.log(comment); // Check if this returns the comment

//   // Return the ID of the parent StandaloneJobForm, if it exists
//   return null
// }
