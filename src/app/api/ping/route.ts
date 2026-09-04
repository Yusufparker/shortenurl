import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ping: 'pong', service: 'shortenurl' }, { status: 200 });
}
