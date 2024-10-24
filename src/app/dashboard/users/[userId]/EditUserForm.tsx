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
import { UserRole, UserType, UserWithRole } from "@/data/definitions";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { SubmitButton } from "@/components/custom/SubmitButton";
import {
  deleteUserAction,
  updateUserAction,
} from "@/data/actions/users-actions";
import { StrapiErrors } from "@/components/custom/StrapiErrors";
import { Switch } from "@/components/ui/switch";

const INITIAL_STATE = {
  message: "",
  name: "",
  status: "",
};

// const mTechBarcode = z.union([
//   z.string().min(12).and(z.string().max(13)),
//   z.string().length(0),
// ]);

const formSchema = z.object({
  net_id: z
    .string()
    .min(3, {
      message: "NetID must be between 3 and 20 characters",
    })
    .max(20, {
      message: "NetID must be between 3 and 20 characters",
    }),
  // net_id: z.string().min(12).and(z.string().max(13)),
  stu_id: z
    .string()
    .min(15, {
      message: "ID Barcode must be between 15 and 16 characters",
    })
    .max(16, {
      message: "ID Barcode must be between 15 and 16 characters",
    }),
  first_name: z
    .string()
    .min(2, {
      message: "First Name must be between 2 and 20 characters",
    })
    .max(20, {
      message: "First Name must be between 2 and 20 characters",
    }),
  last_name: z
    .string()
    .min(2, {
      message: "Last Name must be between 2 and 20 characters",
    })
    .max(20, {
      message: "Last Name must be between 2 and 20 characters",
    }),
  password: z
    .string()
    .min(8, {
      message: "Min length is 8",
    })
    .optional(),
  academic_level: z
    .string()
    .min(3, {
      message: "Academic Level must be between 3 and 10 characters",
    })
    .max(10, {
      message: "Academic Level must be between 3 and 10 characters",
    }),
  user_role: z.number(),
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
  user: UserWithRole;
  currentUserRole: UserRole;
}) => {
  // console.log(currentUserRole.id);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [strapiErrors, setStrapiErrors] = useState(INITIAL_STATE);

  const form =
    currentUserRole.name === "Admin"
      ? useForm<z.infer<typeof formSchema>>({
          resolver: zodResolver(formSchema.omit({ stu_id: true })),
          defaultValues: {
            net_id: user.net_id ?? undefined,
            stu_id: user.stu_id ?? undefined,
            first_name: user.first_name ?? undefined,
            last_name: user.last_name ?? undefined,
            password: undefined,
            academic_level: user.academic_level ?? undefined,
            user_role: user?.user_role?.id ?? undefined,
            email: user.email ?? undefined,
            bio: user.bio || undefined,
            blocked: user.blocked ?? false,
          },
        })
      : useForm<z.infer<typeof formSchema>>({
          resolver: zodResolver(formSchema),
          defaultValues: {
            net_id: user.net_id ?? undefined,
            stu_id: user.stu_id ?? undefined,
            first_name: user.first_name ?? undefined,
            last_name: user.last_name ?? undefined,
            password: undefined,
            academic_level: user.academic_level ?? undefined,
            user_role: user?.user_role?.id,
            email: user.email ?? undefined,
            bio: user.bio ?? undefined,
            blocked: user.blocked ?? false,
          },
        });
  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const submitValue = {
      ...values,
      stu_id: form.getValues("stu_id") ? form.getValues("stu_id") : null,
      user_role: { connect: { id: values.user_role } },
    };
    // console.log(values);
    const { res, error } = await updateUserAction(submitValue, userId);
    // console.log(error);
    // setStrapiErrors(res.strapiErrors);

    if (!error) {
      router.push("/dashboard/users");
      toast.success("User Saved.");
    }
  }

  async function handleDelete(e: any) {
    const confirm = window.confirm(
      "Are you sure you want to delete this item?",
    );

    if (!confirm) return;

    const { res, error } = await deleteUserAction(userId);

    if (res) {
      router.push("/dashboard/users");
      toast.success("User Deleted.");
      router.refresh();
    } else {
      // setStrapiErrors(res?.strapiErrors);
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
          className="w-screen shrink flex-col gap-2 space-y-1 px-4 md:grid md:max-w-lg md:grid-cols-2 md:px-0"
        >
          <FormField
            control={form.control}
            name="net_id"
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
            name="stu_id"
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
            name="first_name"
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
            name="last_name"
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="New Password"
                  ></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {currentUserRole.name === "Admin" ? (
            <FormField
              control={form.control}
              name="user_role"
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
                      <SelectItem value="4">Inventory Manager</SelectItem>
                      <SelectItem value="2">User</SelectItem>
                      <SelectItem value="1">Admin</SelectItem>
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
            name="academic_level"
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
                  <div className="h-10 content-center items-center">
                    <Switch
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
