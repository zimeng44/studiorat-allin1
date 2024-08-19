"use server";

import { getAuthToken } from "@/data/services/get-token";
import { mutateData } from "@/data/services/mutate-data";
import { flattenAttributes } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { InventoryReportTypePost } from "@/data/definitions";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
// import { updateItemAction } from "./inventory-actions";

export async function createInventoryReportAction(
  newReport: Prisma.inventory_reportsCreateInput,
) {
  const authToken = await getAuthToken();
  if (!authToken) throw new Error("No auth token found");

  const payload = {
    data: newReport,
  };

  try {
    const resData = prisma.inventory_reports.create(payload);
    return { res: resData, error: null };
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

export const updateInventoryReportAction = async (
  updatedReport: Prisma.inventory_reportsUncheckedUpdateInput,
  id: string,
) => {
  const payload = {
    data: updatedReport,
    where: {
      id: parseInt(id),
    },
  };

  try {
    const responseData = await prisma.inventory_reports.update(payload);
    revalidatePath("/dashboard/inventory-reports");
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

export async function deleteInventoryReportAction(id: string) {
  // const responseData = await mutateData(
  //   "DELETE",
  //   `/api/inventory-reports/${id}`,
  // );
  // if (!responseData) {
  //   return {
  //     strapiErrors: null,
  //     message: "Oops! Something went wrong. Please try again.",
  //   };
  // }
  // if (responseData.error) {
  //   return {
  //     strapiErrors: responseData.error,
  //     message: "Failed to delete Item.",
  //   };
  // }
  // redirect("/dashboard/inventory-reports");
}
