import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; // Adjust the path as needed
import { notifyJobFormStatusChanged } from '@/utils/notifications';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const jobForms = await prisma.jobForm.findMany({
      where: {
        userId: uid,
      },
      include: {
        deliverables: true, // Include related deliverables
      },
    });

    return NextResponse.json(jobForms);
  } catch (error) {
    console.error('Error fetching job forms:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, status, walletAddress } = await req.json();

    if (!id || !status || !walletAddress) {
      return NextResponse.json(
        { message: 'JobForm ID, status, and wallet address are required' },
        { status: 400 },
      );
    }

    // Fetch the job form by ID to get its related proposal's category
    const jobForm = await prisma.jobForm.findUnique({
      where: { id },
      include: {
        deliverables: {
          include: {
            deliverable: {
              select: { proposalId: true },
            },
          },
        },
        user: {
          select: { id: true }, // Include the user and get the user ID
        },
      },
    });
    
    




    if (!jobForm) {
      return NextResponse.json({ message: 'JobForm not found' }, { status: 404 });
    }

    // Get the proposal ID related to the job form
    const proposalId = jobForm.deliverables[0]?.deliverable.proposalId;

    if (!proposalId) {
      return NextResponse.json(
        { message: 'No proposal associated with this job form' },
        { status: 404 },
      );
    }

    // Fetch the proposal to get its category ID
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: { categoryId: true },
    });

    if (!proposal) {
      return NextResponse.json({ message: 'Associated proposal not found' }, { status: 404 });
    }

    // Check if the wallet is a maintainer for this category
    const isMaintainer = await prisma.maintainerCategory.findFirst({
      where: {
        maintainer: {
          wallet: {
            address: walletAddress,
          },
        },
        categoryId: proposal.categoryId,
      },
    });

    if (!isMaintainer) {
      return NextResponse.json(
        { message: 'Unauthorized: You do not have permission to update this job form' },
        { status: 403 },
      );
    }

    // Update the job form status
    const updatedJobForm = await prisma.jobForm.update({
      where: { id },
      data: { status },
    });



    notifyJobFormStatusChanged(jobForm?.user?.id,jobForm.id,status)

    
    return NextResponse.json(updatedJobForm);
  } catch (error) {
    console.error('Error updating job form status:', error);
    return NextResponse.json({ message: 'Failed to update job form status.' }, { status: 500 });
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import prisma from "../../../lib/prisma"; // Adjust the path as needed
// import { appendToSheet } from "@/utils/googlesheets";

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const {
//       githubUsername,
//       email,
//       mriNumber,
//       description,
//       deliverables,
//       weightsRequested,
//       walletAddress,
//       minimumWeightsTime,
//       userId,
//     } = body;

//     // Validate all required fields
//     if (
//       !githubUsername ||
//       !email ||
//       !mriNumber ||
//       !description ||
//       !deliverables ||
//       !weightsRequested ||
//       !walletAddress ||
//       !minimumWeightsTime ||
//       !userId
//     ) {
//       return NextResponse.json(
//         { error: "All fields are required" },
//         { status: 400 }
//       );
//     }

//     // Check if the user exists
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//     });

//     // If the user does not exist, return an error response
//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     // Save the contribution data to the database
//     const contribution = await prisma.contribution.create({
//       data: {
//         githubUsername,
//         email,
//         mriNumber,
//         description,
//         deliverables,
//         weightsRequested,
//         walletAddress,
//         minimumWeightsTime,
//         user: { connect: { id: userId } },
//       },
//     });

//     const timestamp = new Date().toISOString();

//     // Map the data to the rowData array
//     const rowDataForm = [
//       timestamp,
//       githubUsername,
//       email,
//       mriNumber,
//       description,
//       weightsRequested,
//       walletAddress,
//       deliverables,
//       minimumWeightsTime,
//     ];

//     await appendToSheet(rowDataForm);

//     return NextResponse.json(
//       { message: "Form submitted successfully", contribution },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Failed to submit the form:", error);
//     return NextResponse.json(
//       { error: "Failed to submit the form" },
//       { status: 500 }
//     );
//   }
// }
