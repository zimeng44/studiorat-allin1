"use client";
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// import { toast } from "react-toastify";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";
import { InventoryItem } from "@/data/definitions";
import { createInventoryItemAction } from "@/data/actions/inventory-actions";

interface StrapiErrorsProps {
  message: string | null;
  name: string;
}

const INITIAL_STATE = {
  message: null,
  name: "",
};

const mTechBarcodeType = z.union([
  z.string().min(12).and(z.string().max(13)),
  z.string().length(0),
]);
// .optional();
// .transform((e) => (e === "" ? undefined : e));

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  mTechBarcode: mTechBarcodeType,
  make: z.string(),
  model: z.string(),
  category: z.string(),
  description: z.string(),
  accessories: z.string(),
  storageLocation: z
    .literal("Floor 6")
    .or(z.literal("Floor 8"))
    .or(z.literal("Studio G")),
  comments: z.string(),
  out: z.boolean(),
  broken: z.boolean(),
});

const AddItem = ({ rowData }: { rowData: InventoryItem }) => {
  // const [data, setData] = useState(rowData);
  const [error, setError] = useState<StrapiErrorsProps>(INITIAL_STATE);

  // console.log(rowId);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mTechBarcode: rowData.mTechBarcode,
      make: rowData.make,
      model: rowData.model,
      category: rowData.category,
      description: rowData.description,
      accessories: rowData.accessories,
      storageLocation: "Floor 8",
      comments: rowData.comments,
      out: rowData.out,
      broken: rowData.broken,
    },
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

    try {
      await createInventoryItemAction(values);
    } catch (error) {
      toast.error("Error Creating Summary");
      setError({
        ...INITIAL_STATE,
        message: "Error Creating Inventory Item",
        name: "Inventory Item Error",
      });
      // setLoading(false);
      return;
    }

    toast.success("New Item Added");
    // console.log("data submited!!!!!!!!!!!");
    // setAddOpen(false);
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4"
        >
          <FormField
            control={form.control}
            name="mTechBarcode"
            render={({ field }) => (
              <FormItem>
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
              <FormItem>
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
              <FormItem>
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
              <FormItem>
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
              <FormItem>
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
              <FormItem>
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
            name="storageLocation"
            render={({ field }) => (
              <FormItem>
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
              <FormItem>
                <FormLabel>Comments</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <div className="col-span-1 flex gap-12 bg-slate-300">
            <FormField
              control={form.control}
              name="out"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="ml-2 align-bottom">Out</FormLabel>
                  <FormControl>
                    <Checkbox
                      className="ml-2 align-middle"
                      disabled
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="broken"
              render={({ field }) => (
                <FormItem className="mb-1">
                  <FormLabel className="ml-1">Broken</FormLabel>
                  <FormControl>
                    
                    <Checkbox
                      className="ml-2"
                      disabled
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div> */}

          {/* <div className="col-span-1 grid grid-cols-subgrid gap-4"></div> */}

          <Button className="align-right" type="submit">
            Add
          </Button>
          <Link href="/dashboard/master-inventory">
            <Button
              className="hover:bg-slate-200 active:bg-slate-300"
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
          </Link>
        </form>
      </Form>
    </div>
  );
};

export default AddItem;
