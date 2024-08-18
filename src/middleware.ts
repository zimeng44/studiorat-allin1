import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { getAuthToken } from "./data/services/get-token";
import { decrypt } from "./data/services/auth-services";

export async function middleware(request: NextRequest) {
  // const user = await getUserMeLoader();
  const currentPath = request.nextUrl.pathname;

  // console.log("############# MIDDLE", user);
  const authToken = await getAuthToken();

  // if (!authToken) return NextResponse.redirect(new URL("/signin", request.url));
  const { user, EXPIRE } = await decrypt(authToken);

  if (currentPath.startsWith("/dashboard") && !user?.net_id) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}
