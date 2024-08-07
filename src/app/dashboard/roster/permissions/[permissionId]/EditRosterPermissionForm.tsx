"use client";
import React, { useState } from "react";
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RosterPermissionType } from "@/data/definitions";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { SubmitButton } from "@/components/custom/SubmitButton";
import { StrapiErrors } from "@/components/custom/StrapiErrors";
import {
  deleteRosterPermissionAction,
  updateRosterPermissionAction,
} from "@/data/actions/rosterPermission-actions";
import { TagsInput } from "react-tag-input-component";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

const INITIAL_STATE = {
  strapiErrors: null,
  data: null,
  message: null,
};

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  // mTechBarcode: z.string().min(12).and(z.string().max(13)),
  permissionCode: z.string().min(2),
  permissionTitle: z.string().optional(),
  instructor: z.string().optional(),
  permissionDetails: z.string().optional(),
  permittedStudios: z.string().array().optional(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

const EditRosterPermissionForm = ({
  permissionId,
  permission,
  userRole,
}: {
  permissionId: string;
  permission: RosterPermissionType;
  userRole: string;
}) => {
  // console.log("Item Details Render!!");
  const router = useRouter();
  const searchParams = useSearchParams();
  // const deleteSummaryById = deleteInventoryItemAction.bind(null, itemId);
  // const rosterPermissions =
  //   roster.roster_permissions as RetrievedRosterPermission;
  // const [itemObjArr, setItemObjArr] = useState(
  //   rosterPermissions?.data ?? Array(),
  // );
  // const [permittedStudios, setPermittedStudios] = useState(
  //   permission.permittedStudios ?? ["example"],
  // );

  // console.log(permission.permmitedStudios);

  const [error, setError] = useState(INITIAL_STATE);

  // const [deleteState, deleteAction] = useFormState(
  //   deleteSummaryById,
  //   INITIAL_STATE,
  // );

  // const [updateState, updateAction] = useFormState(
  //   updateInventoryItemAction,
  //   INITIAL_STATE,
  // );

  // const [data, setData] = useState(item);
  // const [currentRowId, setCurrentRowId] = useState(itemId);
  // const data = item;

  // console.log(itemId);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      permissionCode: permission.permissionCode ?? "",
      permissionTitle: permission.permissionTitle ?? "",
      instructor: permission.instructor ?? "",
      permissionDetails: permission.permissionDetails ?? "",
      permittedStudios: permission.permittedStudios ?? ["example"],
      startDate: permission.startDate ?? "",
      endDate: permission.endDate ?? "",
    },
  });
  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    // console.log(values);
    if (values.startDate === "") values.startDate = null;
    if (values.endDate === "") values.endDate = null;

    // values.permittedStudios = permittedStudios;

    try {
      const res = await updateRosterPermissionAction(values, permissionId);
      setError(res?.strapiErrors ?? null);
      if (!res?.strapiErrors?.status) {
        router.push("/dashboard/roster/permissions");
        toast.success("Roster Saved.");
      }
    } catch (error) {
      toast.error("Error Updating Checkout Session");
      // setError({
      //   ...INITIAL_STATE,
      //   message: "Error Creating Summary",
      //   name: "Summary Error",
      // });
      // setLoading(false);
      return;
    }

    // router.refresh();
    // console.log(res);

    // closeDetail();
    // console.log("Form Submitted!!");
    // setDialogOpen(false);
  }

  // const handleRemoveFromBooking = (row: RosterPermissionType) => {
  //   let newArr = itemObjArr.filter((item) => item.id !== row.id);
  //   setItemObjArr(newArr);
  //   // router.refresh();
  //   // console.log("item should be removed")
  // };

  async function handleDelete(e: any) {
    const confirm = window.confirm(
      "Are you sure you want to delete this roster record?",
    );

    if (!confirm) return;

    const res = await deleteRosterPermissionAction(permissionId);

    if (!res) toast.success("Roster Deleted");

    // if ((totalEntries - 1) % pageSize === 0) {
    //   setPageIndex((pageIndex) => pageIndex - 1);
    // }
    // console.log("Item Deleted!!!!!!!!!!!!!");
    // closeDetail();
  }

  return (
    <div>
      <StrapiErrors error={error} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-screen shrink flex-col justify-start gap-2 space-y-1 px-2 md:grid md:grid-cols-2 md:px-0"
        >
          <div className="gap-2 space-y-1 px-2 md:grid md:max-w-[600px] md:grid-cols-2">
            <FormField
              control={form.control}
              name="permissionCode"
              render={({ field }) => (
                <FormItem className="col-span-1 size-fit md:col-span-2">
                  <FormLabel>Permission Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"Permission Code"}
                      {...field}
                      disabled={userRole !== "Admin"}
                    ></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissionTitle"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={userRole !== "Admin"}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instructor"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Instructor</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={userRole !== "Admin"}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="col-span-1">
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
                          disabled={userRole !== "Admin"}
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
                        selected={
                          field.value ? new Date(field?.value) : undefined
                        }
                        onSelect={(value: Date | undefined) => {
                          field.onChange(value ? value.toISOString() : "");
                        }}
                        disabled={(date) => date < new Date()}
                        // initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="col-span-1">
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
                          disabled={userRole !== "Admin"}
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
                        selected={
                          field.value ? new Date(field?.value) : undefined
                        }
                        onSelect={(value) => {
                          field.onChange(value ? value.toISOString() : "");
                          // handleStartDateSelect(value);
                        }}
                        disabled={(date) => date < new Date()}
                        // initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permittedStudios"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Permitted Studios</FormLabel>
                  <FormControl>
                    <TagsInput
                      value={field.value}
                      onChange={(value) => form.setValue(field.name, value)}
                      name="permittedStudios"
                      placeHolder="Enter a studio"
                      disabled={userRole !== "Admin"}
                    />
                  </FormControl>
                  <FormMessage className="text-slate-400">
                    press enter or comma to add new studio
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissionDetails"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Details</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-32 whitespace-normal"
                      placeholder="Leave a note"
                      disabled={userRole !== "Admin"}
                    ></Textarea>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <div className="col-span-1"></div> */}
          </div>

          {/* <div className="col-span-1 flex size-full max-w-2xl justify-start gap-2 md:col-span-2 ">
            <RosterEmbededTable
              data={itemObjArr}
              columns={rosterPermissionsColumns}
              handleRemoveFromBooking={handleRemoveFromBooking}
              isPast={true}
            />
          </div> */}

          {/* <Button className="align-right" type="submit">
            Save
          </Button> */}

          <div className="col-span-1 flex size-fit max-w-xl gap-1 md:col-span-2">
            {userRole === "Admin" ? (
              <SubmitButton
                className="flex-1"
                text="Save"
                loadingText="Saving"
                loading={form.formState.isSubmitting}
              />
            ) : (
              ``
            )}

            {userRole === "Admin" ? (
              <Button
                className="flex-1"
                type="button"
                variant="destructive"
                onClick={(e) => handleDelete(e)}
              >
                Delete
              </Button>
            ) : (
              ``
            )}

            <Button
              className="flex-1 hover:bg-slate-200 active:bg-slate-300"
              type="button"
              variant="secondary"
              onClick={(e) => {
                // const params = new URLSearchParams(searchParams);
                router.push(
                  `/dashboard/roster/permissions?${searchParams.toString()}`,
                );
              }}
            >
              {userRole === "Admin" ? "Cancel" : "Close"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditRosterPermissionForm;
