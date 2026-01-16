import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/request'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // 1. If not logged in, always send to login
  if (!session && req.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 2. Fetch the role from the profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session?.user.id)
    .single()

  const role = profile?.role

  // 3. SELLER RULES:
  // If a seller tries to access / or /dashboard or /inventory, bounce them to /sales
  if (role === 'seller' && (req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/dashboard' || req.nextUrl.pathname === '/inventory')) {
    return NextResponse.redirect(new URL('/sales', req.url))
  }

  // 4. ADMIN RULES:
  // When an admin first logs in (hits the root), send them to the Landing Page (/)
  // This is handled naturally by Next.js if / is your landing page.

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}