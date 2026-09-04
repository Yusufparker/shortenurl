import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

function generateShortCode(length = 6) {
  return crypto.randomBytes(length).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, length);
}

export async function POST(request: Request) {
  try {
    const { 
      originalUrl, 
      customSlug, 
      title: customTitle, 
      tags, 
      domainId,
      expiresAt,
      fbPixelId,
      googleTagId
    } = await request.json();

    if (!originalUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(originalUrl);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    let shortCode = customSlug;
    
    if (customSlug) {
      // Check if custom slug is already in use for this domain
      const existing = await prisma.url.findFirst({
        where: { shortCode: customSlug, domainId: domainId || null }
      });
      if (existing) {
        return NextResponse.json({ error: 'Custom slug is already in use for this domain' }, { status: 400 });
      }
    } else {
      // Generate a unique short code
      let isUnique = false;
      while (!isUnique) {
        shortCode = generateShortCode();
        const existing = await prisma.url.findFirst({
          where: { shortCode, domainId: domainId || null }
        });
        if (!existing) {
          isUnique = true;
        }
      }
    }

    // Title scraping (if not provided)
    let title = customTitle || null;
    if (!title) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(originalUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        const html = await response.text();
        const match = html.match(/<title>([^<]*)<\/title>/i);
        if (match && match[1]) {
          title = match[1].trim();
        }
      } catch (e) {
        // silently fail title scraping
      }
    }

    // Handle Tags mapping
    const tagConnectOrCreate = tags ? tags.map((tagName: string) => ({
      where: { name: tagName.toLowerCase() },
      create: { name: tagName.toLowerCase() }
    })) : undefined;

    // Create URL record
    const url = await prisma.url.create({
      data: {
        originalUrl,
        shortCode,
        title,
        domainId: domainId || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        fbPixelId: fbPixelId || null,
        googleTagId: googleTagId || null,
        ...(tagConnectOrCreate && { tags: { connectOrCreate: tagConnectOrCreate } })
      },
      include: {
        domain: true
      }
    });

    // Construct the actual short URL for the client response
    let baseHost = request.headers.get('host') || 'localhost:3000';
    let protocol = 'http://';
    if (baseHost !== 'localhost:3000') protocol = 'https://';
    
    const domainHost = url.domain ? url.domain.host : baseHost;
    const shortUrl = `${protocol}${domainHost}/${url.shortCode}`;

    return NextResponse.json({ ...url, shortUrl }, { status: 201 });
  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
