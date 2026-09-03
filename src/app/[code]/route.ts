import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const url = await prisma.url.findUnique({
      where: {
        shortCode: code,
      },
    });

    if (url) {
      // Increment click count in the background
      await prisma.url.update({
        where: { id: url.id },
        data: { clicks: { increment: 1 } },
      });

      return NextResponse.redirect(url.originalUrl);
    } else {
      // Redirect to home if code is not found
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch (error) {
    console.error('Error finding URL:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
