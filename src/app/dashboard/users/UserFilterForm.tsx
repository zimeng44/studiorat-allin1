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

interface FilterFormProps {
  blocked?: boolean;
  academicLevel?: string;
  role?: string;
}

// const mTechBarcode = z.union([
//   z.string().min(12).and(z.string().max(13)),
//   z.string().length(0),
// ]);

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  academicLevel: z.string().optional(),
  blocked: z.boolean().optional(),
  role: z.string().optional(),
});

const UserFilterForm = ({
  filter,
  currentUserRole,
}: {
  filter: FilterFormProps;
  currentUserRole: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const createPageURL = (filterValues: FilterFormProps) => {
    const params = new URLSearchParams(searchParams);
    params.set("filterOpen", "false");
    params.set("filterOn", "true");
    for (const [key, value] of Object.entries(filterValues)) {
      if (key === "blocked" && value === false) {
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

  const resetPageURL = (filterValues: FilterFormProps) => {
    const params = new URLSearchParams(searchParams);
    params.set("filterOpen", "false");
    params.set("filterOn", "false");
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

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: filter,
  });

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
      academicLevel: "All",
      blocked: false,
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
          {currentUserRole === "Admin" ? (
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="size-fit">
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select A Role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Monitor">Monitor</SelectItem>
                      <SelectItem value="InventoryManager">
                        Inventory Manager
                      </SelectItem>
                      <SelectItem value="Authenticated">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            ``
          )}
          <FormField
            control={form.control}
            name="academicLevel"
            render={({ field }) => (
              <FormItem className="size-fit">
                <FormLabel>Academic Level</FormLabel>
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
                    <SelectItem value="Grad">Grad</SelectItem>
                    <SelectItem value="Undergrad">Undergrad</SelectItem>
                    <SelectItem value="Faculty">Faculty</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-1 flex grid-cols-2 justify-evenly gap-2 bg-slate-300">
            <FormField
              control={form.control}
              name="blocked"
              render={({ field }) => (
                <FormItem className="col-span-2 grid grid-cols-2 items-center">
                  <FormLabel className="col-span-1">Blocked</FormLabel>
                  <FormControl className="col-span-1 size-fit">
                    <div className="pb-4">
                      <Checkbox
                        className="ml-2"
                        // disabled
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
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UserFilterForm;
