"use client";
import React, { useRef } from "react";
import qs from "qs";
import {
  CheckoutSessionType,
  CheckoutSessionTypePost,
  InventoryItem,
  RetrievedItems,
  studioList,
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
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateCheckoutSessionAction } from "@/data/actions/checkout-actions";
import Link from "next/link";
import { inventoryColumns } from "@/data/inventoryColumns";
import EmbededTable from "@/components/custom/EmbededTable";
import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import { updateItemAction } from "@/data/actions/inventory-actions";
import { useDebouncedCallback } from "use-debounce";

// import { useRouter } from "next/navigation";

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  creationTime: z.date().or(z.string()),
  finishTime: z.date().or(z.string()).optional(),
  stuIDCheckout: z.string().min(15).max(16),
  userName: z.string().optional(),
  stuIDCheckin: z.string(),
  studio: z.string(),
  otherLocation: z.string().optional(),
  creationMonitor: z.string().min(1),
  finishMonitor: z.string().optional(),
  notes: z.string().optional(),
  finished: z.boolean(),
  scan: z.string().optional(),
  inventory_items: z.string().optional(),
  user: z.string().optional(),
});

// const getIdArray: number[] = (session: CheckoutSessionType) => {
//   let IdArray: number[] = session.inventory_items?.data.map(
//     (item: InventoryItem) => item.id,
//   );

//   return IdArray;
// };

