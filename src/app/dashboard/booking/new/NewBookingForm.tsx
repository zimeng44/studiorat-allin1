"use client";
import React from "react";
import qs from "qs";
import { cn } from "@/lib/utils";
import {
  BookingType,
  InventoryItem,
  bookingTimeList,
  bookingLocationList,
  bookingTypeList,
  UserType,
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
  add,
  addHours,
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { inventoryColumns } from "@/app/dashboard/master-inventory/inventoryColumns";
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
import { createBookingAction } from "@/data/actions/booking-actions";
import { SubmitButton } from "@/components/custom/SubmitButton";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  type: z.string(),
  startDate: z.date(),
  startTime: z.string().min(1),
  endDate: z.date(),
  endTime: z.string().min(4),
  // user: z.string().min(2),
  netId: z.string().optional(),
  userName: z.string().min(1),
  useLocation: z.enum([
    "Outside",
    "Studio A",
    "Studio B",
    "Studio C",
    "Studio D",
    "Studio D1",
    "Studio E",
    "Studio F",
    "Dolan",
    "RLab",
    "Paulson",
  ]),
  bookingCreatorName: z.string().min(1),
  notes: z.string().optional(),
});

const NewBookingForm = ({
  booking,
  authToken,
}: {
  booking: BookingType;
  authToken: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "calendar";

  const [tempForm, setTempForm] = useState<z.infer<typeof formSchema>>();
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "Same Day",
      startDate: new Date(booking?.startTime ?? ``),
      startTime: booking?.startTime
        ? format(new Date(booking?.startTime ?? ``), "hh:mm a")
        : "12:00 PM",
      endDate: new Date(booking?.startTime ?? ``),
      endTime: booking?.startTime
        ? format(addHours(new Date(booking?.startTime ?? ``), 1), "hh:mm a")
        : "01:00 PM",
      netId: "",
      userName:
        booking.user?.role?.name === "Authenticated"
          ? `${booking.user.firstName} ${booking.user.lastName}`
          : "",
      useLocation: "Outside",
      bookingCreatorName:
        `${booking.bookingCreator?.firstName} ${booking.bookingCreator?.lastName}` ??
        "",
      notes: "",
    },
    mode: "onChange",
    values: tempForm,
  });

  const inventoryItems = booking.inventory_items as RetrievedItems;
  const [itemObjArr, setItemObjArr] = useState(inventoryItems?.data ?? Array());

  const [user, setUser] = useState<UserType>(booking.user ?? {});
  // const [netId, setNetId] = useState("");

  let localItemsObj = undefined;
  // let tempBookingObj = undefined;

  //Load local storage
  useEffect(() => {
    if (localStorage) {
      const tempBookingStr =
        localStorage.getItem(`tempNewBooking`) ?? undefined;
      if (tempBookingStr !== undefined) {
        const tempNewBooking = tempBookingStr
          ? JSON.parse(tempBookingStr)
          : undefined;
        // console.log(tempNewBooking.startDate);
        tempNewBooking.startDate = new Date(tempNewBooking.startDate);
        tempNewBooking.endDate = new Date(tempNewBooking.endDate);
        setTempForm(tempNewBooking);
        setUser(tempNewBooking.user);
        localStorage.removeItem(`tempNewBooking`);
      }

      const localItemsStr = localStorage.getItem(`tempNewBookingItems`) ?? "";
      if (localItemsStr !== "") {
        // console.log(localItemsStr);
        localItemsObj = localItemsStr ? JSON.parse(localItemsStr) : undefined;
        // setItemIdArray(localItemsObj.map((item: InventoryItem) => item.id));
        setItemObjArr(localItemsObj);
        localStorage.removeItem(`tempNewBookingItems`);
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

  function handleAddItem() {
    const tempBooking: BookingType = form.watch();

    tempBooking.inventory_items = itemObjArr;
    tempBooking.user = user;
    tempBooking.bookingCreator = booking.bookingCreator;

    localStorage.setItem(`tempNewBooking`, JSON.stringify(tempBooking));
    router.push(`/dashboard/booking/new/additem`);

    return;
  }

  const handleRemoveFromBooking = (row: InventoryItem) => {
    let newArr = itemObjArr.filter((item) => item.id !== row.id);
    setItemObjArr(newArr);
    // router.refresh();
    // console.log("item should be removed")
  };

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
      // console.log(url);
      return flattenAttributes(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error; // or return null;
    }
  }

  async function getUserByUsername(username: string) {
    const query = qs.stringify({
      sort: ["createdAt:desc"],
      filters: {
        $or: [{ username: { $eqi: username } }],
      },
    });
    const url = new URL("/api/users", baseUrl);
    url.search = query;
    // console.log("query data", url.href);
    return fetchData(url.href);
  }

  const handleGetUser = useDebouncedCallback((term: string) => {
    // console.log(term);
    if (term.length > 1) {
      getUserByUsername(term)
        // .then((res) => console.log(res))
        .then((data) => {
          // console.log(data);
          if (data.length !== 0) {
            setUser(data[0]);
            form.setValue(
              "userName",
              `${data[0].firstName} ${data[0].lastName}`,
            );
          } else {
            console.log(data);
            window.alert("User not found.");
            form.setValue("userName", "");
            form.setValue("netId", "");
          }
        });
    }

    // console.log(params.toString());
  }, 1000);

  async function itemConflictCheck(booking: BookingTypePost) {
    const inventoryItems = booking?.inventory_items as InventoryItem[];
    const itemList = inventoryItems.length > 0 ? [...inventoryItems] : [0];

    const query = qs.stringify({
      // sort: ["createdAt:desc"],
      populate: "*",
      filters: {
        $and: [
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
    const updatedStart = new Date(
      `${format(new Date(form.getValues("startDate")), "yyyy-MM-dd")}T${time12To24(form.getValues("startTime").toString())}`,
    ).toISOString();
    const updatedEnd = new Date(
      `${format(new Date(form.getValues("endDate")), "yyyy-MM-dd")}T${time12To24(form.getValues("endTime").toString())}`,
    ).toISOString();

    if (updatedStart >= updatedEnd) {
      window.alert("Save Failed: End Time should be larger than Start Time");
      return;
    }

    const formValue: BookingTypePost = {
      type: form.getValues("type"),
      startTime: updatedStart,
      endTime: updatedEnd,
      user: user?.id ?? 0,
      useLocation: form.getValues("useLocation") ?? "",
      bookingCreator: booking?.bookingCreator?.id ?? 0,
      notes: form.getValues("notes") ?? "",
      inventory_items: itemObjArr.map((item: InventoryItem) => item.id),
    };

    if (formValue.startTime >= formValue.endTime) {
      window.alert("End Date and Time can't be less than Start Date and Time.");
      return;
    }

    // console.log(formValue);
    itemConflictCheck(formValue).then(({ data, meta }) => {
      if (data.length !== 0) {
        window.alert("Item Conflict Found.");
        return;
      }
      if (formValue.useLocation === "Outside") {
        createBookingAction(formValue).then(() => {
          toast.success("Booking Created Successfully.");
          router.push(`/dashboard/booking?view=${view}`);
        });
      } else {
        locationConflictCheck(formValue).then(({ data, meta }) => {
          if (data.length !== 0) {
            window.alert("Location Conflict Found.");
            return;
          }
          createBookingAction(formValue).then(() => {
            toast.success("Booking Created Successfully.");
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
          // className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-4"
          className="w-screen shrink flex-col gap-2 space-y-1 px-2 md:grid md:max-w-lg md:grid-cols-4 md:px-0"
        >
          <div className="col-span-2 max-w-sm md:col-span-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="size-fit">
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleTypeSelect(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
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
          <div className="col-span-1 flex-col md:col-span-2">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem className="size-fit flex-1 md:size-full">
                  <FormLabel>User Name</FormLabel>
                  <FormControl>
                    {/* <Input
                      placeholder="Waiting for a NetID"
                      {...field}
                      disabled
                      // onChange={(e) => setUserId(e.target.value)}
                    ></Input> */}
                    <Label
                      {...field}
                      className="flex p-2 font-sans italic text-slate-400"
                    >
                      {field.value === "" ? "NetID needed" : field.value}
                    </Label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-1 flex-col md:col-span-2">
            {booking.user?.role?.name !== "Authenticated" ? (
              <FormField
                control={form.control}
                name="netId"
                render={({ field }) => (
                  <FormItem className="size-auto flex-1 md:size-full">
                    <FormLabel>NetID</FormLabel>
                    <FormControl
                      onChange={(e) =>
                        handleGetUser((e.target as HTMLInputElement).value)
                      }
                    >
                      <Input
                        placeholder="Type in a NetID Here"
                        {...field}
                        autoCapitalize="none"
                        // onChange={(e) => setUserId(e.target.value)}
                      ></Input>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              ``
            )}
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
                    // defaultValue={field.value}
                    value={field.value}
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
                          disabled={form.getValues("type") !== "Exception"}
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
                    " pl-2 text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  <FormLabel>End Time</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    // defaultValue={field.value}
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
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bookingLocationList.map((location, index) => (
                        <SelectItem
                          key={`${index}${location}`}
                          value={`${location}`}
                        >{`${location}`}</SelectItem>
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
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2"></div>

          <div className="col-span-2 flex justify-evenly md:col-span-4">
            <h1 className="flex-1 content-center text-center">Booking Items</h1>
            <Button
              className="flex-1 hover:bg-slate-200 active:bg-slate-300"
              type="button"
              onClick={(e) => handleAddItem()}
              variant="secondary"
            >
              Add Item
            </Button>
          </div>

          <div className="col-span-2 size-full justify-center gap-10 md:col-span-4">
            <BookingEmbededTable
              data={itemObjArr}
              columns={inventoryColumns}
              handleRemoveFromBooking={handleRemoveFromBooking}
              isPast={false}
            />
          </div>
          {/* <div className="col-span-1 grid grid-cols-subgrid gap-4"></div> */}

          {/* <Button className="align-right col-span-2" type="submit">
            Save
          </Button> */}
          <div className="col-span-2 flex gap-1 py-2 md:col-span-4">
            <SubmitButton
              className="flex-1"
              text="Save"
              loadingText="Saving Booking"
              loading={form.formState.isSubmitting}
            />

            <Button
              variant="secondary"
              className="flex-1 hover:bg-slate-200 active:bg-slate-300"
              type="button"
              onClick={(e) => {
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

export default NewBookingForm;
