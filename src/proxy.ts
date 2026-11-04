import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  let cacheHeaders: Record<string, string> = {};
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list, headers) {
          for (const { name, value } of list) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of list) response.cookies.set(name, value, options);
          cacheHeaders = { ...cacheHeaders, ...(headers ?? {}) };
          for (const [k, v] of Object.entries(cacheHeaders)) response.headers.set(k, v);
        },
      },
    },
  );
  const { data } = await supabase.auth.getUser();
  const { pathname, search } = request.nextUrl;
  if (!data.user && pathname !== "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    url.searchParams.set("next", pathname + search);
    const redirect = NextResponse.redirect(url);
    for (const c of response.cookies.getAll()) redirect.cookies.set(c);
    for (const [k, v] of Object.entries(cacheHeaders)) redirect.headers.set(k, v);
    return redirect;
  }
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
