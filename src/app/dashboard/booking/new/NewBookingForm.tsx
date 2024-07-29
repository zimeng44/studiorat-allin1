"use client";
import React, { useRef } from "react";
import qs from "qs";
import { cn } from "@/lib/utils";
import { getCookies, setCookie, deleteCookie, getCookie } from "cookies-next";
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
  createBookingAction,
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

// const getIdArray: number[] = (booking: CheckoutSessionType) => {
//   let IdArray: number[] = booking.inventory_items?.data.map(
//     (item: InventoryItem) => item.id,
//   );

//   return IdArray;
// };

const NewBookingForm = ({
  booking,
  authToken,
}: {
  booking: BookingType;
  authToken: string;
}) => {
  const router = useRouter();
  const [tempForm, setTempForm] = useState<z.infer<typeof formSchema>>();
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "Same Day",
      startDate: new Date(booking?.startTime??""),
      startTime: booking?.startTime
        ? format(new Date(booking.startTime), "hh:mm a")
        : "12:00 PM",
      endDate: new Date(booking?.startTime??""),
      endTime: booking?.startTime
        ? format(addHours(new Date(booking.startTime), 1), "hh:mm a")
        : "01:00 PM",
      netId: "",
      userName: "",
      useLocation: "Outside",
      bookingCreatorName:
        `${booking.bookingCreator?.firstName} ${booking.bookingCreator?.lastName}` ??
        "",
      notes: "",
    },
    mode: "onChange",
    values: tempForm,
  });

  // console.log(form.getValues("startTime"));
  // if (typeof window !== 'undefined') {}
  // const [itemIdArray, setItemIdArray] = useState(
  //   booking.inventory_items?.data.map((item: InventoryItem) => item.id) ??
  //     Array(),
  // );
  // const [tempBookingObj, setTempBookingObj] = useState(booking);
  const inventoryItems = booking.inventory_items as RetrievedItems;
  const [itemObjArr, setItemObjArr] = useState(
    inventoryItems.data ?? Array(),
  );
  
  const [user, setUser] = useState<UserType>();
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
    const tempBooking:BookingType = form.watch();

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

  async function getUserByUsername(username: string) {
    const query = qs.stringify({
      sort: ["createdAt:desc"],
      filters: {
        $or: [{ username: { $eqi: username } }],
      },
    });
    const url = new URL("/api/users", baseUrl);
    url.search = query;
    // console.log("query data", query)
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
    const inventoryItems = booking?.inventory_items as InventoryItem[]
    const itemList =
      inventoryItems.length > 0
        ? [...inventoryItems]
        : [0];

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
      useLocation: form.getValues("useLocation")??"",
      bookingCreator: booking?.bookingCreator?.id ?? 0,
      notes: form.getValues("notes") ?? "",
      inventory_items: itemObjArr.map((item: InventoryItem) => item.id),
    };

    // values.inventory_items = itemObjArr.map((item) => item.id);
    // values.user = user?.id;
    // values.bookingCreator = booking.bookingCreator.id;
    // values.startTime = updatedStart;
    // values.endTime = updatedEnd;

    // delete values.startDate;
    // delete values.endDate;
    // delete values.netId;
    // delete values.userName;
    // delete values.bookingCreatorName;

    // console.log(values);
    // delete values.bookingCreator;
    if (formValue.startTime >= formValue.endTime) {
      window.alert("End Date and Time can't be less than Start Date and Time.");
      return;
    }

    // console.log(formValue);
    itemConflictCheck(formValue).then(({ data, meta }) => {
      if (data.length !== 0) {
        window.alert("Item Conflict Found.");
      } else {
        locationConflictCheck(formValue).then(({ data, meta }) => {
          if (data.length !== 0) {
            window.alert("Location Conflict Found.");
          } else {
            createBookingAction(formValue).then(() =>
              toast.success("Booking Created Successfully."),
            );
            // router.refresh();
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
          <div className="col-span-4 flex">
            <FormField
              control={form.control}
              name="netId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NetID</FormLabel>
                  <FormControl onChange={(e) => handleGetUser((e.target as HTMLInputElement).value)}>
                    <Input
                      placeholder="Type in a NetID Here"
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
                      placeholder="Waiting for a NetID"
                      {...field}
                      disabled
                      // onChange={(e) => setUserId(e.target.value)}
                    ></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-4 flex">
            <div className="col-span-2 flex">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="w-[120px]">
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
                        "w-[125px] px-2",
                        " pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}>
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
                        "w-[125px] px-2",
                        " pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}>
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
            variant="secondary"
            className="hover:bg-slate-200 active:bg-slate-300"
            type="button"
            onClick={(e) => {
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

export default NewBookingForm;
