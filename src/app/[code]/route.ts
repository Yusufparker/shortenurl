import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { UAParser } from 'ua-parser-js';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const host = request.headers.get('host') || '';
    
    // Check if the host matches any domain in our database
    const domainRecord = await prisma.domain.findUnique({
      where: { host }
    });

    // We look for a URL where shortCode matches and domainId matches either the found domain or null (default domain)
    const url = await prisma.url.findFirst({
      where: {
        shortCode: code,
        domainId: domainRecord ? domainRecord.id : null,
      },
    });

    if (url) {
      // Log visit and increment click count in a transaction to ensure both happen
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      const referer = request.headers.get('referer') || 'unknown';
      const country = request.headers.get('cf-ipcountry') || 'Unknown';

      const parser = new UAParser(userAgent);
      const browser = parser.getBrowser().name || 'Unknown';
      const os = parser.getOS().name || 'Unknown';
      const deviceType = parser.getDevice().type;
      const device = deviceType === 'mobile' || deviceType === 'tablet' || deviceType === 'wearable' ? 'Mobile' : 'Desktop';

      await prisma.$transaction([
        prisma.url.update({
          where: { id: url.id },
          data: { clicks: { increment: 1 } },
        }),
        prisma.visit.create({
          data: {
            urlId: url.id,
            ip: ip.split(',')[0].trim(),
            userAgent,
            referer,
            country,
            browser,
            os,
            device
          }
        })
      ]);

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
