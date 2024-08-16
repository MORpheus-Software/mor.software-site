import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma"; // Adjust the path based on your structure
import { auth } from "@/auth";

export async function POST(req: Request) {
  let session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const {
    proposalId,
    githubUsername,
    email,
    mriNumber,
    description,
    deliverables,
    weightsRequested,
    walletAddress,
    minimumWeightsTime,
    ...deliverableDescriptions
  } = await req.json();


  const filteredDeliverables = Object.keys(deliverableDescriptions)
  .filter((key) => key.startsWith("deliverable-"))
  .map((key) => ({
    id: parseInt(key.split("-")[1], 10), // Extract the deliverable ID
    description: deliverableDescriptions[key] // Extract the corresponding description
  }));


  // Create the BidForm first
  const bidForm = await prisma.bidForm.create({
    data: {
      githubUsername,
      email,
      mriNumber:'null',
      description,
      deliverables,
      deliverableDescriptions: filteredDeliverables,
      weightsRequested,
      walletAddress,
      minimumWeightsTime,
      user: { connect: { id: session?.user.id } },
    //   userId: session?.user.id,
    },
  });

  // Create or update deliverables related to this BidForm
  for (const key in deliverableDescriptions) {
    if (key.startsWith("deliverable-")) {
      const deliverableId = parseInt(key.split("-")[1]);
      const deliverableDescription = deliverableDescriptions[key];

      // Check if the deliverable already exists
      }  }

  return new Response("Bid submitted successfully", { status: 200 });
}
