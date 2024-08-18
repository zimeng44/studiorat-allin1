"use server";

import { getAuthToken } from "@/data/services/get-token";
import { mutateData } from "@/data/services/mutate-data";
import { flattenAttributes } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  CheckoutSessionType,
  CheckoutSessionTypePost,
  InventoryItem,
} from "@/data/definitions";
import { updateItemAction } from "./inventory-actions";
import prisma from "@/lib/prisma";
import { checkout_sessions, inventory_items, Prisma } from "@prisma/client";

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
    console.log(error);
    return { res: null, error: "Error creating new session" };
  }
}

export const updateCheckoutSessionActionWithItems = async (
  updatedSession: Prisma.checkout_sessionsUpdateInput,
  id: string,
  items: inventory_items[],
) => {
  const payload = {
    where: { id: parseInt(id) },
    data: updatedSession,
    include: { inventory_items: true, user: true, created_by: true },
  };

  try {
    const responseData = await prisma.checkout_sessions.update(payload);
  } catch (error) {
    return {
      // ...prevState,
      // strapiErrors: null,
      res: null,
      error: "Oops! Something went wrong. Please try again.",
    };
  }

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
  } catch (error) {
    console.log(itemsResponses);
    return { res: null, error: "Error updating inventory item(s)" };
  }

  return { res: "done", error: null };
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
    // console.log(error);
    return { res: null, error: error.toString() };
  }
}
