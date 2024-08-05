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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  deleteRosterAction,
  updateRosterAction,
} from "@/data/actions/roster-actions";
import {
  InventoryItem,
  RetrievedRosterPermission,
  RosterPermissionType,
  RosterRecordType,
} from "@/data/definitions";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/custom/SubmitButton";
import RosterEmbededTable from "../RosterEmbededTable";
import { rosterPermissionColumns } from "../rosterPermssionColumns";

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
});

const EditRosterForm = ({
  rosterId,
  roster,
}: {
  rosterId: string;
  roster: RosterRecordType;
}) => {
  // console.log("Item Details Render!!");
  const router = useRouter();
  // const deleteSummaryById = deleteInventoryItemAction.bind(null, itemId);
  const rosterPermissions =
    roster.roster_permissions as RetrievedRosterPermission;
  const [itemObjArr, setItemObjArr] = useState(
    rosterPermissions?.data ?? Array(),
  );

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
      stuN: roster.stuN,
      netId: roster.netId,
      stuName: roster.stuName,
      academicLevel: roster.academicLevel,
      academicProgram: roster.academicProgram,
    },
  });
  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    // updateAction(updatedData);

    updateRosterAction(values, rosterId);
    // router.refresh();
    toast.success("Item Saved.");

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
      "Are you sure you want to delete this item?",
    );

    if (!confirm) return;

    const res = deleteRosterAction(rosterId);

    if (!res) toast.success("Item Deleted");

    // if ((totalEntries - 1) % pageSize === 0) {
    //   setPageIndex((pageIndex) => pageIndex - 1);
    // }
    // console.log("Item Deleted!!!!!!!!!!!!!");
    // closeDetail();
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-screen shrink flex-col gap-2 space-y-1 px-2 md:grid justify-start md:grid-cols-2 md:px-0"
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

            <div className="col-span-1"></div>
          </div>

          <div className="col-span-1 flex size-full max-w-3xl justify-start gap-2 md:col-span-2 ">
            <RosterEmbededTable
              data={itemObjArr}
              columns={rosterPermissionColumns}
              handleRemoveFromBooking={handleRemoveFromBooking}
              isPast={true}
            />
          </div>

          {/* <Button className="align-right" type="submit">
            Save
          </Button> */}

          <div className="col-span-1 flex size-fit max-w-2xl gap-1 md:col-span-2">
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
