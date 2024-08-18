"use server";

import { getAuthToken } from "@/data/services/get-token";
import { mutateData } from "@/data/services/mutate-data";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { InventoryItem } from "../definitions";
import prisma from "@/lib/prisma";
import { inventory_items, Prisma } from "@prisma/client";

export async function createInventoryItemAction(newItem: InventoryItem) {
  const authToken = await getAuthToken();
  if (!authToken) throw new Error("No auth token found");

  const payload = {
    data: newItem,
  };

  try {
    const resData = prisma.inventory_items.create(payload);
    return { res: resData, error: null };
  } catch (error) {
    console.log(error);
    return { res: null, error: "Error adding new item" };
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
    console.log(error);
    return { res: null, error: "Error updating the item" };
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
    console.log(error);
    return { res: null, error: "Error updating the item" };
  }
}
