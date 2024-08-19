"use server";

import { getAuthToken } from "@/data/services/get-token";
// import { mutateData } from "@/data/services/mutate-data";
// import { flattenAttributes } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
// import {
//   CheckoutSessionType,
//   CheckoutSessionTypePost,
//   InventoryItem,
// } from "@/data/definitions";
import { updateItemAction } from "./inventory-actions";
import prisma from "@/lib/prisma";
import { inventory_items, Prisma } from "@prisma/client";

export async function createCheckoutSessionAction(
  newSession: Prisma.checkout_sessionsCreateInput,
) {
  const authToken = await getAuthToken();
  if (!authToken) throw new Error("No auth token found");

  const payload = {
    data: newSession,
    include: { inventory_items: true, user: true, created_by: true },
  };
  // console.log(payload);
  try {
    const res = await prisma.checkout_sessions.create(payload);
    return { res: res, error: null };
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

export const updateCheckoutSessionActionWithItems = async (
  updatedSession: Prisma.checkout_sessionsUpdateInput,
  id: string,
  items: inventory_items[],
) => {
  // update items info first
  let itemsResponses = Array(items.length);

  try {
    await Promise.all(
      items.map(async (item, index) => {
        // console.log(item);
        const id = item.id as number;
        itemsResponses[index] = await updateItemAction(
          { out: item.out, broken: item.broken },
          id.toString(),
        );
      }),
    );
    // return { res: "done", error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(error);
      return { res: null, error: error.message };
    } else {
      console.log(error);
      return { res: null, error: "Error Unknown from Database" };
    }
  }

  // update the checkout session
  const payload = {
    where: { id: parseInt(id) },
    data: updatedSession,
    include: { inventory_items: true, user: true, created_by: true },
  };

  try {
    const responseData = await prisma.checkout_sessions.update(payload);
    revalidatePath("/dashboard/checkout");

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

export async function deleteCheckoutSessionAction(id: string) {
  try {
    const authToken = await getAuthToken();
    if (!authToken) throw new Error("No auth token found");

    const res = await prisma.checkout_sessions.delete({
      where: { id: parseInt(id) },
    });

    // console.log(res);
    // revalidatePath("/dashboard/booking");
    return { res: res, error: null };
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(error);
      return { res: null, error: error.message };
    } else {
      console.log(error);
      return { res: null, error: "Error Unknown from Database" };
    }
  }
}
