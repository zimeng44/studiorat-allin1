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
interface CheckoutFilterFormProps {
  creationTime?: { from?: Date; to?: Date };
  finishTime?: { from?: Date; to?: Date };
  stuIDCheckout?: string;
  stuIDCheckin?: string;
  studio?: string;
  otherLocation?: string;
  creationMonitor?: string;
  finishMonitor?: string;
  notes?: string;
  finished?: string;
  userName?: string;
}

const formSchema = z.object({
  creationTime: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
  finishTime: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
  stuIDCheckout: z.string().optional(),
  stuIDCheckin: z.string().optional(),
  studio: z.string().optional(),
  otherLocation: z.string().optional(),
  creationMonitor: z.string().optional(),
  finishMonitor: z.string().optional(),
  notes: z.string().optional(),
  finished: z.string().optional(),
  inventory_items: z.string().optional(),
  user: z.string().optional(),
  // username: z.string().min(2).max(50),
});

const FilterForm = ({ filter }: { filter: CheckoutFilterFormProps }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const createPageURL = (filterValues: CheckoutFilterFormProps) => {
    const params = new URLSearchParams(searchParams);
    params.set("filterOpen", "false");
    for (const [key, value] of Object.entries(filterValues)) {
      if (value === "" || value === "All") {
        params.delete(key);
        continue;
      }
      if (key === "creationTime" || key === "finishTime") {
        if (value.from === undefined && value.to === undefined) {
          params.delete(`${key}From`);
          params.delete(`${key}To`);
          continue;
        }
        if (value.from === undefined) {
          params.delete(`${key}From`);
          continue;
        }
        if (value.to === undefined) {
          params.delete(`${key}To`);
          continue;
        }
        params.set(`${key}From`, value.from);
        params.set(`${key}To`, value.to);
        continue;
      }
      params.set(key, value);
    }
    // console.log(params.toString());
    // params.set("page", pageNumber.toString());
    // params.set("pageSize", newPageSize.toString());
    return `${pathname}?${params.toString()}`;
  };

  const resetPageURL = (filterValues: CheckoutFilterFormProps) => {
    const params = new URLSearchParams(searchParams);
    params.set("filterOpen", "false");
    for (const [key, value] of Object.entries(filterValues)) {
      // if (!params.has(key)) continue;
      if (key === "creationTime" || key === "finishTime") {
        params.delete(`${key}From`);
        params.delete(`${key}To`);
        continue;
      }
      // if (value === "" || value === "All") {
      //   params.delete(key);
      // }
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

    // console.log(values.finished);
    router.push(createPageURL(values));
  }

  const handleReset = () => {
    const blankFilter = {
      creationTime: { from: undefined, to: undefined },
      stuIDCheckout: "",
      stuIDCheckin: "",
      studio: "",
      otherLocation: "",
      creationMonitor: "",
      finishMonitor: "",
      finishTime: { from: undefined, to: undefined },
      notes: "",
      finished: "",
      userName: "",
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
          <FormField
            control={form.control}
            name="creationTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Creation Time</FormLabel>
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value?.from ? (
                          field.value.to ? (
                            <>
                              {format(field.value.from, "LLL dd, y")} -{" "}
                              {format(field.value.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(field.value.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    className="w-auto p-0"
                    align="start"
                  >
                    <Calendar
                      mode="range"
                      selected={field.value}
                      onSelect={field.onChange}
                      // onSelect={(day) => console.log("Calendar output is ", `${day?.toLocaleDateString()}`)}
                      disabled={(date) =>
                        date > new Date() || date < new Date("2024-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="finishTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Finish Time</FormLabel>
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value?.from ? (
                          field.value.to ? (
                            <>
                              {format(field.value.from, "LLL dd, y")} -{" "}
                              {format(field.value.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(field.value.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    className="w-auto p-0"
                    align="start"
                  >
                    <Calendar
                      mode="range"
                      selected={field.value}
                      onSelect={field.onChange}
                      // onSelect={(day) => console.log("Calendar output is ", `${day?.toLocaleDateString()}`)}
                      disabled={(date) =>
                        date > new Date() || date < new Date("2024-01-01")
                      }
                      // initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stuIDCheckout"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Checkout ID</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stuIDCheckin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Checkin ID</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Studio</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="ml-2">
                      <SelectValue placeholder="Select a stuido" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {studioList.map((studio, index) => (
                      <SelectItem
                        key={index}
                        value={`${studio}`}
                      >{`${studio}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="otherLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Location</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="creationMonitor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Creation Monitor</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="finishMonitor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Finish Monitor</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="ml-2 align-bottom">Notes</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                  {/* <Checkbox
                      className="ml-2 align-middle"
                      // disabled
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    /> */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-1 mt-3 flex gap-10 bg-slate-300">
            <FormField
              control={form.control}
              name="finished"
              render={({ field }) => (
                <FormItem className="mb-1">
                  <FormLabel className="ml-1">Finished</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="ml-2">
                        <SelectValue placeholder="Record Finished?" />
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

export default FilterForm;
