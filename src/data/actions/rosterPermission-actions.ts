"use server";

import { getAuthToken } from "@/data/services/get-token";
import { mutateData } from "@/data/services/mutate-data";
import { flattenAttributes } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { RosterPermissionTypePost } from "@/data/definitions";
import prisma from "@/lib/prisma";
import { Prisma, roster_permissions } from "@prisma/client";

export async function getPermissionByPermissionCode(permission_code: string) {
  const query = {
    // sort: ["createdAt:desc"],
    where: {
      permission_code: { equals: permission_code },
    },
  };
  // const url = new URL("/api/roster-permissions", baseUrl);
  // url.search = query;
  // console.log("query data", url.href);
  try {
    const data = await prisma.roster_permissions.findMany(query);
    return { data: data, error: null };
  } catch (error) {
    return { data: null, error: error as string };
  }
}

export async function createRosterPermissionAction(
  newRosterPermission: Prisma.roster_permissionsCreateInput,
) {
  const authToken = await getAuthToken();
  if (!authToken) throw new Error("No auth token found");

  const payload = {
    data: newRosterPermission,
  };

  try {
    const data = await prisma.roster_permissions.create(payload);
    return data;
  } catch (error) {
    console.log(error);
  }
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
  try {
    const res = await prisma.roster_permissions.delete({
      where: { id: parseInt(id) },
    });
    revalidatePath("/dashboard/roster");
    return { res: res, error: null };
  } catch (error) {
    console.log(error);
    return { res: null, error: error as string };
  }
}
