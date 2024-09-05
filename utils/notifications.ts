// utils/notifications.ts
import prisma from '@/lib/prisma'; // Adjust the import path to your prisma client

export async function createNotification(userId: string, proposalId: number, message: string) {
  await prisma.notification.create({
    data: {
      userId,
      proposalId,
      message,
    },
  });
}
