import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const domains = await prisma.domain.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: { urls: true },
        },
      }
    });

    return NextResponse.json(domains, { status: 200 });
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { host } = await request.json();

    if (!host) {
      return NextResponse.json({ error: 'Host is required' }, { status: 400 });
    }

    // Clean up host (remove http://, https://, trailing slashes)
    const cleanedHost = host.replace(/^https?:\/\//, '').replace(/\/$/, '');

    // Verify that the domain is correctly pointing to this server
    try {
      // Use AbortController for a 5 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const pingRes = await fetch(`http://${cleanedHost}/api/ping`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'ShortenUrl-Verifier'
        }
      });
      
      clearTimeout(timeoutId);

      if (!pingRes.ok) {
        throw new Error('Non-200 status');
      }

      const data = await pingRes.json();
      if (data.ping !== 'pong' || data.service !== 'shortenurl') {
        throw new Error('Invalid signature');
      }
    } catch (err) {
      console.error(`Domain verification failed for ${cleanedHost}:`, err);
      return NextResponse.json(
        { error: `Invalid domain! Please ensure you have pointed the DNS A/CNAME Record of ${cleanedHost} to this server's IP address.` },
        { status: 400 }
      );
    }

    const domain = await prisma.domain.create({
      data: {
        host: cleanedHost,
      },
    });

    return NextResponse.json(domain, { status: 201 });
  } catch (error: any) {
    console.error('Error creating domain:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Domain already exists' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
