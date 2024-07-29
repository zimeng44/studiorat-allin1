"use server";

import { getAuthToken } from "@/data/services/get-token";
import { mutateData } from "@/data/services/mutate-data";
import { flattenAttributes } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { BookingType, BookingTypePost } from "@/data/definitions";

export async function createBookingAction(newBooking: BookingTypePost) {
  const authToken = await getAuthToken();
  if (!authToken) throw new Error("No auth token found");

  // console.log(newBooking.finishTime);
  newBooking.startTime = new Date(newBooking.startTime).toISOString();

  newBooking.endTime = new Date(newBooking.endTime).toISOString();

  const payload = {
    data: newBooking,
  };

  const data = await mutateData("POST", "/api/bookings", payload);
  const flattenedData = flattenAttributes(data);
  // console.log("data submited#########", flattenedData);
  // redirect("/dashboard/booking/" + flattenedData.id);
  redirect("/dashboard/booking");
}

export const updateBookingAction = async (
  updatedBooking: BookingTypePost,
  id: string,
) => {
  // if (updatedBooking.startTime === undefined) delete updatedBooking.startTime;
  // else
  //   updatedBooking.startTime = new Date(updatedBooking.startTime).toISOString();

  // if (updatedBooking.endTime === undefined || updatedBooking.endTime === "")
  //   delete updatedBooking.endTime;
  // else updatedBooking.endTime = new Date(updatedBooking.endTime).toISOString();

  const payload = {
    data: updatedBooking,
  };

  const responseData = await mutateData("PUT", `/api/bookings/${id}`, payload);

  // console.log(updatedBooking);

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
  revalidatePath("/dashboard/booking");

  redirect("/dashboard/booking");

  // console.log(flattenedData);

  return {
    // ...prevState,
    message: "Summary updated successfully",
    data: flattenedData,
    strapiErrors: null,
  };
};

export async function deleteBookingAction(id: string) {
  const responseData = await mutateData("DELETE", `/api/bookings/${id}`);

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

  redirect("/dashboard/booking");
}
