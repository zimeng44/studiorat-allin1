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
  UserType,
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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
import { inventoryColumns } from "@/app/dashboard/master-inventory/inventoryColumns";
import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";
import BookingEmbededTable from "../BookingEmbededTable";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CirclePlus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  deleteBookingAction,
  updateBookingAction,
} from "@/data/actions/booking-actions";
import qs from "qs";
import { SubmitButton } from "@/components/custom/SubmitButton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  currentUser,
  authToken,
}: {
  booking: BookingType;
  bookingId: string;
  currentUser: UserType;
  authToken: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const pathname = usePathname();
  const view = searchParams.get("view") ?? "calendar";
  const isPast =
    new Date().toISOString() >=
    (booking?.startTime ?? new Date().toISOString());
  // console.log(isPast);
  // const params = new URLSearchParams(searchParams);

  const [tempForm, setTempForm] = useState<z.infer<typeof formSchema>>();
  const inventoryItems = booking.inventory_items as RetrievedItems;
  const [itemObjArr, setItemObjArr] = useState(inventoryItems?.data ?? Array());
  const [bookingType, setBookingType] = useState(booking.type);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: booking.startTime ? new Date(booking.startTime) : new Date(),
      startTime: booking.startTime
        ? format(new Date(booking.startTime), "hh:mm a")
        : "",
      endDate: booking.endTime ? new Date(booking.endTime) : new Date(),
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
        const tempBooking = tempBookingStr
          ? JSON.parse(tempBookingStr)
          : undefined;

        tempBooking.startDate = new Date(tempBooking.startDate);
        tempBooking.endDate = new Date(tempBooking.endDate);
        setTempForm(tempBooking);
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

    if (value === "Exception" && currentUser.role?.name !== "Admin") {
      window.alert(
        "Admin approval required, please contact admin to make exceptions.",
      );
      form.setValue("type", bookingType ?? "Same Day");
    }
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
    setBookingType(value);
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
    const tempBooking: BookingType = form.getValues();
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
      `/dashboard/booking/${bookingId}/additem?bookingId=${bookingId}&view=${view}`,
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
    const inventoryItems = booking?.inventory_items as InventoryItem[];
    const itemList = inventoryItems.length > 0 ? [...inventoryItems] : [0];

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
        return;
      }
      if (formValue.useLocation === "Outside") {
        updateBookingAction(formValue, bookingId).then(() => {
          toast.success("Booking Saved Successfully.");
          router.push(`/dashboard/booking?view=${view}`);
        });
      } else {
        locationConflictCheck(formValue).then(({ data, meta }) => {
          // console.log(data);
          if (data.length !== 0) {
            window.alert("Location Conflict Found.");
            return;
          }
          updateBookingAction(formValue, bookingId).then(() => {
            toast.success("Booking Saved Successfully.");
            router.push(`/dashboard/booking?view=${view}`);
          });
        });
      }
    });
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-screen shrink flex-col gap-2 space-y-1 px-2 md:grid md:max-w-lg md:grid-cols-4 md:px-0"
        >
          <div className="col-span-1 flex md:col-span-2">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="size-fitl">
                  <FormLabel>Type</FormLabel>
                  <Select
                    // onValueChange={field.onChange}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleTypeSelect(value);
                    }}
                    // defaultValue={field.value}
                    value={field.value}
                    disabled={isPast}
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
          </div>
          <div className="col-span-1 flex md:col-span-2">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem className="size-fit">
                  <FormLabel>User Name</FormLabel>
                  <FormControl>
                    {/* <Input
                      {...field}
                      disabled
                      // onChange={(e) => setUserId(e.target.value)}
                    ></Input> */}
                    <Label
                      {...field}
                      className="flex p-2 font-sans italic text-slate-400"
                    >
                      {field.value}
                    </Label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-1 flex size-auto flex-1 flex-row justify-start md:col-span-2">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="col-span-1 size-full min-w-[120px]">
                  <FormLabel>Start Date</FormLabel>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "flex size-full justify-between pl-2 text-left font-normal md:size-auto",
                            !field.value && "text-muted-foreground",
                          )}
                          disabled={isPast}
                        >
                          {field.value ? (
                            format(field.value, "LL/dd/y")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-1 h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      side="bottom"
                      className="w-auto flex-1 p-0"
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
                <FormItem
                  className={cn(
                    "col-span-1 size-full min-w-[125px]",
                    " pl-2 text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  <FormLabel>Start Time</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPast}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="w-auto p-0">
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
          <div className="col-span-1 flex size-auto flex-1 flex-row justify-start md:col-span-2">
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="col-span-1 size-full min-w-[120px]">
                  <FormLabel>End Date</FormLabel>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "flex size-full justify-between pl-2 text-left font-normal md:size-auto",
                            !field.value && "text-muted-foreground",
                          )}
                          disabled={
                            form.getValues("type") !== "Exception" || isPast
                          }
                        >
                          {field.value ? (
                            format(field.value, "LL/dd/y")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-1 h-4 w-4 opacity-50" />
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
                <FormItem
                  className={cn(
                    "col-span-1 size-full min-w-[125px]",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  <FormLabel>End Time</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={
                      form.getValues("type") === "Overnight" ||
                      form.getValues("type") === "Weekend" ||
                      isPast
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

          <div className="col-span-2 flex size-auto flex-1 flex-row justify-start md:col-span-4">
            <FormField
              control={form.control}
              name="useLocation"
              render={({ field }) => (
                <FormItem className="col-span-1 flex size-full flex-col text-left font-normal md:col-span-2 md:size-full">
                  <FormLabel>Use Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    // defaultValue={field.value}
                    value={field.value}
                    disabled={isPast}
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
                <FormItem className="col-span-1 size-full pl-2 md:col-span-2">
                  <FormLabel>Created by</FormLabel>
                  <FormControl>
                    {/* <Input disabled {...field}></Input> */}
                    <Label
                      {...field}
                      className="flex p-2 font-sans italic text-slate-400"
                    >
                      {field.value}
                    </Label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="col-span-2 size-full">
                <FormLabel className="align-bottom">Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Leave a note"></Textarea>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2"></div>

          <div className="col-span-2 flex justify-evenly md:col-span-4">
            {/* <div className="text-center align-baseline font-normal"> */}
            <h1 className="flex-1 content-center text-center">Booking Items</h1>
            <Button
              className={`flex-1 p-3 hover:bg-slate-200 active:bg-slate-300 ${isPast ? "invisible" : ""}`}
              type="button"
              onClick={(e) => handleAddItem()}
              variant="secondary"
              disabled={isPast}
            >
              <CirclePlus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
            {/* </div> */}
          </div>
          <div className="col-span-2 size-full justify-center gap-10 md:col-span-4">
            <BookingEmbededTable
              data={itemObjArr}
              columns={inventoryColumns}
              handleRemoveFromBooking={handleRemoveFromBooking}
              isPast={isPast}
            />
          </div>
          {/* <div className="col-span-1 grid grid-cols-subgrid gap-4"></div> */}

          {/* <Button className="align-right col-span-2" type="submit">
            Save
          </Button> */}
          <div className="col-span-2 flex gap-1 p-3 md:col-span-4">
            <SubmitButton
              className="flex-1"
              text="Save"
              loadingText="Saving Booking"
              loading={form.formState.isSubmitting}
            />

            <Button
              className={`flex-1 hover:bg-red-300 active:bg-red-400 ${isPast && currentUser.role?.name !== "Admin" ? "invisible" : ""}`}
              type="button"
              onClick={(e) => {
                const confirm = window.confirm(
                  "Are you sure you want to delete this booking?",
                );
                if (!confirm) return;
                const res = deleteBookingAction(bookingId);
                if (!res) {
                  toast.success("Booking Deleted");
                  router.push(`/dashboard/booking?view=${view}`);
                }
              }}
              variant="destructive"
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              className="flex-1 hover:bg-slate-200 active:bg-slate-300"
              type="button"
              onClick={(e) => {
                // deleteCookie(`tempBookingItems${bookingId}`);
                // localStorage.removeItem(`tempBookingItems${bookingId}`);
                router.push(`/dashboard/booking?view=${view}`);
                // router.refresh();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditBookingForm;
