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
import {
  bookingLocationList,
  bookingTypeList,
  studioList,
} from "@/data/definitions";

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
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// const mTechBarcode = z.union([
//   z.string().min(12).and(z.string().max(13)),
//   z.string().length(0),
// ]);
export interface BookingFilterFormProps {
  start_time: { from: Date | null; to: Date | null } | null;
  end_time: { from: Date | null; to: Date | null } | null;
  type: string | null;
  use_location: string | null;
}

const formSchema = z.object({
  start_time: z
    .object({
      from: z.date().nullable(),
      to: z.date().nullable(),
    })
    .nullable(),
  end_time: z
    .object({
      from: z.date().nullable(),
      to: z.date().nullable(),
    })
    .nullable(),
  type: z.string().nullable(),
  use_location: z.string().nullable(),
  // username: z.string().min(2).max(50),
});

const FilterForm = ({ filter }: { filter: BookingFilterFormProps }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [data, setData] = useState<BookingFilterFormProps>(filter);

  const createPageURL = (filterValues: BookingFilterFormProps) => {
    const params = new URLSearchParams(searchParams);
    params.set("filterOpen", "false");
    params.set("filterOn", "true");
    for (const [key, value] of Object.entries(filterValues)) {
      if (value === "" || value === "All") {
        params.delete(key);
        continue;
      }
      if (key === "start_time" || key === "end_time") {
        if (value.from === null && value.to === null) {
          params.delete(`${key}From`);
          params.delete(`${key}To`);
          continue;
        }
        if (value.from === null) {
          params.delete(`${key}From`);
          continue;
        }
        if (value.to === null) {
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

  const resetPageURL = (filterValues: BookingFilterFormProps) => {
    const params = new URLSearchParams(searchParams);
    params.set("filterOpen", "false");
    params.set("filterOn", "false");
    for (const [key, value] of Object.entries(filterValues)) {
      // if (!params.has(key)) continue;
      if (key === "start_time" || key === "end_time") {
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
    defaultValues: {
      start_time: {
        from: filter.start_time?.from,
        to: filter.start_time?.to,
      },
      end_time: {
        from: filter.end_time?.from,
        to: filter.end_time?.to,
      },
      // ...filter,
    },
    values: data,
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    // console.log(createPageURL(values));
    router.push(createPageURL(values));
  }

  const handleReset = () => {
    const blankFilter = {
      start_time: { from: null, to: null },
      end_time: { from: null, to: null },
      type: null,
      use_location: null,
    };
    router.push(resetPageURL(blankFilter));
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          // className="grid grid-cols-2 gap-4"
          className="flex flex-col gap-2 space-y-1 "
        >
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
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
                          field.value?.to ? (
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
                      selected={
                        field.value
                          ? {
                              from: field.value?.from ?? undefined,
                              to: field.value?.to ?? undefined,
                            }
                          : {
                              from: undefined,
                              to: undefined,
                            }
                      }
                      onSelect={field.onChange}

                      // onSelect={(day) => console.log("Calendar output is ", `${day?.toLocaleDateString()}`)}
                      // disabled={(date) =>
                      //   date > new Date() || date < new Date("2024-01-01")
                      // }
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
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
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
                      selected={
                        field.value
                          ? {
                              from: field.value?.from ?? undefined,
                              to: field.value?.to ?? undefined,
                            }
                          : {
                              from: undefined,
                              to: undefined,
                            }
                      }
                      onSelect={field.onChange}
                      // onSelect={(day) => console.log("Calendar output is ", `${day?.toLocaleDateString()}`)}
                      // disabled={(date) =>
                      //   date > new Date() || date < new Date("2024-01-01")
                      // }
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
            name="use_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Use Location</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? undefined}
                >
                  <FormControl>
                    <SelectTrigger className="">
                      <SelectValue placeholder="Select a stuido" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {bookingLocationList.map((studio, index) => (
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

          <div className="col-span-1 mt-3 flex gap-10 bg-slate-300">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="mb-1">
                  <FormLabel className="ml-1">Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="ml-2">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      {bookingTypeList.map((studio, index) => (
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
