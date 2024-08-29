import { NextRequest, NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma'; // Adjust the path as needed

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallets: {
          include: { stakings: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const walletId = searchParams.get('walletId');

  if (!userId || !walletId) {
    return NextResponse.json({ error: 'User ID and Wallet ID are required' }, { status: 400 });
  }

  const { name } = await request.json();

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    if (name.length > 20) {
      return NextResponse.json(
        { error: 'Wallet name must be 20 characters or fewer' },
        { status: 400 },
      );
    }

    if (wallet.userId !== userId) {
      return NextResponse.json({ error: 'Forjobden' }, { status: 403 });
    }

    const updatedWallet = await prisma.wallet.update({
      where: { id: walletId },
      data: { name: name === '' ? null : name },
    });

    return NextResponse.json(updatedWallet, { status: 200 });
  } catch (error) {
    console.error('Failed to update wallet name:', error);
    return NextResponse.json({ error: 'Failed to update wallet name' }, { status: 500 });
  }
}
