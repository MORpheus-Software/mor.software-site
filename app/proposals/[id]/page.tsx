// app/proposals/[id]/page.tsx
import prisma from "@/lib/prisma"; // adjust the path based on your structure
import { notFound } from "next/navigation";
import Link from "next/link";
import BidForm from "./bidform";
import Button from "@/components/button";

export default async function ProposalDetailPage({ params }: { params: { id: string } }) {
  const proposal = await prisma.proposal.findUnique({
    where: { id: parseInt(params.id) },
    include: { deliverables: true },
  });

  if (!proposal) {
    notFound();
  }

  return (
    <div className="col-span-12 p-4 mx sm:mx-auto sm:p-6 shadow bg-morBg rounded-2xl max-w-3xl border border-borderTr">
      
      <div className="flex justify-between items-center mb-6 ">
        <h1 className="text-2xl font-semibold mb-0">Submit Bid</h1>
        <Link href="/">
          <Button text="Go Back" />
        </Link>
      </div>

      <div className="flex flex-col justify-center col-span-12 p-4 mx sm:mx-auto sm:p-6 shadow bg-morBg rounded-2xl max-w-3xl border border-borderTr"> 

      <div className="flex flex-col gap-2 "> 
      <div className="flex flex-col"> 
      <h1 className="text-2xl font-bold mt-0">{proposal.title}</h1>
      {/* <p className="text-gray-500 mt-2">{proposal.description}</p> */}
      </div>

      <div className="flex flex-col"> 

      <h3 className="text-xl mt-4 font-semibold">Deliverables:</h3>
      <ul>
        {proposal.deliverables.map((deliverable) => (
          <li key={deliverable.id} className="mt-2">
            {deliverable.description}
          </li>
        ))}
      </ul>
      </div></div>

      </div>

      <h3 className="mt-6 font-semibold my-6 text-center text-white text-2xl">Submit Your Bid</h3>

      {/* Pass the deliverables array to the BidForm component */}
      <BidForm proposalId={proposal.id} deliverables={proposal.deliverables} />
    </div>
  );
}
