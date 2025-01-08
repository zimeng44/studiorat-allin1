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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
// import { inventoryColumns } from "@/app/dashboard/master-inventory/inventoryColumns";
import { getBackendURL } from "@/lib/utils";
import qs from "qs";
// import EmbededTable from "@/components/custom/EmbededTable";
import { useDebouncedCallback } from "use-debounce";
import { SubmitButton } from "@/components/custom/SubmitButton";
import { createInventoryReportAction } from "@/data/actions/inventoryReports-actions";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Prisma, User } from "@prisma/client";
import { DEV_MODE, InventoryItemWithImage } from "@/data/definitions";
import InventoryItemCart from "@/components/custom/InventoryItemCart";
import { inventoryReportInventoryCartColumns } from "../InventoryCartColumns";

interface StrapiErrorsProps {
  message: string | null;
  name: string;
}

const INITIAL_STATE = {
  message: null,
  name: "",
};

const formSchema = z.object({
  created_by: z.string().min(2).max(20),
  inventory_size: z.number(), // finishMonitor: z.string().optional(),
  notes: z.string().optional(),
  is_finished: z.boolean(),
  scan: z.string().optional(),
});

const NewInventoryReportForm = ({
  thisMonitor,
  authToken,
  inventory_size,
}: {
  thisMonitor: User;
  authToken: string;
  inventory_size: number;
}) => {
  const router = useRouter();
  const [data, setData] = useState({
    created_by: `${thisMonitor.first_name} ${thisMonitor.last_name}`,
    inventory_size: inventory_size,
    notes: "",
    is_finished: false,
    scan: "",
  });
  const [error, setError] = useState<StrapiErrorsProps>(INITIAL_STATE);
  // const [itemIdArray, setItemIdArray] = useState(Array());
  const [itemObjArr, setItemObjArr] = useState<InventoryItemWithImage[]>();

  // console.log(inventory_size);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      created_by: `${thisMonitor.first_name} ${thisMonitor.last_name}`,
      inventory_size: inventory_size,
      notes: undefined,
      is_finished: false,
      scan: "",
    },
    mode: "onChange",
    values: data,
  });

  // const [stuIDCheckout, setstuIDCheckout] = useState("");
  // const [userId, setUserId] = useState("");
  // const [userName, setUserName] = useState("");

  useEffect(() => {
    form.setFocus("scan");
  }, []);

  const baseUrl = getBackendURL();

  async function fetchData(url: string) {
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
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error; // or return null;
    }
  }

  async function getItemByBarcode(barcode: string) {
    const query = qs.stringify({
      m_tech_barcode: barcode,
    });
    const url = new URL("/api/inventory", baseUrl);
    url.search = query;
    return fetchData(url.href);
  }

  const handleScan = useDebouncedCallback(async (term: string) => {
    if (term.length > 9) {
      const { data, error } = await getItemByBarcode(term);
      if (data) {
        // let newArr = [...itemIdArray];
        if (itemObjArr?.map((item) => item.id).includes(data.id)) {
          window.alert("Item scanned already.");
          form.setValue("scan", "");
          form.setFocus("scan");
        } else {
          // const newIdArray = [data.id, ...itemIdArray];
          // setItemIdArray(newIdArray);
          const newObjArr = itemObjArr ? [data, ...itemObjArr] : [data];
          setItemObjArr(newObjArr);

          // Auto Save
          if (newObjArr.length > 4) {
            // onSubmit(form.watch());
            let createValues: Prisma.inventory_reportsCreateInput = {
              created_by: { connect: { id: thisMonitor.id } },
              inventory_size: form.getValues("inventory_size"),
              notes: form.getValues("notes"),
              is_finished: form.getValues("is_finished"),
              inventory_items: {
                connect: newObjArr.map((item) => ({ id: item.id })),
              },
            };

            try {
              const { res, error } =
                await createInventoryReportAction(createValues);

              if (res) {
                toast.success("Report Autosaved.");
                // redirect();
                router.push("/dashboard/inventory-reports/" + (await res).id);
              }
            } catch (error) {
              toast.error("Error Auto Saving New Inventory Report");
              setError({
                ...INITIAL_STATE,
                message: "Error Creating New Inventory Report",
                name: "New Inventory Report Error",
              });
              // setLoading(false);
              return;
            }

            // setAutoSaved(true)
          }
        }
      } else {
        window.alert("Item not in the inventory.");
        form.setValue("scan", "");
        form.setFocus("scan");
      }
    } else {
      window.alert("hand typing not allowed, please use a scanner.");
      form.setValue("scan", "");
      form.setFocus("scan");
    }
    form.setValue("scan", "");
    form.setFocus("scan");
  }, 50);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    let createValues: Prisma.inventory_reportsCreateInput = {
      created_by: { connect: { id: thisMonitor.id } },
      inventory_size: values.inventory_size,
      notes: values.notes,
      is_finished: values.is_finished,
      inventory_items: {
        connect: itemObjArr?.map((item) => ({ id: item.id })),
      },
    };

    try {
      const { res, error } = await createInventoryReportAction(createValues);
      if (res) {
        toast.success("New Report Saved.");
        router.push("/dashboard/inventory-reports");
        router.refresh();
      }
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

    // redirect("/dashboard/inventory-reports");

    // console.log("data submited is ", values);
  }

  function handleFinish() {
    if (form.getValues("created_by") === "" || !form.getValues("created_by")) {
      window.alert("Creator Name Missing by Accident.");
      return;
    }

    const confirm = window.confirm(
      "Editing after finishing will be forbidden.",
    );
    if (!confirm) {
      return;
    }

    form.setValue("is_finished", true);
    onSubmit(form.getValues());
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-screen shrink flex-col gap-2 space-y-1 px-4 md:grid md:max-w-xl md:grid-cols-2 md:px-0"
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
            name="created_by"
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
            name="inventory_size"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Scaned Amount of Total</FormLabel>
                <FormControl>
                  <div className="pt-1 text-lg">
                    <Badge variant="default" className="ml-3 mr-2">
                      {itemObjArr?.length?.toString() ?? "0"}
                    </Badge>
                    of
                    <Badge variant="secondary" className="ml-2">
                      {field.value.toString()}
                    </Badge>
                  </div>
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
                  onPaste={(e) => {
                    if (!DEV_MODE) e.preventDefault();
                  }}
                >
                  <Input
                    className="bg-indigo-100"
                    placeholder={"Scan a barcode"}
                    autoComplete="off"
                    {...field}
                  ></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-1 size-full justify-center gap-2 md:col-span-2">
            {/* <EmbededTable
              data={itemObjArr}
              setItemObjArr={setItemObjArr}
              columns={inventoryColumns}
              disabled={true}
            /> */}
            <InventoryItemCart
              data={itemObjArr}
              setItemObjArr={setItemObjArr}
              columnsMeta={inventoryReportInventoryCartColumns}
              disabled={true}
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewInventoryReportForm;
