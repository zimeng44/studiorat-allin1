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

const INITIAL_STATE = {
  data: null,
  zodErrors: null,
  message: null,
};

export function SignupForm() {
  const [formState, formAction] = useFormState(
    registerUserAction,
    INITIAL_STATE,
  );

  // console.log(formState, "client");

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
              <Label htmlFor="username">NetID</Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoCapitalize="none"
                placeholder="School Assigned NetId"
              />
              <ZodErrors error={formState?.zodErrors?.username} />
            </div>
            <div className="space-y-2">
              {/* <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoCapitalize="none"
                placeholder="name@example.com"
              /> */}
              <ZodErrors error={formState?.zodErrors?.email} />
            </div>

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
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                autoCapitalize="none"
                placeholder="First Name"
              />
              <ZodErrors error={formState?.zodErrors?.firstName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                autoCapitalize="none"
                placeholder="Last Name"
              />
              <ZodErrors error={formState?.zodErrors?.lastName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stuId">ID Barcode</Label>
              <Input
                id="stuId"
                name="stuId"
                type="text"
                autoCapitalize="none"
                placeholder="ID Barcode"
              />
              <ZodErrors error={formState?.zodErrors?.stuId} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academicLevel">Academic Level</Label>
              {/* <Input
                id="academicLevel"
                name="academicLevel"
                type="text"
                autoCapitalize="none"
                placeholder="Academic Level"
              /> */}
              <Select name="academicLevel">
                <SelectTrigger id="academicLevel">
                  <SelectValue placeholder="Select a Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="underGrad">Undergrad</SelectItem>
                  <SelectItem value="Grad">Grad</SelectItem>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>
              <ZodErrors error={formState?.zodErrors?.academicLevel} />
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
