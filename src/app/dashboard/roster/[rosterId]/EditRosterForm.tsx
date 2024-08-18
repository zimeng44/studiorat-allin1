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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteRosterAction,
  updateRosterAction,
} from "@/data/actions/roster-actions";
import {
  RetrievedRosterPermission,
  RosterPermissionType,
  RosterRecordType,
  RosterWithPermission,
} from "@/data/definitions";
import Link from "next/link";
import { toast } from "sonner";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { SubmitButton } from "@/components/custom/SubmitButton";
import RosterEmbededTable from "../RosterEmbededTable";
import { rosterPermissionsColumnsInEditRoster } from "../permissions/rosterPermissionsColumns";
import { Switch } from "@/components/ui/switch";
import { StrapiErrors } from "@/components/custom/StrapiErrors";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { roster_permissions } from "@prisma/client";
// import { flattenAttributes, getStrapiURL } from "@/lib/utils";
// import qs from "qs";

const INITIAL_STATE = {
  strapiErrors: null,
  data: null,
  message: null,
};

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  // mTechBarcode: z.string().min(12).and(z.string().max(13)),
  stu_n: z.string().min(2),
  net_id: z.string().min(2),
  stu_name: z.string(),
  academic_level: z.string(),
  academic_program: z.string(),
  agreement: z.boolean(),
  excused_abs: z.number(),
  excused_late: z.number(),
  unexcused_abs: z.number(),
  unexcused_late: z.number(),
  late_return: z.number(),
  roster_permissions: z.number().optional().array().optional(),
});

