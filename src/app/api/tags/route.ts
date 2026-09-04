import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: { urls: true },
        },
      }
    });

    return NextResponse.json(tags, { status: 200 });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
