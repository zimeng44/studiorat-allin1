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
    revalidatePath("/dashboard/roster/permissions");
    return data;
  } catch (error) {
    console.log(error);
  }
}

export const updateRosterPermissionAction = async (
  updatedRosterPermission: RosterPermissionTypePost,
  id: string,
) => {
  const payload = {
    data: updatedRosterPermission,
    where: { id: parseInt(id) },
  };

  try {
    const res = prisma.roster_permissions.update(payload);
    revalidatePath("/dashboard/roster/permissions");
    return { res: res, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(error);
      return { res: null, error: error.message };
    } else {
      console.log(error);
      return { res: null, error: "Error Unknown" };
    }
  }
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
