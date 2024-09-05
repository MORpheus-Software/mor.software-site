// utils/notifications.ts
import prisma from '@/lib/prisma';

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

export async function createNotification({
  userId,
  proposalId,
  jobFormId,
  message,
  type,
}: CreateNotificationParams) {
  await prisma.notification.create({
    data: {
      userId,
      proposalId,
      jobFormId,
      message,
      type,
    },
  });
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

// Notify users about jobs
export async function notifyJobStatusChanged(userId: string, jobId: string) {
  await createNotification({
    userId,
    message: `The status of job #${jobId} has changed.`,
    type: 'JobStatusChanged',
  });
}

export async function notifyJobCommentAdded(userId: string, jobId: string) {
  await createNotification({
    userId,
    message: `A new comment has been added to job #${jobId}.`,
    type: 'JobCommentAdded',
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

// Notify maintainers about comments
export async function notifyMaintainerProposalCommentAdded(maintainerId: string, proposalId: number,title:string) {
  await createNotification({
    userId: maintainerId,
    proposalId,
    message: `A new comment has been added to proposal "${title}".`,
    type: 'ProposalCommentAdded',
  });
}

export async function notifyMaintainerJobCommentAdded(maintainerId: string, jobId: string) {
  await createNotification({
    userId: maintainerId,
    message: `A new comment has been added to job #${jobId}.`,
    type: 'JobCommentAdded',
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
