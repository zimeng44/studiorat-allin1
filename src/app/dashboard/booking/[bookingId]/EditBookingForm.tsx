"use client";
import React, { useRef } from "react";
import qs from "qs";
import { cn } from "@/lib/utils";
// import { getCookies, setCookie, deleteCookie, getCookie } from "cookies-next";
import {
  BookingType,
  InventoryItem,
  bookingTimeList,
  bookingLocationList,
  bookingTypeList,
} from "@/data/definitions";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  format,
  compareAsc,
  formatISO,
  addDays,
  nextMonday,
  nextFriday,
  isFriday,
} from "date-fns";
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
import Link from "next/link";
import { inventoryColumns } from "@/data/inventoryColumns";
import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";
import BookingEmbededTable from "../BookingEmbededTable";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  deleteBookingAction,
  updateBookingAction,
} from "@/data/actions/booking-actions";

// const config = {
//   maxAge: 60 * 60, // 1 hour
//   path: "/",
//   domain: process.env.HOST ?? "localhost",
//   // httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
// };

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  startDate: z.date().or(z.string()),
  startTime: z.date().or(z.string()),
  endDate: z.date().or(z.string()),
  endTime: z.date().or(z.string()),
  // stuIDCheckout: z.string().min(15).max(16),
  user: z.string().min(2),
  // studio: z.enum(bookingLocationList),
  useLocation: z.string(),
  type: z.string(),
  bookingCreator: z.string().min(1),
  notes: z.string().optional(),
  scan: z.string().optional(),
  inventory_items: z.array(z.number()).optional(),
  // studio_user: z.string().optional(),
});

// const getIdArray: number[] = (booking: CheckoutSessionType) => {
//   let IdArray: number[] = booking.inventory_items?.data.map(
//     (item: InventoryItem) => item.id,
//   );

//   return IdArray;
// };

