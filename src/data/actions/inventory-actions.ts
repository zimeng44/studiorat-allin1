"use server";

import { getAuthToken } from "@/data/services/get-token";
// import { mutateData } from "@/data/services/mutate-data";
// import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { InventoryItem } from "../definitions";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
