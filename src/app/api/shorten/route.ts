import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { originalUrl } = await request.json();

    if (!originalUrl) {
      return NextResponse.json(
        { error: 'Original URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let urlToSave = originalUrl;
    try {
      new URL(urlToSave);
    } catch (_) {
      // If no protocol is provided, assume https
      urlToSave = `https://${urlToSave}`;
      try {
        new URL(urlToSave);
      } catch (__) {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }

    // Generate a unique 6-character short code
    const shortCode = crypto.randomBytes(4).toString('hex').slice(0, 6);

    const newUrl = await prisma.url.create({
      data: {
        originalUrl: urlToSave,
        shortCode,
      },
    });

    return NextResponse.json(newUrl, { status: 201 });
  } catch (error) {
    console.error('Error generating short URL:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
