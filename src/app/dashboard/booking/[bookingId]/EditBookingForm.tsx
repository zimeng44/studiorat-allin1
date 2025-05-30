"use client";
import React from "react";
import { cn } from "@/lib/utils";
import {
  InventoryItem,
  bookingTimeList,
  bookingLocationList,
  bookingTypeList,
  InventoryItemWithImage,
} from "@/data/definitions";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format, addDays, nextMonday, nextFriday, isFriday } from "date-fns";
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
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { bookingInventoryCartColumns } from "@/app/dashboard/booking/inventoryCartColumns";
// import BookingEmbededTable from "../BookingEmbededTable";
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
import { SubmitButton } from "@/components/custom/SubmitButton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { inventory_items } from "@prisma/client";
import { BookingWithUserAndItems, UserWithRole } from "@/data/definitions";
import { Badge } from "@/components/ui/badge";
import InventoryItemCart from "@/components/custom/InventoryItemCart";

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  start_date: z.date(),
  startTime: z.string(),
  end_date: z.date(),
  endTime: z.string(),
  netId: z
    .string()
    .min(2, {
      message: "Type in a NetID to retrieve the user name",
    })
    .optional(),
  userName: z.string().min(2, {
    message: "Type in a NetID to retrieve the user name",
  }),
  use_location: z.string().min(1, {
    message: "Location can't be blank",
  }),
  type: z.string(),
  bookingCreatorName: z.string().min(1),
  notes: z.string().optional(),
  scan: z.string(),
  // inventory_items: z.array(z.number()).optional(),
  // studio_user: z.string().optional(),
});

