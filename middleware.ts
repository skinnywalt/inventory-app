import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 1. If not logged in, force to login (except for login page itself)
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'seller' // Default to safest role
    const path = request.nextUrl.pathname

    // 2. Prevent infinite redirect loops
    // If they are on their designated "Home" page, do nothing
    if (role === 'admin' && path === '/dashboard') return response
    if (role === 'seller' && path === '/sales') return response

    // 3. Handle the Root "/" Redirect
    if (path === '/') {
      const target = role === 'admin' ? '/dashboard' : '/sales'
      return NextResponse.redirect(new URL(target, request.url))
    }

    // 4. STRICT BOUNCER LOGIC
    // Kick Sellers out of Admin/Supervisor zones
    const adminZones = ['/dashboard', '/inventory', '/clients', '/settings']
    if (role === 'seller' && adminZones.some(zone => path.startsWith(zone))) {
      return NextResponse.redirect(new URL('/sales', request.url))
    }

    // Kick Supervisors out of Admin zones (Dashboard)
    if (role === 'supervisor' && path.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/inventory', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}