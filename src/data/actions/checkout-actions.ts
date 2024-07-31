"use server";

import { getAuthToken } from "@/data/services/get-token";
import { mutateData } from "@/data/services/mutate-data";
import { flattenAttributes } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  CheckoutSessionType,
  CheckoutSessionTypePost,
} from "@/data/definitions";

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

  // redirect("/dashboard/checkout/" + flattenedData.id);
  redirect("/dashboard/checkout/");
}

export const updateCheckoutSessionAction = async (
  updatedSession: CheckoutSessionTypePost,
  id: string,
) => {
  // if (updatedSession.creationTime === undefined)
  //   // delete updatedSession?.creationTime;
  //   updatedSession.creationTime = "";
  // else
  //   updatedSession.creationTime = new Date(
  //     updatedSession.creationTime,
  //   ).toISOString();

  // if (
  //   updatedSession.finishTime === undefined ||
  //   updatedSession.finishTime === ""
  // )
  //   delete updatedSession.finishTime;
  // else
  //   updatedSession.finishTime = new Date(
  //     updatedSession.finishTime,
  //   ).toISOString();

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
      message: "Failed to update summary.",
    };
  }

  const flattenedData = flattenAttributes(responseData);
  revalidatePath("/dashboard/checkout");

  // console.log(flattenedData);

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
