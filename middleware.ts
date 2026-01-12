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

  // 1. Auth Guard
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // Fetch the role from the profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'seller'
    const path = request.nextUrl.pathname

    // 2. Redirect / to the correct starting page
    if (path === '/') {
      return NextResponse.redirect(new URL(role === 'seller' ? '/sales' : '/dashboard', request.url))
    }

    // 3. ROLE PROTECTION (The "Bouncer" logic)
    if (role === 'seller' && (path.startsWith('/inventory') || path.startsWith('/clients') || path.startsWith('/dashboard'))) {
      return NextResponse.redirect(new URL('/sales', request.url))
    }
    
    if (role === 'supervisor' && path.startsWith('/dashboard')) {
       return NextResponse.redirect(new URL('/inventory', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}