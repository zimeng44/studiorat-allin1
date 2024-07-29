"use client";
import React from "react";
import { cn } from "@/lib/utils";
// import { getCookies, setCookie, deleteCookie, getCookie } from "cookies-next";
import {
  BookingType,
  InventoryItem,
  bookingTimeList,
  bookingLocationList,
  bookingTypeList,
  RetrievedItems,
  BookingTypePost,
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
import qs from "qs";

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  startDate: z.date(),
  startTime: z.string(),
  endDate: z.date(),
  endTime: z.string(),
  // stuIDCheckout: z.string().min(15).max(16),
  userName: z.string().min(2),
  // studio: z.enum(bookingLocationList),
  useLocation: z.string(),
  type: z.string(),
  bookingCreatorName: z.string().min(1),
  notes: z.string().optional(),
  scan: z.string(),
  // inventory_items: z.array(z.number()).optional(),
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
  bookingId,
  authToken,
}: {
  booking: BookingType;
  bookingId: string;
  authToken: string;
}) => {
  const router = useRouter();
  const [tempForm, setTempForm] = useState<z.infer<typeof formSchema>>();
  // console.log(booking.user);
  // if (typeof window !== 'undefined') {}
  // const [itemIdArray, setItemIdArray] = useState(
  //   booking.inventory_items?.data.map((item: InventoryItem) => item.id) ??
  //     Array(),
  // );
  const inventoryItems = booking.inventory_items as RetrievedItems;
  const [itemObjArr, setItemObjArr] = useState(
    inventoryItems.data ?? Array(),
  );

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: booking.startTime
        ? new Date(booking.startTime)
        : new Date(),
      startTime: booking.startTime
        ? format(new Date(booking.startTime), "hh:mm a")
        : "",
      endDate: booking.endTime
        ? new Date(booking.endTime)
        : new Date(),
      endTime: booking.endTime
        ? format(new Date(booking.endTime), "hh:mm a")
        : "",
      userName: `${booking.user?.firstName} ${booking.user?.lastName}`,
      useLocation: booking.useLocation ?? "",
      type: booking.type ?? "",
      bookingCreatorName:
        `${booking.bookingCreator?.firstName} ${booking.bookingCreator?.lastName}` ??
        "",
      notes: booking.notes ?? "",
      scan: "",
    },
    mode: "onChange",
    values: tempForm,
  });

  let localItemsObj = undefined;
  useEffect(() => {
    if (localStorage) {
      const tempBookingStr =
        localStorage.getItem(`tempBooking${bookingId}`) ?? undefined;
      if (tempBookingStr !== undefined) {
        // console.log("here");
        const tempNewBooking = tempBookingStr
          ? JSON.parse(tempBookingStr)
          : undefined;
        setTempForm(tempNewBooking);
        localStorage.removeItem(`tempBooking${bookingId}`);
        // console.log(tempNewBooking);
      }

      const localItems =
        localStorage.getItem(`tempBookingItems${bookingId}`) ?? "";
      if (localItems) {
        // console.log(localItems);
        localItemsObj = localItems ? JSON.parse(localItems) : undefined;
        // setItemIdArray(localItemsObj.map((item: InventoryItem) => item.id));
        setItemObjArr(localItemsObj);
        localStorage.removeItem(`tempBookingItems${bookingId}`);
      }
    }
  }, []);

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

  function handleStartDateSelect(value: Date) {
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
    const tempBooking:BookingType = form.getValues();
    tempBooking.inventory_items = itemObjArr;
    // tempBooking.startTime = `${form.getValues("startDate")}, ${form.getValues("startTime")}`;
    // tempBooking.endTime = `${form.getValues("endDate")}, ${form.getValues("endTime")}`;
    tempBooking.user = booking.user;
    tempBooking.bookingCreator = booking.bookingCreator;
    // delete tempBooking.startDate;
    // delete tempBooking.endDate;
    // console.log(tempBooking);
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

  function time12To24(time: string) {
    const hour = time.slice(0, 2);
    const minute = time.slice(3, 5);
    const ampm = time.slice(6, 8);
    let convertedHour = "";
    // ampm === "AM" ? hour : (parseInt(hour) + 12).toString();
    if (hour === "12" && ampm === "AM") convertedHour = "00";
    else if (hour === "12" && ampm === "PM") convertedHour = "12";
    else if (ampm === "PM") convertedHour = `${parseInt(hour) + 12}`;
    else convertedHour = hour;

    return `${convertedHour}:${minute}:00`;
  }

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

  async function itemConflictCheck(booking: BookingTypePost) {
    const inventoryItems = booking?.inventory_items as InventoryItem[]
    const itemList =
      inventoryItems.length > 0
        ? [...inventoryItems]
        : [0];

    // console.log(itemList);
    const query = qs.stringify({
      // sort: ["createdAt:desc"],
      populate: "*",
      filters: {
        $and: [
          {
            id: { $ne: bookingId },
          },
          {
            $or: [
              {
                startTime: {
                  $between: [booking.startTime, booking.endTime],
                },
              },
              {
                endTime: {
                  $between: [booking.startTime, booking.endTime],
                },
              },
              {
                $and: [
                  { startTime: { $lte: booking.startTime } },
                  { endTime: { $gte: booking.endTime } },
                ],
              },
            ],
          },
          {
            inventory_items: {
              id: {
                $in: [...itemList],
              },
            },
          },
        ],
      },
    });
    const url = new URL("/api/bookings", baseUrl);
    url.search = query;
    // console.log("query data", query)
    return fetchData(url.href);
  }

  async function locationConflictCheck(booking: BookingTypePost) {
    const query = qs.stringify({
      // sort: ["createdAt:desc"],
      // populate: "*",
      filters: {
        $and: [
          {
            id: { $ne: bookingId },
          },
          {
            $or: [
              {
                startTime: {
                  $between: [booking.startTime, booking.endTime],
                },
              },
              {
                endTime: {
                  $between: [booking.startTime, booking.endTime],
                },
              },
              {
                $and: [
                  { startTime: { $lte: booking.startTime } },
                  { endTime: { $gte: booking.endTime } },
                ],
              },
            ],
          },
          {
            useLocation: { $eq: booking.useLocation },
          },
        ],
      },
    });
    const url = new URL("/api/bookings", baseUrl);
    url.search = query;
    // console.log("query data", query)
    return fetchData(url.href);
  }

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // setItemIdArray(itemObjArr.map((item) => item.id));
    const formValue: BookingTypePost = {
      type: form.getValues("type"),
      startTime: new Date(
        `${format(new Date(form.getValues("startDate")), "yyyy-MM-dd")}T${time12To24(form.getValues("startTime").toString())}`,
      ).toISOString(),
      endTime: new Date(
        `${format(new Date(form.getValues("endDate")), "yyyy-MM-dd")}T${time12To24(form.getValues("endTime").toString())}`,
      ).toISOString(),
      user: booking?.user?.id ?? 0,
      useLocation: form.getValues("useLocation"),
      bookingCreator: booking?.bookingCreator?.id ?? 0,
      notes: form.getValues("notes") ?? "",
      inventory_items: itemObjArr.map((item: InventoryItem) => item.id),
    };

    if (formValue.startTime >= formValue.endTime) {
      window.alert("End Date and Time can't be less than Start Date and Time.");
      return;
    }

    itemConflictCheck(formValue).then(({ data, meta }) => {
      // console.log(data);
      if (data.length !== 0) {
        window.alert("Item Conflict Found.");
      } else {
        locationConflictCheck(formValue).then(({ data, meta }) => {
          // console.log(data);
          if (data.length !== 0) {
            // locationConflict = true;
            window.alert("Location Conflict Found.");
          } else {
            updateBookingAction(formValue, bookingId).then(() =>
              toast.success("Booking Saved Successfully."),
            );
          }
        });
      }
    });
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
                  // defaultValue={field.value}
                  value={field.value}
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
            name="userName"
            render={({ field }) => (
              <FormItem className="col-span-2">
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
                        onSelect={(value: Date | undefined) => {
                          if (value) {
                            field.onChange(value);
                            handleStartDateSelect(value);
                          }
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
                <FormItem className={cn(
                      "col-span-1 w-[120px]",
                      " pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}>
                  <FormLabel>Start Time</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
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
                <FormItem className={cn(
                      "w-[120px]",
                      " pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}>
                  <FormLabel>End Time</FormLabel>
                  <Select
                    onValueChange={field.onChange}
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

          <FormField
            control={form.control}
            name="useLocation"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Use Location</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  // defaultValue={field.value}
                  value={field.value}
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
            name="bookingCreatorName"
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
              // localStorage.removeItem(`tempBookingItems${bookingId}`);
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
