"use client";
import React from "react";
import { TagsInput } from "react-tag-input-component";
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
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  CheckoutSessionTypePost,
  InventoryItem,
  studioList,
  UserType,
} from "@/data/definitions";
import { inventoryColumns } from "@/app/dashboard/master-inventory/inventoryColumns";
import { createCheckoutSessionAction } from "@/data/actions/checkout-actions";
import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import qs from "qs";
import EmbededTable from "@/components/custom/EmbededTable";
import { useDebouncedCallback } from "use-debounce";
import { updateItemAction } from "@/data/actions/inventory-actions";
import { SubmitButton } from "@/components/custom/SubmitButton";
import { useRouter } from "next/navigation";
import { StrapiErrors } from "@/components/custom/StrapiErrors";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface StrapiErrorsProps {
  message: string | null;
  name: string;
}

const INITIAL_STATE = {
  message: null,
  name: "",
};

const formSchema = z.object({
  creationTime: z.date().or(z.string()),
  stuIDCheckout: z.string().min(15).max(16),
  userName: z.string().optional(),
  studio: z.string(),
  otherLocation: z.string().optional(),
  creationMonitor: z.string().min(1),
  notes: z.string().optional(),
  noTagItems: z.string().array().optional(),
  scan: z.string().optional(),
});

