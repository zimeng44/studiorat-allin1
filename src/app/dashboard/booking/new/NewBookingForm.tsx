"use client";
import React from "react";
import qs from "qs";
import { cn } from "@/lib/utils";
import {
  InventoryItem,
  bookingTimeList,
  bookingLocationList,
  bookingTypeList,
  UserWithRole,
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
import { inventoryColumns } from "@/app/dashboard/booking/bookingInventoryColumns";
import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";
import BookingEmbededTable from "../BookingEmbededTable";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { createBookingAction } from "@/data/actions/booking-actions";
import { SubmitButton } from "@/components/custom/SubmitButton";
import { Textarea } from "@/components/ui/textarea";
import { inventory_items } from "@prisma/client";
import { InputWithLoading } from "@/components/custom/InputWithLoading";

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  type: z.string(),
  start_date: z.date().nullable(),
  start_time: z.string().min(4),
  end_date: z.date().nullable(),
  end_time: z.string().min(4),
  // user: z.string().min(2),
  netId: z.string().optional(),
  userName: z.string().min(2, {
    message: "Type in a NetID to retrieve the user name",
  }),
  use_location: z.enum([
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
  notes: z.string().nullable(),
});

// type BookingWithUserAndItems = Prisma.bookingsGetPayload<{
//   include: {
//     user: { include: { user_role: true } };
//     created_by: true;
//     inventory_items: true;
//     // user_role: true;
//   };
// }>;
// type UserWithRole = Prisma.UserGetPayload<{
//   include: { user_role: true };
// }>;

const NewBookingForm = ({
  booking,
  currentUser,
  authToken,
}: {
  booking: any;
  currentUser: UserWithRole | null;
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
      start_date: booking?.start_time ?? new Date(),
      start_time: booking?.start_time
        ? format(booking?.start_time ?? ``, "hh:mm a")
        : "12:00 PM",
      end_date: booking?.start_time ?? new Date(),
      end_time: booking?.start_time
        ? format(addHours(booking?.start_time ?? ``, 1), "hh:mm a")
        : "01:00 PM",
      netId: "",
      userName:
        booking.user?.user_role?.name === "Authenticated"
          ? `${booking.user.first_name} ${booking.user.last_name}`
          : "",
      use_location: "Outside",
      bookingCreatorName:
        `${booking.created_by?.first_name} ${booking.created_by?.last_name}` ??
        "",
      notes: "",
    },
    mode: "onChange",
    values: tempForm,
  });

  // const inventoryItems = booking.inventory_items as RetrievedItems;
  const [itemObjArr, setItemObjArr] = useState(Array());
  const [user, setUser] = useState<UserWithRole | null>(booking.user);
  const [bookingType, setBookingType] = useState(booking.type);
  const [error, setError] = useState("");
  const [userLoading, setUserLoading] = useState(false);

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
        // console.log(tempNewBooking.start_date);
        tempNewBooking.start_date = new Date(tempNewBooking.start_date);
        tempNewBooking.end_date = new Date(tempNewBooking.end_date);
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
    if (value === "Exception" && currentUser?.user_role?.name !== "Admin") {
      window.alert(
        "Admin approval required, please contact admin to make exceptions.",
      );
      form.setValue("type", bookingType ?? "Same Day");
    }
    if (value === "Same Day") {
      form.setValue("end_date", form.getValues("start_date"));
    }
    if (value === "Overnight") {
      form.setValue(
        "end_date",
        addDays(form.getValues("start_date") as Date, 1),
      );
      form.setValue("end_time", "12:00 PM");
      // console.log("End Time is ", form.getValues("end_time"));
    }
    if (value === "Weekend") {
      form.setValue("start_date", nextFriday(new Date()));
      form.setValue(
        "end_date",
        nextMonday(form.getValues("start_date") as Date),
      );
      form.setValue("end_time", "12:00 PM");
      // form.setValue("end_date", form.getValues("start_date"));
    }
    setBookingType(value);
  }

  function handleStartDateSelect(value: Date) {
    // window.alert(value);
    if (form.getValues("type") === "Same Day") {
      form.setValue("end_date", new Date(value));
      form.setValue("end_time", form.getValues("start_time"));
    }
    if (form.getValues("type") === "Overnight") {
      form.setValue(
        "end_date",
        addDays(form.getValues("start_date") as Date, 1),
      );
      form.setValue("end_time", "12:00 PM");
    }
    if (form.getValues("type") === "Weekend") {
      if (!isFriday(new Date(value))) {
        window.alert("Weekend booking has to start on Fridays");
        form.setValue("start_date", nextFriday(new Date()));
        form.setValue(
          "end_date",
          nextMonday(form.getValues("start_date") as Date),
        );
        form.setValue("end_time", "12:00 PM");
      } else {
        form.setValue(
          "end_date",
          nextMonday(form.getValues("start_date") as Date),
        );
        form.setValue("end_time", "12:00 PM");
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
    let tempBooking: any = { ...form.watch() };

    tempBooking.inventory_items = itemObjArr;
    tempBooking.user = user;
    tempBooking.created_by = booking.created_by;

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
    // const query = qs.stringify({
    //   sort: ["createdAt:desc"],
    //   filters: {
    //     $or: [{ username: { $eqi: username } }],
    //   },
    // });
    const query = qs.stringify({
      // sort: ["createdAt:desc"],
      // where: {
      net_id: username,
      // },
    });
    const url = new URL("/api/users", baseUrl);
    url.search = query;
    // console.log("query data", url.href);

    return fetchData(url.href);
  }

  const handleGetUser = useDebouncedCallback((term: string) => {
    // console.log(term);
    setUserLoading(true);
    if (term.length > 1) {
      getUserByUsername(term)
        // .then((res) => console.log(res))
        .then(({ data }) => {
          // console.log(data);
          if (data.length !== 0) {
            setUser(data[0]);
            form.setValue(
              "userName",
              `${data[0].first_name} ${data[0].last_name}`,
            );
          } else {
            // console.log(data);
            window.alert("User not found.");
            form.setValue("userName", "");
            form.setValue("netId", "");
          }
        });
    }
    setUserLoading(false);
    // console.log(params.toString());
  }, 1000);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const updatedStart = new Date(
      `${format(form.getValues("start_date") as Date, "yyyy-MM-dd")}T${time12To24(form.getValues("start_time").toString())}`,
    );
    const updatedEnd = new Date(
      `${format(form.getValues("end_date") as Date, "yyyy-MM-dd")}T${time12To24(form.getValues("end_time").toString())}`,
    );

    if (updatedStart >= updatedEnd) {
      window.alert("Save Failed: End Time should be larger than Start Time");
      return;
    }

    if (updatedStart >= updatedEnd) {
      window.alert("End Date and Time can't be less than Start Date and Time.");
      return;
    }
    // console.log("here");

    const createValues = {
      type: form.getValues("type"),
      start_time: updatedStart,
      end_time: updatedEnd,
      use_location: form.getValues("use_location") ?? "",
      notes: form.getValues("notes") ?? "",
      user: {
        connect: { id: user?.id },
      },
      created_by: {
        connect: { id: currentUser?.id },
      },
      inventory_items:
        itemObjArr.length > 0
          ? {
              connect: itemObjArr.map((item: inventory_items) => ({
                id: item.id,
              })),
            }
          : undefined,
    };

    const { res, error } = await createBookingAction(createValues);

    // console.log(res);
    if (error) setError(error);

    if (!error) {
      toast.success("New Booking Added Successfully");
      setError("");
      router.push("/dashboard/booking");
      router.refresh();
    }

    // console.log(createValues);
  }

  return (
    <div>
      {error ? <p className="text-red-500">{error}</p> : ``}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          // className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-4"
          className="w-screen shrink flex-col gap-2 space-y-1 px-4 md:grid md:max-w-lg md:grid-cols-4 md:px-0 xl:max-w-screen-lg xl:grid-cols-8 xl:flex-row"
        >
          <div className="flex-1 gap-2 md:col-span-4 md:grid md:max-w-xl md:grid-cols-4 md:px-0 xl:col-span-4">
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
                      {/* <Label
                      {...field}
                      className="flex p-2 font-sans italic text-slate-400"
                    >
                      {field.value === "" ? "NetID needed" : field.value}
                    </Label> */}
                      <InputWithLoading
                        placeholder="Type in a NetID"
                        field={field}
                        isLoading={userLoading}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-1 flex-col md:col-span-2">
              {booking.user?.user_role?.name !== "Authenticated" ? (
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
                name="start_date"
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
                          selected={field.value ?? undefined}
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
                name="start_time"
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
                name="end_date"
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
                          selected={field.value ?? undefined}
                          onSelect={field.onChange}
                          // onSelect={(day) => console.log("Calendar output is ", `${day?.toLocaleDateString()}`)}
                          disabled={(date) =>
                            date < new Date(form.getValues("start_date") ?? "")
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
                name="end_time"
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

            <div className="col-span-2 flex size-auto flex-1 flex-row justify-start gap-2 md:col-span-4">
              <FormField
                control={form.control}
                name="use_location"
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
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-1 flex size-full flex-col text-left font-normal md:col-span-2 md:size-full">
                    <FormLabel className="align-bottom">Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        value={field.value ?? ""}
                        // {...field}
                        placeholder="Leave a note"
                      ></Textarea>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2"></div>
          </div>
          <div className="flex-col gap-2 md:col-span-4 xl:col-span-4">
            <div className="col-span-2 flex flex-1 justify-evenly md:col-span-4">
              <h1 className="flex-1 content-center text-center">
                Booking Items
              </h1>
              <Button
                className="flex-1 hover:bg-slate-200 active:bg-slate-300"
                type="button"
                onClick={(e) => handleAddItem()}
                variant="secondary"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
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
          </div>
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
