import { getAuthToken } from "@/data/services/get-token";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
// import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  // const reqAuthToken = req.headers.get("Authorization")?.split(" ")[1];
  // const user = await getUserMeLoader(reqAuthToken);

  // if (!user.ok)
  //   return new Response(
  //     JSON.stringify({ data: null, error: "Not authorized" }),
  //     {
  //       status: 401,
  //     },
  //   );
  // console.log("called here");
  const url = new URL(req.url);
  const filename = url.searchParams.get("filename");

  // console.log(stu_id);
  if (!filename) {
    return Response.json(
      { data: null, error: "Filename is required" },
      { status: 400 },
    );
  }

  const filePath = path.join(process.cwd(), "public/uploads", filename);

  if (!fs.existsSync(filePath)) {
    return Response.json({ error: "Image not found" }, { status: 404 });
  }

  const fileStream = fs.createReadStream(filePath);

  // Convert the Node.js ReadStream to a Web ReadableStream
  const readableStream = new ReadableStream({
    start(controller) {
      fileStream.on("data", (chunk) => {
        controller.enqueue(chunk);
      });

      fileStream.on("end", () => {
        controller.close();
      });

      fileStream.on("error", (err) => {
        controller.error(err);
      });
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "image/jpeg", // or the appropriate content type
    },
  });
}
