"use client";
import React from "react";
import qs from "qs";
import {
  CheckoutSessionType,
  CheckoutSessionTypePost,
  CheckoutWithUserAndItems,
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
import { useRouter, useSearchParams } from "next/navigation";
import { updateCheckoutSessionActionWithItems } from "@/data/actions/checkout-actions";
import {
  inventoryColumns,
  inventoryColumnsFinished,
} from "@/app/dashboard/checkout/embeddedInventoryColumns";
import EmbededTable from "@/components/custom/EmbededTable";
import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";
import { SubmitButton } from "@/components/custom/SubmitButton";
import { StrapiErrors } from "@/components/custom/StrapiErrors";
import { TagsInput } from "react-tag-input-component";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
  checkout_sessions,
  inventory_items,
  Prisma,
  User,
} from "@prisma/client";
import { InputWithLoading } from "@/components/custom/InputWithLoading";

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
  creation_time: z.date().or(z.string()),
  finish_time: z.date().or(z.string()).optional(),
  stuIDCheckout: z
    .string()
    .min(15, {
      message: "ID Barcode should be at least 15 characters",
    })
    .max(16, {
      message: "ID Barcode should be at least 15 characters",
    }),
  userName: z.string().min(2, {
    message: "Scan a ID barcode to retrieve the user name",
  }),
  return_id: z.string().optional(),
  studio: z.string().min(1),
  otherLocation: z.string().optional(),
  creationMonitor: z.string().min(1),
  finishMonitor: z.string().optional(),
  notes: z.string().optional(),
  finished: z.boolean(),
  scan: z.string().optional(),
  inventory_items: z.string().optional(),
  noTagItems: z.any().optional(),
  user: z.string().optional(),
});

