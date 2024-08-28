// app/proposals/[id]/page.tsx

import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BidForm from './bidform';
import Button from '@/components/button';
import ReactMarkdown from 'react-markdown';
import 'easymde/dist/easymde.min.css';
import '@/app/styles/custom-mde.css';

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
            <h3 className="mt-4 text-xl font-semibold text-white">Description:</h3>
            <div className="markdown-body text-sm text-gray-300">
              <ReactMarkdown>{proposal.description}</ReactMarkdown>
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="mt-4 text-xl font-semibold text-white">Deliverables:</h3>
            <ul className="markdown-body">
              {proposal.deliverables.map((deliverable) => (
                <li key={deliverable.id} className="mt-2">
                  <ReactMarkdown>{deliverable.description}</ReactMarkdown>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <h3 className="my-10 text-center text-2xl font-semibold text-white">Submit Your Bid</h3>

      {/* Pass the deliverables array to the BidForm component */}
      <BidForm proposalId={proposal.id} deliverables={proposal.deliverables} />

      <h3 className="my-6 mt-6 text-center text-2xl font-semibold text-white">Submitted Bids</h3>

      {/* Display all submitted bids */}
      <div>
        {bidForms.length > 0 ? (
          bidForms.map((bid) => (
            <div key={bid.id} className="mb-6 rounded-lg border border-gray-600 p-4">

              <div className='flex flex-row justify-between w-full' > 
              <h4 className="font-semibold">Bid by {bid.user.name || bid.githubUsername}</h4>

              <h4 className="font-semibold">
  Status:{" "}
  <span
    className={`${
      bid.status === "pending"
        ? "bg-yellow-500 text-white"
        : bid.status === "approved"
        ? "bg-green-500 text-white"
        : "bg-red-500 text-white"
    } px-2 py-1 rounded-sm text-sm`}
  >
    {bid.status}
  </span>
</h4>


              </div>


              <p>Email: {bid.email}</p>
              <h5 className="mt-2 font-semibold">Deliverables:</h5>
              <ul className="markdown-body">
                {bid.deliverables.map((deliverable) => (
                  <li key={deliverable.id} className="mt-2">
                    <div className="flex flex-col">
                      <strong>Bid for weights description:</strong>
                      <ReactMarkdown>{deliverable.deliverableDescription}</ReactMarkdown>
                    </div>
                    <div className="mt-2 flex flex-col">
                      <strong>End of month deliverables:</strong>
                      <ReactMarkdown>{deliverable.description}</ReactMarkdown>
                    </div>
                    <div className="mt-2 flex flex-col">
                      <strong>Weights Requested:</strong>
                      <span>{deliverable.weightsRequested}</span>
                    </div>
                    <div className="mt-2 flex flex-col">
                      <strong>Minimum Weights Time:</strong>
                      <span>{deliverable.minimumWeightsTime}</span>
                    </div>
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
