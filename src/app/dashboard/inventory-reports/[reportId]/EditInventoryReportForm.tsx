"use client";
import React, { useRef } from "react";
import qs from "qs";
import {
  InventoryItem,
  InventoryReportType,
  InventoryReportTypePost,
  RetrievedItems,
  UserType,
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
import { useRouter } from "next/navigation";
import { inventoryColumns } from "@/data/inventoryColumns";
import EmbededTable from "@/components/custom/EmbededTable";
import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import { updateItemAction } from "@/data/actions/inventory-actions";
import { useDebouncedCallback } from "use-debounce";
import { SubmitButton } from "@/components/custom/SubmitButton";
import { updateInventoryReportAction } from "@/data/actions/inventoryReports-actions";
import { StrapiErrors } from "@/components/custom/StrapiErrors";

// import { useRouter } from "next/navigation";

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  creatorName: z.string().min(2).max(20),
  inventorySize: z.number(), // finishMonitor: z.string().optional(),
  notes: z.string().optional(),
  isFinished: z.boolean(),
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
  report: InventoryReportType;
  reportId: string;
  thisMonitor: UserType;
  authToken: string;
}) => {
  useEffect(() => {
    if (!report.isFinished && thisMonitor.role?.name === "Monitor")
      window.alert("Please finish the draft before filing any new reports");
  }, []);

  const router = useRouter();
  const [strapiErrors, setStrapiErrors] = useState(INITIAL_STATE);
  const itemsChecked = report.itemsChecked as RetrievedItems;

  const [itemIdArray, setItemIdArray] = useState(
    itemsChecked?.data.map((item: InventoryItem) => item.id) ?? [],
  );
  const [itemObjArr, setItemObjArr] = useState<InventoryItem[]>(
    itemsChecked?.data ?? Array(),
  );

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creatorName: `${report.creator?.firstName ?? ""} ${report.creator?.lastName ?? ""}`,
      inventorySize: report.inventorySize,
      notes: report.notes,
      isFinished: report.isFinished,
      scan: "",
    },
    mode: "onChange",
  });

  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;

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

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    // console.log(form.formState.isSubmitting);

    let formValue: InventoryReportTypePost = {
      creator: thisMonitor.id,
      inventorySize: values.inventorySize,
      notes: values.notes,
      isFinished: values.isFinished,
      itemsChecked: itemIdArray ?? undefined,
    };

    try {
      const res = await updateInventoryReportAction(formValue, reportId);
      setStrapiErrors(res.strapiErrors);
    } catch (error) {
      toast.error("Error Updating Checkout Session");
      // setError({
      //   ...INITIAL_STATE,
      //   message: "Error Creating Summary",
      //   name: "Summary Error",
      // });
      // setLoading(false);
      return;
    }
    toast.success("Report Saved.");
    router.push("/dashboard/inventory-reports");
    router.refresh();
    // router.refresh();
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
      <StrapiErrors error={strapiErrors} />
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
              className={`${report.isFinished ? "invisible" : ""} w-max flex-1 hover:bg-slate-200 active:bg-slate-300`}
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
                router.push("/dashboard/inventory-reports");
                // router.refresh();
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
                    disabled={report.isFinished ?? false}
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

export default EditInventoryReportForm;
