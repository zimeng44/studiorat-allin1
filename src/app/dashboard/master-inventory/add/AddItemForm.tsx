"use client";
import React from "react";
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
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { createInventoryItemAction } from "@/data/actions/inventory-actions";
import { SubmitButton } from "../../../../components/custom/SubmitButton";
import { useRouter } from "next/navigation";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/data/definitions";
import ImagePicker from "@/components/custom/ImagePicker";
import ImagePickerInForm from "@/components/custom/ImagePickerInForm";
import { fileUploadService } from "@/data/services/file-service";
import { getStrapiURL } from "@/lib/utils";

interface StrapiErrorsProps {
  message: string | null;
  name: string;
}

const INITIAL_STATE = {
  message: null,
  name: "",
};

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  m_tech_barcode: z.string().min(12).and(z.string().max(13)),
  make: z.string().min(2),
  model: z.string().min(2),
  category: z.string(),
  description: z.string().optional(),
  accessories: z.string().optional(),
  storage_location: z
    .literal("Floor 6")
    .or(z.literal("Floor 8"))
    .or(z.literal("Studio G")),
  comments: z.string().optional(),
  out: z.boolean(),
  broken: z.boolean(),
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

const AddItem = ({ rowData }: { rowData: any }) => {
  const router = useRouter();
  // const [data, setData] = useState(rowData);
  const [error, setError] = useState<StrapiErrorsProps>(INITIAL_STATE);

  // console.log(rowId);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      m_tech_barcode: rowData.m_tech_barcode ?? undefined,
      make: rowData.make ?? undefined,
      model: rowData.model ?? undefined,
      category: rowData.category ?? undefined,
      description: rowData.description ?? undefined,
      accessories: rowData.accessories ?? undefined,
      storage_location: "Floor 8",
      comments: rowData.comments ?? undefined,
      out: rowData.out ?? false,
      broken: rowData.broken ?? false,
    },
    mode: "onChange",
  });

  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // const data = {
    //   data: values,
    // };

    // console.log(values.image);
    // return;
    try {
      const baseUrl = getStrapiURL();
      const url = new URL("/api/upload", baseUrl);

      const formData = new FormData();
      formData.append("file", values.image, values.image.name);

      const uploadResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const { res: imageResponse, error: uploadError } =
        await uploadResponse.json();
      // console.log(imageResponse);

      if (uploadError) throw Error(uploadError);

      const createValues = {
        ...values,
        image: { connect: { id: imageResponse.id } },
      };

      const { res, error } = await createInventoryItemAction(createValues);
      if (error) throw Error(error);
      router.push("/dashboard/master-inventory");
      router.refresh();
      toast.success("New Item Added");
    } catch (error) {
      console.log(error);
      toast.error("Error Creating Summary");
      // setError({
      //   ...INITIAL_STATE,
      //   message: "Error Creating Inventory Item",
      //   name: "Inventory Item Error",
      // });
      // setLoading(false);
      return;
    }

    // console.log("data submited!!!!!!!!!!!");
    // setAddOpen(false);
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-col gap-2 space-y-1 md:grid md:grid-cols-2"
        >
          {/* <div className="max-w-25 max-h-25 col-span-1 md:col-span-2"></div> */}
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem className=" col-span-1 size-fit max-w-xs md:col-span-2">
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <ImagePickerInForm
                    id="image"
                    name="image"
                    label="Item Image"
                    defaultValue={field.value}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="m_tech_barcode"
            render={({ field }) => (
              <FormItem className="col-span-1 ">
                <FormLabel>MTech Barcode</FormLabel>
                <FormControl>
                  <Input placeholder={"MTech Barcode Here"} {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem className="col-span-1 ">
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
              <FormItem className="col-span-1 ">
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
              <FormItem className="col-span-1 ">
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
              <FormItem className="col-span-1 ">
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
              <FormItem className="col-span-1 ">
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
              <FormItem className="col-span-1 ">
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
              <FormItem className="col-span-1 ">
                <FormLabel>Comments</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-1 flex gap-1 md:col-span-2">
            <SubmitButton
              className="flex-1"
              text="Save"
              loadingText="Saving"
              loading={form.formState.isSubmitting}
            />
            <Link className="flex-1" href="/dashboard/master-inventory">
              <Button
                className="size-full hover:bg-slate-200 active:bg-slate-300"
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddItem;
