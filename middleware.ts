import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 1. If not logged in and trying to access any app page, redirect to /login
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. PROTECT THE SETTINGS PAGE (Admin Only)
  if (request.nextUrl.pathname.startsWith('/settings')) {
    const role = user?.app_metadata?.role
    if (role !== 'admin') {
      // Redirect regular users to inventory if they try to touch settings
      return NextResponse.redirect(new URL('/inventory', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/inventory/:path*', '/sales/:path*', '/settings/:path*'],
}