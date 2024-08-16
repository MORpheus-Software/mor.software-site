"use server";
import prisma from "../../lib/prisma"; // Adjust the path to your prisma client

export async function submitProposal(formData: FormData) {
  try {
    // Extract data from the form
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const mri = formData.get("mri") as string;

    // Gather deliverables
    const deliverables = Array.from(formData.entries())
      .filter(([key]) => key.startsWith("deliverable-"))
      .map(([, value]) => ({ description: value as string }));

    // Create a new proposal with associated deliverables
    await prisma.proposal.create({
      data: {
        title,
        description,
        mri,
        deliverables: {
          create: deliverables,
        },
      },
    });

    // Return a success response
    return { success: true, message: "Proposal submitted successfully!" };
  } catch (error) {
    // Return an error response
    return { success: false, message: "Failed to submit the proposal." };
  }
}