const EditBookingForm = ({
  booking,
  // tempItems,
  bookingId,
}: {
  booking: BookingType;
  // tempItems: InventoryItem[];
  bookingId: string;
}) => {
  const router = useRouter();
  // if (typeof window !== 'undefined') {}
  // const [itemIdArray, setItemIdArray] = useState(
  //   booking.inventory_items?.data.map((item: InventoryItem) => item.id) ??
  //     Array(),
  // );
  const [itemObjArr, setItemObjArr] = useState(
    booking.inventory_items?.data ?? Array(),
  );

  let localItemsObj = undefined;
  useEffect(() => {
    // console.log("inside");
    const localItems =
      localStorage.getItem(`tempBookingItems${bookingId}`) ?? "";

    if (localItems) {
      // console.log(localItems);
      localItemsObj = localItems ? JSON.parse(localItems) : undefined;
      // setItemIdArray(localItemsObj.map((item: InventoryItem) => item.id));
      setItemObjArr(localItemsObj);
    }
    // localStorage.removeItem(`tempBookingItems${bookingId}`);
  }, []);

  useEffect(() => {
    localStorage.removeItem(`tempBookingItems${bookingId}`);
  }, [localItemsObj]);

  // console.log(tempItems);
  // const [tempSession, setTempSession] = useState(booking);
  // console.log("Item Details Render!!", booking);
  // const router = useRouter();
  // const [data, setData] = useState(rowData);
  // const [scan, setScan] = useState("");

  // console.log("creator is ",booking.bookingCreator);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: booking.startTime
        ? format(new Date(booking.startTime), "MM/dd/yyyy")
        : "",
      startTime: booking.startTime
        ? format(new Date(booking.startTime), "hh:mm a")
        : "",
      endDate: booking.endTime
        ? format(new Date(booking.endTime), "MM/dd/yyyy")
        : "",
      endTime: booking.endTime
        ? format(new Date(booking.endTime), "hh:mm a")
        : "",
      // stuIDCheckout: booking.stuIDCheckout,
      user: `${booking.user?.firstName} ${booking.user?.lastName}` ?? "",
      // stuIDCheckin: booking.stuIDCheckin ?? "",
      // studio: booking.studio,
      useLocation: booking.useLocation ?? "",
      type: booking.type ?? "",
      bookingCreator:
        `${booking.bookingCreator?.firstName} ${booking.bookingCreator?.lastName}` ??
        "",
      // finishMonitor: booking.finishMonitor ?? "",
      notes: booking.notes ?? "",
      // finished: booking.finished,
      scan: "",
    },
    mode: "onChange",
  });

  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;

  // const baseUrl = getStrapiURL();

  // async function fetchData(url: string) {
  //   // const authToken = getAuthToken();
  //   const authToken = process.env.NEXT_PUBLIC_API_TOKEN;

  //   const headers = {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${authToken}`,
  //     },
  //   };

  //   try {
  //     const response = await fetch(url, authToken ? headers : {});
  //     const data = await response.json();
  //     // console.log(data);
  //     return flattenAttributes(data);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     throw error; // or return null;
  //   }
  // }

  // async function getItemByBarcode(barcode: string) {
  //   const query = qs.stringify({
  //     sort: ["createdAt:desc"],
  //     filters: {
  //       $or: [{ mTechBarcode: { $eq: barcode } }],
  //     },
  //   });
  //   const url = new URL("/api/inventory-items", baseUrl);
  //   url.search = query;
  //   // console.log("query data", query)
  //   return fetchData(url.href);
  // }

  // useEffect(() => {
  //   // console.log();

  //   if (scan) {
  //     getItemByBarcode(scan).then(({ data, meta }) => {
  //       if (data[0]) {
  //         let newArr = [...itemIdArray];
  //         if (newArr.includes(data[0].id)) {
  //           // newArr = newArr.filter((id) => id !== data[0].id);
  //           // console.log("here");
  //           updateItemAction({ out: !data[0].out }, data[0].id);
  //         } else {
  //           newArr = [...itemIdArray, data[0].id];
  //           setItemIdArray(newArr);
  //           updateItemAction({ out: true }, data[0].id);
  //           updateCheckoutSessionAction(
  //             {
  //               inventory_items: newArr,
  //             },
  //             booking.id,
  //           );
  //         }
  //       }
  //     });
  //   }
  //   setScan("");
  //   // router.refresh();
  //   form.setValue("scan", "");

  //   // if (inputRef.current) inputRef.current.focus();
  //   // console.log("here", inputRef.current);
  // }, [scan]);

  // const handleIdScan = useDebouncedCallback((term: string) => {
  //   // window.alert("you did it!!");
  //   if (term.length > 12) {
  //     if (term) {
  //       getItemByBarcode(term).then(({ data, meta }) => {
  //         if (data[0]) {
  //           let newArr = [...itemIdArray];
  //           if (newArr.includes(data[0].id)) {
  //             // let newItemObjArr = structuredClone(itemObjArr);
  //             // newItemObjArr.map((item) => {
  //             //   if (item.id === data[0].id) item.out = !item.out;
  //             // });
  //             // setItemObjArr(newItemObjArr);
  //             window.alert("Item already added.");
  //           } else {
  //             // let newItem: InventoryItem = structuredClone(data[0]);
  //             // newItem.out = true;
  //             // newArr = [...itemIdArray, data[0].id];
  //             setItemIdArray([...itemIdArray, data[0].id]);
  //             setItemObjArr([...itemObjArr, data[0]]);
  //           }
  //         } else {
  //           window.alert("Item not found.");
  //         }
  //       });
  //     }
  //   } else {
  //     window.alert("hand typing not allowed, please use a scanner.");
  //   }
  //   form.setValue("scan", "");
  //   form.setFocus("scan");
  // }, 200);

  function handleTypeSelect(value: string) {
    // window.alert("yes");
    if (value === "Same Day") {
      form.setValue("endDate", form.getValues("startDate"));
    }
    if (value === "Overnight") {
      form.setValue("endDate", addDays(form.getValues("startDate"), 1));
      form.setValue("endTime", "12:00 PM");
      // console.log("End Time is ", form.getValues("endTime"));
    }
    if (value === "Weekend") {
      form.setValue("startDate", nextFriday(new Date()));
      form.setValue("endDate", nextMonday(form.getValues("startDate")));
      form.setValue("endTime", "12:00 PM");
      // form.setValue("endDate", form.getValues("startDate"));
    }

    // console.log(form.getValues("type"));
  }

  function handleStartDateSelect(value: string) {
    // window.alert(value);
    if (form.getValues("type") === "Same Day") {
      form.setValue("endDate", new Date(value));
      form.setValue("endTime", form.getValues("startTime"));
    }
    if (form.getValues("type") === "Overnight") {
      form.setValue("endDate", addDays(form.getValues("startDate"), 1));
      form.setValue("endTime", "12:00 PM");
    }
    if (form.getValues("type") === "Weekend") {
      if (!isFriday(new Date(value))) {
        window.alert("Weekend booking has to start on Fridays");
        form.setValue("startDate", nextFriday(new Date()));
        form.setValue("endDate", nextMonday(form.getValues("startDate")));
        form.setValue("endTime", "12:00 PM");
      } else {
        form.setValue("endDate", nextMonday(form.getValues("startDate")));
        form.setValue("endTime", "12:00 PM");
      }
    }
  }

  function handleAddItem() {
    const tempBooking = form.getValues();
    tempBooking.inventory_items = itemObjArr;
    tempBooking.startTime = `${form.getValues("startDate")}, ${form.getValues("startTime")}`;
    tempBooking.endTime = `${form.getValues("endDate")}, ${form.getValues("endTime")}`;
    tempBooking.user = booking.user;
    tempBooking.bookingCreator = booking.bookingCreator;
    delete tempBooking.startDate;
    delete tempBooking.endDate;

    // setCookie(`tempBooking${bookingId}`, JSON.stringify(tempBooking), config);
    localStorage.setItem(
      `tempBooking${bookingId}`,
      JSON.stringify(tempBooking),
    );
    router.push(
      `/dashboard/booking/${bookingId}/additem?bookingId=${bookingId}`,
    );

    // console.log(tempBooking);
    return;
  }

  const handleRemoveFromBooking = (row: InventoryItem) => {
    let newArr = itemObjArr.filter((item) => item.id !== row.id);
    setItemObjArr(newArr);
    // router.refresh();
    // console.log("item should be removed")
  };

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // setItemIdArray(itemObjArr.map((item) => item.id));
    values.inventory_items = itemObjArr.map((item) => item.id);
    values.startTime = `${values.startDate}, ${values.startTime}`;
    values.endTime = `${values.endDate}, ${values.endTime}`;
    delete values.startDate;
    delete values.endDate;
    delete values.bookingCreator;
    delete values.user;

    updateBookingAction(values, bookingId);
    // deleteCookie(`tempBookingItems${bookingId}`);
    localStorage?.removeItem(`tempBookingItems${bookingId}`);
    // console.log("##############################", new Date(values.startTime).toISOString());
    // itemObjArr.map((itemObj) =>
    //   updateItemAction({ out: itemObj.out }, itemObj.id),
    // );
    router.refresh();
    toast.success("Booking Saved.");
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-4"
        >
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Type</FormLabel>
                <Select
                  // onValueChange={field.onChange}
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleTypeSelect(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a stuido" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bookingTypeList.map((type, index) => (
                      <SelectItem
                        key={index}
                        value={`${type}`}
                      >{`${type}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="user"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>User</FormLabel>
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
          <div className="col-span-2 flex">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="col-span-1 w-[120px]">
                  <FormLabel>Start Date</FormLabel>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "LL/dd/y")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      side="bottom"
                      className="w-auto p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(value) => {
                          field.onChange(value);
                          handleStartDateSelect(value);
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="col-span-1 w-[120px]">
                  <FormLabel>Start Time</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className={cn(
                      " pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bookingTimeList.map((time, index) => (
                        <SelectItem
                          key={index}
                          value={`${time}`}
                        >{`${time}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-2 flex">
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="w-[120px]">
                  <FormLabel>End Date</FormLabel>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            " pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                          disabled={form.getValues("type") !== "Exception"}
                        >
                          {field.value ? (
                            format(field.value, "LL/dd/y")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      side="bottom"
                      className="w-auto p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        // onSelect={(day) => console.log("Calendar output is ", `${day?.toLocaleDateString()}`)}
                        disabled={(date) =>
                          date < new Date(form.getValues("startDate"))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem className="w-[120px]">
                  <FormLabel>End Time</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className={cn(
                      " pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                    value={field.value}
                    disabled={
                      form.getValues("type") === "Overnight" ||
                      form.getValues("type") === "Weekend"
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bookingTimeList.map((time, index) => (
                        <SelectItem
                          key={index}
                          value={`${time}`}
                        >{`${time}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input disabled {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          {/* <FormField
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
          /> */}

          {/* <FormField
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select a stuido" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bookingLocationList.map((studio, index) => (
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
          /> */}
          <FormField
            control={form.control}
            name="useLocation"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Use Location</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a stuido" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bookingLocationList.map((locataion, index) => (
                      <SelectItem
                        key={index}
                        value={`${locataion}`}
                      >{`${locataion}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bookingCreator"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Created by</FormLabel>
                <FormControl>
                  <Input disabled {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel className="align-bottom">Notes</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2"></div>
          <div className="col-span-4">
            {/* <div className="text-center align-baseline font-normal"> */}
            Booking Items
            {/* </div> */}
          </div>

          {/* <FormField
            control={form.control}
            name="scan"
            render={({ field }) => (
              <FormItem className="col-span-2">
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
          /> */}
          <Button
            className="hover:bg-slate-200 active:bg-slate-300"
            type="button"
            onClick={(e) => handleAddItem()}
            variant="secondary"
          >
            Add Item
          </Button>
          <div className="col-span-2 size-full gap-10 md:col-span-4 lg:col-span-4">
            <BookingEmbededTable
              data={itemObjArr}
              columns={inventoryColumns}
              handleRemoveFromBooking={handleRemoveFromBooking}
            />
          </div>
          {/* <div className="col-span-1 grid grid-cols-subgrid gap-4"></div> */}

          <Button className="align-right col-span-2" type="submit">
            Save
          </Button>

          <Button
            className="hover:bg-red-300 active:bg-red-400"
            type="button"
            onClick={(e) => {
              const confirm = window.confirm(
                "Are you sure you want to delete this booking?",
              );
              if (!confirm) return;
              const res = deleteBookingAction(bookingId);
              if (!res) {
                toast.success("Booking Deleted");
                router.push("/dashboard/booking");
              }
            }}
            variant="destructive"
          >
            Delete
          </Button>
          <Button
            variant="secondary"
            className="hover:bg-slate-200 active:bg-slate-300"
            type="button"
            onClick={(e) => {
              // deleteCookie(`tempBookingItems${bookingId}`);
              localStorage.removeItem(`tempBookingItems${bookingId}`);
              router.push("/dashboard/booking");
              // router.refresh();
            }}
          >
            Cancel
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditBookingForm;
