// app/proposals/page.tsx
import prisma  from "@/lib/prisma"; // adjust the path based on your structure
import Link from "next/link";

export default async function ProposalsPage() {
  const openProposals = await prisma.proposal.findMany({
    where: {
      status: "open",
    },
    include: {
      deliverables: true, // include deliverables if you want to display them
    },
  });

  return (
    <div className="col-span-12 p-4 mx sm:mx-auto sm:p-6 shadow bg-morBg rounded-2xl max-w-3xl border border-borderTr">
      <h1 className="text-2xl font-semibold">Open Proposals</h1>
      <ul>
        {openProposals.map((proposal) => (
          <li key={proposal.id} className="border border-neutral-600 p-5 flex flex-col my-3 gap-1 hover:bg-neutral-900 rounded bg-black">

          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col gap-2"> 
            <h2 className="text-xl font-bold mb-0">{proposal.title}</h2>
            <p>{proposal.description}</p>
            </div>


            <Link legacyBehavior href={`/proposals/${proposal.id}`}>
              <a className="text-blue-500 underline">View Proposal</a>
            </Link>


            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
