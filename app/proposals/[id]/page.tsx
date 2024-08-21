import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BidForm from './bidform';
import Button from '@/components/button';
import ReactMarkdown from 'react-markdown';

export default async function ProposalDetailPage({ params }: { params: { id: string } }) {
  const proposal = await prisma.proposal.findUnique({
    where: { id: parseInt(params.id) },
    include: { deliverables: true },
  });

  if (!proposal) {
    notFound();
  }

  const bidForms = await prisma.bidForm.findMany({
    where: { deliverables: { some: { deliverable: { proposalId: proposal.id } } } },
    include: {
      user: true,
      deliverables: {
        include: {
          deliverable: true,
        },
      },
    },
  });

  return (
    <div className="mx col-span-12 max-w-3xl rounded-2xl border border-borderTr bg-morBg p-4 shadow sm:mx-auto sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="mb-0 text-2xl font-semibold">Submit Bid</h1>
        <Link href="/">
          <Button text="Go Back" />
        </Link>
      </div>

      <div className="mx col-span-12 flex max-w-3xl flex-col justify-center rounded-2xl border border-borderTr bg-morBg p-4 shadow sm:mx-auto sm:p-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <h1 className="mt-0 text-2xl font-bold">{proposal.title}</h1>
            <h1 className="mt-0 text-base font-bold">{proposal.mri}</h1>
          </div>

          <div className="flex flex-col">
            <h3 className="mt-4 text-xl font-semibold">Description:</h3>
            <div className="text-sm text-gray-300">
              <div>
                <ReactMarkdown>{proposal.description}</ReactMarkdown>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="mt-4 text-xl font-semibold">Deliverables:</h3>
            <ul>
              {proposal.deliverables.map((deliverable) => (
                <li key={deliverable.id} className="mt-2">
                  {deliverable.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <h3 className="my-6 mt-6 text-center text-2xl font-semibold text-white">Submit Your Bid</h3>

      {/* Pass the deliverables array to the BidForm component */}
      <BidForm proposalId={proposal.id} deliverables={proposal.deliverables} />

      <h3 className="my-6 mt-6 text-center text-2xl font-semibold text-white">Submitted Bids</h3>

      {/* Display all submitted bids */}
      <div>
        {bidForms.length > 0 ? (
          bidForms.map((bid) => (
            <div key={bid.id} className="mb-6 rounded-lg border border-gray-600 p-4">
              <h4 className="font-semibold">Bid by {bid.user.name || bid.githubUsername}</h4>
              <p>Email: {bid.email}</p>
              <h5 className="mt-2 font-semibold">Deliverables:</h5>
              <ul>
                {bid.deliverables.map((deliverable) => (
                  <li key={deliverable.id} className="mt-2">
                    <p>
                      <strong>Description:</strong> {deliverable.description}
                    </p>
                    <p>
                      <strong>Deliverable Description:</strong> {deliverable.deliverableDescription}
                    </p>
                    <p>
                      <strong>Weights Requested:</strong> {deliverable.weightsRequested}
                    </p>
                    <p>
                      <strong>Minimum Weights Time:</strong> {deliverable.minimumWeightsTime}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>No bids have been submitted yet.</p>
        )}
      </div>
    </div>
  );
}
