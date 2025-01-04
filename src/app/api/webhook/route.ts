import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { exec } from "child_process";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    const signature = req.headers.get("x-hub-signature-256");
    const payload = await req.text(); // Use `.text()` to get the raw payload

    // Validate the webhook signature
    const expectedSignature = `sha256=${crypto
      .createHmac("sha256", secret as string) // Ensure secret is not null
      .update(payload)
      .digest("hex")}`;

    if (signature !== expectedSignature) {
      console.error("Invalid signature");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Execute deployment commands
    exec(
      "cd /var/www/nextjs/studio-rat-fullstack && git pull && npm install && npm run build && pm2 restart studio-rat",
      (err, stdout, stderr) => {
        if (err) {
          console.error(`Deployment error: ${stderr}`);
          return;
        }
        console.log(`Deployment output: ${stdout}`);
      },
    );

    return NextResponse.json(
      { message: "Deployment succeeded" },
      { status: 200 },
    );
  } catch (error: unknown) {
    // Narrow the error type to 'Error'
    if (error instanceof Error) {
      console.error(`Error handling webhook: ${error.message}`);
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 },
      );
    }

    // In case the error is not an instance of 'Error'
    console.error("Unknown error occurred");
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}