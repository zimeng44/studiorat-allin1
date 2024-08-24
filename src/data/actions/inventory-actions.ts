"use server";
import { z } from "zod";
import { getAuthToken } from "@/data/services/get-token";
// import { mutateData } from "@/data/services/mutate-data";
// import { redirect } from "next/navigation";
import {
  fileDeleteService,
  fileUploadService,
} from "@/data/services/file-service";
import { revalidatePath } from "next/cache";
// import { InventoryItem } from "../definitions";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getUserMeLoader } from "../services/get-user-me-loader";
// import { connect } from "http2";

export async function createInventoryItemAction(newItem: any) {
  const { ok } = await getUserMeLoader();
  if (!ok) throw new Error("Not authenticated");

  const payload = {
    data: newItem,
  };

  try {
    const resData = prisma.inventory_items.create(payload);
    return { res: resData, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(error);
      return { res: null, error: error.message };
    } else {
      console.log(error);
      return { res: null, error: "Error Unknown from Database" };
    }
  }
}

export async function createManyInventoryItemAction(
  newItems: Prisma.inventory_itemsCreateInput[],
) {
  const authToken = await getAuthToken();
  if (!authToken) throw new Error("No auth token found");

  const payload = {
    data: newItems,
    skipDuplicates: true,
  };

  try {
    const resData = prisma.inventory_items.createMany(payload);
    return { res: resData, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(error);
      return { res: null, error: error.message };
    } else {
      console.log(error);
      return { res: null, error: "Error Unknown from Database" };
    }
  }
}

// export const updateManyItemsAction = async (
//   updatedItem: InventoryItem,
//   id_list: number[],
// ) => {
//   // console.log(id);

//   const payload = {
//     data: updatedItem,
//     where: {
//       id: { in: id_list },
//     },
//     include: { permissions: true },
//   };

//   const responseData = await prisma.inventory_items.updateMany(payload);

//   if (!responseData) {
//     return {
//       // ...prevState,
//       strapiErrors: null,
//       message: "Oops! Something went wrong. Please try again.",
//     };
//   }

//   revalidatePath("/dashboard/master-inventory");

//   return {
//     // ...prevState,
//     message: "Summary updated successfully",
//     data: responseData,
//     strapiErrors: null,
//   };
// };

export const updateItemAction = async (
  updatedItem: Prisma.inventory_itemsUncheckedUpdateInput,
  id: string,
) => {
  // console.log(id);

  const payload = {
    data: updatedItem,
    where: {
      id: parseInt(id),
    },
  };

  try {
    const responseData = await prisma.inventory_items.update(payload);
    revalidatePath("/dashboard/master-inventory");
    return { res: responseData, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(error);
      return { res: null, error: error.message };
    } else {
      console.log(error);
      return { res: null, error: "Error Unknown from Database" };
    }
  }
};

export async function deleteItemAction(id: string) {
  try {
    const responseData = await prisma.inventory_items.delete({
      where: { id: parseInt(id) },
    });
    // revalidatePath("/dashboard/master-inventory");
    return { res: responseData, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(error);
      return { res: null, error: error.message };
    } else {
      console.log(error);
      return { res: null, error: "Error Unknown from Database" };
    }
  }
}

export async function deleteManyItemAction(idArray: number[]) {
  try {
    const responseData = await prisma.inventory_items.deleteMany({
      where: { id: { in: idArray } },
    });

    revalidatePath("/dashboard/master-inventory");
    return { res: responseData, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(error);
      return { res: null, error: error.message };
    } else {
      console.log(error);
      return { res: null, error: "Error Unknown from Database" };
    }
  }
}

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

export async function uploadInventoryImageAction(
  imageId: number | null,
  inventoryId: number,
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

  // console.log(fileUploadResponse);

  // UPDATE USER PROFILE WITH NEW IMAGE
  // const updateImageResponse = await mutateData(
  //   "PUT",
  //   `/api/users/${userId}`,
  //   payload,
  // );

  const updateImageResponse = await prisma.inventory_items.update({
    where: { id: inventoryId },
    data: payload,
  });

  // const flattenedData = flattenAttributes(updateImageResponse);
  revalidatePath("/dashboard/master-inventory");

  return {
    ...prevState,
    data: updateImageResponse,
    zodErrors: null,
    strapiErrors: null,
    message: "Image Uploaded",
  };
}