const EditRosterForm = ({
  rosterId,
  roster,
  permissions,
  userRole,
}: {
  rosterId: string;
  roster: RosterWithPermission;
  permissions: roster_permissions[];
  userRole: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // const rosterPermissions =
  //   roster.permissions as RetrievedRosterPermission;
  const [itemObjArr, setItemObjArr] = useState(roster.permissions ?? Array());
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(INITIAL_STATE);

  // console.log(itemId);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stu_n: roster.stu_n ?? undefined,
      net_id: roster.net_id ?? undefined,
      stu_name: roster.stu_name ?? undefined,
      academic_level: roster.academic_level ?? undefined,
      academic_program: roster.academic_program ?? undefined,
      agreement: roster.agreement ?? false,
      excused_abs: roster.excused_abs ?? 0,
      excused_late: roster.excused_late ?? 0,
      unexcused_abs: roster.unexcused_abs ?? 0,
      unexcused_late: roster.unexcused_late ?? 0,
      late_return: roster.late_return ?? 0,
    },
  });
  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;
  // const baseUrl = getStrapiURL();

  // async function fetchData(url: string) {
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

  // async function getPermissionByCouseN(permission_code: string) {
  //   const query = qs.stringify({
  //     sort: ["createdAt:desc"],
  //     filters: {
  //       $or: [{ permission_code: { $eqi: permission_code } }],
  //     },
  //   });
  //   const url = new URL("/api/roster-permissions", baseUrl);
  //   url.search = query;
  //   // console.log("query data", query)
  //   return fetchData(url.href);
  // }

  // async function handleGetPermission(permission_code: string) {
  //   const res = await getPermissionByCouseN(permission_code);
  //   if (res.length > 0) {
  //     if (!itemObjArr.map((item) => item.id).includes(res[0].id)) {
  //       const newArr = [...itemObjArr, res[0]];
  //       setItemObjArr(newArr);
  //     } else {
  //       window.alert("Permission is already in the list, no need to re-add");
  //     }
  //   } else {
  //     window.alert("Permission not found.");
  //   }
  // }
  // console.log("Form Errors:", form.formState.errors);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    // if (values.roster_permissions?.length) {
    //   values.roster_permissions = {
    //     set: itemObjArr.map((item) => ({ id: item.id })),
    //   };
    // }

    const updateValues = {
      ...values,
      permissions: {
        set: itemObjArr.map((item) => ({ id: item.id })),
      },
    };

    // if (itemObjArr.length > 0)
    //   formValue.inventory_items = {
    //     set: itemObjArr.map((item: inventory_items) => ({ id: item.id })),
    //   };

    try {
      const { res, error } = await updateRosterAction(updateValues, rosterId);
      // setError(res?.strapiErrors ?? null);
      if (!error) {
        router.push("/dashboard/roster");
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
  }

  const handleRemoveFromBooking = (row: RosterPermissionType) => {
    let newArr = itemObjArr.filter((item) => item.id !== row.id);
    setItemObjArr(newArr);
    // router.refresh();
    // console.log("item should be removed")
  };

  async function handleDelete(e: any) {
    const confirm = window.confirm(
      "Are you sure you want to delete this roster record?",
    );

    if (!confirm) return;

    const { res, error } = await deleteRosterAction(rosterId);

    if (res) {
      toast.success("Roster Deleted");
      router.push("/dashboard/roster");
    }
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
              name="stu_n"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Student Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"Student Number"}
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
              name="net_id"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>NetID</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={userRole !== "Admin"}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stu_name"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Student Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={userRole !== "Admin"}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="academic_level"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Level</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={userRole !== "Admin"}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="academic_program"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Program</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={userRole !== "Admin"}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agreement"
              render={({ field }) => (
                <FormItem className="col-span-1 flex-col">
                  <FormLabel className="size-fit">Agreement</FormLabel>
                  <FormControl>
                    <div className="h-10 content-center items-center">
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          form.setValue("agreement", checked)
                        }
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-1 flex gap-1">
              <FormField
                control={form.control}
                name="excused_abs"
                render={({ field }) => (
                  <FormItem className="size-fit min-w-32 flex-1">
                    <FormLabel>Excused Absence</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) =>
                          form.setValue("excused_abs", parseInt(e.target.value))
                        }
                        type="number"
                      ></Input>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="excused_late"
                render={({ field }) => (
                  <FormItem className="size-fit min-w-24 flex-1">
                    <FormLabel>Excused Late</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) =>
                          form.setValue(
                            "excused_late",
                            parseInt(e.target.value),
                          )
                        }
                        type="number"
                      ></Input>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-1 flex gap-1">
              <FormField
                control={form.control}
                name="unexcused_abs"
                render={({ field }) => (
                  <FormItem className="size-fit min-w-36 flex-1">
                    <FormLabel>Unexcused Absence</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) =>
                          form.setValue(
                            "unexcused_abs",
                            parseInt(e.target.value),
                          )
                        }
                        type="number"
                      ></Input>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unexcused_late"
                render={({ field }) => (
                  <FormItem className="size-fit min-w-28 flex-1">
                    <FormLabel>Unexcused Late</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) =>
                          form.setValue(
                            "unexcused_late",
                            parseInt(e.target.value),
                          )
                        }
                        type="number"
                      ></Input>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* <div className="col-span-1"></div> */}
            <div className="col-span-1">
              {userRole === "Admin" ? (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="min-w-[150px] justify-start"
                      disabled={userRole !== "Admin"}
                    >
                      + Add a new permission
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Filter permissions..." />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                          {permissions.map((permission) => (
                            <CommandItem
                              key={permission.permission_code}
                              value={permission.permission_code ?? undefined}
                              onSelect={(value) => {
                                // console.log(value);
                                if (
                                  !itemObjArr
                                    .map((item) => item.permission_code)
                                    .includes(value)
                                ) {
                                  const newItem = permissions.filter(
                                    (perm) => perm.permission_code === value,
                                  );
                                  const newArr = [...itemObjArr, ...newItem];
                                  setItemObjArr(newArr);
                                  setOpen(false);
                                } else {
                                  window.alert("Permission Added Already");
                                }
                              }}
                            >
                              {`${permission.permission_code}`}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              ) : (
                ``
              )}
            </div>
          </div>

          <div className="col-span-1 flex size-full max-w-2xl justify-start gap-2 md:col-span-2 ">
            <RosterEmbededTable
              data={itemObjArr}
              columns={rosterPermissionsColumnsInEditRoster}
              handleRemoveFromBooking={handleRemoveFromBooking}
              isEditable={userRole === "Admin"}
            />
          </div>

          {/* <Button className="align-right" type="submit">
            Save
          </Button> */}

          <div className="col-span-1 flex size-full max-w-xl gap-1 md:col-span-2">
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
              className="size-fit flex-1 hover:bg-slate-200 active:bg-slate-300"
              type="button"
              variant="secondary"
              onClick={(e) => {
                // const params = new URLSearchParams(searchParams);
                router.push(`/dashboard/roster?${searchParams.toString()}`);
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

export default EditRosterForm;
