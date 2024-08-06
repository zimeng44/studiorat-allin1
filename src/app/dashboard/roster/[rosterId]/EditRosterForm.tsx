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
} from "@/data/definitions";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import { flattenAttributes, getStrapiURL } from "@/lib/utils";
import qs from "qs";

const INITIAL_STATE = {
  strapiErrors: null,
  data: null,
  message: null,
};

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  // mTechBarcode: z.string().min(12).and(z.string().max(13)),
  stuN: z.string().min(2),
  netId: z.string().min(2),
  stuName: z.string(),
  academicLevel: z.string(),
  academicProgram: z.string(),
  agreement: z.boolean(),
  excusedAbs: z.number(),
  excusedLate: z.number(),
  unexcusedAbs: z.number(),
  unexcusedLate: z.number(),
  lateReturn: z.number(),
  roster_permissions: z.number().optional().array(),
});

// type Status = {
//   value: string;
//   label: string;
// };

// const statuses: Status[] = [
//   {
//     value: "backlog",
//     label: "Backlog",
//   },
//   {
//     value: "todo",
//     label: "Todo",
//   },
//   {
//     value: "in progress",
//     label: "In Progress",
//   },
//   {
//     value: "done",
//     label: "Done",
//   },
//   {
//     value: "canceled",
//     label: "Canceled",
//   },
// ];

// function StatusList({
//   setOpen,
//   setSelectedStatus,
// }: {
//   setOpen: (open: boolean) => void;
//   setSelectedStatus: (status: Status | null) => void;
// }) {
//   return (
//     <Command>
//       <CommandInput placeholder="Filter status..." />
//       <CommandList>
//         <CommandEmpty>No results found.</CommandEmpty>
//         <CommandGroup>
//           {statuses.map((status) => (
//             <CommandItem
//               key={status.value}
//               value={status.value}
//               onSelect={(value) => {
//                 setSelectedStatus(
//                   statuses.find((priority) => priority.value === value) || null,
//                 );
//                 setOpen(false);
//               }}
//             >
//               {status.label}
//             </CommandItem>
//           ))}
//         </CommandGroup>
//       </CommandList>
//     </Command>
//   );
// }

