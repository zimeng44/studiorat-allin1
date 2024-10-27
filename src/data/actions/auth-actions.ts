"use server";
import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginUserService } from "@/data/services/auth-services";
import { getUserMeLoader } from "../services/get-user-me-loader";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

const config = {
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: "/",
  domain: process.env.HOST ?? "localhost",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

const schemaRegister = z.object({
  net_id: z
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
  email: z.string().email({
    message: "Please enter a valid NYU email address",
  }),
  user_role: z.string(),
  stu_id: z
    .string()
    .min(15, {
      message: "ID barcode must be between 15 and 16 characters",
    })
    .max(16, {
      message: "ID barcode must be between 15 and 16 characters",
    }),
  academic_level: z
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
  // console.log(currentUser.user_role);

  const validatedFields =
    currentUser?.user_role?.name === "Admin"
      ? schemaRegister.omit({ stu_id: true }).safeParse({
          net_id: formData.get("net_id"),
          password: formData.get("password"),
          first_name: formData.get("first_name"),
          last_name: formData.get("last_name"),
          email: `${formData.get("net_id")}@nyu.edu`,
          stu_id: formData.get("stu_id"),
          user_role: formData.get("user_role"),
          academic_level: formData.get("academic_level"),
        })
      : schemaRegister.omit({ user_role: true }).safeParse({
          net_id: formData.get("net_id"),
          password: formData.get("password"),
          first_name: formData.get("first_name"),
          last_name: formData.get("last_name"),
          email: `${formData.get("net_id")}@nyu.edu`,
          stu_id: formData.get("stu_id"),
          academic_level: formData.get("academic_level"),
        });

  if (!validatedFields.success) {
    return {
      ...prevState,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      strapiErrors: null,
      message: "Missing Fields. Failed to Register.",
    };
  }

  const formPassword = formData.get("password")?.toString();
  const hashedPassword = formPassword
    ? await bcrypt.hash(formPassword, 10)
    : undefined;

  const correctedData =
    currentUser?.user_role.name !== "Admin"
      ? {
          ...validatedFields.data,
          user_role: {
            connect: { id: 2 }, //anyone who isn't a Admin can only create user as Authenticated
          },
          password: hashedPassword,
        }
      : {
          ...validatedFields.data,
          user_role: {
            connect: { id: parseInt(formData.get("user_role") as string) },
          },
          stu_id: formData.get("stu_id")?.toString()
            ? formData.get("stu_id")?.toString()
            : null,
          password: hashedPassword,
        };

  const payload = { data: correctedData };
  // console.log(validatedFields.data);

  // const responseData = await registerUserService(validatedFields.data);
  try {
    await prisma.user.create(payload);
    // if (!responseData) {
    //   return {
    //     ...prevState,
    //     strapiErrors: {
    //       message: "Ops! Something went wrong. Please try again.",
    //     },
    //     zodErrors: null,
    //     message: "Ops! Something went wrong. Please try again.",
    //   };
    // }
    // console.log("here");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // if (error.code === "P2002")
      console.log(error.message);
      return {
        ...prevState,
        strapiErrors: {
          name: error.name,
          message: error.code === "P2002" ? "User exists" : error.message,
        },
        zodErrors: null,
        message: null,
      };
    }
  }
  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");

  // if (responseData.error) {
  //   return {
  //     ...prevState,
  //     strapiErrors: responseData.error,
  //     zodErrors: null,
  //     message: "Failed to Register.",
  //   };
  // }

  // cookies().set("jwt", responseData.jwt, config);
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

  // console.log(responseData);

  if (!responseData?.user) {
    return {
      ...prevState,
      strapiErrors: { message: responseData?.error },
      zodErrors: null,
      message: "Ops! Something went wrong. Please try again.",
    };
  }

  // if (responseData.error) {
  //   return {
  //     ...prevState,
  //     strapiErrors: responseData.error,
  //     zodErrors: null,
  //     message: "Failed to Login.",
  //   };
  // }
  // console.log(responseData.jwt);

  (await cookies()).set("jwt", responseData.jwt ?? "", config);

  redirect("/dashboard");
}

export async function logoutAction() {
  (await cookies()).set("jwt", "", { ...config, maxAge: 0 });
  redirect("/");
}
