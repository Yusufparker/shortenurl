import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;

  if (!session) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  try {
    const payload = await decrypt(session);
    if (payload?.role === 'admin') {
      return NextResponse.json({ loggedIn: true }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  return NextResponse.json({ loggedIn: false }, { status: 401 });
}
