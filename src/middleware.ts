import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // Protect both shorten and urls API routes
  if (
    request.nextUrl.pathname === '/api/shorten' || 
    request.nextUrl.pathname.startsWith('/api/urls') ||
    request.nextUrl.pathname.startsWith('/api/tags') ||
    request.nextUrl.pathname.startsWith('/api/domains') ||
    request.nextUrl.pathname === '/api/stats'
  ) {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const payload = await decrypt(sessionCookie);
      if (payload?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/shorten', '/api/urls/:path*', '/api/tags/:path*', '/api/domains/:path*', '/api/stats'],
};
