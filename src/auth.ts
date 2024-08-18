import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import { z, ZodError } from "zod";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";

async function getUser(identifier: string) {
  try {
    const user = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: identifier, mode: "insensitive" } },
          { net_id: { contains: identifier, mode: "insensitive" } },
        ],
      },
      include: { user_role: true },
    });
    return user[0];
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },
  // providers: [],

  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        identifier: {},
        password: {},
      },
      authorize: async (credentials) => {
        // console.log(credentials);
        try {
          const parsedCredentials = z
            .object({
              identifier: z.string().min(2),
              password: z.string().min(6),
            })
            .safeParse(credentials);
          if (!parsedCredentials.success) {
            return null; // Return null if the credentials are invalid
          }
          const { identifier, password } = parsedCredentials.data;

          // console.log(parsedCredentials.success);
          // logic to salt and hash password
          // const pwHash = await bcrypt.hash(password, await bcrypt.genSalt(10));
          // logic to verify if the user exists
          const user = await getUser(identifier);
          // console.log(user);

          if (!user) {
            throw new Error("User not found.");
          }
          // If you want to check the password, you can do something like this:
          // const isPasswordValid = await bcrypt.compare(
          //   password,
          //   user.password ?? "",
          // );

          const isPasswordValid = user.password === password;
          // console.log(password);
          if (!isPasswordValid) {
            return null; // Return null if the password is incorrect
          }
          // console.log(user.password);
          // return JSON object with the user data
          return user;
        } catch (error) {
          if (error instanceof ZodError) {
            return null; // Return null if there's a validation error
          }
          console.error("Error in authorization:", error);
          return null; // Return null if there's any other error
        }
      },
    }),
  ],
});
