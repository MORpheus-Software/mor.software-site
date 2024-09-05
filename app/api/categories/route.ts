// app/api/categories/route.ts
// export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET handler to fetch categories with proposals for a specific wallet address
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json({ message: 'Wallet address is required' }, { status: 400 });
    }

    // Fetch the categories associated with the wallet address of the maintainer
    const categories = await prisma.category.findMany({
      where: {
        maintainers: {
          some: {
            maintainer: {
              wallet: {
                address: walletAddress,
              },
            },
          },
        },
      },
      include: {
        proposals: {
          include: {
            deliverables: true,
            comments: {
              include: {
                user: {
                  select: { name: true },
                },
              },
            },
          },
        },
        maintainers: {
          include: {
            maintainer: {
              include: {
                wallet: true,
              },
            },
          },
        },
      },
    });

    if (categories.length === 0) {
      return NextResponse.json(
        { message: 'No categories found for the provided wallet address.' },
        { status: 404 },
      );
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: 'Failed to fetch categories.' }, { status: 500 });
  }
}
