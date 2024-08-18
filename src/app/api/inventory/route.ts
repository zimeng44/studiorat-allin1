import { getAuthToken } from "@/data/services/get-token";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // console.log("FROM OUR ROUTE HANDLER:", req.body);

  const user = await getUserMeLoader();
  const token = await getAuthToken();

  if (!user.ok || !token)
    return new Response(
      JSON.stringify({ data: null, error: "Not authenticated" }),
      { status: 401 },
    );

  // if (user.data.credits < 1)
  //   return new Response(
  //     JSON.stringify({
  //       data: null,
  //       error: "Insufficient credits",
  //     }),
  //     { status: 402 },
  //   );

  const body = await req.json();
  // const { videoId } = body;

  // let transcript: Awaited<ReturnType<typeof fetchTranscript>>;

  try {
    // transcript = await fetchTranscript(videoId);
    // const transformedData = transformData(transcript);
    // console.log("Transcript", transformedData);
    // let summary: Awaited<ReturnType<typeof generateSummary>>;
    // summary = await generateSummary(transformedData.text, TEMPLATE);
    // console.log("Summary: ", summary);
    // return new Response(JSON.stringify({ data: summary, error: null }));
  } catch (error) {
    console.error("Error processing request:", error);
    if (error instanceof Error)
      return new Response(JSON.stringify({ error: error }));
    return new Response(JSON.stringify({ error: "Unknown error" }));
  }
}

export async function GET(req: NextRequest) {
  // console.log("FROM OUR ROUTE HANDLER:", req);
  // const url = new URL();
  // const searchParams = new URLSearchParams(url.searchParams);
  // const query = searchParams.get("where");
  // console.log();
  const barcode = req.nextUrl.searchParams.get("m_tech_barcode");
  // console.log(stu_id);

  const user = await getUserMeLoader();
  const token = await getAuthToken();

  if (!user.ok || !token)
    return new Response(
      JSON.stringify({ data: null, error: "Not authenticated" }),
      { status: 401 },
    );

  // if (user.data.credits < 1)
  //   return new Response(
  //     JSON.stringify({
  //       data: null,
  //       error: "Insufficient credits",
  //     }),
  //     { status: 402 },
  //   );

  // const body = await req.json();
  // const { videoId } = body;
  // console.log(body);

  // let transcript: Awaited<ReturnType<typeof fetchTranscript>>;

  try {
    // transcript = await fetchTranscript(videoId);
    // const transformedData = transformData(transcript);
    // console.log("Transcript", transformedData);
    // let summary: Awaited<ReturnType<typeof generateSummary>>;
    // summary = await generateSummary(transformedData.text, TEMPLATE);
    // console.log("Summary: ", summary);
    // return ;

    return new Response(
      JSON.stringify({
        data: await prisma.inventory_items.findMany({
          where: { m_tech_barcode: barcode },
        }),
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
