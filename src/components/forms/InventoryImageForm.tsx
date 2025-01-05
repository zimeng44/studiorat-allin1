"use client";
import React from "react";
import { useActionState } from "react";
import { cn } from "@/lib/utils";
import { SubmitButton } from "@/components/custom/SubmitButton";
import ImagePicker from "@/components/custom/ImagePicker";
import { ZodErrors } from "@/components/custom/ZodErrors";
import { StrapiErrors } from "@/components/custom/StrapiErrors";
import { uploadInventoryImageAction } from "@/data/actions/inventory-actions";

interface InventoryImageFormProps {
  id: number;
  url: string | null;
  name?: string | null;
}

const initialState = {
  message: null,
  data: null,
  strapiErrors: null,
  zodErrors: null,
};

export function InventoryImageForm({
  data,
  className,
  inventoryId,
}: {
  data: Readonly<InventoryImageFormProps> | null;
  className?: string;
  inventoryId: number;
}) {
  const uploadInventoryImageWithIdAction = uploadInventoryImageAction.bind(
    null,
    data?.id ?? null,
    inventoryId,
  );

  const [formState, formAction] = useActionState(
    uploadInventoryImageWithIdAction,
    initialState,
  );

  return (
    <form className={cn("max-w-60 space-y-4", className)} action={formAction}>
      <div className="">
        <ImagePicker
          id="image"
          name="image"
          label="Profile Image"
          defaultValue={data?.url || ""}
        />
        <ZodErrors error={formState.zodErrors?.image} />
        <StrapiErrors error={formState.strapiErrors} />
      </div>
      <div className="flex justify-end">
        <SubmitButton text="Save Image" loadingText="Saving Image" />
      </div>
    </form>
  );
}
