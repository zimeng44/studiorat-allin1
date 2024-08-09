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
import { UserRole, UserType } from "@/data/definitions";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { SubmitButton } from "@/components/custom/SubmitButton";
import {
  deleteUserAction,
  updateUserAction,
} from "@/data/actions/users-actions";
import { StrapiErrors } from "@/components/custom/StrapiErrors";

const INITIAL_STATE = {
  message: "",
  name: "",
  status: "",
};

const mTechBarcode = z.union([
  z.string().min(12).and(z.string().max(13)),
  z.string().length(0),
]);

const formSchema = z.object({
  username: z
    .string()
    .min(3, {
      message: "Username must be between 3 and 20 characters",
    })
    .max(20, {
      message: "Username must be between 3 and 20 characters",
    }),
  // username: z.string().min(12).and(z.string().max(13)),
  stuId: z
    .string()
    .min(15, {
      message: "ID Barcode must be between 15 and 16 characters",
    })
    .max(16, {
      message: "ID Barcode must be between 15 and 16 characters",
    }),
  firstName: z
    .string()
    .min(2, {
      message: "First Name must be between 2 and 20 characters",
    })
    .max(20, {
      message: "First Name must be between 2 and 20 characters",
    }),
  lastName: z
    .string()
    .min(2, {
      message: "Last Name must be between 2 and 20 characters",
    })
    .max(20, {
      message: "Last Name must be between 2 and 20 characters",
    }),
  academicLevel: z
    .string()
    .min(3, {
      message: "Academic Level must be between 3 and 10 characters",
    })
    .max(10, {
      message: "Academic Level must be between 3 and 10 characters",
    }),
  role: z.number(),
  email: z.string().email({
    message: "Please enter a valid NYU email address",
  }),
  bio: z.string().optional(),
  blocked: z.boolean(),
});

const EditUserForm = ({
  userId,
  user,
  currentUserRole,
}: {
  userId: string;
  user: UserType;
  currentUserRole: UserRole;
}) => {
  // console.log(currentUserRole.id);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [strapiErrors, setStrapiErrors] = useState(INITIAL_STATE);
  // const deleteSummaryById = deleteInventoryItemAction.bind(null, itemId);

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
  const form =
    currentUserRole.name === "Admin"
      ? useForm<z.infer<typeof formSchema>>({
          resolver: zodResolver(formSchema.omit({ stuId: true })),
          defaultValues: {
            username: user.username,
            stuId: user.stuId,
            firstName: user.firstName,
            lastName: user.lastName,
            academicLevel: user.academicLevel,
            role: user?.role?.id ?? undefined,
            email: user.email,
            bio: user.bio || "",
            blocked: user.blocked ?? false,
          },
        })
      : useForm<z.infer<typeof formSchema>>({
          resolver: zodResolver(formSchema),
          defaultValues: {
            username: user.username,
            stuId: user.stuId,
            firstName: user.firstName,
            lastName: user.lastName,
            academicLevel: user.academicLevel,
            role: user?.role?.id,
            email: user.email,
            bio: user.bio || "",
            blocked: user.blocked ?? false,
          },
        });
  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    // console.log(values);
    const res = await updateUserAction(values, userId);
    // console.log(res.strapiErrors);
    setStrapiErrors(res.strapiErrors);

    if (!res.strapiErrors?.status) {
      router.push("/dashboard/users");
      toast.success("User Saved.");
    }
  }

  async function handleDelete(e: any) {
    const confirm = window.confirm(
      "Are you sure you want to delete this item?",
    );

    if (!confirm) return;

    const res = await deleteUserAction(userId);

    if (!res?.strapiErrors?.status) {
      router.push("/dashboard/users");
      toast.success("User Deleted.");
    } else {
      setStrapiErrors(res?.strapiErrors);
    }

    // if (!res) toast.success("Item Deleted");

    // if ((totalEntries - 1) % pageSize === 0) {
    //   setPageIndex((pageIndex) => pageIndex - 1);
    // }
    // console.log("Item Deleted!!!!!!!!!!!!!");
    // closeDetail();
  }

  return (
    <div>
      <div className="max-w-60">
        <StrapiErrors error={strapiErrors} />
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-col gap-2 space-y-1 md:grid md:grid-cols-2"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>NetID</FormLabel>
                <FormControl>
                  <Input placeholder={"MTech Barcode Here"} {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stuId"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>ID Barcode</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {currentUserRole.name === "Admin" ? (
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={(value: string) =>
                      field.onChange(parseInt(value))
                    }
                    value={field.value?.toString() ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="3">Monitor</SelectItem>
                      <SelectItem value="5">Inventory Manager</SelectItem>
                      <SelectItem value="1">User</SelectItem>
                      <SelectItem value="4">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            ``
          )}
          <FormField
            control={form.control}
            name="academicLevel"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Academic Level</FormLabel>
                {/* <FormControl>
                <Input {...field}></Input>
              </FormControl> */}
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Undergrad">Undergrad</SelectItem>
                    <SelectItem value="Grad">Grad</SelectItem>
                    <SelectItem value="Faculty">Faculty</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <div className="col-span-1 flex h-10 items-center justify-center gap-10 bg-slate-300"> */}
          <FormField
            control={form.control}
            name="blocked"
            render={({ field }) => (
              <FormItem className="col-span-1 flex-col">
                <FormLabel>Block</FormLabel>
                <FormControl className="contents-center flex items-center justify-center">
                  <div className="h-10 flex-1 bg-indigo-200">
                    <Checkbox
                      // disabled

                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* </div> */}
          {/* <div className="col-span-1"></div> */}

          {/* <Button className="align-right" type="submit">
            Save
          </Button> */}

          <div className="col-span-1 flex gap-1 md:col-span-2">
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
            {/* <Link href="/dashboard/users"> */}
            <Button
              className="flex-1 hover:bg-slate-200 active:bg-slate-300"
              type="button"
              variant="secondary"
              onClick={(e) => {
                // const params = new URLSearchParams(searchParams);
                router.push(`/dashboard/users?${searchParams.toString()}`);
              }}
            >
              Cancel
            </Button>
            {/* </Link> */}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditUserForm;
