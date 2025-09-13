import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/verifier')) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/verifier/:path*'],
};