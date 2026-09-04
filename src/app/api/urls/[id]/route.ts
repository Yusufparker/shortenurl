import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const url = await prisma.url.findUnique({
      where: { id },
      include: {
        domain: true,
        tags: true,
        visits: {
          select: {
            country: true,
            browser: true,
            os: true,
            device: true,
            createdAt: true,
          }
        }
      }
    });

    if (!url) {
      return NextResponse.json({ error: 'URL not found' }, { status: 404 });
    }

    // Aggregate analytics
    const analytics = {
      countries: {} as Record<string, number>,
      browsers: {} as Record<string, number>,
      oses: {} as Record<string, number>,
      devices: {} as Record<string, number>,
      timeline: {} as Record<string, number>,
    };

    url.visits.forEach(visit => {
      // Country
      const country = visit.country || 'Unknown';
      analytics.countries[country] = (analytics.countries[country] || 0) + 1;

      // Browser
      const browser = visit.browser || 'Unknown';
      analytics.browsers[browser] = (analytics.browsers[browser] || 0) + 1;

      // OS
      const os = visit.os || 'Unknown';
      analytics.oses[os] = (analytics.oses[os] || 0) + 1;

      // Device
      const device = visit.device || 'Desktop';
      analytics.devices[device] = (analytics.devices[device] || 0) + 1;

      // Timeline (last 30 days or so, just simple by date string)
      const dateStr = new Date(visit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      analytics.timeline[dateStr] = (analytics.timeline[dateStr] || 0) + 1;
    });

    // Format for Recharts
    const formatForCharts = (data: Record<string, number>) =>
      Object.entries(data).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return NextResponse.json({
      ...url,
      visits: undefined, // Don't send raw visits to frontend
      analytics: {
        countries: formatForCharts(analytics.countries),
        browsers: formatForCharts(analytics.browsers),
        oses: formatForCharts(analytics.oses),
        devices: formatForCharts(analytics.devices),
        timeline: formatForCharts(analytics.timeline).reverse(), // Chronological-ish
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching URL details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.url.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting URL:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