const EditBookingForm = ({
  booking,
  bookingId,
  currentUser,
  authToken,
}: {
  booking: BookingWithUserAndItems;
  bookingId: string;
  currentUser?: UserWithRole | null;
  authToken: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const pathname = usePathname();
  const view = searchParams.get("view") ?? "calendar";
  const isPast = new Date() >= (booking?.start_time ?? new Date());
  const [error, setError] = useState("");

  const [tempForm, setTempForm] = useState<z.infer<typeof formSchema>>({
    start_date: booking.start_time ? new Date(booking.start_time) : new Date(),
    startTime: booking.start_time
      ? format(new Date(booking.start_time), "hh:mm a")
      : "",
    end_date: booking.end_time ? new Date(booking.end_time) : new Date(),
    endTime: booking.end_time
      ? format(new Date(booking.end_time), "hh:mm a")
      : "",
    userName: `${booking.user?.first_name} ${booking.user?.last_name}`,
    use_location: booking.use_location ?? "",
    type: booking.type ?? "",
    bookingCreatorName:
      `${booking.created_by?.first_name} ${booking.created_by?.last_name}`,
    notes: booking.notes ?? "",
    scan: "",
  });
  const [itemObjArr, setItemObjArr] = useState<InventoryItemWithImage[]>(
    booking.inventory_items ?? Array(),
  );
  const [bookingType, setBookingType] = useState(booking.type);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // defaultValues: ,
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

        tempBooking.start_date = new Date(tempBooking.start_date);
        tempBooking.end_date = new Date(tempBooking.end_date);
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
      form.setValue("end_date", addDays(form.getValues("start_date"), 1));
      form.setValue("endTime", "12:00 PM");
      // console.log("End Time is ", form.getValues("endTime"));
    }
    if (value === "Weekend") {
      form.setValue("start_date", nextFriday(new Date()));
      form.setValue("end_date", nextMonday(form.getValues("start_date")));
      form.setValue("endTime", "12:00 PM");
      // form.setValue("end_date", form.getValues("start_date"));
    }
    setBookingType(value);
    // console.log(form.getValues("type"));
  }

  function handleStartDateSelect(value: Date) {
    // window.alert(value);
    if (form.getValues("type") === "Same Day") {
      form.setValue("end_date", new Date(value));
      form.setValue("endTime", form.getValues("startTime"));
    }
    if (form.getValues("type") === "Overnight") {
      form.setValue("end_date", addDays(form.getValues("start_date"), 1));
      form.setValue("endTime", "12:00 PM");
    }
    if (form.getValues("type") === "Weekend") {
      if (!isFriday(new Date(value))) {
        window.alert("Weekend booking has to start on Fridays");
        form.setValue("start_date", nextFriday(new Date()));
        form.setValue("end_date", nextMonday(form.getValues("start_date")));
        form.setValue("endTime", "12:00 PM");
      } else {
        form.setValue("end_date", nextMonday(form.getValues("start_date")));
        form.setValue("endTime", "12:00 PM");
      }
    }
  }

  function handleAddItem() {
    const tempBooking = {
      ...form.getValues(),
      inventory_items: itemObjArr,
      user: booking.user,
      created_by: booking.created_by,
    };

    localStorage.setItem(
      `tempBooking${bookingId}`,
      JSON.stringify(tempBooking),
    );
    router.push(
      `/dashboard/booking/additem?bookingId=${bookingId}&view=${view}`,
    );

    // console.log(tempBooking);
    return;
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

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // setItemIdArray(itemObjArr.map((item) => item.id));
    const updateValues = {
      // ...values,
      type: form.getValues("type"),
      start_time: new Date(
        `${format(new Date(form.getValues("start_date")), "yyyy-MM-dd")}T${time12To24(form.getValues("startTime").toString())}`,
      ),
      end_time: new Date(
        `${format(new Date(form.getValues("end_date")), "yyyy-MM-dd")}T${time12To24(form.getValues("endTime").toString())}`,
      ),
      use_location: form.getValues("use_location"),
      notes: form.getValues("notes") ?? null,
      inventory_items:
        itemObjArr.length > 0
          ? {
              set: itemObjArr.map((item: inventory_items) => ({ id: item.id })),
            }
          : {
              set: [],
            },
    };

    if (updateValues.start_time >= updateValues.end_time) {
      window.alert("End Date and Time can't be less than Start Date and Time.");
      return;
    }

    const res = await updateBookingAction(updateValues, parseInt(bookingId));

    if (res.error) setError(res.error);
    else {
      toast.success("Booking Updated");
      setError("");
      router.push("/dashboard/booking");
      router.refresh();
    }
  }

  return (
    <div>
      {isPast ? (
        <Badge className="size-fit" variant="secondary">
          Archived
        </Badge>
      ) : (
        ``
        // <Badge className="size-fit" variant="default">
        //   Ongoing
        // </Badge>
      )}
      {error ? <p className="text-red-500">{error}</p> : ``}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-screen shrink flex-col gap-2 space-y-1 px-4 md:grid md:max-w-lg md:grid-cols-4 md:px-0 xl:max-w-screen-lg xl:grid-cols-8 xl:flex-row"
        >
          <div className="flex-1 gap-2 md:col-span-4 md:grid md:max-w-xl md:grid-cols-4 md:px-0 ">
            <div className="col-span-1 flex md:col-span-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="size-fit">
                    <FormLabel>Type</FormLabel>
                    <Select
                      key={field.value || "default-key"}
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
                      key={field.value || "default-key"}
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
                            date < new Date(form.getValues("start_date"))
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
                      key={field.value || "default-key"}
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
                name="use_location"
                render={({ field }) => (
                  <FormItem className="col-span-1 flex size-full flex-col text-left font-normal md:col-span-2 md:size-full">
                    <FormLabel>Use Location</FormLabel>
                    <Select
                      key={field.value || "default-key"}
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
          </div>

          <div className="flex-col gap-2 md:col-span-4">
            <div className="col-span-2 flex justify-evenly p-1 md:col-span-4">
              <h1 className="flex-1 content-center text-center">
                Booking Items
              </h1>
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
              {/* <BookingEmbededTable
                data={itemObjArr}
                columns={inventoryColumns}
                handleRemoveFromBooking={handleRemoveFromBooking}
                isPast={isPast}
              /> */}
              <InventoryItemCart
                data={itemObjArr}
                columnsMeta={bookingInventoryCartColumns}
                setItemObjArr={setItemObjArr}
                disabled={isPast}
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
              className={`flex-1 hover:bg-red-300 active:bg-red-400 ${isPast && currentUser?.user_role?.name !== "Admin" ? "invisible" : ""}`}
              type="button"
              onClick={async (e) => {
                const confirm = window.confirm(
                  "Are you sure you want to delete this booking?",
                );
                if (!confirm) return;
                const { res, error } = await deleteBookingAction(bookingId);
                if (res) {
                  toast.success("Booking Deleted");
                  router.push(`/dashboard/booking?view=${view}`);
                  router.refresh();
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
                // const params = new URLSearchParams(searchParams);
                // params.set("view", view);
                router.push(`/dashboard/booking?${searchParams.toString()}`);
                // router.push(`/dashboard/booking?view=${view}`);
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
