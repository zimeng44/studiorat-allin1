"use client";
import React from "react";

import { useFormState } from "react-dom";
import { updateProfileAction } from "@/data/actions/profile-actions";
import { cn } from "@/lib/utils";

import { SubmitButton } from "@/components/custom/SubmitButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StrapiErrors } from "../custom/StrapiErrors";

const INITIAL_STATE = {
  data: null,
  strapiErrors: null,
  message: null,
};

interface ProfileFormProps {
  id: string;
  net_id?: string | null;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  bio?: string | null;
}

// function CountBox({ text }: { readonly text: number }) {
//   const style = "font-bold text-md mx-1";
//   const color = text > 0 ? "text-primary" : "text-red-500";
//   return (
//     <div className="flex h-9 w-full items-center justify-center rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none">
//       You have<span className={cn(style, color)}>{text}</span>credit(s)
//     </div>
//   );
// }

export function ProfileForm({
  data,
  className,
}: {
  readonly data: ProfileFormProps;
  readonly className?: string;
}) {
  const updateProfileWithId = updateProfileAction.bind(null, data.id);

  const [formState, formAction] = useFormState(
    updateProfileWithId,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className={cn("space-y-4", className)}>
      <div className="grid space-y-4 ">
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="net_id"
            name="net_id"
            placeholder="NetID"
            defaultValue={data.net_id || ""}
            disabled
          />
          <Input
            id="email"
            name="email"
            placeholder="Email"
            defaultValue={data.email || ""}
            disabled
          />
          {/* <CountBox text={data.credits} /> */}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="first_name"
            name="first_name"
            placeholder="First Name"
            defaultValue={data.first_name || ""}
          />
          <Input
            id="last_name"
            name="last_name"
            placeholder="Last Name"
            defaultValue={data.last_name || ""}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="password"
            name="password"
            placeholder="New Password"
            defaultValue={undefined}
            type="password"
          />
        </div>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Write your bio here..."
          className="h-[124px] w-full resize-none rounded-md border p-2"
          defaultValue={data.bio || ""}
          // required
        />
      </div>
      <div className="flex justify-end">
        <SubmitButton text="Update Profile" loadingText="Saving Profile" />
      </div>
      <StrapiErrors error={formState?.strapiErrors} />
    </form>
  );
}