const EditCheckoutSessionForm = ({
  session,
  sessionId,
  thisMonitor,
  authToken,
}: {
  session: CheckoutWithUserAndItems;
  sessionId: string;
  thisMonitor: User;
  authToken: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState<StrapiErrorsProps>(INITIAL_STATE);
  // const inventoryItems = session;
  const [noTagItems, setNoTagItems] = useState(
    session.no_tag_items ?? ["unreturned", "example: xlr cable 2"],
  );

  const [itemObjArr, setItemObjArr] = useState<inventory_items[]>(
    session.inventory_items ?? undefined,
  );
  const [itemLoading, setItemLoading] = useState(false);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creation_time: session.creation_time
        ? new Date(session?.creation_time)
        : undefined,
      finish_time: session.finish_time
        ? new Date(session?.finish_time)
        : undefined,
      stuIDCheckout: session.user?.stu_id ?? undefined,
      userName: `${session.user?.first_name} ${session.user?.last_name}`,
      return_id: session.return_id ?? undefined,
      studio: session.studio ?? undefined,
      otherLocation: session.other_location ?? "",
      creationMonitor: `${session.created_by?.first_name} ${session.created_by?.last_name}`,
      finishMonitor: session.finished_by ?? "",
      notes: session.notes ?? "",
      finished: session.finished ?? false,
      noTagItems: session.no_tag_items ?? [""],
      scan: undefined,
    },
    mode: "onChange",
  });

  // console.log(form.getValues("finish_time"));
  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;

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

  const handleScan = useDebouncedCallback((term: string) => {
    // window.alert("you did it!!");
    setItemLoading(true);
    if (term.length > 9) {
      getItemByBarcode(term).then(({ data, error }) => {
        if (data) {
          if (data.length > 1) {
            window.alert(
              "Inventpory warning: multiple items found with the same barcode, the first item found will be added",
            );
          }
          if (itemObjArr.map((item) => item.id).includes(data[0].id)) {
            let newItemObjArr = structuredClone(itemObjArr);
            newItemObjArr.map((item: any) => {
              if (item.id === data[0].id) item.out = !item.out;
            });
            setItemObjArr(newItemObjArr);
          } else {
            let newItem: inventory_items = data[0];
            newItem.out = true;
            setItemObjArr([...itemObjArr, newItem]);
          }
        } else {
          window.alert(error);
        }
      });
    } else {
      window.alert("hand typing not allowed, please use a scanner.");
    }

    form.setValue("scan", "");
    form.setFocus("scan");
    setItemLoading(false);
  }, 50);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    // console.log(form.formState.isSubmitting);

    let formValue: Prisma.checkout_sessionsUpdateInput = {
      // creat: new Date(values.creation_time).toISOString(),
      // stuIDCheckout: values.stuIDCheckout,
      // return_id: values.return_id,
      studio: values.studio,
      other_location: values.otherLocation ?? null,
      // creationMonitor: values.creationMonitor,
      return_id: values.return_id ?? null,
      finish_time: values.finish_time ? values.finish_time : null,
      //   values.finish_time === "" ? undefined : new Date().toISOString(),
      finished_by: values.finishMonitor ?? null,
      finished: values.finished,
      notes: values.notes ?? null,
      // inventory_items: itemIdArray ?? [0],
      no_tag_items: noTagItems ?? [""],
      // user: session.user?.id ?? 0,
    };

    if (itemObjArr.length > 0)
      formValue.inventory_items = {
        set: itemObjArr.map((item: inventory_items) => ({ id: item.id })),
      };

    try {
      const { res, error } = await updateCheckoutSessionActionWithItems(
        formValue,
        sessionId,
        itemObjArr,
      );
      // setError(res.strapiErrors);
      if (!error) {
        router.push("/dashboard/checkout");
        toast.success("Checkout Session Saved");
      }
    } catch (error) {
      toast.error("Error Updating Checkout Session");
      return;
    }
  }

  function handleFinish() {
    if (!form.getValues("return_id")) {
      window.alert("Return ID needed.");
      return;
    }
    // console.log(itemObjArr.filter((item) => item.out === false));
    if (itemObjArr.filter((item) => item.out === true).length > 0) {
      window.alert("Unreturned item(s)");
      return;
    }
    if ((noTagItems as string[]).includes("unreturned")) {
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
    form.setValue("finish_time", new Date().toISOString());
    form.setValue(
      "finishMonitor",
      `${thisMonitor.first_name} ${thisMonitor.last_name}`,
    );
    form.setValue("finished", true);
    onSubmit(form.getValues());
  }

  const handleReturnId = useDebouncedCallback((term: string) => {
    // window.alert("you did it!!");
    if (term.length > 15) {
    } else {
      window.alert("hand typing not allowed, please use a scanner.");
      form.setValue("return_id", "");
      form.setFocus("return_id");
    }
  }, 50);

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-screen shrink flex-col gap-2 space-y-1 px-2 md:grid md:max-w-lg md:grid-cols-2 md:px-0"
        >
          <FormField
            control={form.control}
            name="creation_time"
            render={({ field }) => (
              <FormItem className="col-span-1 size-full">
                <FormLabel>Creation Time</FormLabel>
                <FormControl>
                  <Input
                    disabled
                    placeholder={"This is the time"}
                    {...field}
                    value={
                      field.value === null || field.value === undefined
                        ? ``
                        : format(field.value, "MM/dd/yyyy hh:mm a")
                    }
                  ></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {session.finished ? (
            <FormField
              control={form.control}
              name="finish_time"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Finish Time</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      {...field}
                      value={
                        field.value === null || field.value === undefined
                          ? ``
                          : format(field.value, "MM/dd/yyyy hh:mm a")
                      }
                    ></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            ``
          )}
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
            name="return_id"
            render={({ field }) => (
              <FormItem className="col-span-1 size-full">
                <FormLabel>Return ID</FormLabel>
                <FormControl
                  onChange={(e) =>
                    handleReturnId((e.target as HTMLInputElement).value)
                  }
                >
                  <Input
                    {...field}
                    disabled={session.finished ?? false}
                    placeholder="Scan an ID Here"
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
              <FormItem className="col-span-1 size-full">
                <FormLabel>Studio</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value !== "Other") form.setValue("otherLocation", "");
                  }}
                  value={field.value}
                  disabled={session.finished ?? false}
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
          {form.getValues("studio") === "Other" ? (
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
                        form.getValues("studio") !== "Other" ||
                        (session.finished ?? false)
                      }
                    ></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="col-span-1"></div>
          )}
          {session.finished ? <div className="col-span-1"></div> : ``}
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
                    disabled={session.finished ?? false}
                  />
                </FormControl>
                <FormMessage className="text-slate-400">
                  press enter or comma to add new item. take 'unreturned' off
                  when items return'
                </FormMessage>
              </FormItem>
            )}
          />

          {session.finished ? (
            ``
          ) : (
            <FormField
              control={form.control}
              name="scan"
              render={({ field }) => (
                <FormItem className="col-span-1 size-full">
                  <FormLabel className="ml-1 flex gap-3">
                    Barcode Scan
                    <div
                      className={`${itemLoading ? "visible" : "invisible"} h-5 w-5 animate-spin rounded-full border-t-4 border-indigo-600`}
                    />
                  </FormLabel>
                  <FormControl
                    onChange={(e) =>
                      handleScan((e.target as HTMLInputElement).value)
                    }
                  >
                    <Input
                      className="bg-indigo-100"
                      placeholder={"Scan a barcode"}
                      {...field}
                      disabled={session.finished ?? false}
                    ></Input>

                    {/* <InputWithLoading
                      className="bg-indigo-100"
                      placeholder="Item Barcode Scan"
                      field={field}
                      isLoading={itemLoading}
                      disabled={session.finished ?? false}
                    /> */}
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
              columns={
                session.finished ?? false
                  ? inventoryColumnsFinished
                  : inventoryColumns
              }
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
              text={session.finished ? "Save Notes" : "Save Unfinished"}
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
                // const params = new URLSearchParams(searchParams);
                router.push(`/dashboard/checkout?${searchParams.toString()}`);
                // router.refresh();
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
