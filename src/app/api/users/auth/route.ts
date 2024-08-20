// import { getAuthToken } from "@/data/services/get-token";
// import { getUserMeLoader } from "@/data/services/get-user-me-loader";
// import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { getUserByIdentifier } from "@/data/loaders";


export async function POST(req: NextRequest) {
  const userData = await req.json(); // Parse the ReadableStream to JSON

  const { data: user, error } = await getUserByIdentifier(userData.identifier);

  if (!user) {
    return new Response(
      JSON.stringify({
        data: null,
        error: "User not found",
      }),
    );
  }

  const passwordMatches = await bcrypt.compare(
    userData.password,
    user?.password ?? "",
  );

  // console.log(passwordMatches);

  if (passwordMatches) {
    return new Response(
      JSON.stringify({
        data: user,
        error: null,
      }),
    );
  } else {
    return new Response(
      JSON.stringify({
        data: null,
        error: "Password not match",
      }),
    );
  }
}
