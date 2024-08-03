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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";
import { InventoryReportTypePost, UserType } from "@/data/definitions";
import { inventoryColumns } from "@/data/inventoryColumns";

import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import qs from "qs";
import EmbededTable from "@/components/custom/EmbededTable";
import { useDebouncedCallback } from "use-debounce";

import { SubmitButton } from "@/components/custom/SubmitButton";
import { createInventoryReportAction } from "@/data/actions/inventoryReports-actions";

interface StrapiErrorsProps {
  message: string | null;
  name: string;
}

const INITIAL_STATE = {
  message: null,
  name: "",
};

const formSchema = z.object({
  creatorName: z.string().min(2).max(20),
  inventorySize: z.number(), // finishMonitor: z.string().optional(),
  notes: z.string().optional(),
  isFinished: z.boolean(),
  scan: z.string().optional(),
});

const NewInventoryReportForm = ({
  thisMonitor,
  authToken,
}: {
  thisMonitor: UserType;
  authToken: string;
}) => {
  const [data, setData] = useState({
    creatorName: `${thisMonitor.firstName} ${thisMonitor.lastName}`,
    inventorySize: 0,
    notes: "",
    isFinished: false,
    scan: "",
  });

  const [error, setError] = useState<StrapiErrorsProps>(INITIAL_STATE);

  // console.log(rowId);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creatorName: `${thisMonitor.firstName} ${thisMonitor.lastName}`,
      inventorySize: 0,
      notes: "",
      isFinished: false,
      scan: "",
    },
    mode: "onChange",
    values: data,
  });

  // const [stuIDCheckout, setstuIDCheckout] = useState("");
  // const [userId, setUserId] = useState("");
  // const [userName, setUserName] = useState("");
  const [itemIdArray, setItemIdArray] = useState(Array());
  const [itemObjArr, setItemObjArr] = useState(Array());

  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;

  // 2. Define a submit handler.

  const baseUrl = getStrapiURL();

  async function fetchData(url: string) {
    // const authToken = getAuthToken();
    // const authToken = process.env.NEXT_PUBLIC_API_TOKEN;

    const headers = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    };

    try {
      const response = await fetch(url, authToken ? headers : {});
      const data = await response.json();
      // console.log(data);
      return flattenAttributes(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error; // or return null;
    }
  }

  async function getItemByBarcode(barcode: string) {
    const query = qs.stringify({
      sort: ["createdAt:desc"],
      filters: {
        $or: [{ mTechBarcode: { $eq: barcode } }],
      },
    });
    const url = new URL("/api/inventory-items", baseUrl);
    url.search = query;
    // console.log("query data", query)
    return fetchData(url.href);
  }

  const handleScan = useDebouncedCallback((term: string) => {
    if (term.length > 9) {
      getItemByBarcode(term).then(({ data, meta }) => {
        if (data[0]) {
          let newArr = [...itemIdArray];
          if (newArr.includes(data[0].id)) {
            window.alert("Item scanned already.");
            form.setValue("scan", "");
            form.setFocus("scan");
          } else {
            setItemIdArray([data[0].id, ...itemIdArray]);
            setItemObjArr([data[0], ...itemObjArr]);
          }
        } else {
          window.alert("Item not in the inventory.");
          form.setValue("scan", "");
          form.setFocus("scan");
        }
      });
    } else {
      window.alert("hand typing not allowed, please use a scanner.");
      form.setValue("scan", "");
      form.setFocus("scan");
    }
    form.setValue("scan", "");
    form.setFocus("scan");
  }, 200);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    let formValue: InventoryReportTypePost = {
      creator: thisMonitor.id,
      inventorySize: values.inventorySize,
      notes: values.notes,
      isFinished: values.isFinished,
      itemsChecked: itemIdArray ?? [0],
    };

    try {
      await createInventoryReportAction(formValue);
    } catch (error) {
      toast.error("Error Creating New Inventory Report");
      setError({
        ...INITIAL_STATE,
        message: "Error Creating New Inventory Report",
        name: "New Inventory Report Error",
      });
      // setLoading(false);
      return;
    }

    toast.success("New Report Completed.");

    // console.log("data submited is ", values);
  }

  function handleFinish() {
    if (form.getValues("creatorName") === "") {
      window.alert("Creator Name Missing by Accident.");
      return;
    }

    const confirm = window.confirm(
      "Editing after finishing will be forbidden.",
    );
    if (!confirm) {
      return;
    }

    form.setValue("isFinished", true);
    onSubmit(form.getValues());
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-1 space-y-1 md:grid md:grid-cols-2"
        >
          <div className="col-span-1 flex gap-1 md:col-span-2">
            <SubmitButton
              className="flex-1"
              text="Save Draft"
              loadingText="Saving Report"
              loading={form.formState.isSubmitting}
            />

            <Button
              variant="secondary"
              className="flex-1 hover:bg-slate-200 active:bg-slate-300"
              type="button"
              onClick={() => {
                handleFinish();
              }}
            >
              Finish
            </Button>

            <Link className="flex-1" href="/dashboard/inventory-reports">
              <Button
                className="size-full hover:bg-slate-200 active:bg-slate-300"
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
            </Link>
          </div>
          <FormField
            control={form.control}
            name="creatorName"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Creator</FormLabel>
                <FormControl>
                  <Input
                    disabled
                    placeholder={"Creator Name"}
                    {...field}
                    // value={field.value?.toLocaleString()}
                    value={field.value}
                  ></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inventorySize"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Scaned Amount of Total</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled
                    value={`${itemIdArray.length?.toString() ?? "0"} of ${field.value.toString()}`}
                  ></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel className="align-bottom">Notes</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="scan"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel className="ml-1">Barcode Scan</FormLabel>
                <FormControl
                  onChange={(e) =>
                    handleScan((e.target as HTMLInputElement).value)
                  }
                >
                  <Input
                    className="bg-indigo-100"
                    placeholder={"Scan a barcode"}
                    {...field}
                  ></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-1 size-full justify-center gap-2 md:col-span-2">
            <EmbededTable
              data={itemObjArr}
              setItemObjArr={setItemObjArr}
              columns={inventoryColumns}
              disabled={true}
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewInventoryReportForm;
