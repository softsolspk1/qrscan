import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Define protected and auth routes
    const isProtectedPage = pathname.startsWith("/admin");
    const isLoginPage = pathname === "/login";
    const isRootPage = pathname === "/";

    // 2. Extract token
    const token = request.cookies.get("auth_token")?.value;

    // 3. Root redirect
    if (isRootPage) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 4. Protection logic
    if (isProtectedPage) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        try {
            await jwtVerify(token, secret);
            return NextResponse.next();
        } catch (err) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // 5. Login page logic (redirect to admin if already logged in)
    if (isLoginPage && token) {
        try {
            await jwtVerify(token, secret);
            return NextResponse.redirect(new URL("/admin", request.url));
        } catch (err) {
            // Invalid token, stay on login page
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/admin/:path*", "/login"],
};
