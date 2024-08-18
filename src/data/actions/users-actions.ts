"use server";

import { getAuthToken } from "@/data/services/get-token";
import { mutateData } from "@/data/services/mutate-data";
import { flattenAttributes } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
// import { InventoryItem } from "@/app/lib/definitions";
import { InventoryItem, UserType, UserTypePost } from "../definitions";
import prisma from "@/lib/prisma";

// interface Payload {
//   data: {
//     title?: string;
//     videoId: string;
//     summary: string;
//   };
// }

// export async function createUserAction(newUser: UserType) {
//   const authToken = await getAuthToken();
//   if (!authToken) throw new Error("No auth token found");

//   const payload = {
//     data: newUser,
//   };

//   const data = await mutateData("POST", "/api/inventory-items", payload);
//   // const flattenedData = flattenAttributes(data);
//   // console.log("data submited#########", flattenedData);
//   // redirect("/dashboard/master-inventory/" + flattenedData.id);
//   redirect("/dashboard/users");
// }

export const updateUserAction = async (
  updatedUser: UserTypePost,
  id: string,
) => {
  // console.log(id);
  try {
    const authToken = await getAuthToken();
    if (!authToken) throw new Error("No auth token found");

    const payload = {
      where: { id: id },
      data: updatedUser,
      include: { user_role: true },
    };

    const res = await prisma.user.update(payload);
    // console.log("herrrrrrrrrrrrrrrrrrrrrrrrrrrrrre");
    // console.log("res is ############## ", res);

    revalidatePath("/dashboard/users");
    return { res: res, error: null };
  } catch (error) {
    console.log("Error is ########################", error);
    return { res: null, error: error as string };
  }
  // console.log(updatedUser);
};

// export async function updateInventoryItemAction(
//   prevState: any,
//   formData: FormData,
// ) {
//   const rawFormData = Object.fromEntries(formData);
//   const id = rawFormData.id as string;

//   const payload = {
//     data: {
//       title: rawFormData.title,
//       summary: rawFormData.summary,
//     },
//   };

//   const responseData = await mutateData(
//     "PUT",
//     `/api/inventory-items/${id}`,
//     payload,
//   );

//   if (!responseData) {
//     return {
//       ...prevState,
//       strapiErrors: null,
//       message: "Oops! Something went wrong. Please try again.",
//     };
//   }

//   if (responseData.error) {
//     return {
//       ...prevState,
//       strapiErrors: responseData.error,
//       message: "Failed to update summary.",
//     };
//   }

//   const flattenedData = flattenAttributes(responseData);
//   revalidatePath("/dashboard/master-inventory");

//   return {
//     ...prevState,
//     message: "Summary updated successfully",
//     data: flattenedData,
//     strapiErrors: null,
//   };
// }

export async function deleteUserAction(id: string) {
  // const responseData = await mutateData("DELETE", `/api/users/${id}`);

  // if (!responseData) {
  //   return {
  //     // ...prevState,
  //     strapiErrors: null,
  //     message: "Oops! Something went wrong. Please try again.",
  //   };
  // }

  // if (responseData.error) {
  //   return {
  //     // ...prevState,
  //     strapiErrors: responseData.error,
  //     message: "Failed to delete Item.",
  //   };
  // }
  try {
    const responseData = await prisma.user.delete({ where: { id: id } });
    return { res: responseData, error: null };
  } catch (error) {
    return { res: null, error: error };
  }
}

// export async function deleteInventoryItemAction(id: string, prevState: any) {
//   const responseData = await mutateData("DELETE", `/api/inventory-items/${id}`);

//   if (!responseData) {
//     return {
//       ...prevState,
//       strapiErrors: null,
//       message: "Oops! Something went wrong. Please try again.",
//     };
//   }

//   if (responseData.error) {
//     return {
//       ...prevState,
//       strapiErrors: responseData.error,
//       message: "Failed to delete Item.",
//     };
//   }

//   redirect("/dashboard/master-inventory");
// }
