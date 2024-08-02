"use server";
import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  registerUserService,
  loginUserService,
} from "@/data/services/auth-services";
import { getUserMeLoader } from "../services/get-user-me-loader";

const config = {
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: "/",
  domain: process.env.HOST ?? "localhost",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

const schemaRegister = z.object({
  username: z
    .string()
    .min(3, {
      message: "Username must be between 3 and 20 characters",
    })
    .max(20, {
      message: "Username must be between 3 and 20 characters",
    }),
  password: z
    .string()
    .min(6, {
      message: "Password must be between 6 and 100 characters",
    })
    .max(100, {
      message: "Password must be between 6 and 100 characters",
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
  email: z.string().email({
    message: "Please enter a valid NYU email address",
  }),
  role: z.string(),
  stuId: z
    .string()
    .min(15, {
      message: "ID barcode must be between 15 and 16 characters",
    })
    .max(16, {
      message: "ID barcode must be between 15 and 16 characters",
    }),
  academicLevel: z
    .string()
    .min(3, {
      message: "Academic Level must be between 3 and 10 characters",
    })
    .max(10, {
      message: "Academic Level must be between 3 and 10 characters",
    }),
});

export async function registerUserAction(prevState: any, formData: FormData) {
  const { data: currentUser } = await getUserMeLoader();
  // console.log(currentUser.role);

  const validatedFields =
    currentUser.role.name === "Admin"
      ? schemaRegister.omit({ stuId: true }).safeParse({
          username: formData.get("username"),
          password: formData.get("password"),
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: `${formData.get("username")}@nyu.edu`,
          stuId: formData.get("stuId"),
          role: formData.get("userRole"),
          academicLevel: formData.get("academicLevel"),
        })
      : schemaRegister.omit({ role: true }).safeParse({
          username: formData.get("username"),
          password: formData.get("password"),
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: `${formData.get("username")}@nyu.edu`,
          stuId: formData.get("stuId"),
          academicLevel: formData.get("academicLevel"),
        });

  if (!validatedFields.success) {
    return {
      ...prevState,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      strapiErrors: null,
      message: "Missing Fields. Failed to Register.",
    };
  }

  // console.log(validatedFields.data);

  const responseData = await registerUserService(validatedFields.data);

  if (!responseData) {
    return {
      ...prevState,
      strapiErrors: null,
      zodErrors: null,
      message: "Ops! Something went wrong. Please try again.",
    };
  }

  if (responseData.error) {
    return {
      ...prevState,
      strapiErrors: responseData.error,
      zodErrors: null,
      message: "Failed to Register.",
    };
  }

  // cookies().set("jwt", responseData.jwt, config);
  redirect("/dashboard/users");
}

const schemaLogin = z.object({
  identifier: z
    .string()
    .min(3, {
      message: "Identifier must have at least 3 or more characters",
    })
    .max(20, {
      message: "Please enter a valid username or email address",
    }),
  password: z
    .string()
    .min(6, {
      message: "Password must have at least 6 or more characters",
    })
    .max(100, {
      message: "Password must be between 6 and 100 characters",
    }),
});

export async function loginUserAction(prevState: any, formData: FormData) {
  const validatedFields = schemaLogin.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Login.",
    };
  }

  const responseData = await loginUserService(validatedFields.data);

  if (!responseData) {
    return {
      ...prevState,
      strapiErrors: responseData.error,
      zodErrors: null,
      message: "Ops! Something went wrong. Please try again.",
    };
  }

  if (responseData.error) {
    return {
      ...prevState,
      strapiErrors: responseData.error,
      zodErrors: null,
      message: "Failed to Login.",
    };
  }

  cookies().set("jwt", responseData.jwt, config);

  redirect("/dashboard");
}

export async function logoutAction() {
  cookies().set("jwt", "", { ...config, maxAge: 0 });
  redirect("/");
}