const NewCheckoutForm = ({
  thisMonitor,
  authToken,
}: {
  thisMonitor: UserType;
  authToken: string;
}) => {
  const router = useRouter();
  const [data, setData] = useState({
    creationTime: `${new Date().toLocaleString()}`,
    stuIDCheckout: "",
    studio: "",
    otherLocation: "",
    creationMonitor: `${thisMonitor.firstName} ${thisMonitor.lastName}`,
    notes: "",
    noTagItems: [""],
  });

  const [error, setError] = useState<StrapiErrorsProps>(INITIAL_STATE);

  // console.log(rowId);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creationTime: data.creationTime,
      stuIDCheckout: data.stuIDCheckout,
      userName: "",
      studio: data.studio ?? "",
      otherLocation: data.otherLocation ? data.otherLocation : "",
      creationMonitor: data.creationMonitor,
      notes: data.notes ? data.notes : "",
      noTagItems: [""],
    },
    mode: "onChange",
    values: data,
  });

  const [userId, setUserId] = useState("");
  const [itemIdArray, setItemIdArray] = useState(Array());
  const [itemObjArr, setItemObjArr] = useState(Array());
  const [noTagItems, setNoTagItems] = useState([
    "unreturned",
    "example: xlr cable 1",
  ]);
  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;

  // 2. Define a submit handler.

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

  async function getStudioUserByStuId(stuId: string) {
    const query = qs.stringify({
      sort: ["createdAt:desc"],
      filters: {
        $or: [{ stuId: { $eqi: stuId } }],
      },
    });
    const url = new URL("/api/users", baseUrl);
    url.search = query;
    // console.log("query data", query)
    return fetchData(url.href);
  }

  const handleStuIdInput = useDebouncedCallback((term: string) => {
    if (term.length > 15) {
      getStudioUserByStuId(term).then((data) => {
        // console.log(data);
        if (data[0]) {
          setUserId(data[0].id ?? "");
          // setUserName(`${data[0].firstName} ${data[0].lastName}`);
          form.setValue("userName", `${data[0].firstName} ${data[0].lastName}`);
        } else {
          // window.alert("User not found.");
          form.setValue("userName", "");
          form.setValue("stuIDCheckout", "");
          form.setFocus("stuIDCheckout");
          const confirm = window.confirm("User not found, create a new one?");
          if (confirm) router.push(`/signup?stuId=${term}`);
        }
      });
    } else {
      window.alert("hand typing not allowed, please use a scanner.");
      form.setValue("userName", "");
      form.setValue("stuIDCheckout", "");
      form.setFocus("stuIDCheckout");
    }
    // console.log(params.toString());
  }, 200);

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
            let newItemObjArr = structuredClone(itemObjArr);
            newItemObjArr.map((item) => {
              if (item.id === data[0].id) item.out = !item.out;
            });
            setItemObjArr(newItemObjArr);
          } else {
            // if the scanned item is already out
            if (data[0].out) {
              window.alert("Item is being used by others");
              return;
            }
            let newItem: InventoryItem = data[0];
            newItem.out = true;
            newArr = [...itemIdArray, data[0].id];
            setItemIdArray(newArr);
            setItemObjArr([...itemObjArr, newItem]);
          }
        } else {
          window.alert("Item not found.");
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

    // console.log(params.toString());
  }, 200);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    let formValue: CheckoutSessionTypePost = {
      creationTime: new Date(values.creationTime).toISOString(),
      stuIDCheckout: values.stuIDCheckout,
      stuIDCheckin: "",
      studio: values.studio,
      otherLocation: values.otherLocation,
      creationMonitor: values.creationMonitor,
      // finishTime: ,
      finishMonitor: "",
      finished: false,
      notes: values.notes ?? "",
      inventory_items: itemIdArray ?? [0],
      noTagItems: noTagItems,
      user: parseInt(userId),
    };

    try {
      //update the out status of the items in the master inventory
      itemObjArr.map((itemObj) =>
        updateItemAction({ out: itemObj.out }, itemObj.id),
      );
      //create the session in the checkout
      const res = await createCheckoutSessionAction(formValue);
      setError(res?.strapiErrors);
      // console.log(res);
      if (!res?.strapiErrors?.status) {
        router.push("/dashboard/checkout");
        toast.success("New Checkout Session Added");
      }
    } catch (error) {
      // console.log(error);
      toast.error("Error Creating New Checkout Session");
      setError({
        ...INITIAL_STATE,
        message: "Error Creating New Checkout Session",
        name: "New Checkout Session Error",
      });
      // setLoading(false);
      return;
    }
    return;
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
                    value={format(field.value, "MM/dd/yyyy hh:mm a")}
                  ></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-1"></div>

          <FormField
            control={form.control}
            name="stuIDCheckout"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Checkout ID</FormLabel>
                <FormControl
                  // onChange={(e) => {
                  //   handleStuIdInput(e.target.value);
                  // }}
                  onChange={(e) =>
                    handleStuIdInput((e.target as HTMLInputElement).value)
                  }
                >
                  <Input
                    className="bg-indigo-100"
                    placeholder="Scan an ID barcode"
                    {...field}
                    // onChange={(e) => setUserId(e.target.value)}
                  ></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>User Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled
                    placeholder="Waiting for ID scan"
                    // onChange={(e) => setUserId(e.target.value)}
                  ></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studio"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Studio</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  // defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="">
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
          {form.getValues("studio") === "Other" ? (
            <FormField
              control={form.control}
              name="otherLocation"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Other Location</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={form.getValues("studio") !== "Other"}
                    ></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="col-span-1"></div>
          )}

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="col-span-1">
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
              <FormItem className="col-span-1">
                <FormLabel className="ml-1">Barcode Scan</FormLabel>
                <FormControl
                  onChange={(e) =>
                    handleScan((e.target as HTMLInputElement).value)
                  }
                >
                  <Input
                    className="bg-indigo-100"
                    placeholder={"Scan an item barcode"}
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
              disabled={false}
            />
          </div>

          {/* <Button className="align-right" type="submit">
            Add
          </Button> */}
          <div className="col-span-1 flex items-center gap-1 space-y-1 md:col-span-2">
            <SubmitButton
              className="flex-1 items-center"
              text="Save"
              loadingText="Saving Session"
              loading={form.formState.isSubmitting}
            />

            <Link
              className="size-full flex-1 items-center"
              href="/dashboard/checkout"
            >
              <Button
                className="size-full hover:bg-slate-200 active:bg-slate-300"
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
            </Link>
          </div>
          <div className="max-w-60">
            <StrapiErrors error={error} />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewCheckoutForm;
