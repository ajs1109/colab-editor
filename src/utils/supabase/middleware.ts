import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicPaths = [
  "/", // Landing page
  "/login", // Auth pages
  "/create-account",
  "/forgot-password",
  "/auth/callback",
  "/auth/reset-password",
  "/auth/auth-error",
  "/profile/:id", 
];

const authRequiredPaths = [
  "/profile/setup", // Requires auth but has special username logic
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPath = request.nextUrl.pathname;
  const nextPath =
    currentPath === "/login" || currentPath === "/create-account"
      ? request.nextUrl.searchParams.get("next") || "/" // Default to landing page
      : currentPath;

  const isPublicPath = publicPaths.some((path) => {
    const pattern = path.replace(":id", "[^/]+");
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(currentPath) && !authRequiredPaths.includes(currentPath);
  });

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", currentPath);
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: username, error: usernameError } = await supabase
      .from("users")
      .select("name")
      .eq("id", user.id)
      .single();

    if (usernameError) {
      console.error("Failed to fetch username:", usernameError);
    } else {
      console.log("Fetched username:", username);
      const hasValidUsername =
        username.name &&
        typeof username.name === "string" &&
        username.name.trim() !== "";

      // If user is trying to access profile setup but already has a username
      if (currentPath === "/profile/setup" && hasValidUsername) {
        const url = request.nextUrl.clone();
        url.pathname = "/projects"; // or wherever you want to redirect users with usernames
        return NextResponse.redirect(url);
      }

      // If user doesn't have a username and is not already on profile setup
      if (!hasValidUsername && currentPath !== "/profile/setup") {
        const url = request.nextUrl.clone();
        url.pathname = "/profile/setup";
        url.searchParams.set("next", currentPath);
        return NextResponse.redirect(url);
      }
    }
  }

  if (user && (currentPath === "/login" || currentPath === "/create-account")) {
    // For logged in users trying to access auth pages, redirect to the next path
    const url = new URL(nextPath, request.url);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
