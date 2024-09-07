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
