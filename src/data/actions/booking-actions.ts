"use server";

import { getAuthToken } from "@/data/services/get-token";
import { mutateData } from "@/data/services/mutate-data";
import { flattenAttributes } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { BookingTypePost } from "@/data/definitions";
import { inventory_items, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

type BookingWithUserAndItems = Prisma.bookingsGetPayload<{
  include: {
    user: { include: { user_role: true } };
    created_by: true;
    inventory_items: true;
    // user_role: true;
  };
}>;
type UserWithRole = Prisma.UserGetPayload<{
  include: { user_role: true };
}>;

async function itemConflictCheck(booking: any, bookingId?: number) {
  if (!booking.inventory_items || booking.inventory_items.length === 0)
    return 0;

  let inventoryItems = [];

  if (booking.inventory_items.connect)
    inventoryItems = booking.inventory_items.connect;

  if (booking.inventory_items.set) inventoryItems = booking.inventory_items.set;

  const itemList = inventoryItems.map((item: any) => item.id);

  const query = {
    where: {
      AND: [
        {
          OR: [
            {
              start_time: {
                gte: booking.start_time as Date,
                lte: booking.end_time as Date,
              },
            },
            {
              end_time: {
                gte: booking.start_time as Date,
                lte: booking.end_time as Date,
              },
            },
            {
              AND: [
                { start_time: { lte: booking.start_time as Date } },
                { end_time: { gte: booking.end_time as Date } },
              ],
            },
          ],
        },
        {
          inventory_items: {
            some: {
              id: {
                in: [...itemList],
              },
            },
          },
        },
        { id: bookingId ? { not: bookingId } : undefined },
      ],
    },
  };
  return await prisma.bookings.count(query);
}

async function locationConflictCheck(booking: any, bookingId?: number) {
  if (booking.user_location === "Outside") return 0;

  const query = {
    where: {
      AND: [
        {
          OR: [
            {
              start_time: {
                gte: booking.start_time as Date,
                lte: booking.end_time as Date,
              },
            },
            {
              end_time: {
                gte: booking.start_time as Date,
                lte: booking.end_time as Date,
              },
            },
            {
              AND: [
                { start_time: { lte: booking.start_time as Date } },
                { end_time: { gte: booking.end_time as Date } },
              ],
            },
          ],
        },
        {
          use_location: { equals: booking.use_location },
        },
        { id: bookingId ? { not: bookingId } : undefined },
      ],
    },
  };

  return await prisma.bookings.count(query);
}

export async function createBookingAction(newBooking: any) {
  // const newBooking = JSON.parse()
  try {
    const authToken = await getAuthToken();
    if (!authToken) throw new Error("No auth token found");

    const payload = {
      data: newBooking,
      include: { user: true, inventory_items: true, created_by: true },
    };

    const itemConflictCount = await itemConflictCheck(newBooking);

    // console.log(data);

    if (itemConflictCount !== 0) {
      return { res: null, error: "Item Conflict Found." };
    }

    if (newBooking.use_location === "Outside") {
      const res = await prisma.bookings.create(payload);
      return { res: res, error: null };
    } else {
      const locationConflictCount = await locationConflictCheck(newBooking);
      if (locationConflictCount !== 0) {
        return { res: null, error: "Location Conflict Found." };
      }

      const res = await prisma.bookings.create(payload);
      return { res: res, error: null };
    }
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

export const updateBookingAction = async (
  updatedBooking: Prisma.bookingsUncheckedUpdateInput,
  id: number,
) => {
  try {
    const authToken = await getAuthToken();
    if (!authToken) throw new Error("No auth token found");

    const payload = {
      where: { id: id },
      data: updatedBooking,
    };

    const itemConflictCount = await itemConflictCheck(updatedBooking, id);

    // console.log(data);

    if (itemConflictCount !== 0) {
      return { res: null, error: "Item Conflict Found." };
    }
    // if (updatedBooking.use_location === "Outside") {
    //   const res = await prisma.bookings.update(payload);
    //   revalidatePath("/dashboard/booking");
    //   return { res: res, error: null };
    // } else {
    // const bookingForCheck = { ...updatedBooking };
    const locationConflictCount = await locationConflictCheck(
      updatedBooking,
      id,
    );

    if (locationConflictCount !== 0) {
      return { res: null, error: "Location Conflict Found." };
    }

    const res = await prisma.bookings.update(payload);
    revalidatePath("/dashboard/booking");
    return { res: res, error: null };
    // }
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

export async function deleteBookingAction(id: string) {
  try {
    const authToken = await getAuthToken();
    if (!authToken) throw new Error("No auth token found");

    const res = await prisma.bookings.delete({ where: { id: parseInt(id) } });

    // console.log(res);
    // revalidatePath("/dashboard/booking");
    return { res: res, error: null };
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(error);
      return { res: null, error: error.message };
    } else {
      console.log(error);
      return { res: null, error: "Error Unknown from Database" };
    }
  }
}

export async function deleteManyBookingAction(idArray: number[]) {
  try {
    const authToken = await getAuthToken();
    if (!authToken) throw new Error("No auth token found");

    const res = await prisma.bookings.deleteMany({
      where: { id: { in: idArray } },
    });

    // console.log(res);
    revalidatePath("/dashboard/booking");
    return { res: res, error: null };
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(error);
      return { res: null, error: error.message };
    } else {
      console.log(error);
      return { res: null, error: "Error Unknown from Database" };
    }
  }
}
