// app/proposals/page.tsx
import Button from '@/components/button';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function ProposalsPage() {
  const openProposals = await prisma.proposal.findMany({
    where: {
      status: 'approved',
    },
    include: {
      user: true,
      deliverables: true, // include deliverables if you want to display them
    },
  });

  return (
    <div className="mx col-span-12 max-w-3xl rounded-2xl border border-borderTr bg-morBg p-4 shadow sm:mx-auto sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="mb-0 text-2xl font-semibold">Open MRCs</h1>
        <Link href="/create-proposal">
          <Button text="+ NEW MRC" />
        </Link>
      </div>{' '}
      <ul>
        {openProposals.map((proposal) => (
          <li
            key={proposal.id}
            className="my-3 flex flex-col gap-1 rounded border border-neutral-600 bg-black p-5 hover:bg-neutral-900"
          >
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col gap-2">
                <h2 className="mb-0 text-xl font-bold">{proposal.title}</h2>
                <p>Submitted by: {proposal.user.name}</p>
                <p>Category: {proposal.mri}</p>
              </div>

              <Link legacyBehavior href={`/proposals/${proposal.id}`}>
                <a className="text-blue-500 underline">View MRC</a>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
