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
import { DEV_MODE, InventoryItem, studioList } from "@/data/definitions";

import { createCheckoutSessionAction } from "@/data/actions/checkout-actions";
import { getBackendURL } from "@/lib/utils";
import qs from "qs";
import { useDebouncedCallback } from "use-debounce";
import { updateItemAction } from "@/data/actions/inventory-actions";
import { SubmitButton } from "@/components/custom/SubmitButton";
import { useRouter } from "next/navigation";
import { StrapiErrors } from "@/components/custom/StrapiErrors";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { inventory_items, User } from "@prisma/client";
import { InputWithLoading } from "@/components/custom/InputWithLoading";
import InventoryItemCart from "@/components/custom/InventoryItemCart";
import { checkoutNewInventoryCartColumns } from "../InventoryCartColumns";

interface StrapiErrorsProps {
  message?: string | null;
  name?: string;
}

const INITIAL_STATE = {
  message: null,
  name: "",
};

const formSchema = z.object({
  creationTime: z.date().or(z.string()),
  stuIDCheckout: z
    .string()
    .min(15, { message: "ID barcode is 16 digits long" })
    .max(16, { message: "ID barcode is 16 digits long" }),
  userName: z.string().optional(),
  studio: z.string().min(1),
  other_location: z.string().optional(),
  creationMonitor: z
    .string()
    .min(1, { message: "Creation monitor can't be blank" }),
  notes: z.string().optional(),
  noTagItems: z.string().array().optional(),
  scan: z.string().optional(),
});

