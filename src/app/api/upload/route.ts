import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { Prisma } from "@prisma/client";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";

export async function POST(req: NextRequest) {
  const reqAuthToken = req.headers.get("Authorization")?.split(" ")[1];
  const user = await getUserMeLoader(reqAuthToken);

  if (!user.ok) {
    return new Response(
      JSON.stringify({ data: null, error: "Not authorized" }),
      { status: 401 },
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { res: null, error: "File not uploaded" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedFilename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const uploadPath = path.join(process.cwd(), "public/uploads");
    const filePath = path.join(uploadPath, sanitizedFilename);

    try {
      // Ensure the uploads directory exists
      await fs.mkdir(uploadPath, { recursive: true });
      await fs.writeFile(filePath, buffer as Uint8Array);
    } catch (error) {
      console.error("File upload failed:", error);
      return NextResponse.json(
        { res: null, error: "File upload failed" },
        { status: 500 },
      );
    }

    // Store the file metadata in the database
    const fileUrl = `/uploads/${sanitizedFilename}`;
    const res = await prisma.image.create({ data: { url: fileUrl } });

    return NextResponse.json({ res, error: null });
  } catch (error) {
    console.error("Database error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { res: null, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { res: null, error: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
