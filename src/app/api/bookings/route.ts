import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const user = await getUserMeLoader();

  if (!user.ok)
    return new Response(
      JSON.stringify({ data: null, error: "Not authenticated" }),
      { status: 401 },
    );

  const start = new Date(req.nextUrl.searchParams.get("start") as string);
  const end = new Date(req.nextUrl.searchParams.get("end") as string);

  try {
    return new Response(
      JSON.stringify({
        data: await prisma.bookings.findMany({
          include: { user: true, created_by: true, inventory_items: true },
          where: {
            AND:
              user.data?.user_role.name === "Admin" ||
              user.data?.user_role.name === "Monitor"
                ? [{ start_time: { gte: start } }, { start_time: { lte: end } }]
                : [
                    { start_time: { gte: start } },
                    { start_time: { lte: end } },
                    { user: { id: user.data?.id } },
                  ],
          },
        }),
        error: null,
      }),
    );
  } catch (error) {
    console.error("Error processing request:", error);
    if (error instanceof Error)
      return new Response(JSON.stringify({ data: null, error: error }));
    return new Response(JSON.stringify({ data: null, error: "Unknown error" }));
  }
}
