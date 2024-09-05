'use server';

import prisma from '@/lib/prisma';

import { auth } from '@/auth';

export async function getNotificationsByUserId(userId: any) {
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
