"use client";
import React, { useState } from "react";
import { useFormState } from "react-dom";
import { updateProfileAction } from "@/data/actions/profile-actions";
import { cn, getStrapiURL } from "@/lib/utils";
import { SubmitButton } from "@/components/custom/SubmitButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StrapiErrors } from "../custom/StrapiErrors";
import ImagePickerInForm from "../custom/ImagePickerInForm";
// import { InventoryItemWithImage } from "@/data/definitions";
import { Image } from "@prisma/client";

const INITIAL_STATE = {
  data: null,
  strapiErrors: null,
  message: null,
};

interface ProfileFormProps {
  id: string;
  net_id?: string | null;
  email?: string | null;
  image?: Image | null;
  first_name?: string | null;
  last_name?: string | null;
  bio?: string | null;
}

export function ProfileForm({
  data,
  className,
}: {
  readonly data: ProfileFormProps;
  readonly className?: string;
}) {
  const [imageFile, setImageFile] = useState<File>();

  const uploadImage = async (file: File | undefined) => {
    if (!file) return null;

    const baseUrl = getStrapiURL();
    const url = new URL("/api/upload", baseUrl);

    const formData = new FormData();
    formData.append("file", file, file.name);

    const uploadResponse = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const { res: imageResponse, error: uploadError } =
      await uploadResponse.json();
    // console.log(imageResponse);

    if (uploadError) throw Error(uploadError);
    return imageResponse.id;
  };

  const handleFormSubmit = async (initialState: any, formData: any) => {
    setIsLoading(true);
    try {
      // Step 1: Upload the image and get the imageId

      const imageId = imageFile ? await uploadImage(imageFile) : null;

      // Step 2: Bind updateProfileAction with data.id and imageId
      const updateProfileWithId = updateProfileAction.bind(
        null,
        data.id,
        imageId,
      );

      // Step 3: Execute the bound function to update the profile
      const res = await updateProfileWithId(null, formData);

      // console.log(res);
      setIsLoading(false);
      return await res;

      // console.log("Profile updated successfully");
    } catch (error) {
      setIsLoading(false);
      console.error("Error updating profile:", error);
      return {
        message: "Error updateing profile",
        data: null,
        StrapiErrors: null,
      };
    }
  };

  // const updateProfileWithId = updateProfileAction.bind(
  //   null,
  //   data.id,
  // );
  const [isLoading, setIsLoading] = useState(false);

  const [formState, formAction] = useFormState(handleFormSubmit, INITIAL_STATE);
  // console.log(formState.message);

  return (
    <form action={formAction} className={cn("space-y-4", className)}>
      <div className="grid-col-2 flex flex-col-reverse gap-4 md:grid md:grid-cols-3 md:flex-row">
        <div className="col-span-2 grid space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="net_id"
              name="net_id"
              placeholder="NetID"
              defaultValue={data.net_id || ""}
              disabled
            />
            <Input
              id="email"
              name="email"
              placeholder="Email"
              defaultValue={data.email || ""}
              disabled
            />
            {/* <CountBox text={data.credits} /> */}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="first_name"
              name="first_name"
              placeholder="First Name"
              defaultValue={data.first_name || ""}
            />
            <Input
              id="last_name"
              name="last_name"
              placeholder="Last Name"
              defaultValue={data.last_name || ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="password"
              name="password"
              placeholder="New Password"
              defaultValue={undefined}
              type="password"
            />
          </div>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Write your bio here..."
            className="h-[124px] w-full resize-none rounded-md border p-2"
            defaultValue={data.bio || ""}
            // required
          />
        </div>
        <div className="col-span-2 size-fit md:col-span-1">
          <ImagePickerInForm
            id="image"
            name="image"
            label="Item Image"
            defaultValue={data.image?.url}
            value={imageFile}
            onChange={setImageFile}
          />
          <p className="text-xs text-muted-foreground">
            (Click on the picture to change)
          </p>
        </div>
      </div>
      <div className="grid-col-2 flex justify-end md:grid md:grid-cols-3">
        <SubmitButton
          text="Update Profile"
          loadingText="Saving Profile"
          loading={isLoading}
        />
      </div>
      <StrapiErrors error={formState?.strapiErrors} />
      <p className="bold text-sm italic text-muted-foreground">
        {formState.message}
      </p>
    </form>
  );
}