const EditRosterForm = ({
  rosterId,
  roster,
  authToken,
  permissions,
}: {
  rosterId: string;
  roster: RosterRecordType;
  authToken: string;
  permissions: RosterPermissionType[];
}) => {
  // console.log("Item Details Render!!");
  const router = useRouter();
  // const deleteSummaryById = deleteInventoryItemAction.bind(null, itemId);
  const rosterPermissions =
    roster.roster_permissions as RetrievedRosterPermission;
  const [itemObjArr, setItemObjArr] = useState(
    rosterPermissions?.data ?? Array(),
  );

  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);

  const [error, setError] = useState(INITIAL_STATE);

  // console.log(itemId);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stuN: roster.stuN,
      netId: roster.netId,
      stuName: roster.stuName,
      academicLevel: roster.academicLevel,
      academicProgram: roster.academicProgram,
      agreement: roster.agreement ?? false,
      excusedAbs: roster.excusedAbs ?? 0,
      excusedLate: roster.excusedLate ?? 0,
      unexcusedAbs: roster.unexcusedAbs ?? 0,
      unexcusedLate: roster.unexcusedLate ?? 0,
      lateReturn: roster.lateReturn ?? 0,
    },
  });
  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;
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
      // console.log(data);
      return flattenAttributes(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error; // or return null;
    }
  }

  async function getPermissionByCouseN(courseN: string) {
    const query = qs.stringify({
      sort: ["createdAt:desc"],
      filters: {
        $or: [{ courseN: { $eqi: courseN } }],
      },
    });
    const url = new URL("/api/roster-permissions", baseUrl);
    url.search = query;
    // console.log("query data", query)
    return fetchData(url.href);
  }

  async function handleGetPermission(courseN: string) {
    const res = await getPermissionByCouseN(courseN);
    if (res.length > 0) {
      if (!itemObjArr.map((item) => item.id).includes(res[0].id)) {
        const newArr = [...itemObjArr, res[0]];
        setItemObjArr(newArr);
      } else {
        window.alert("Permission is already in the list, no need to re-add");
      }
    } else {
      window.alert("Permission not found.");
    }
  }

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    // console.log(values);
    values.roster_permissions = itemObjArr.map((item) => item.id);

    try {
      const res = await updateRosterAction(values, rosterId);
      setError(res?.strapiErrors ?? null);
      if (!res?.strapiErrors?.status) {
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

    // router.refresh();
    // console.log(res);

    // closeDetail();
    // console.log("Form Submitted!!");
    // setDialogOpen(false);
  }

  const handleRemoveFromBooking = (row: RosterPermissionType) => {
    let newArr = itemObjArr.filter((item) => item.id !== row.id);
    setItemObjArr(newArr);
    // router.refresh();
    // console.log("item should be removed")
  };

  function handleDelete(e: any) {
    const confirm = window.confirm(
      "Are you sure you want to delete this roster record?",
    );

    if (!confirm) return;

    const res = deleteRosterAction(rosterId);

    if (!res) toast.success("Roster Deleted");

    // if ((totalEntries - 1) % pageSize === 0) {
    //   setPageIndex((pageIndex) => pageIndex - 1);
    // }
    // console.log("Item Deleted!!!!!!!!!!!!!");
    // closeDetail();
  }

  // console.log(permissions);

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
              name="stuN"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Student Number</FormLabel>
                  <FormControl>
                    <Input placeholder={"Student Number"} {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="netId"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>NetID</FormLabel>
                  <FormControl>
                    <Input {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stuName"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Student Name</FormLabel>
                  <FormControl>
                    <Input {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="academicLevel"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Level</FormLabel>
                  <FormControl>
                    <Input {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="academicProgram"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Program</FormLabel>
                  <FormControl>
                    <Input {...field}></Input>
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
                name="excusedAbs"
                render={({ field }) => (
                  <FormItem className="size-fit min-w-32 flex-1">
                    <FormLabel>Excused Absence</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) =>
                          form.setValue("excusedAbs", parseInt(e.target.value))
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
                name="excusedLate"
                render={({ field }) => (
                  <FormItem className="size-fit min-w-24 flex-1">
                    <FormLabel>Excused Late</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) =>
                          form.setValue("excusedLate", parseInt(e.target.value))
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
                name="unexcusedAbs"
                render={({ field }) => (
                  <FormItem className="size-fit min-w-36 flex-1">
                    <FormLabel>Unexcused Absence</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) =>
                          form.setValue(
                            "unexcusedAbs",
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
                name="unexcusedLate"
                render={({ field }) => (
                  <FormItem className="size-fit min-w-28 flex-1">
                    <FormLabel>Unexcused Late</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) =>
                          form.setValue(
                            "unexcusedLate",
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
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="min-w-[150px] justify-start"
                  >
                    {selectedStatus ? (
                      <>{selectedStatus.label}</>
                    ) : (
                      <>+ Add a new permission</>
                    )}
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
                            key={permission.courseN}
                            value={permission.id?.toString()}
                            onSelect={(value) => {
                              // console.log(value);
                              const newItem = permissions.filter(
                                (perm) => perm.id === parseInt(value),
                              );
                              const newArr = [...itemObjArr, ...newItem];
                              setItemObjArr(newArr);
                              // setSelectedStatus(
                              //   statuses.find(
                              //     (priority) => priority.value === value,
                              //   ) || null,
                              // );
                              setOpen(false);
                            }}
                          >
                            {`${permission.courseN}: \n ${permission.courseTitle?.slice(0, 30) ?? ""}...`}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="col-span-1 flex size-full max-w-2xl justify-start gap-2 md:col-span-2 ">
            <RosterEmbededTable
              data={itemObjArr}
              columns={rosterPermissionsColumnsInEditRoster}
              handleRemoveFromBooking={handleRemoveFromBooking}
              isPast={true}
            />
          </div>

          {/* <Button className="align-right" type="submit">
            Save
          </Button> */}

          <div className="col-span-1 flex size-full max-w-xl gap-1 md:col-span-2">
            <SubmitButton
              className="flex-1"
              text="Save"
              loadingText="Saving"
              loading={form.formState.isSubmitting}
            />
            <Button
              className="flex-1"
              type="button"
              variant="destructive"
              onClick={(e) => handleDelete(e)}
            >
              Delete
            </Button>
            <Link href="/dashboard/roster">
              <Button
                className="flex-1 hover:bg-slate-200 active:bg-slate-300"
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditRosterForm;
