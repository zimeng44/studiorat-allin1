"use client";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  deleteItemAction,
  updateItemAction,
} from "@/data/actions/inventory-actions";
import {
  ACCEPTED_IMAGE_TYPES,
  InventoryItemWithImage,
  MAX_FILE_SIZE,
} from "@/data/definitions";
// import Link from "next/link";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { SubmitButton } from "../../../../components/custom/SubmitButton";
// import { inventory_items } from "@prisma/client";
import ImagePickerInForm from "@/components/custom/ImagePickerInForm";
import { getStrapiURL } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

const INITIAL_STATE = {
  strapiErrors: null,
  data: null,
  message: null,
};

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  m_tech_barcode: z.string().min(12).and(z.string().max(13)),
  make: z.string().min(2),
  model: z.string().min(2),
  category: z.string(),
  description: z.string().optional(),
  accessories: z.string().optional(),
  storage_location: z.string(),
  comments: z.string().optional(),
  out: z.boolean(),
  broken: z.boolean(),
  image: z.string().optional(),
});

const imageSchema = z.object({
  // username: z.string().min(2).max(50),
  image: z
    .any()
    .refine((file) => {
      if (file.size === 0 || file.name === undefined) return false;
      else return true;
    }, "Please update or add new image.")

    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      ".jpg, .jpeg, .png and .webp files are accepted.",
    )
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .optional(),
});

const EditItemForm = ({
  itemId,
  item,
}: {
  itemId: string;
  item: InventoryItemWithImage;
}) => {
  // console.log("Item Details Render!!");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [imageFile, setImageFile] = useState<File>();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      m_tech_barcode: item.m_tech_barcode ?? undefined,
      make: item.make ?? undefined,
      model: item.model ?? undefined,
      category: item.category ?? undefined,
      description: item.description ?? undefined,
      accessories: item.accessories ?? undefined,
      storage_location: item.storage_location ?? undefined,
      comments: item.comments ?? undefined,
      out: item.out ?? false,
      broken: item.broken ?? false,
      image: item.image?.url,
    },
  });

  const imageForm = useForm<z.infer<typeof imageSchema>>({
    resolver: zodResolver(imageSchema),
    defaultValues: {
      image: undefined,
    },
    mode: "onChange",
  });
  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    // console.log(imageForm.formState.errors);

    if (imageForm.formState.errors.image) return;
    // console.log(imageForm.formState.errors);
    // updateAction(updatedData);

    let imgId = null;
    try {
      if (imageForm.getValues("image")) {
        const baseUrl = getStrapiURL();
        const url = new URL("/api/upload", baseUrl);

        const formData = new FormData();
        formData.append(
          "file",
          imageForm.getValues("image"),
          imageForm.getValues("image").name,
        );

        const uploadResponse = await fetch(url, {
          method: "POST",
          body: formData,
        });

        const { res: imageResponse, error: uploadError } =
          await uploadResponse.json();
        // console.log(imageResponse);

        if (uploadError) throw Error(uploadError);
        imgId = imageResponse.id;
      }

      // return;
      const updateValues = {
        ...values,
        image: imgId ? { connect: { id: imgId } } : undefined,
        updated_at: new Date(),
      };

      const { res, error } = await updateItemAction(updateValues, itemId);

      if (!error) {
        router.push("/dashboard/master-inventory");
        router.refresh();
        toast.success("Item Saved.");
      } else {
        toast.error("Update failed");
      }
    } catch (error) {
      toast.error("Update failed");
    }
  }

  async function handleDelete(e: any) {
    const confirm = window.confirm(
      "Are you sure you want to delete this item?",
    );

    if (!confirm) return;

    const { res, error } = await deleteItemAction(itemId);

    if (!error) {
      router.push("/dashboard/master-inventory");
      router.refresh();
      toast.success("Item Deleted");
    } else {
      window.alert(error);
    }
  }

  return (
    <div className="grid-col-2 flex max-w-2xl flex-col-reverse gap-4 md:grid md:grid-cols-3 md:flex-row">
      <div className="col-span-2 flex space-y-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-screen shrink flex-col gap-2 space-y-1 px-2 md:grid md:max-w-lg md:grid-cols-2 md:px-0"
          >
            <FormField
              control={form.control}
              name="m_tech_barcode"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>MTech Barcode</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"MTech Barcode Here"}
                      {...field}
                    ></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Make</FormLabel>
                  <FormControl>
                    <Input {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accessories"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Accessories</FormLabel>
                  <FormControl>
                    <Input {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="storage_location"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Storage Location</FormLabel>
                  {/* <FormControl>
                <Input {...field}></Input>
              </FormControl> */}
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select A Storage Location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Floor 8">Floor 8</SelectItem>
                      <SelectItem value="Floor 6">Floor 6</SelectItem>
                      <SelectItem value="Studio G">Studio G</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Input {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-1 flex h-10 content-center items-center justify-evenly">
              <FormField
                control={form.control}
                name="broken"
                render={({ field }) => (
                  <FormItem className="flex content-center items-center">
                    <FormLabel>Broken</FormLabel>
                    <FormControl className="pl-2">
                      <div className="">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-1"></div>

            {/* <Button className="align-right" type="submit">
            Save
          </Button> */}

            <div className="col-span-1 flex gap-1 md:col-span-2">
              <SubmitButton
                className="flex-1"
                text="Save"
                loadingText="Saving"
                loading={form.formState.isSubmitting}
              />
              <Button
                className="flex-1"
                type="button"
                variant="destructive"
                onClick={(e) => handleDelete(e)}
              >
                Delete
              </Button>
              {/* <Link href="/dashboard/master-inventory">
              <Button
                className="flex-1 hover:bg-slate-200 active:bg-slate-300"
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
            </Link> */}
              <Button
                className="flex-1 hover:bg-slate-200 active:bg-slate-300"
                type="button"
                variant="secondary"
                onClick={(e) => {
                  // const params = new URLSearchParams(searchParams);
                  router.push(
                    `/dashboard/master-inventory?${searchParams.toString()}`,
                  );
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <div className="col-span-2 flex size-fit md:col-span-1">
        <Form {...imageForm}>
          <form className="flex w-screen shrink flex-col gap-2 space-y-1 px-2 md:grid md:max-w-lg md:grid-cols-2 md:px-0">
            <FormField
              control={imageForm.control}
              name="image"
              render={({ field }) => (
                <FormItem className=" col-span-1 size-fit max-w-xs md:col-span-2">
                  <FormLabel></FormLabel>
                  <FormControl>
                    <ImagePickerInForm
                      id="image"
                      name="image"
                      label="Item Image"
                      defaultValue={form.getValues("image")}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage>
                    <span className="text-xs text-muted-foreground">
                      (Click on the picture to change)
                    </span>
                  </FormMessage>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditItemForm;
