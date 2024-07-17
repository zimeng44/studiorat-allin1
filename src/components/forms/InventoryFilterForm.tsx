"use client";

import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { SheetClose } from "@/components/ui/sheet";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface InventoryFilterFormProps {
  mTechBarcode?: string;
  make?: string;
  model?: string;
  category?: string;
  description?: string;
  accessories?: string;
  storageLocation?: string;
  comments?: string;
  out?: boolean;
  broken?: boolean;
}

const mTechBarcode = z.union([
  z.string().min(12).and(z.string().max(13)),
  z.string().length(0),
]);

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  mTechBarcode: mTechBarcode,
  make: z.string(),
  model: z.string(),
  category: z.string(),
  description: z.string(),
  accessories: z.string(),
  storageLocation: z.string(),
  comments: z.string(),
  out: z.boolean(),
  broken: z.boolean(),
});

const InventoryFilterForm = ({
  filter,
}: {
  filter: InventoryFilterFormProps;
}) => {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: filter,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const createPageURL = (filterValues: InventoryFilterFormProps) => {
    const params = new URLSearchParams(searchParams);
    params.set("filterOpen", "false");
    for (const [key, value] of Object.entries(filterValues)) {
      if ((key === "out" || key === "broken") && value === false) {
        params.delete(key);
        continue;
      }
      if (value === "" || value === "All") {
        params.delete(key);
        continue;
      }
      params.set(key, value);
    }
    // console.log(params.toString());
    // params.set("page", pageNumber.toString());
    // params.set("pageSize", newPageSize.toString());
    return `${pathname}?${params.toString()}`;
  };

  const resetPageURL = (filterValues: InventoryFilterFormProps) => {
    const params = new URLSearchParams(searchParams);
    params.set("filterOpen", "false");
    for (const [key, value] of Object.entries(filterValues)) {
      if (
        (value === "" || value === false || value === "All") &&
        params.has(key)
      )
        params.delete(key);
    }
    // params.set("page", pageNumber.toString());
    // params.set("pageSize", newPageSize.toString());
    return `${pathname}?${params.toString()}`;
  };

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    // setFilter(values);
    router.push(createPageURL(values));
    // setFilterOpen(false);
  }

  const handleReset = () => {
    const blankFilter = {
      mTechBarcode: "",
      make: "",
      model: "",
      category: "",
      description: "",
      accessories: "",
      storageLocation: "All",
      comments: "",
      out: false,
      broken: false,
    };
    router.push(resetPageURL(blankFilter));
    // console.log(resetPageURL(blankFilter));
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-2"
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
                    <SelectItem value="All">All</SelectItem>
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
          <div className="col-span-1 mt-3 flex content-center gap-10 bg-slate-300">
            <FormField
              control={form.control}
              name="out"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="ml-2 align-bottom">Out</FormLabel>
                  <FormControl>
                    <Checkbox
                      className="ml-2 align-middle"
                      // disabled
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
                    {/* <Input placeholder={"Broken"} {...field}></Input> */}
                    <Checkbox
                      className="ml-2"
                      // disabled
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mt-3 space-x-2">
            <Button type="submit">Filter</Button>
            <Button
              className="hover:bg-slate-200 active:bg-slate-300"
              type="button"
              variant="secondary"
              onClick={() => handleReset()}
            >
              Reset
            </Button>

            <SheetClose asChild>
              <Button
                className="hover:bg-slate-200 active:bg-slate-300"
                type="button"
                variant="secondary"
              >
                Close
              </Button>
            </SheetClose>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default InventoryFilterForm;
