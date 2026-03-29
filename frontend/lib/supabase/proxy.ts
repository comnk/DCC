import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const PUBLIC_ROUTES = ["/login", "/signup"]

  const isPublic = PUBLIC_ROUTES.includes(pathname)

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (user && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (user && !isPublic) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("display_name")
      .eq("id", user.id)
      .single()

    const hasOnboarded = !!profile?.display_name

    if (!hasOnboarded && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }

    if (hasOnboarded && pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (hasOnboarded && pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return response
}