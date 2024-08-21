import { NextRequest, NextResponse } from 'next/server';
import Web3 from 'web3';
import prisma from '../../../lib/prisma'; // Adjust the path as needed

export async function POST(request: NextRequest) {
  const web3 = new Web3();
  const body = await request.json();
  const { address, message, signature, duration, userId } = body;

  try {
    const verifiedAddress = web3.eth.accounts.recover(message, signature);
    if (verifiedAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
    }

    // Check if a stake already exists for the given address
    const existingStake = await prisma.stake.findFirst({
      where: { wallet: { address } },
    });

    if (existingStake) {
      return NextResponse.json(
        { error: 'A stake already exists for this address - ' },
        { status: 400 },
      );
    }

    // Calculate the lock end date based on the duration
    const lockEndDate = new Date();
    lockEndDate.setDate(lockEndDate.getDate() + duration);

    // Save the staking data to the database
    const stake = await prisma.stake.create({
      data: {
        duration,
        lockEndDate,
        wallet: {
          connectOrCreate: {
            where: { address },
            create: { address, userId },
          },
        },
        user: { connect: { id: userId } },
      },
    });

    return NextResponse.json({ message: 'Staking submitted successfully', stake }, { status: 200 });
  } catch (error) {
    console.error('Failed to submit staking:', error);
    return NextResponse.json({ error: 'Failed to submit staking' }, { status: 500 });
  }
}
