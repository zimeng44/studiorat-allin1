"use server";

import { getAuthToken } from "@/data/services/get-token";
import { mutateData } from "@/data/services/mutate-data";
import { flattenAttributes } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CheckoutSessionType } from "@/app/lib/definitions";

export async function createCheckoutSessionAction(
  newSession: CheckoutSessionType,
) {
  const authToken = await getAuthToken();
  if (!authToken) throw new Error("No auth token found");

  const payload = {
    data: newSession,
  };

  const data = await mutateData("POST", "/api/checkout-sessions", payload);
  // const flattenedData = flattenAttributes(data);
  // console.log("data submited#########", flattenedData);
  // redirect("/dashboard/master-inventory/" + flattenedData.id);
  redirect("/dashboard/checkout/");
}

export const updateCheckoutSessionAction = async (
  updatedSession: CheckoutSessionType,
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
    return {
      // ...prevState,
      strapiErrors: responseData.error,
      message: "Failed to update summary.",
    };
  }

  const flattenedData = flattenAttributes(responseData);
  revalidatePath("/dashboard/checkout");

  return {
    // ...prevState,
    message: "Summary updated successfully",
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