const NewCheckoutForm = ({
  thisMonitor,
  authToken,
}: {
  thisMonitor: User;
  authToken: string;
}) => {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [itemIdArray, setItemIdArray] = useState(Array());
  const [itemObjArr, setItemObjArr] = useState(Array());
  const [noTagItems, setNoTagItems] = useState([
    "unreturned",
    "example: xlr cable 1",
  ]);
  const [formData, setFormData] = useState({
    creationTime: `${new Date().toLocaleString()}`,
    stuIDCheckout: "",
    studio: "",
    other_location: undefined,
    creationMonitor: `${thisMonitor.first_name} ${thisMonitor.last_name}`,
    notes: undefined,
    noTagItems: undefined,
    scan: "",
  });

  const [error, setError] = useState<StrapiErrorsProps>(INITIAL_STATE);
  const [userLoading, setUserLoading] = useState(false);
  const [itemLoading, setItemLoading] = useState(false);

  // console.log(rowId);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

    mode: "onChange",
    values: formData,
  });

  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;

  // 2. Define a submit handler.

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

  async function getStudioUserByStuId(stuId: string) {
    const query = qs.stringify({
      // sort: ["createdAt:desc"],
      // where: {
      stu_id: stuId,
      // },
    });
    const url = new URL("/api/users", baseUrl);
    url.search = query;
    // console.log("query data", query);
    return fetchData(url.href);
    // return await prisma.user.findUnique({ where: { stu_id: stuId } });
  }

  const handleStuIdInput = useDebouncedCallback(async (term: string) => {
    setUserLoading(true);
    if (term.length > 15) {
      const { data: user } = await getStudioUserByStuId(term);
      // console.log(user);
      if (!user[0]) {
        form.setValue("userName", undefined);
        form.setValue("stuIDCheckout", "");
        form.setFocus("stuIDCheckout");
        setUserId("");
        const confirm = window.confirm("User not found, create a new one?");
        if (confirm) router.push(`/signup?stuId=${term}`);
      } else {
        if (user[0].blocked) {
          window.alert("User blocked");
          form.setValue("userName", undefined);
          form.setValue("stuIDCheckout", "");
          form.setFocus("stuIDCheckout");
          setUserId("");
        } else {
          setUserId(user[0].id ?? "");
          form.setValue(
            "userName",
            `${user[0].first_name} ${user[0].last_name}`,
          );
        }
      }
    } else {
      window.alert("hand typing not allowed, please use a scanner.");
      form.setValue("userName", "");
      form.setValue("stuIDCheckout", "");
      form.setFocus("stuIDCheckout");
    }
    setUserLoading(false);
    // console.log(params.toString());
  }, 50);

  async function getItemByBarcode(barcode: string) {
    const query = qs.stringify({
      m_tech_barcode: barcode,
    });
    const url = new URL("/api/inventory", baseUrl);
    url.search = query;
    return fetchData(url.href);
  }

  const handleScan = useDebouncedCallback(async (term: string) => {
    setItemLoading(true);
    if (term.length > 9) {
      const { data, error } = await getItemByBarcode(term);
      // console.log("data is ", data);
      if (data) {
        if (itemObjArr.map((item) => item.id).includes(data.id)) {
          let newItemObjArr = structuredClone(itemObjArr);
          newItemObjArr.map((item) => {
            if (item.id === data.id) item.out = !item.out;
          });
          setItemObjArr(newItemObjArr);
        } else {
          // if the scanned item is already out
          if (data.out) {
            window.alert("Item is marked as being used in a other session");
            // return;
          } else {
            let newItem: InventoryItem = data;
            newItem.out = true;
            setItemObjArr([...itemObjArr, newItem]);
          }
        }
      } else {
        window.alert("Item not found.");
        // form.setValue("scan", "");
        // form.setFocus("scan");
      }
    } else {
      window.alert("hand typing not allowed, please use a scanner.");
      // form.setValue("scan", "");
      // form.setFocus("scan");
    }
    form.setValue("scan", "");
    form.setFocus("scan");
    setItemLoading(false);
    // console.log(params.toString());
  }, 50);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    //update the out status of the items in the master inventory
    try {
      await Promise.all(
        itemObjArr.map(async (itemObj) => {
          const { res, error } = await updateItemAction(
            { out: itemObj.out },
            itemObj.id,
          );
          if (error) {
            setError({ name: "Error updating items", message: error });
          }
        }),
      );
    } catch (error) {
      console.log(error);
    }

    //create new session in the checkout
    const createValues = {
      creation_time: new Date(values.creationTime),
      studio: values.studio,
      other_location: values.other_location ?? null,
      finished: false,
      notes: values.notes ?? null,
      inventory_items: {
        connect: itemObjArr.map((item: inventory_items) => ({ id: item.id })),
      },
      no_tag_items: noTagItems,
      user: {
        connect: { id: userId },
      },
      created_by: {
        connect: { id: thisMonitor.id },
      },
    };

    try {
      const { res, error } = await createCheckoutSessionAction(createValues);
      // setError(res?.strapiErrors);
      // console.log(res);
      if (res) {
        router.push("/dashboard/checkout");
        router.refresh();
        toast.success("New Checkout Session Added");
      } else {
        toast.error("Error happened");
        setError({ name: "Error creating new session", message: error });
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
      // return;
    }
    // return;
  }

  return (
    <div>
      <div className="max-w-60">
        <StrapiErrors error={error} />
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-screen shrink flex-col gap-2 space-y-1 px-4 md:grid md:max-w-lg md:grid-cols-2 md:px-0 xl:max-w-screen-lg xl:grid-cols-4 xl:flex-row"
        >
          <div className="flex-1 gap-2 md:col-span-2 md:grid md:max-w-xl md:grid-cols-2 md:px-0">
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
                    onChange={(e) =>
                      handleStuIdInput((e.target as HTMLInputElement).value)
                    }
                    onPaste={(e) => {
                      if (!DEV_MODE) e.preventDefault();
                    }}
                  >
                    <Input
                      className="bg-indigo-100"
                      placeholder="Scan an ID barcode"
                      autoComplete="off"
                      {...field}
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
                    <InputWithLoading
                      placeholder="Waiting for ID scan"
                      field={field}
                      isLoading={userLoading}
                      disabled
                    />
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
                name="other_location"
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
          </div>

          <div className="flex-col gap-2 md:col-span-2">
            <FormField
              control={form.control}
              name="scan"
              render={({ field }) => (
                <FormItem className="col-span-1 mb-2 w-60">
                  <FormLabel className="ml-1 flex gap-3">
                    Scan to Add Item(s)
                    <div
                      className={`${itemLoading ? "visible" : "invisible"} h-5 w-5 animate-spin rounded-full border-t-4 border-indigo-600`}
                    />
                  </FormLabel>
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
                      placeholder={"Scan an item barcode"}
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
                disabled={false}
              /> */}
              <InventoryItemCart
                data={itemObjArr}
                setItemObjArr={setItemObjArr}
                columnsMeta={checkoutNewInventoryCartColumns}
                disabled={true}
              />
            </div>
          </div>

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
        </form>
      </Form>
    </div>
  );
};

export default NewCheckoutForm;
