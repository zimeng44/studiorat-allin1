"use server";

import { getAuthToken } from "@/data/services/get-token";
import { mutateData } from "@/data/services/mutate-data";
import { flattenAttributes } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { BookingTypePost, RosterRecordTypePost } from "@/data/definitions";

export async function createRosterAction(
  newRosterRecord: RosterRecordTypePost,
) {
  const authToken = await getAuthToken();
  if (!authToken) throw new Error("No auth token found");

  // console.log(newRosterRecord.finishTime);

  const payload = {
    data: newRosterRecord,
  };

  const data = await mutateData("POST", "/api/rosters", payload);
  const flattenedData = flattenAttributes(data);
  // console.log("data submited#########", flattenedData);
  // redirect("/dashboard/rosterRecord/" + flattenedData.id);
  // redirect("/dashboard/roster");
}

export const updateRosterAction = async (
  updatedRosterRecord: RosterRecordTypePost,
  id: string,
) => {
  const payload = {
    data: updatedRosterRecord,
  };

  const responseData = await mutateData("PUT", `/api/rosters/${id}`, payload);

  // console.log(updatedRosterRecord);

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
  revalidatePath("/dashboard/roster");

  redirect("/dashboard/roster");

  // console.log(flattenedData);

  return {
    // ...prevState,
    message: "Summary updated successfully",
    data: flattenedData,
    strapiErrors: null,
  };
};

export async function deleteRosterAction(id: string) {
  const responseData = await mutateData("DELETE", `/api/rosters/${id}`);

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

  redirect("/dashboard/roster");
}
