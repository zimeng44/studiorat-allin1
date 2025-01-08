"use server";
import { z } from "zod";
// import qs from "qs";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
// import { mutateData } from "@/data/services/mutate-data";
import { flattenAttributes } from "@/lib/utils";

import {
  fileDeleteService,
  fileUploadService,
} from "@/data/services/file-service";
import { revalidatePath } from "next/cache";
import { updateUserAction } from "./users-actions";
import prisma from "@/lib/prisma";

const MAX_FILE_SIZE = 5000000;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// VALIDATE IMAGE WITH ZOD
const imageSchema = z.object({
  image: z
    .any()
    .refine((file) => {
      if (file.size === 0 || file.name === undefined) return false;
      else return true;
    }, "Please update or add new image.")

    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      ".jpg, .jpeg, .png and .webp files are accepted.",
    )
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`),
});

export async function updateProfileAction(
  userId: string,
  imageId: number | null,
  prevState: any,
  formData: FormData,
) {
  const rawFormData = Object.fromEntries(formData);

  const { ok, data } = await getUserMeLoader();

  if (!ok || data?.id !== userId) {
    return {
      ...prevState,
      strapiErrors: null,
      data: null,
      message: "You're not authorized to update this record",
    };
  }

  const payload = {
    first_name: rawFormData.first_name.toString(),
    last_name: rawFormData.last_name.toString(),
    bio: rawFormData.bio.toString(),
    password: rawFormData.password.toString(),
    image: imageId ? { connect: { id: imageId } } : undefined,
  };

  const { res: responseData, error } = await updateUserAction(payload, userId);

  if (error) {
    return {
      ...prevState,
      data: null,
      strapiErrors: { name: "Database Error", message: error },
      message: "update user error",
    };
  }

  // const flattenedData = flattenAttributes(responseData);
  revalidatePath("/dashboard/account");

  return {
    ...prevState,
    message: "Profile Updated",
    data: responseData,
    strapiErrors: null,
  };
}

export async function uploadProfileImageAction(
  imageId: number | null,
  prevState: any,
  formData: FormData,
) {
  // GET THE LOGGED IN USER
  const user = await getUserMeLoader();
  if (!user.ok)
    throw new Error("You are not authorized to perform this action.");

  const userId = user?.data?.id;

  // CONVERT FORM DATA TO OBJECT
  const data = Object.fromEntries(formData);

  // VALIDATE THE IMAGE
  const validatedFields = imageSchema.safeParse({
    image: data.image,
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      strapiErrors: null,
      data: null,
      message: "Invalid Image",
    };
  }

  // DELETE PREVIOUS IMAGE IF EXISTS
  if (imageId) {
    try {
      await fileDeleteService(imageId.toString());
    } catch (error) {
      return {
        ...prevState,
        strapiErrors: null,
        zodErrors: null,
        message: "Failed to Delete Previous Image.",
      };
    }
  }

  // UPLOAD NEW IMAGE TO MEDIA LIBRARY
  const { res: fileUploadResponse, error: fileUploadError } =
    await fileUploadService(data.image);

  if (!fileUploadResponse) {
    return {
      ...prevState,
      strapiErrors: null,
      zodErrors: null,
      message: "Ops! Something went wrong. Please try again.",
    };
  }

  if (fileUploadError) {
    return {
      ...prevState,
      strapiErrors: fileUploadResponse.error,
      zodErrors: null,
      message: "Failed to Upload File.",
    };
  }
  const updatedImageId = fileUploadResponse.id;
  const payload = { image: { connect: { id: updatedImageId } } };

  const updateImageResponse = await prisma.user.update({
    where: { id: userId },
    data: payload,
  });

  const flattenedData = flattenAttributes(updateImageResponse);
  revalidatePath("/dashboard/account");

  return {
    ...prevState,
    data: flattenedData,
    zodErrors: null,
    strapiErrors: null,
    message: "Image Uploaded",
  };
}
