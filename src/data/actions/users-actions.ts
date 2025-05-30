"use server";

// import { getAuthToken } from "@/data/services/get-token";
// import { mutateData } from "@/data/services/mutate-data";
// import { flattenAttributes } from "@/lib/utils";
// import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
// import { InventoryItem } from "@/app/lib/definitions";
// import { InventoryItem, UserType, UserTypePost } from "../definitions";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

export const updateUserAction = async (
  updatedUser: Prisma.UserUncheckedUpdateInput,
  id: string,
) => {
  const formPassword = updatedUser.password ?? undefined;
  const hashedPassword = formPassword
    ? await bcrypt.hash(formPassword as string, 10)
    : undefined;

  const userWithHashedPassword = {
    ...updatedUser,
    password: hashedPassword ?? undefined,
  };

  try {
    const payload = {
      where: { id: id },
      data: userWithHashedPassword,
      include: { user_role: true },
    };

    const res = await prisma.user.update(payload);

    revalidatePath("/dashboard/users");
    return { res: res, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(error);
      return { res: null, error: error.message };
    } else {
      console.log(error);
      return { res: null, error: "Error Unknown from Database" };
    }
  }
  // console.log(updatedUser);
};

export async function deleteUserAction(id: string) {
  try {
    const responseData = await prisma.user.delete({ where: { id: id } });
    return { res: responseData, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(error);
      return { res: null, error: error.message };
    } else {
      console.log(error);
      return { res: null, error: "Error Unknown from Database" };
    }
  }
}
