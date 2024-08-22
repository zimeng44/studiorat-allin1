"use server";

import { getAuthToken } from "@/data/services/get-token";
// import { mutateData } from "@/data/services/mutate-data";
// import { flattenAttributes } from "@/lib/utils";
// import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { RosterRecordTypePost } from "@/data/definitions";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function createRosterAction(
  newRosterRecord: RosterRecordTypePost,
) {
  const authToken = await getAuthToken();
  if (!authToken) throw new Error("No auth token found");

  if (newRosterRecord.permission_code) delete newRosterRecord.permission_code;

  const payload = {
    data: {
      ...newRosterRecord,
      permissions: newRosterRecord.permissions
        ? {
            connect: newRosterRecord.permissions.map((id) => ({
              id: id,
            })),
          }
        : undefined,
    },
    include: {
      permissions: true,
    },
  };

  // console.log(payload);

  try {
    const data = await prisma.rosters.create(payload);

    revalidatePath("/dashboard/roster");

    return { res: data, error: null };
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

// export async function createManyRosterAction(
//   newRosterRecords: Prisma.rostersCreateInput[],
// ) {
//   const authToken = await getAuthToken();
//   if (!authToken) throw new Error("No auth token found");

//   const payload = {
//     data: [...newRosterRecords],
//     skipDuplicates: true,
//   };

//   // console.log(payload);

//   try {
//     const data = await prisma.rosters.createMany(payload);
//     return { res: data, error: null };
//   } catch (error) {
//     console.log(error);
//     return { res: null, error: error as string };
//   }
// }

export const updateRosterAction = async (
  updatedRosterRecord: Prisma.rostersUncheckedUpdateInput,
  id: string,
) => {
  const payload = {
    data: updatedRosterRecord,
    where: { id: parseInt(id) },
  };

  try {
    const res = prisma.rosters.update(payload);
    revalidatePath("/dashboard/roster");
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
};

export async function deleteRosterAction(id: string) {
  try {
    const res = await prisma.rosters.delete({ where: { id: parseInt(id) } });
    revalidatePath("/dashboard/roster");
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
}

export async function deleteManyRosterAction(idArray: number[]) {
  try {
    const res = await prisma.rosters.deleteMany({
      where: { id: { in: idArray } },
    });
    revalidatePath("/dashboard/roster");
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
}
