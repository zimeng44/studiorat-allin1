import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import { Checkbox } from "@/components/ui/checkbox";
// import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { studioList } from "@/data/definitions";

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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// const mTechBarcode = z.union([
//   z.string().min(12).and(z.string().max(13)),
//   z.string().length(0),
// ]);
interface FilterFormProps {
  // creationTime?: { from?: Date; to?: Date };
  // finishTime?: { from?: Date; to?: Date };
  // stuIDCheckout?: string;
  // stuIDCheckin?: string;
  // studio?: string;
  // otherLocation?: string;
  // creationMonitor?: string;
  // finishMonitor?: string;
  // notes?: string;
  isFinished?: string;
  // userName?: string;
}

const formSchema = z.object({
  // creationTime: z
  //   .object({
  //     from: z.date(),
  //     to: z.date(),
  //   })
  //   .optional(),
  // finishTime: z
  //   .object({
  //     from: z.date(),
  //     to: z.date(),
  //   })
  //   .optional(),
  // stuIDCheckout: z.string().optional(),
  // stuIDCheckin: z.string().optional(),
  // studio: z.string().optional(),
  // otherLocation: z.string().optional(),
  // creationMonitor: z.string().optional(),
  // finishMonitor: z.string().optional(),
  // notes: z.string().optional(),
  isFinished: z.string().optional(),
  // inventory_items: z.string().optional(),
  // user: z.string().optional(),
  // username: z.string().min(2).max(50),
});

const FilterForm = ({ filter }: { filter: FilterFormProps }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const createPageURL = (filterValues: FilterFormProps) => {
    const params = new URLSearchParams(searchParams);
    params.set("filterOpen", "false");
    for (const [key, value] of Object.entries(filterValues)) {
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
    for (const [key, value] of Object.entries(filterValues)) {
      params.delete(key);
    }
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

    // console.log(values.finished);
    router.push(createPageURL(values));
  }

  const handleReset = () => {
    const blankFilter = {
      isFinished: "",
    };
    router.push(resetPageURL(blankFilter));
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          // className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-1 mt-3 flex gap-10 bg-slate-200">
            <FormField
              control={form.control}
              name="isFinished"
              render={({ field }) => (
                <FormItem className="m-2">
                  <FormLabel className="ml-1">Finished</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="m-2">
                        <SelectValue placeholder="Finished?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="finished">Finished</SelectItem>
                      <SelectItem value="unfinished">Unfinished</SelectItem>
                    </SelectContent>
                  </Select>
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

export default FilterForm;
