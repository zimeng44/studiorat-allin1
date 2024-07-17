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
import { CheckoutSessionType, studioList } from "@/data/definitions";

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  creationTime: z.string(),
  finishTime: z.string().optional(),
  stuIDCheckout: z.string().max(4),
  stuIDCheckin: z.string(),
  studio: z.string(),
  otherLocation: z.string(),
  creationMonitor: z.string(),
  finishMonitor: z.string(),
  notes: z.string(),
  finished: z.boolean(),
  inventory_items: z.number().array(),
  studio_user: z.number().array(),
});

const AddForm = ({
  rowData,
  addItem,
  setAddOpen,
}: {
  rowData: CheckoutSessionType;
  addItem: Function;
  setAddOpen: Function;
}) => {
  const [data, setData] = useState(rowData);

  // console.log(rowId);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creationTime: data.attributes.creationTime,
      finishTime: data.attributes.finishTime,
      stuIDCheckout: data.attributes.stuIDCheckout,
      stuIDCheckin: data.attributes.stuIDCheckin,
      studio: data.attributes.studio,
      otherLocation: data.attributes.otherLocation
        ? data.attributes.otherLocation
        : "",
      creationMonitor: data.attributes.creationMonitor,
      finishMonitor: data.attributes.finishMonitor,
      notes: data.attributes.notes ? data.attributes.notes : "",
      finished: data.attributes.finished,
      inventory_items: [],
      studio_user: [],
    },
    mode: "onChange",
  });

  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    values.creationTime = new Date(values.creationTime).toISOString();
    if (values.finishTime === "") values.finishTime = undefined;

    const data = {
      data: values,
    };

    addItem(data);

    setAddOpen(false);
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
            name="creationTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Creation Time</FormLabel>
                <FormControl>
                  <Input
                    disabled
                    placeholder={"This is the time"}
                    {...field}
                  ></Input>
                </FormControl>
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
                <FormControl>
                  <Input disabled {...field}></Input>
                </FormControl>
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-1 grid grid-cols-subgrid gap-4"></div>

          <Button className="align-right" type="submit">
            Add
          </Button>

          <DialogClose asChild>
            <Button
              className="hover:bg-slate-200 active:bg-slate-300"
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
          </DialogClose>
        </form>
      </Form>
    </div>
  );
};

export default AddForm;
