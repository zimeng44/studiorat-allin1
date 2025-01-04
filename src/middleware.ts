import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { getAuthToken } from "./data/services/get-token";
// import { decrypt } from "./data/services/auth-services";
import { jwtVerify } from "jose";
import { JWTExpired } from "jose/errors";

const secretKey = "secret";
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  // const user = await getUserMeLoader();
  const currentPath = request.nextUrl.pathname;

  // console.log("############# MIDDLE", user);
  const authToken = await getAuthToken();

  // console.log(await decrypt(authToken));

  // if (!authToken) return NextResponse.redirect(new URL("/signin", request.url));
  // const { data: user, EXPIRE: currentExpire } = await decrypt(authToken);

  // const jwtExpired =
  //   new Date(currentExpire).toISOString() <= new Date().toISOString();

  // if (currentPath.startsWith("/dashboard") && jwtExpired) {
  //   return NextResponse.redirect(new URL("/signin", request.url));
  // }

  // return NextResponse.next();

  try {
    if (!authToken) {
      throw Error;
    }
    // Verify the token and decode its payload
    await jwtVerify(authToken, key, {
      algorithms: ["HS256"],
    });

    // Allow access to protected routes

    return NextResponse.next();
  } catch (error) {
    if (currentPath.startsWith("/dashboard")) {
      if (error instanceof JWTExpired) {
        console.error("JWT has expired:", error);
        return NextResponse.redirect(new URL("/signin", request.url));
      } else {
        console.error("JWT verification failed:", error);
        return NextResponse.redirect(new URL("/signin", request.url));
      }
      // return NextResponse.redirect(new URL("/signin", request.url));
    } else {
      return NextResponse.next();
    }
    // console.error("Middleware Error:", error);
    // return NextResponse.redirect(new URL("/signin", request.url));
  }
}
