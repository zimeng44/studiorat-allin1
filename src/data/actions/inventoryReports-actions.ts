"use server";

import { getAuthToken } from "@/data/services/get-token";
import { mutateData } from "@/data/services/mutate-data";
import { flattenAttributes } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { InventoryReportTypePost } from "@/data/definitions";
// import { updateItemAction } from "./inventory-actions";

export async function createInventoryReportAction(
  newSession: InventoryReportTypePost,
) {
  const authToken = await getAuthToken();
  if (!authToken) throw new Error("No auth token found");

  const payload = {
    data: newSession,
  };

  const data = await mutateData("POST", "/api/inventory-reports", payload);
  const flattenedData = flattenAttributes(data);

  // redirect("/dashboard/checkout/" + flattenedData.id);
  redirect("/dashboard/inventory-reports/");
}

export const updateInventoryReportAction = async (
  updatedReport: InventoryReportTypePost,
  id: string,
) => {
  const payload = {
    data: updatedReport,
  };

  const responseData = await mutateData(
    "PUT",
    `/api/inventory-reports/${id}`,
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
  revalidatePath("/dashboard/inventory-reports");

  // console.log(flattenedData);

  return {
    // ...prevState,
    message: "Summary updated successfully",
    data: flattenedData,
    strapiErrors: null,
  };
};

// export const updateInventoryReportActionWithItems = async (
//   updatedSession: InventoryReportTypePost,
//   id: string,
//   items: InventoryItem[],
// ) => {
//   const payload = {
//     data: updatedSession,
//   };

//   const responseData = await mutateData(
//     "PUT",
//     `/api/inventory-reports/${id}`,
//     payload,
//   );

//   if (!responseData) {
//     return {
//       // ...prevState,
//       strapiErrors: null,
//       message: "Oops! Something went wrong. Please try again.",
//     };
//   }

//   if (responseData.error) {
//     // console.log("responseData.error", responseData.error);
//     return {
//       // ...prevState,
//       strapiErrors: responseData.error,
//       message: "Failed to update summary.",
//     };
//   }

//   const flattenedData = flattenAttributes(responseData);

//   let itemsResponses = Array(items.length);

//   try {
//     items.map((item, index) => {
//       // console.log(item);
//       const id = item.id as number;
//       itemsResponses[index] = updateItemAction(
//         { out: item.out, broken: item.broken },
//         id.toString(),
//       );
//     });
//   } catch (error) {
//     console.log(itemsResponses);
//     return { itemsError: itemsResponses };
//   }

//   revalidatePath("/dashboard/inventory-reports");

//   // console.log(flattenedData);

//   return {
//     // ...prevState,
//     message: "Summary updated successfully",
//     data: flattenedData,
//     strapiErrors: null,
//   };
// };

export async function deleteInventoryReportAction(id: string) {
  const responseData = await mutateData(
    "DELETE",
    `/api/inventory-reports/${id}`,
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

  redirect("/dashboard/inventory-reports");
}
