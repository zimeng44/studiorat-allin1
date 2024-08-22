import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { getAuthToken } from "./data/services/get-token";
import { decrypt } from "./data/services/auth-services";

export async function middleware(request: NextRequest) {
  // const user = await getUserMeLoader();
  const currentPath = request.nextUrl.pathname;

  // console.log("############# MIDDLE", user);
  const authToken = await getAuthToken();

  // console.log(await decrypt(authToken));

  // if (!authToken) return NextResponse.redirect(new URL("/signin", request.url));
  const { data: user, EXPIRE: currentExpire } = await decrypt(authToken);

  const jwtExpired =
    new Date(currentExpire).toISOString() <= new Date().toISOString();

  if (currentPath.startsWith("/dashboard") && jwtExpired) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}
