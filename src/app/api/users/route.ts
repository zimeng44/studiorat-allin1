import { getAuthToken } from "@/data/services/get-token";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const stu_id = req.nextUrl.searchParams.get("stu_id");
  const net_id = req.nextUrl.searchParams.get("net_id");
  // console.log(stu_id);

  const user = await getUserMeLoader();
  const token = await getAuthToken();

  if (!user.ok || !token)
    return new Response(
      JSON.stringify({ data: null, error: "Not authenticated" }),
      { status: 401 },
    );

  if (user.data?.user_role.name === "Authenticated")
    return new Response(JSON.stringify({ data: null, error: "Not allowed" }), {
      status: 401,
    });

  try {
    if (stu_id)
      return new Response(
        JSON.stringify({
          data: await prisma.user.findMany({ where: { stu_id: stu_id } }),
          error: null,
        }),
      );
    if (net_id)
      return new Response(
        JSON.stringify({
          data: await prisma.user.findMany({ where: { net_id: net_id } }),
          error: null,
        }),
      );
  } catch (error) {
    console.error("Error processing request:", error);
    if (error instanceof Error)
      return new Response(JSON.stringify({ error: error }));
    return new Response(JSON.stringify({ error: "Unknown error" }));
  }
}
