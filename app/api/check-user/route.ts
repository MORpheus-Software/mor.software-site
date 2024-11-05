import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isValidUUID } from '@/utils/validateUUID';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }
  if (!isValidUUID(userId)) {
    return NextResponse.json({ error: 'Invalid UUID' }, { status: 400 });
  }
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });
  const response = NextResponse.json({ data: Boolean(user) });

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}
