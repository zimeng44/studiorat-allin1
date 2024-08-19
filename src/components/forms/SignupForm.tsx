"use client";

import Link from "next/link";

import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFormState } from "react-dom";
import { registerUserAction } from "@/data/actions/auth-actions";
import { ZodErrors } from "../custom/ZodErrors";
import { StrapiErrors } from "../custom/StrapiErrors";
import { SubmitButton } from "../custom/SubmitButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";

const INITIAL_STATE = {
  data: null,
  zodErrors: null,
  message: null,
};

export function SignupForm({
  userRole,
  stuId,
}: {
  userRole: string;
  stuId: string;
}) {
  const [formState, formAction] = useFormState(
    registerUserAction,
    INITIAL_STATE,
  );
  const [selectedRole, setSelectedRole] = useState("3");

  return (
    <div className="w-full max-w-md">
      <form action={formAction}>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold">Sign Up</CardTitle>
            <CardDescription>
              Enter your details to create a new account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="net_id">NetID</Label>
              <Input
                id="net_id"
                name="net_id"
                type="text"
                autoCapitalize="none"
                placeholder="School Assigned NetID"
              />
              <ZodErrors error={formState?.zodErrors?.net_id} />
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoCapitalize="none"
                placeholder="name@example.com"
              />
              <ZodErrors error={formState?.zodErrors?.email} />
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="password"
              />
              <ZodErrors error={formState?.zodErrors?.password} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                autoCapitalize="none"
                placeholder="First Name"
              />
              <ZodErrors error={formState?.zodErrors?.first_name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                type="text"
                autoCapitalize="none"
                placeholder="Last Name"
              />
              <ZodErrors error={formState?.zodErrors?.last_name} />
            </div>
            {userRole === "Admin" ? (
              <div className="space-y-2">
                <Label htmlFor="user_role">User Type</Label>
                <Select
                  name="user_role"
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value)}
                >
                  <SelectTrigger id="user_role">
                    <SelectValue placeholder="User Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="3">Monitor</SelectItem>
                    <SelectItem value="5">Inventory Manager</SelectItem>
                    <SelectItem value="2">User</SelectItem>
                    <SelectItem value="4">Admin</SelectItem> */}
                    <SelectItem value="3">Monitor</SelectItem>
                    <SelectItem value="4">Inventory Manager</SelectItem>
                    <SelectItem value="1">Admin</SelectItem>
                    <SelectItem value="2">User</SelectItem>
                  </SelectContent>
                </Select>
                <ZodErrors error={formState?.zodErrors?.user_role} />
              </div>
            ) : (
              ``
            )}
            {selectedRole === "2" || userRole === "Monitor" ? (
              <div className="space-y-2">
                <Label htmlFor="stu_id">ID Barcode</Label>
                <Input
                  id="stu_id"
                  name="stu_id"
                  type="text"
                  defaultValue={stuId}
                  autoCapitalize="none"
                  placeholder="ID Barcode"
                />
                <ZodErrors error={formState?.zodErrors?.stu_id} />
              </div>
            ) : (
              ``
            )}
            <div className="space-y-2">
              <Label htmlFor="academic_level">Academic Level</Label>
              {/* <Input
                id="academic_level"
                name="academic_level"
                type="text"
                autoCapitalize="none"
                placeholder="Academic Level"
              /> */}
              <Select name="academic_level" defaultValue="Undergrad">
                <SelectTrigger id="academic_level">
                  <SelectValue placeholder="Select a Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Undergrad">Undergrad</SelectItem>
                  <SelectItem value="Grad">Grad</SelectItem>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>
              <ZodErrors error={formState?.zodErrors?.academic_level} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <SubmitButton
              className="w-full"
              text="Sign Up"
              loadingText="Loading"
            />
            <StrapiErrors error={formState?.strapiErrors} />
          </CardFooter>
        </Card>
        <div className="mt-4 text-center text-sm">
          Have an account?
          <Link className="ml-2 underline" href="signin">
            Sing In
          </Link>
        </div>
      </form>
    </div>
  );
}
