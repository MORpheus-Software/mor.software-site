// utils/notifications.ts
import prisma from '@/lib/prisma';
import { sendSMS,sendEmail } from '@/lib/twilio';

type NotificationType =
  | 'ProposalStatusChanged'
  | 'ProposalCommentAdded'
  | 'JobStatusChanged'
  | 'JobCommentAdded'
  | 'NewProposalSubmitted'
  | 'NewJobSubmitted'
  | 'JobFormStatusChanged'
  | 'NewProofOfContributionSubmitted'
  | 'NewStandaloneJobFormSubmitted'
  | 'JobFormCommentAdded';

interface CreateNotificationParams {
  userId: string;
  proposalId?: number;
  jobFormId?: string;
  message: string;
  type: NotificationType;
}

const notificationDescriptions: Record<NotificationType, string> = {
  ProposalStatusChanged: 'The status of the proposal has been updated - Morpheus',
  ProposalCommentAdded: 'A new comment has been added to the proposal - Morpheus',
  JobStatusChanged: 'The status of your job has changed - Morpheus',
  JobCommentAdded: 'A new comment has been added to the job - Morpheus',
  NewProposalSubmitted: 'A new proposal has been submitted - Morpheus',
  NewJobSubmitted: 'A new job has been submitted - Morpheus',
  JobFormStatusChanged: 'Your attached job form status has been updated - Morpheus',
  NewProofOfContributionSubmitted: 'A new proof of contribution has been submitted - Morpheus',
  NewStandaloneJobFormSubmitted: 'A new standalone job proposal has been submitted - Morpheus',
  JobFormCommentAdded: 'A new comment has been added to your standalone job - Morpheus',
};




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

  // Fetch user contact details and maintainer information from the database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallets: { include: { maintainers: true } } },
  });

  console.log(user);
  
  // If user contact details exist, send notifications
  if (user) {
    // Check if user is a maintainer
    const isMaintainer = user.wallets.some((wallet) => wallet.maintainers.length > 0);

    // Send SMS only if the user is a maintainer
    // if (isMaintainer && user.phoneNumber && isValidPhoneNumber(user.phoneNumber)) {
    //   await sendSMS(user.phoneNumber, message);
    // }

    // // Send email regardless of whether the user is a maintainer
    // if (user.email) {
    //   await sendEmail(user.email, `${notificationDescriptions[type]}`, message);
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

// Notify users maintainers standalonde job forms
export async function notifyStandaloneJobFormCreation(maintainerId: string, jobId: string) {
  await createNotification({
    userId: maintainerId,
    message: `A new standalone job by ${jobId} has been submitted.`,
    type: 'NewStandaloneJobFormSubmitted',
  });
}

export async function notifyProofOfContributionCreation(maintainerId: string, jobId: string) {
  await createNotification({
    userId: maintainerId,
    message: `A new proof of contribution by ${jobId} has been submitted.`,
    type: 'NewProofOfContributionSubmitted',
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
