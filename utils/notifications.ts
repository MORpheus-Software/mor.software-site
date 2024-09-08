// utils/notifications.ts
import prisma from '@/lib/prisma';
import { sendSMS } from '@/lib/twilio';

type NotificationType =
  | 'ProposalStatusChanged'
  | 'ProposalCommentAdded'
  | 'JobStatusChanged'
  | 'JobCommentAdded'
  | 'NewProposalSubmitted'
  | 'NewJobSubmitted'
  | 'JobFormStatusChanged'
  | 'JobFormCommentAdded';

interface CreateNotificationParams {
  userId: string;
  proposalId?: number;
  jobFormId?: string;
  message: string;
  type: NotificationType;
}


const phoneNumberPattern = /^\+?[1-9]\d{1,14}$/;

function isValidPhoneNumber(phoneNumber:string) {
    return phoneNumberPattern.test(phoneNumber);
}



export async function createNotification({
  userId,
  proposalId,
  jobFormId,
  message,
  type,
}: CreateNotificationParams) {
  // Save notification to the database
  await prisma.notification.create({
    data: {
      userId,
      proposalId,
      jobFormId,
      message,
      type,
    },
  });

  // Fetch user contact details from the database
  const user = await prisma.user.findUnique({ where: { id: userId } });

  console.log(user)
  // If user contact details exist, send notifications
  if (user) {
    if (user.phoneNumber) {
      await sendSMS(user.phoneNumber, message);
    }
    // await sendSMS('+995557786556', message);

    // if (user.email) {
    //   await sendEmail(user.email, `Notification: ${type}`, message);
    // }
  }
}

// Notify users about proposals
export async function notifyProposalStatusChanged(userId: string, proposalId: number,title:string) {
  await createNotification({
    userId,
    proposalId,
    message: `The status of proposal "${title}" has been updated.`,
    type: 'ProposalStatusChanged',
  });
}

export async function notifyProposalCommentAdded(userId: string, proposalId: number,  title:string) {
  await createNotification({
    userId,
    proposalId,
    message: `A new comment has been added to proposal "${title}".`,
    type: 'ProposalCommentAdded',
  });
}


// Notify maintainers about proposals
export async function notifyNewProposalSubmitted(maintainerId: string, proposalId: number, title:string) {
  await createNotification({
    userId: maintainerId,
    proposalId,
    message: `A new proposal "${title}" has been submitted.`,
    type: 'NewProposalSubmitted',
  });
}

// Notify maintainers about jobs
export async function notifyNewJobSubmitted(maintainerId: string, jobId: string) {
  await createNotification({
    userId: maintainerId,
    message: `A new job by ${jobId} has been submitted.`,
    type: 'NewJobSubmitted',
  });
}


// Notify users about job forms
export async function notifyJobFormStatusChanged(userId: string, jobFormId: string, status:string) {
  await createNotification({
    userId,
    jobFormId,
    message: `You job form has been ${status}.`,
    type: 'JobFormStatusChanged',
  });
}

export async function notifyJobFormCommentAdded(userId: string, jobFormId: string) {
  await createNotification({
    userId,
    jobFormId,
    message: `A new private comment has been added to your job form`,
    type: 'JobFormCommentAdded',
  });
}
