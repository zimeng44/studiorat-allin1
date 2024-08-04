"use client";
import React from "react";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCheckoutSessionActionWithItems } from "@/data/actions/checkout-actions";
import { inventoryColumns } from "@/app/dashboard/master-inventory/inventoryColumns";
import EmbededTable from "@/components/custom/EmbededTable";
import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";
import { SubmitButton } from "@/components/custom/SubmitButton";
import { StrapiErrors } from "@/components/custom/StrapiErrors";
import { TagsInput } from "react-tag-input-component";
import { Textarea } from "@/components/ui/textarea";

// import { useRouter } from "next/navigation";

interface StrapiErrorsProps {
  message: string | null;
  name: string;
}

const INITIAL_STATE = {
  message: null,
  name: "",
};

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
  noTagItems: z.string().array().optional(),
  user: z.string().optional(),
});

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
  const [error, setError] = useState<StrapiErrorsProps>(INITIAL_STATE);
  // router.refresh();
  // const [tempSession, setTempSession] = useState(session);
  // console.log("Item Details Render!!", session);
  // const router = useRouter();
  // const [data, setData] = useState(rowData);
  // const [scan, setScan] = useState("");
  const inventoryItems = session.inventory_items as RetrievedItems;
  const [noTagItems, setNoTagItems] = useState(session.noTagItems ?? [""]);
  // const [itemObjArr, setItemObjArr] = useState(
  //   inventoryItems.data ?? Array(),
  // );

  const [itemIdArray, setItemIdArray] = useState(
    inventoryItems?.data?.map((item: InventoryItem) => item.id),
  );
  const [itemObjArr, setItemObjArr] = useState<InventoryItem[]>(
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
      noTagItems: session.noTagItems ?? [""],
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
    // window.alert("you did it!!");
    if (term.length > 9) {
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
    } else {
      window.alert("hand typing not allowed, please use a scanner.");
    }

    form.setValue("scan", "");
    form.setFocus("scan");
  }, 200);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    // console.log(form.formState.isSubmitting);

    let formValue: CheckoutSessionTypePost = {
      creationTime: new Date(values.creationTime).toISOString(),
      stuIDCheckout: values.stuIDCheckout,
      stuIDCheckin: values.stuIDCheckin,
      studio: values.studio,
      otherLocation: values.otherLocation,
      creationMonitor: values.creationMonitor,
      finishTime: values.finishTime === "" ? undefined : values.finishTime,
      finishMonitor: values.finishMonitor,
      finished: values.finished,
      notes: values.notes ?? "",
      inventory_items: itemIdArray ?? [0],
      noTagItems: noTagItems,
      user: session.user?.id ?? 0,
    };

    try {
      const res = await updateCheckoutSessionActionWithItems(
        formValue,
        sessionId,
        itemObjArr,
      );
      setError(res.strapiErrors);
      if (!res?.strapiErrors?.status) {
        router.push("/dashboard/users");
        toast.success("New Checkout Session Added");
      }
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

    toast.success("Session Saved.");
    router.push("/dashboard/checkout");
    router.refresh();
    // router.refresh();
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
    if (noTagItems.includes("unreturned")) {
      window.alert("Unreturned untagged item(s)");
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
          className="flex w-screen shrink flex-col gap-2 space-y-1 px-2 md:grid md:max-w-lg md:grid-cols-2 md:px-0"
        >
          <FormField
            control={form.control}
            name="creationTime"
            render={({ field }) => (
              <FormItem className="col-span-1 size-full">
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
          {/* <FormField
            control={form.control}
            name="finishTime"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Finish Time</FormLabel>
                <FormControl>
                  <Input
                    disabled
                    {...field}
                    value={field.value?.toLocaleString()}
                  ></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <FormField
            control={form.control}
            name="stuIDCheckout"
            render={({ field }) => (
              <FormItem className="col-span-1 size-full">
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
              <FormItem className="col-span-1 size-full">
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
              <FormItem className="col-span-1 size-full">
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
              <FormItem className="col-span-1 size-full">
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
              <FormItem className="col-span-1 size-full">
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
              <FormItem className="col-span-1 size-full">
                <FormLabel>Creation Monitor</FormLabel>
                <FormControl>
                  <Input {...field} disabled></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="finishMonitor"
            render={({ field }) => (
              <FormItem className="col-span-1 size-full">
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
              <FormItem className="col-span-1 size-full">
                <FormLabel className="align-bottom">Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="min-h-32 whitespace-normal"
                    placeholder="Leave a note"
                  ></Textarea>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="noTagItems"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Untagged Items</FormLabel>
                <FormControl>
                  <TagsInput
                    value={noTagItems}
                    onChange={setNoTagItems}
                    name="item"
                    placeHolder="Enter a item"
                    disabled={session.finished}
                  />
                </FormControl>
                <FormMessage className="text-slate-400">
                  press enter or comma to add new item. take 'unreturned' off
                  when items return'
                </FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scan"
            render={({ field }) => (
              <FormItem className="col-span-1 size-full">
                <FormLabel className="ml-1">Barcode Scan</FormLabel>
                <FormControl
                  onChange={(e) =>
                    handleScan((e.target as HTMLInputElement).value)
                  }
                  // onChange={(e) => handleScan(e.target.value)}
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

          <div className="col-span-1 size-full justify-center gap-2 md:col-span-2">
            <EmbededTable
              data={itemObjArr}
              setItemObjArr={setItemObjArr}
              columns={inventoryColumns}
              disabled={session.finished ?? false}
            />
          </div>
          {/* <div className="col-span-1 grid grid-cols-subgrid gap-4"></div> */}

          {/* <Button className="align-right" type="submit">
            Save
          </Button> */}
          <div className="col-span-1 flex gap-1 md:col-span-2">
            <SubmitButton
              className="flex-1"
              text="Save"
              loadingText="Saving Session"
              loading={form.formState.isSubmitting}
            />

            <Button
              variant="secondary"
              className={`${session.finished ? "invisible" : ""} w-max flex-1 hover:bg-slate-200 active:bg-slate-300`}
              type="button"
              onClick={() => {
                handleFinish();
              }}
            >
              Finish
            </Button>
            <Button
              className="ml-2 flex-1 hover:bg-slate-200 active:bg-slate-300"
              type="button"
              variant="secondary"
              onClick={(e) => {
                router.push("/dashboard/checkout");
                router.refresh();
              }}
            >
              Cancel
            </Button>
          </div>
          <div className="max-w-60">
            <StrapiErrors error={error} />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditCheckoutSessionForm;