const EditCheckoutSessionForm = ({
  session,
  sessionId,
  thisMonitor,
  authToken,
}: {
  session: CheckoutSessionType;
  sessionId: string;
  thisMonitor: UserType;
  authToken: string;
}) => {
  const router = useRouter();
  // const [tempSession, setTempSession] = useState(session);
  // console.log("Item Details Render!!", session);
  // const router = useRouter();
  // const [data, setData] = useState(rowData);
  // const [scan, setScan] = useState("");
  const inventoryItems = session.inventory_items as RetrievedItems;
  // const [itemObjArr, setItemObjArr] = useState(
  //   inventoryItems.data ?? Array(),
  // );

  const [itemIdArray, setItemIdArray] = useState(
    inventoryItems?.data.map((item: InventoryItem) => item.id),
  );
  const [itemObjArr, setItemObjArr] = useState(
    inventoryItems?.data ?? Array(),
  );

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creationTime: session.creationTime
        ? new Date(session.creationTime).toLocaleString()
        : "",
      finishTime: session.finishTime
        ? new Date(session.finishTime).toLocaleString()
        : "",
      stuIDCheckout: session.stuIDCheckout,
      userName: `${session.user?.firstName} ${session.user?.lastName}`,
      stuIDCheckin: session.stuIDCheckin ?? "",
      studio: session.studio ?? "",
      otherLocation: session.otherLocation ?? "",
      creationMonitor: session.creationMonitor,
      finishMonitor: session.finishMonitor ?? "",
      notes: session.notes ?? "",
      finished: session.finished ?? false,
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

  const handleIdScan = useDebouncedCallback((term: string) => {
    // window.alert("you did it!!");
    if (term.length > 12) {
      if (term) {
        getItemByBarcode(term).then(({ data, meta }) => {
          if (data[0]) {
            let newArr = [...itemIdArray];
            if (newArr.includes(data[0].id)) {
              let newItemObjArr = structuredClone(itemObjArr);
              newItemObjArr.map((item) => {
                if (item.id === data[0].id) item.out = !item.out;
              });
              setItemObjArr(newItemObjArr);
            } else {
              let newItem: InventoryItem = data[0];
              newItem.out = true;
              newArr = [...itemIdArray, data[0].id];
              setItemIdArray(newArr);
              setItemObjArr([...itemObjArr, newItem]);
            }
          } else {
            window.alert("Item not found.");
          }
        });
      }
    } else {
      window.alert("hand typing not allowed, please use a scanner.");
    }
    form.setValue("scan", "");
    form.setFocus("scan");
  }, 200);

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    let formValue:CheckoutSessionTypePost={
      creationTime: values.creationTime,
      stuIDCheckout: values.stuIDCheckout,
      stuIDCheckin: values.stuIDCheckin,
      studio: values.studio,
      otherLocation: values.otherLocation,
      creationMonitor: values.creationMonitor,
      finishTime: values.finishTime,
      finishMonitor: values.finishMonitor,
      finished: values.finished,
      notes: values.notes??"",
      inventory_items:itemIdArray??[0],
      user: session.user?.id??0,
    }
    
    // {...values, inventory_items: itemIdArray}

    // values.inventory_items = itemIdArray;
    // delete values.userName;
    updateCheckoutSessionAction(formValue, sessionId);
    itemObjArr.map((itemObj) =>
      updateItemAction({ out: itemObj.out }, itemObj.id?.toString()??""),
    );
    router.refresh();
    toast.success("Session Saved.");
    router.push("/dashboard/checkout");
  }

  function handleFinish() {
    if (form.getValues("stuIDCheckin") === "") {
      window.alert("Checkin ID needed.");
      return;
    }
    // console.log(itemObjArr.filter((item) => item.out === false));
    if (itemObjArr.filter((item) => item.out === true).length > 0) {
      window.alert("Unreturned item(s)");
      return;
    }
    const confirm = window.confirm(
      "Editing after finishing will be forbidden.",
    );
    if (!confirm) {
      return;
    }
    // window.alert("finished");
    form.setValue("finishTime", new Date().toISOString());
    form.setValue(
      "finishMonitor",
      `${thisMonitor.firstName} ${thisMonitor.lastName}`,
    );
    form.setValue("finished", true);
    onSubmit(form.getValues());
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-2"
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
                    value={field.value?.toLocaleString()}
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
                  <Input disabled {...field} value={field.value?.toLocaleString()}></Input>
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
                  <Input disabled {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled
                    // onChange={(e) => setUserId(e.target.value)}
                  ></Input>
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
                  <Input {...field} disabled={session.finished}></Input>
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
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value !== "Other") form.setValue("otherLocation", "");
                  }}
                  value={field.value}
                  disabled={session.finished}
                >
                  <FormControl>
                    <SelectTrigger>
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
                  <Input
                    {...field}
                    disabled={
                      form.getValues("studio") !== "Other" || session.finished
                    }
                  ></Input>
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
                  <Input {...field} disabled={session.finished}></Input>
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
                  <Input {...field} disabled></Input>
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
                <FormLabel className="align-bottom">Notes</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name="finished"
            render={({ field }) => (
              <FormItem className="mb-1">
                <FormLabel className="ml-1">Finished</FormLabel>
                <FormControl>
                  <div className="col-span-1 h-10 rounded-md border-2 bg-slate-300">
                    <Checkbox
                      className="ml-20 mt-3"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <FormField
            control={form.control}
            name="scan"
            render={({ field }) => (
              <FormItem className="mb-1">
                <FormLabel className="ml-1">Barcode Scan</FormLabel>
                <FormControl
                  // onPaste={(e) => {
                  //   e.preventDefault();
                  //   return false;
                  // }}
                  // onCopy={(e) => {
                  //   e.preventDefault();
                  //   return false;
                  // }}
                  onChange={(e) => handleIdScan((e.target as HTMLInputElement).value)}
                  // onChange={(e) => handleIdScan(e.target.value)}
                >
                  <Input
                    className="bg-indigo-100"
                    placeholder={"Scan a barcode"}
                    {...field}
                    disabled={session.finished}
                  ></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2 flex w-[550px]  gap-10">
            <EmbededTable
              data={itemObjArr}
              columns={inventoryColumns}
              disabled={session.finished ?? false}
            />
          </div>
          {/* <div className="col-span-1 grid grid-cols-subgrid gap-4"></div> */}

          <Button className="align-right" type="submit">
            Save
          </Button>
          <div className="col-span-1">
            <Button
              variant="secondary"
              className="w-max hover:bg-slate-200 active:bg-slate-300"
              type="button"
              onClick={() => {
                handleFinish();
              }}
            >
              Finish
            </Button>
            <Link href="/dashboard/checkout">
              <Button
                className="ml-2 hover:bg-slate-200 active:bg-slate-300"
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditCheckoutSessionForm;
