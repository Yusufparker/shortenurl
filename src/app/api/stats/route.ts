import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get basic stats
    const urlsCount = await prisma.url.count();
    const tagsCount = await prisma.tag.count();
    const domainsCount = await prisma.domain.count();
    const visitsCount = await prisma.visit.count();

    // Get visits over the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentVisits = await prisma.visit.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Process visits into chart data
    const chartDataMap = new Map<string, number>();
    
    // Initialize map with last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      chartDataMap.set(dateStr, 0);
    }

    // Aggregate counts
    recentVisits.forEach((v) => {
      const dateStr = new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (chartDataMap.has(dateStr)) {
        chartDataMap.set(dateStr, (chartDataMap.get(dateStr) || 0) + 1);
      }
    });

    const chartData = Array.from(chartDataMap.entries()).map(([date, visits]) => ({
      date,
      visits
    }));

    return NextResponse.json({
      urls: urlsCount,
      tags: tagsCount,
      domains: domainsCount,
      visits: visitsCount,
      chartData
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
