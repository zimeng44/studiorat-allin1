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

export async function createCheckoutSessionAction(
  newSession: CheckoutSessionTypePost,
) {
  const authToken = await getAuthToken();
  if (!authToken) throw new Error("No auth token found");

  // console.log(newSession);

  // console.log(newSession.finishTime);
  // if (newSession.creationTime === undefined){
  //   // delete newSession.creationTime;
  //   // newSession.creationTime="";
  // }else
  //   newSession.creationTime = new Date(newSession.creationTime).toISOString();

  // if (newSession.finishTime === undefined) delete newSession.finishTime;
  // else newSession.finishTime = new Date(newSession.finishTime).toISOString();

  const payload = {
    data: newSession,
  };

  const data = await mutateData("POST", "/api/checkout-sessions", payload);
  const flattenedData = flattenAttributes(data);

  if (data.error) {
    // console.log("responseData.error", responseData.error);
    return {
      // ...prevState,
      strapiErrors: data.error,
      message: "Failed to create checkout session.",
    };
  }

  // redirect("/dashboard/checkout/" + flattenedData.id);
  redirect("/dashboard/checkout/");
}

export const updateCheckoutSessionAction = async (
  updatedSession: CheckoutSessionTypePost,
  id: string,
) => {
  const payload = {
    data: updatedSession,
  };

  const responseData = await mutateData(
    "PUT",
    `/api/checkout-sessions/${id}`,
    payload,
  );

  if (!responseData) {
    return {
      // ...prevState,
      strapiErrors: null,
      message: "Oops! Something went wrong. Please try again.",
    };
  }

  if (responseData.error) {
    // console.log("responseData.error", responseData.error);
    return {
      // ...prevState,
      strapiErrors: responseData.error,
      message: "Failed to update checkout session.",
    };
  }

  const flattenedData = flattenAttributes(responseData);
  revalidatePath("/dashboard/checkout");

  // console.log(flattenedData);

  return {
    // ...prevState,
    message: "checkout session updated successfully",
    data: flattenedData,
    strapiErrors: null,
  };
};

export const updateCheckoutSessionActionWithItems = async (
  updatedSession: CheckoutSessionTypePost,
  id: string,
  items: InventoryItem[],
) => {
  const payload = {
    data: updatedSession,
  };

  const responseData = await mutateData(
    "PUT",
    `/api/checkout-sessions/${id}`,
    payload,
  );

  if (!responseData) {
    return {
      // ...prevState,
      strapiErrors: null,
      message: "Oops! Something went wrong. Please try again.",
    };
  }

  if (responseData.error) {
    // console.log("responseData.error", responseData.error);
    return {
      // ...prevState,
      strapiErrors: responseData.error,
      message: "Failed to update checkout session.",
    };
  }

  const flattenedData = flattenAttributes(responseData);

  let itemsResponses = Array(items.length);

  try {
    items.map((item, index) => {
      // console.log(item);
      const id = item.id as number;
      itemsResponses[index] = updateItemAction(
        { out: item.out, broken: item.broken },
        id.toString(),
      );
    });
  } catch (error) {
    console.log(itemsResponses);
    return { itemsError: itemsResponses };
  }

  revalidatePath("/dashboard/checkout");

  // console.log(flattenedData);

  return {
    // ...prevState,
    message: "Checkout session updated successfully",
    data: flattenedData,
    strapiErrors: null,
  };
};

export async function deleteCheckoutSessionAction(id: string) {
  const responseData = await mutateData(
    "DELETE",
    `/api/checkout-sessions/${id}`,
  );

  if (!responseData) {
    return {
      strapiErrors: null,
      message: "Oops! Something went wrong. Please try again.",
    };
  }

  if (responseData.error) {
    return {
      strapiErrors: responseData.error,
      message: "Failed to delete Item.",
    };
  }

  redirect("/dashboard/checkout");
}
