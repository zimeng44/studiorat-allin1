import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { Prisma } from "@prisma/client";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { getAuthToken } from "@/data/services/get-token";

export async function POST(req: NextRequest) {
  const reqAuthToken = req.headers.get("Authorization")?.split(" ")[1];
  const user = await getUserMeLoader(reqAuthToken);

  if (!user.ok)
    return new Response(
      JSON.stringify({ data: null, error: "Not authorized" }),
      {
        status: 401,
      },
    );

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    // console.log("Parsed File:", file);

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { res: null, error: "File not uploaded" },
        { status: 400 },
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename =
      Date.now().toString() + "_" + file.name.replaceAll(" ", "_");
    // console.log(filename);

    try {
      await fs.writeFile(
        path.join(process.cwd(), "public/uploads/" + filename),
        buffer,
      );
      // return NextResponse.json({ Message: "Success", status: 201 });
    } catch (error) {
      try {
        await fs.mkdir(path.join(process.cwd(), "public/uploads"), {
          recursive: true,
        });
        await fs.writeFile(
          path.join(process.cwd(), "public/uploads/" + filename),
          buffer,
        );
      } catch (error) {
        console.log("Error occured ", error);
      }

      console.log("Error occured ", error);
      // return NextResponse.json({ Message: "Failed", status: 500 });
    }

    const filePath = `${filename}`;

    // create the image in the database
    const res = await prisma.image.create({
      data: { url: filePath },
    });

    return NextResponse.json({ res: res, error: null });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(error);
      return NextResponse.json(
        { res: null, error: error.message },
        { status: 500 },
      );
    } else {
      console.log(error);
      return NextResponse.json(
        { res: null, error: "An unknown error occurred on the database" },
        { status: 500 },
      );
    }
  }
}
