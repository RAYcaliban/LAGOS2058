import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/actions/:path*',
    '/character/:path*',
    '/party/:path*',
    '/admin/:path*',
    '/forum/:path*',
    '/wiki/:path*',
    '/api/:path*',
  ],
} 
