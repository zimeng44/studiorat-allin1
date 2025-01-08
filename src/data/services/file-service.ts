import { getAuthToken } from "@/data/services/get-token";
// import { mutateData } from "@/data/services/mutate-data";
// import { flattenAttributes } from "@/lib/utils";
import { getBackendURL } from "@/lib/utils";
import { join } from "path";
import { promises as fs } from "fs";
import prisma from "@/lib/prisma";

export async function fileDeleteService(imageId: string) {
  const authToken = await getAuthToken();
  // console.log(authToken);
  if (!authToken) throw new Error("No auth token found");
  try {
    const image = await prisma.image.findUnique({
      where: { id: parseInt(imageId) },
    });
    if (!image) throw Error("Image not found");

    const filePath = join(process.cwd(), "public", image.url);

    // Check if the file exists
    await fs.access(filePath);

    // Delete the image file
    await fs.unlink(filePath);
  } catch (error) {
    console.log(error);
  }
  try {
    const res = await prisma.image.delete({
      where: { id: parseInt(imageId) },
    });
  } catch (error) {
    console.log(error);
  }
}

export async function fileUploadService(image: any) {
  const authToken = await getAuthToken();
  // console.log(authToken);
  if (!authToken) throw new Error("No auth token found");

  const baseUrl = getBackendURL();
  const url = new URL("/api/upload", baseUrl);

  const formData = new FormData();
  formData.append("file", image, image.name);

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${authToken}` },
      method: "POST",
      body: formData,
      // credentials: "include",
    });

    const dataResponse = await response.json();

    return dataResponse;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
