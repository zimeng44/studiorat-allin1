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
import { toast } from "sonner";
import Link from "next/link";
import {
  CheckoutSessionType,
  InventoryItem,
  studioList,
} from "@/data/definitions";
import { inventoryColumns } from "@/data/inventoryColumns";
import {
  createCheckoutSessionAction,
  updateCheckoutSessionAction,
} from "@/data/actions/checkout-actions";
// import { getStudioUserByStuId } from "@/data/loaders";
import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import qs from "qs";
import EmbededTable from "@/components/custom/EmbededTable";
import { useDebouncedCallback } from "use-debounce";
import { updateItemAction } from "@/data/actions/inventory-actions";

// const NEW_BOOKING = {
//   startTime: "",
//   endTime: "",
//   useLocation: "",
//   type: "",
//   createMonitor: "",
//   notes: "",
// };

interface StrapiErrorsProps {
  message: string | null;
  name: string;
}

const INITIAL_STATE = {
  message: null,
  name: "",
};

const FormUserType = z
  .object({
    stuId: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    lastUse: z.string().optional(),
    email: z.string().optional(),
    userType: z.string().optional(),
    blocked: z.boolean(),
  })
  .optional();

// const mTechBarcode = z.union([
//   z.string().min(12).and(z.string().max(13)),
//   z.string().length(0),
// ]);
// .optional();
// .transform((e) => (e === "" ? undefined : e));

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  statDate: z.date().or(z.string().date()),
  statTime: z.string().time(),
  endDate: z.date().or(z.string().date()),
  endTime: z.string().time(),
  user: z.string(),
  useLocation: z.string().min(1),
  creationMonitor: z.string().min(1),
  finishMonitor: z.string().optional(),
  notes: z.string().optional(),
  finished: z.boolean(),
  scan: z.string().optional(),
  inventory_items: z.number().array().optional(),
  studio_user: z.string().optional(),
});

const NewBookingForm = () => {
  const [data, setData] = useState({
    creationTime: `${new Date().toLocaleString()}`,
    stuIDCheckout: "",
    stuIDCheckin: "",
    studio: "",
    otherLocation: "",
    creationMonitor: "",
    finishMonitor: "",
    finishTime: "",
    notes: "",
    finished: false,
  });

  const [error, setError] = useState<StrapiErrorsProps>(INITIAL_STATE);

  // console.log(rowId);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creationTime: data.creationTime,
      finishTime: undefined,
      stuIDCheckout: data.stuIDCheckout,
      userName: "",
      stuIDCheckin: data.stuIDCheckin,
      studio: data.studio ?? "",
      otherLocation: data.otherLocation ? data.otherLocation : "",
      creationMonitor: data.creationMonitor,
      finishMonitor: data.finishMonitor,
      notes: data.notes ? data.notes : "",
      finished: data.finished,
      inventory_items: [],
      studio_user: undefined,
    },
    mode: "onChange",
  });

  const [stuIDCheckout, setstuIDCheckout] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [itemIdArray, setItemIdArray] = useState(Array());
  const [itemObjArr, setItemObjArr] = useState(Array());

  useEffect(() => {
    // console.log(stuIDCheckout);
    const baseUrl = getStrapiURL();

    async function fetchData(url: string) {
      // const authToken = getAuthToken();
      const authToken = process.env.NEXT_PUBLIC_API_TOKEN;

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
      const url = new URL("/api/studio-users", baseUrl);
      url.search = query;
      // console.log("query data", query)
      return fetchData(url.href);
    }

    if (stuIDCheckout) {
      getStudioUserByStuId(stuIDCheckout).then(({ data, meta }) => {
        // console.log(data);
        if (data[0]) {
          setUserId(data[0].id ?? "");
          setUserName(`${data[0].firstName} ${data[0].lastName}`);
          form.setValue("userName", `${data[0].firstName} ${data[0].lastName}`);
        } else {
          form.setValue("userName", "");
          console.log("User Not Found");
        }
        // console.log(data[0].id);
      });
    }
    // console.log(data);
  }, [stuIDCheckout]);
  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;

  // 2. Define a submit handler.

  const baseUrl = getStrapiURL();

  async function fetchData(url: string) {
    // const authToken = getAuthToken();
    const authToken = process.env.NEXT_PUBLIC_API_TOKEN;

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
    if (term.length > 12) {
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
        }
      });
    } else {
      window.alert("hand typing not allowed, please use a scanner.");
    }
    form.setValue("scan", "");
    form.setFocus("scan");

    // console.log(params.toString());
  }, 200);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    values.studio_user = userId;
    values.inventory_items = itemIdArray;

    try {
      //update the out status of the items in the master inventory
      itemObjArr.map((itemObj) =>
        updateItemAction({ out: itemObj.out }, itemObj.id),
      );
      //create the session in the checkout
      await createCheckoutSessionAction(values);
    } catch (error) {
      toast.error("Error Creating New Checkout Session");
      setError({
        ...INITIAL_STATE,
        message: "Error Creating New Checkout Session",
        name: "New Checkout Session Error",
      });
      // setLoading(false);
      return;
    }

    toast.success("New Checkout Session Added");

    // console.log("data submited is ", values);
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-3"
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
                <FormControl
                  onChange={(e) => {
                    setstuIDCheckout(e.target.value);
                  }}
                >
                  <Input
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
                  onChange={(e) => handleIdScan(e.target.value)}
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
          <div className="col-span-2 flex w-[550px]  gap-10">
            <EmbededTable data={itemObjArr} columns={inventoryColumns} />
          </div>

          {/* <div className="col-span-1 grid grid-cols-subgrid gap-4">what</div> */}

          <Button className="align-right" type="submit">
            Add
          </Button>

          <Link href="/dashboard/booking">
            <Button
              className="hover:bg-slate-200 active:bg-slate-300"
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
          </Link>
        </form>
      </Form>
    </div>
  );
};

export default NewBookingForm;
