import { getUserByIdentifier } from "@/data/services/auth-services";
import { getAuthToken } from "@/data/services/get-token";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import bcrypt from "bcrypt";

// export async function POST(req: NextRequest) {
//   // console.log("FROM OUR ROUTE HANDLER:", req.body);

//   const user = await getUserMeLoader();
//   const token = await getAuthToken();

//   if (!user.ok || !token)
//     return new Response(
//       JSON.stringify({ data: null, error: "Not authenticated" }),
//       { status: 401 },
//     );

//   // if (user.data.credits < 1)
//   //   return new Response(
//   //     JSON.stringify({
//   //       data: null,
//   //       error: "Insufficient credits",
//   //     }),
//   //     { status: 402 },
//   //   );

//   const body = await req.json();
//   // const { videoId } = body;

//   // let transcript: Awaited<ReturnType<typeof fetchTranscript>>;

//   try {
//     // transcript = await fetchTranscript(videoId);
//     // const transformedData = transformData(transcript);
//     // console.log("Transcript", transformedData);
//     // let summary: Awaited<ReturnType<typeof generateSummary>>;
//     // summary = await generateSummary(transformedData.text, TEMPLATE);
//     // console.log("Summary: ", summary);
//     // return new Response(JSON.stringify({ data: summary, error: null }));
//   } catch (error) {
//     console.error("Error processing request:", error);
//     if (error instanceof Error)
//       return new Response(JSON.stringify({ error: error }));
//     return new Response(JSON.stringify({ error: "Unknown error" }));
//   }
// }

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
