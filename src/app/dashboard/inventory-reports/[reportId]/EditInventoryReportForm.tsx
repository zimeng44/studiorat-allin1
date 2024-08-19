"use client";
import React, { useRef } from "react";
import qs from "qs";
import {
  InventoryItem,
  InventoryReportType,
  InventoryReportTypePost,
  InventoryReportWithCreatorAndItems,
  RetrievedItems,
  UserType,
  UserWithRole,
} from "@/data/definitions";
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
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { inventoryColumns } from "@/app/dashboard/master-inventory/inventoryColumns";
import EmbededTable from "@/components/custom/EmbededTable";
import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import { updateItemAction } from "@/data/actions/inventory-actions";
import { useDebouncedCallback } from "use-debounce";
import { SubmitButton } from "@/components/custom/SubmitButton";
import {
  createInventoryReportAction,
  updateInventoryReportAction,
} from "@/data/actions/inventoryReports-actions";
import { StrapiErrors } from "@/components/custom/StrapiErrors";
import { Badge } from "@/components/ui/badge";
import { inventory_items, inventory_reports, Prisma } from "@prisma/client";
import { getInventoryItemByBarcode } from "@/data/loaders";

// import { useRouter } from "next/navigation";

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  creatorName: z.string().min(2).max(20),
  inventory_size: z.number(), // finishMonitor: z.string().optional(),
  notes: z.string().optional(),
  is_finished: z.boolean(),
  scan: z.string().optional(),
});

const INITIAL_STATE = {
  message: "",
  name: "",
  status: "",
};

// const getIdArray: number[] = (session: CheckoutSessionType) => {
//   let IdArray: number[] = session.inventory_items?.data.map(
//     (item: InventoryItem) => item.id,
//   );

//   return IdArray;
// };

const EditInventoryReportForm = ({
  report,
  reportId,
  thisMonitor,
  authToken,
}: {
  report: InventoryReportWithCreatorAndItems;
  reportId: string;
  thisMonitor: UserWithRole;
  authToken: string;
}) => {
  // console.log(report);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [strapiErrors, setStrapiErrors] = useState(INITIAL_STATE);
  // const inventory_items = report.inventory_items as RetrievedItems;

  // const [itemIdArray, setItemIdArray] = useState(
  //   report.inventory_items?.map((item: inventory_items) => item.id) ?? [],
  // );
  const [itemObjArr, setItemObjArr] = useState<inventory_items[]>(
    report.inventory_items,
  );
  // const [autoSaved, setAutoSaved] = useState(false);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creatorName: `${report.created_by?.first_name ?? "No Name"} ${report.created_by?.last_name ?? ""}`,
      inventory_size: report.inventory_size ?? undefined,
      notes: report.notes ?? undefined,
      is_finished: report.is_finished ?? false,
      scan: "",
    },
    mode: "onChange",
  });

  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;

  useEffect(() => {
    if (!report.is_finished) form.setFocus("scan");
  }, []);

  const baseUrl = getStrapiURL();

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
      return flattenAttributes(data);
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
      // console.log(data);
      if (data[0]) {
        // let newArr = [...itemIdArray];
        if (itemObjArr.map((item) => item.id).includes(data[0].id)) {
          window.alert("Item scanned already.");
          form.setValue("scan", "");
          form.setFocus("scan");
        } else {
          // const newIdArray = [data[0].id, ...itemIdArray];
          // setItemIdArray(newIdArray);
          const newObjArr = [data[0], ...itemObjArr];
          setItemObjArr(newObjArr);

          // Auto Save
          if (newObjArr.length > 4 && newObjArr.length % 5 === 0) {
            // onSubmit(form.watch());
            let updateValues: Prisma.inventory_reportsUpdateInput = {
              created_by: { connect: { id: thisMonitor.id } },
              inventory_size: form.getValues("inventory_size"),
              notes: form.getValues("notes"),
              is_finished: form.getValues("is_finished"),
              inventory_items: {
                set: newObjArr.map((item) => ({ id: item.id })),
              },
            };

            try {
              const { res, error } = await updateInventoryReportAction(
                updateValues,
                reportId,
              );

              if (res) {
                toast.success("Report Autosaved.");
                // redirect();
                router.push("/dashboard/inventory-reports/" + res.id);
              } else {
                toast.error("Error Auto Saving Inventory Report");
              }
            } catch (error) {
              toast.error("Error Auto Saving Inventory Report");
              // setError({
              //   ...INITIAL_STATE,
              //   message: "Error Creating New Inventory Report",
              //   name: "New Inventory Report Error",
              // });
              // setLoading(false);
              // return;
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
  }, 200);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    let updateValues: Prisma.inventory_reportsCreateInput = {
      created_by: { connect: { id: thisMonitor.id } },
      inventory_size: values.inventory_size,
      notes: values.notes,
      is_finished: values.is_finished,
      inventory_items: {
        connect: itemObjArr.map((item) => ({ id: item.id })),
      },
    };

    try {
      const { res, error } = await updateInventoryReportAction(
        updateValues,
        reportId,
      );
      if (res) {
        toast.success("Report Saved.");
        router.push("/dashboard/inventory-reports");
      }
    } catch (error) {
      toast.error("Error Creating New Inventory Report");
      //  setError({
      //    ...INITIAL_STATE,
      //    message: "Error Creating New Inventory Report",
      //    name: "New Inventory Report Error",
      //  });
      // setLoading(false);
      return;
    }
  }

  function handleFinish() {
    if (!form.getValues("creatorName")) {
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
      {/* {autoSaved ? <p className="test-xs text-slate-400">(Auto Saved)</p> : ``} */}
      <StrapiErrors error={strapiErrors} />
      {!report.is_finished && thisMonitor.user_role?.name === "Monitor" ? (
        <p className="mb-2 italic text-gray-400">
          (No new report allowed before finishing the draft)
        </p>
      ) : (
        ``
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-1 space-y-1 md:grid md:grid-cols-2"
        >
          <div className="col-span-1 flex gap-1 md:col-span-2">
            <SubmitButton
              className="flex-1"
              text={report.is_finished ? "Save Notes" : "Save Draft"}
              loadingText="Saving Report"
              loading={form.formState.isSubmitting}
            />

            <Button
              variant="secondary"
              className={`${report.is_finished ? "invisible" : ""} w-max flex-1 hover:bg-slate-200 active:bg-slate-300`}
              type="button"
              onClick={() => {
                handleFinish();
              }}
            >
              Finish
            </Button>
            {/* <Link href="/dashboard/checkout"> */}
            <Button
              className="ml-2 flex-1 hover:bg-slate-200 active:bg-slate-300"
              type="button"
              variant="secondary"
              onClick={(e) => {
                // router.push("/dashboard/inventory-reports");
                // router.refresh();
                // const params = new URLSearchParams(searchParams);
                router.push(
                  `/dashboard/inventory-reports?${searchParams.toString()}`,
                );
              }}
            >
              Cancel
            </Button>

            {/* </Link> */}
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
                      {itemObjArr.length?.toString() ?? "0"}
                    </Badge>
                    of
                    <Badge variant="secondary" className="ml-2">
                      {field.value.toString()}
                    </Badge>
                  </div>
                  {/* <Input
                    {...field}
                    disabled
                    value={`${itemIdArray.length?.toString() ?? "0"} of ${field.value.toString()}`}
                  ></Input> */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {report.is_finished ? (
            ``
          ) : (
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
                      disabled={report.is_finished ?? false}
                      className="bg-indigo-100"
                      placeholder={"Scan a barcode"}
                      {...field}
                    ></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
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

export default EditInventoryReportForm;
