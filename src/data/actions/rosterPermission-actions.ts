"use server";

import { getAuthToken } from "@/data/services/get-token";
import { mutateData } from "@/data/services/mutate-data";
import { flattenAttributes } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { BookingTypePost, RosterPermissionTypePost } from "@/data/definitions";

export async function createRosterPermissionAction(
  newRosterPermission: RosterPermissionTypePost,
) {
  const authToken = await getAuthToken();
  if (!authToken) throw new Error("No auth token found");

  // console.log(newRosterPermission.finishTime);
  if (newRosterPermission.startDate)
    newRosterPermission.startDate = new Date(
      newRosterPermission.startDate,
    ).toISOString();
  if (newRosterPermission.endDate)
    newRosterPermission.endDate = new Date(
      newRosterPermission.endDate,
    ).toISOString();

  const payload = {
    data: newRosterPermission,
  };

  const data = await mutateData("POST", "/api/roster-permissions", payload);
  const flattenedData = flattenAttributes(data);
  // console.log("data submited#########", flattenedData);
  // redirect("/dashboard/rosterPermission/" + flattenedData.id);
  // redirect("/dashboard/roster");
}

export const updateRosterPermissionAction = async (
  updatedRosterPermission: RosterPermissionTypePost,
  id: string,
) => {
  // if (updatedRosterPermission.startTime === undefined) delete updatedRosterPermission.startTime;
  // else
  //   updatedRosterPermission.startTime = new Date(updatedRosterPermission.startTime).toISOString();

  // if (updatedRosterPermission.endTime === undefined || updatedRosterPermission.endTime === "")
  //   delete updatedRosterPermission.endTime;
  // else updatedRosterPermission.endTime = new Date(updatedRosterPermission.endTime).toISOString();

  const payload = {
    data: updatedRosterPermission,
  };

  const responseData = await mutateData(
    "PUT",
    `/api/roster-permissions/${id}`,
    payload,
  );

  // console.log(updatedRosterPermission);

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

  redirect("/dashboard/roster/permissions");

  // console.log(flattenedData);

  return {
    // ...prevState,
    message: "Summary updated successfully",
    data: flattenedData,
    strapiErrors: null,
  };
};

export async function deleteRosterPermissionAction(id: string) {
  const responseData = await mutateData(
    "DELETE",
    `/api/roster-permissions/${id}`,
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

  redirect("/dashboard/roster/permissions");
}
