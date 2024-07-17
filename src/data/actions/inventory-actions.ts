"use server";

import { getAuthToken } from "@/data/services/get-token";
import { mutateData } from "@/data/services/mutate-data";
import { flattenAttributes } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { InventoryItem } from "@/app/lib/definitions";

// interface Payload {
//   data: {
//     title?: string;
//     videoId: string;
//     summary: string;
//   };
// }

export async function createInventoryItemAction(newItem: InventoryItem) {
  const authToken = await getAuthToken();
  if (!authToken) throw new Error("No auth token found");

  const payload = {
    data: newItem,
  };

  const data = await mutateData("POST", "/api/inventory-items", payload);
  // const flattenedData = flattenAttributes(data);
  // console.log("data submited#########", flattenedData);
  // redirect("/dashboard/master-inventory/" + flattenedData.id);
  redirect("/dashboard/master-inventory/");
}

export const updateItemAction = async (
  updatedItem: InventoryItem,
  id: string,
) => {
  const payload = {
    data: updatedItem,
  };

  const responseData = await mutateData(
    "PUT",
    `/api/inventory-items/${id}`,
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
  revalidatePath("/dashboard/master-inventory");

  return {
    // ...prevState,
    message: "Summary updated successfully",
    data: flattenedData,
    strapiErrors: null,
  };
};

export async function updateInventoryItemAction(
  prevState: any,
  formData: FormData,
) {
  const rawFormData = Object.fromEntries(formData);
  const id = rawFormData.id as string;

  const payload = {
    data: {
      title: rawFormData.title,
      summary: rawFormData.summary,
    },
  };

  const responseData = await mutateData(
    "PUT",
    `/api/inventory-items/${id}`,
    payload,
  );

  if (!responseData) {
    return {
      ...prevState,
      strapiErrors: null,
      message: "Oops! Something went wrong. Please try again.",
    };
  }

  if (responseData.error) {
    return {
      ...prevState,
      strapiErrors: responseData.error,
      message: "Failed to update summary.",
    };
  }

  const flattenedData = flattenAttributes(responseData);
  revalidatePath("/dashboard/master-inventory");

  return {
    ...prevState,
    message: "Summary updated successfully",
    data: flattenedData,
    strapiErrors: null,
  };
}

export async function deleteItemAction(id: string) {
  const responseData = await mutateData("DELETE", `/api/inventory-items/${id}`);

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
      message: "Failed to delete Item.",
    };
  }

  redirect("/dashboard/master-inventory");
}

export async function deleteInventoryItemAction(id: string, prevState: any) {
  const responseData = await mutateData("DELETE", `/api/inventory-items/${id}`);

  if (!responseData) {
    return {
      ...prevState,
      strapiErrors: null,
      message: "Oops! Something went wrong. Please try again.",
    };
  }

  if (responseData.error) {
    return {
      ...prevState,
      strapiErrors: responseData.error,
      message: "Failed to delete Item.",
    };
  }

  redirect("/dashboard/master-inventory");
}
