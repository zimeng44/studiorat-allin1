// import { getAuthToken } from "@/data/services/get-token";
// import { getUserMeLoader } from "@/data/services/get-user-me-loader";
// import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { getUserByIdentifier } from "@/data/loaders";
import { updateUserAction } from "@/data/actions/users-actions";

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
    const updateValuesWithLastLogin = { last_login: new Date() };
    const { res, error } = await updateUserAction(
      updateValuesWithLastLogin,
      user.id,
    );
    if (!error)
      return new Response(
        JSON.stringify({
          data: { ...res, password: null },
          error: null,
        }),
      );
    else
      return new Response(
        JSON.stringify({
          data: null,
          error: error,
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
