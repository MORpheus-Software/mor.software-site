import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Ensure your prisma client setup is correct

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('wallet');

  if (!walletAddress) {
    return NextResponse.json({ isMaintainer: false }, { status: 400 });
  }

  // Check if the wallet address is a maintainer
  const maintainer = await prisma.maintainer.findFirst({
    where: {
      wallet: {
        address: walletAddress,
      },
    },
  });

  // Return the maintainer status
  if (maintainer) {
    return NextResponse.json({ isMaintainer: true });
  } else {
    return NextResponse.json({ isMaintainer: false });
  }
}
